import React, { PureComponent, Fragment } from 'react';
import { Table, Card, Tree, Icon, Popconfirm, Tag, Button, Divider } from 'antd';
import classNames from 'classnames';
import { autodata, can } from '../../../decorators';
import { Dialog, StaffFinder, FormItemGroup } from '../../../components';
import { Action, RadioGroup } from '../../../components/Helpers';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import StaffForm from '../Staff/StaffForm';
import { valuesFilter } from '../Staff';
import { request, tree, findNodeDeep, getNodesByPos, getPagination, enums } from '../../../utils';
import { getJobStatusTag } from '../../../utils/helpers';
import styles from './index.less';

const { TreeNode } = Tree;
const verifyDeep = (dropKey, { id, children = [] }) => id !== dropKey && !findNodeDeep(children, dropKey).node;
const getName = (value, { isLeader }) => isLeader ? <Fragment><Tag color="green" className="no-events">负责人</Tag> {value}</Fragment> : value;
const getMergerName = (...args) => (getNodesByPos.apply(null, args) || []).map(({ name }) => name).join(' / ');

@autodata({ namespace: 'departments', url: '/api/personnel/department', dataFilter: tree })
export default class Organization extends PureComponent {
  state = {
    staffs: { loading: false },
    selectedKeys: [],
  };

  getNodes = (nodes) => {
    return nodes.map(({ id: key, name, children, isLeaf, loading, active }) => {
      const actions = [];
      if (loading) {
        actions.push({ icon: 'loading' });
      } else {
        actions.push(
          { icon: 'plus', onClick: this.createNode(key) },
          { icon: 'edit', onClick: this.editNode(key, name) },
        );
        isLeaf && actions.push({ icon: 'delete', confirm: '您确定要删除这条数据吗？', onClick: this.removeNode(key) });
      }
      const title = (
        <div className={classNames('flex-row', loading ? 'tree-node-loading' : null)}>
          <div className="flex-item ellipsis">{name}</div>
          <div className="tree-actions">{actions.map(({ icon, confirm, onClick, ...actionProps }) => {
            if (confirm) {
              return (
                <Popconfirm title={confirm} onVisibleChange={this.onConfirmVisibleChange(key)} onConfirm={onClick} key={icon}>
                  <Icon {...actionProps} type={icon}/>
                </Popconfirm>
              );
            }
            return <Icon {...actionProps} onClick={onClick} type={icon} key={icon}/>;
          })}</div>
        </div>
      );
      const nodeProps = { className: classNames(active ? 'tree-node-active' : null), title, key };
      if (children && children.length) {
        return <TreeNode {...nodeProps}>{this.getNodes(children)}</TreeNode>;
      }
      return <TreeNode {...nodeProps}/>;
    });
  };

  onConfirmVisibleChange = (id) => (visible) => {
    this.onSelectCancelBubble();
    const { departments: { data: nodes, setData } } = this.props;
    const { node } = findNodeDeep(nodes, id);
    node.active = visible;
    setData({ data: [].concat(nodes) });
  };

  onDrop = ({ node, dragNode, dropPosition, dropToGap }) => {
    const { departments: { data: nodes, setData } } = this.props;
    const { eventKey: dropKey, pos } = node.props;
    const { eventKey: dragKey } = dragNode.props;
    const id = ~~dragKey;
    const parentId = ~~dropKey;
    const dropPos = pos.split('-');
    dropPosition -= _.last(dropPos);

    findNodeDeep(nodes, id, (dragNode, index, currentNodes) => {
      if (verifyDeep(parentId, dragNode)) {
        currentNodes.splice(index, 1);
        if (dropToGap) {
          findNodeDeep(nodes, parentId, ({ parentId }, index, currentNodes) => {
            dragNode = { ...dragNode, parentId };
            if (dropPosition === -1) {
              currentNodes.splice(index, 0, dragNode);
            } else {
              currentNodes.splice(index + 1, 0, dragNode);
            }
          });
        } else {
          findNodeDeep(nodes, parentId, (dropNode) => {
            const { id: parentId, children = [] } = dropNode;
            dragNode = { ...dragNode, parentId };
            dropNode.children = [...children, dragNode];
          });
        }
        setData({ data: nodes }, () => {
          const { id, parentId } = dragNode;
          this.transfer(id, parentId);
        });
      }
    });
  };

  transfer = async (id, parentId) => {
    const { departments: { data: nodes, setData } } = this.props;
    const { node } = findNodeDeep(nodes, id);
    node.loading = true;
    setData({ data: [].concat(nodes) });
    await request('/api/personnel/department/transfer', { method: 'PUT', body: { id, parentId } });
    delete node.loading;
    setData({ data: [].concat(nodes) });
  };

  onSelect = (selectedKeys, { node }) => {
    const { props: { pos } } = node;
    const { ...restState } = this.state;
    _.merge(restState, { pos, staffs: { loading: false } });
    if (!this.cancelBubble && !_.isEmpty(selectedKeys)) {
      _.merge(restState, { selectedPos: pos, selectedKeys, staffs: { loading: true } });
      this.getStaffs(~~selectedKeys);
    }
    this.setState(restState);
  };

  onSelectCancelBubble = () => {
    this.cancelBubble = true;
    setTimeout(() => this.cancelBubble = false);
  };

  getDepartmentNames = (includeCurrentNode = true) => () => {
    const { pos } = this.state;
    const { departments: { data: nodes } } = this.props;
    return getMergerName(nodes, includeCurrentNode ? pos : _.drop(_.dropRight(pos.split('-')))) || '请输入组织名称';
  };

  createNode = (parentId = 0) => () => {
    this.onSelectCancelBubble();
    Dialog.prompt({
      action: '/api/personnel/department',
      label: '组织名称',
      maxLength: 15,
      placeholder: parentId ? '请输入下级组织名称' : '请输入组织名称',
      titleRender: this.getDepartmentNames(),
      valuesFilter: ({ name }) => ({ parentId, name }),
      onSubmitted: () => this.props.departments.reload(),
    });
  };

  editNode = (id, name) => async () => {
    this.onSelectCancelBubble();
    const { departments: { data } } = this.props;
    const { parentId } = findNodeDeep(data, id);
    Dialog.prompt({
      action: `/api/personnel/department/${id}`,
      method: 'PUT',
      label: '组织名称',
      maxLength: 15,
      defaultValue: name,
      titleRender: this.getDepartmentNames(false),
      valuesFilter: ({ name }) => ({ parentId, name }),
      onSubmitted: () => this.props.departments.reload(),
    });
  };

  removeNode = (id) => async () => {
    this.onSelectCancelBubble();
    await request(`/api/personnel/department/${id}`, { method: 'DELETE' });
    const { selectedKeys } = this.state;
    if (id === ~~selectedKeys) {
      this.setState({ selectedKeys: [], pos: null, selectedPos: null, staffs: { loading: false } });
    }
    this.props.departments.reload();
  };

  unbind = (id) => async () => {
    const { selectedKeys } = this.state;
    const departmentId = ~~selectedKeys;
    await request(`/api/personnel/employee/${id}`, { method: 'DELETE', query: { departmentId } });
    this.getStaffs(departmentId);
  };

  bind = () => {
    const { selectedKeys } = this.state;
    const departmentId = ~~selectedKeys;
    Dialog.open({
      width: 450,
      action: `/api/personnel/department/${departmentId}/employee`,
      titleRender: this.getDepartmentNames(),
      onSubmitted: () => this.getStaffs(departmentId),
      render() {
        const { form } = this.props;
        const items = [
          { name: 'employeeId', label: '员工帐号', component: StaffFinder, required: true },
          { name: 'isLeader', label: '组织负责人', value: 0, component: RadioGroup, items: enums('LEADER_TYPE') },
        ];
        return <FormItemGroup items={items} form={form} layout={null}/>;
      }
    });
  };

  edit = (staffId) => () => {
    const { selectedPos, selectedKeys } = this.state;
    const departmentId = ~~selectedKeys;
    const { departments: { data: departments = [] } } = this.props;
    const nodePath = getMergerName(departments, selectedPos);
    let options = {
      title: `新建员工${nodePath ? ` - ${nodePath}` : ''}`,
      width: 700,
      autodata: { leader: `/api/personnel/department/${departmentId}/leader` },
      staff: { data: { departmentIds: [{ id: departmentId }] } },
      formProps: {
        action: '/api/personnel/employee',
        valuesFilter,
        onSubmitted: () => this.getStaffs(departmentId)
      },
      render() {
        const { staff, leader, form } = this.props;
        return <StaffForm staff={staff} form={form} leader={leader} organization={true}/>;
      }
    };
    if (staffId) {
      const { formProps, ...restOptions } = options;
      options = {
        ...restOptions,
        title: `编辑员工信息${nodePath ? ` - ${nodePath}` : ''}`,
        autodata: { staff: `/api/personnel/employee/${staffId}?departmentId=${departmentId}` },
        formProps: {
          ...formProps,
          action: `/api/personnel/employee/${staffId}`,
          method: 'PUT',
        },
      };
    }
    Dialog.open(options);
  };

  onPageChange = (page) => {
    const { selectedKeys } = this.state;
    this.getStaffs(~~selectedKeys, page);
  };

  getStaffs = async (departmentId, page = 1) => {
    const { onPageChange: onChange } = this;
    const { data, pagination } = await request(`/api/personnel/department/${departmentId}/employee`, { query: { page } });
    this.setState({ staffs: { data, pagination: { ...getPagination(pagination), onChange }, loading: false } });
  };

  getAction = (value, { id }) => {
    const items = [
      { onClick: this.edit(id) },
      { text: '删除', type: 'confirm', onClick: this.unbind(id) },
    ];
    return <Action items={items}/>;
  };

  getFooter = () => {
    const { selectedKeys } = this.state;
    if (_.isEmpty(selectedKeys)) return null;
    return (
      <Fragment>
        <Button type="primary" onClick={this.edit()}>新建员工</Button>
        <Divider type="vertical"/>
        <Button type="primary" onClick={this.bind}>添加员工</Button>
      </Fragment>
    );
  };

  render() {
    const { onSelect, onDrop, getFooter: footer } = this;
    const { staffs: { data: dataSource, pagination, loading }, selectedPos, selectedKeys } = this.state;
    const { departments: { data: departments = [], starting } } = this.props;
    const treeProps = {
      className: styles.tree,
      draggable: true,
      selectedKeys,
      onSelect,
      onDrop,
    };
    const nodePath = getMergerName(departments, selectedPos);
    const columns = [
      { title: '员工姓名', dataIndex: 'name', width: 180, render: getName },
      { title: '岗位名称', dataIndex: 'position', width: 180 },
      { title: '在职状态', dataIndex: 'isOnJob', width: 100, render: getJobStatusTag },
      { title: '直接上级', dataIndex: 'leaderName' },
      { title: '操作', fixed: 'right', width: 150, render: this.getAction },
    ];
    const tableProps = {
      size: 'middle',
      rowKey: 'id',
      scroll: { x: 750 },
      locale: { emptyText: dataSource ? '该组织暂无成员' : '请选择一个组织' },
      pagination,
      columns,
      dataSource,
      loading,
      footer,
    };

    return (
      <PageHeaderLayout className="flex-column" wrapperClassName="main-fixed">
        <div className={classNames(styles.organization, 'flex-item flex-row')}>
          <Card bordered={false} title="组织架构" className={classNames('flex-column', styles.treeContainer)} loading={starting}>
            <Tree {...treeProps}>{this.getNodes(departments)}</Tree>
            <Button className="blocked" type="dashed" onClick={this.createNode()} icon="plus">新建一级组织</Button>
          </Card>
          <Card bordered={false} title={`员工管理${nodePath ? ` - ${nodePath}` : ''}`} className={classNames('flex-item', styles.listContainer)}>
            <Table {...tableProps}/>
          </Card>
        </div>
      </PageHeaderLayout>
    );
  }
}
