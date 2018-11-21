import React, { PureComponent } from 'react';
import classNames from 'classnames';
import { Card, Tree, Icon, Tabs, Tag, Button, message } from 'antd';
import { autodata } from '../../../decorators';
import { Region, Popconfirm, Shining, FormItemGroup } from '../../../components';
import { Action, CheckboxGroup } from '../../../components/Helpers';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import { tree, enums, request, redirectTo, getNodesByPos, findChildrenDeep } from '../../../utils';
import styles from './index.less';

const { TreeNode } = Tree;
const { TabPane } = Tabs;
const { View: RegionView } = Region;
const makeTree = (data) => tree(data, '0', { key: 'code', parentKey: 'parentCode' });
const mapToCode = ({ code }) => code;

@autodata({
  namespace: 'role',
  url: '/api/role/:id',
  autoCreateForm: true,
  shouldSend: (props) => /^\d+$/.test(_.get(props, 'match.params.id'))
})
@autodata({
  namespace: 'permissions',
  url: '/api/permissions',
  cache: true,
  dataFilter: makeTree
})
export default class Edit extends PureComponent {
  state = {
    regionCode: null,
    isRegionPopoverVisible: false,
  };

  getNodes = (nodes) => {
    return nodes.map(({ code: key, name: title, children }) => {
      const nodeProps = { title, key };
      if (children && children.length) {
        return <TreeNode {...nodeProps}>{this.getNodes(children)}</TreeNode>;
      }
      return <TreeNode {...nodeProps}/>;
    });
  };

  onCheck = (checkedKeys, { checked, node: { props: { pos } } }) => {
    const { role: { data = {}, setData }, permissions: { data: nodes } } = this.props;
    const posNodes = getNodesByPos(nodes, pos);
    const posCodes = posNodes.map(mapToCode);
    const currentNode = _.last(posNodes);
    const childrenCodes = findChildrenDeep(currentNode).map(mapToCode);
    let { permissionCodeList: selected = [] } = data;
    if (checked) {
      selected = selected.concat(posCodes).concat(childrenCodes);
    } else {
      selected = _.pullAll(selected, childrenCodes.concat(currentNode.code));
      _.forEach(_.drop(_.reverse(posNodes)), ({ code, children }) => {
        if (_.isEmpty(_.intersection(selected, children.map(mapToCode)))) {
          selected = _.pull(selected, code);
        }
      });
    }
    setData({ data: { ...data, permissionCodeList: selected } });
  };

  clear = () => {
    const { role: { data, setData } } = this.props;
    setData({ data: { ...data, permissionCodeList: [] } });
  };

  refresh = () => {
    this.props.permissions.reload();
  };

  save = () => {
    const { role: { form: { validateFields }, data = {} }, match: { params: { id } } } = this.props;
    let { createTime, updateTime, isDel, isMaster, ...body } = data;
    validateFields(async (err, values) => {
      if (!err) {
        if (_.isEmpty(_.get(body, 'permissionCodeList'))) return this.shining.play();
        body = { ...body, ...values };
        await request(`/api/role`, { method: id ? 'PUT' : 'POST', body });
        this.back();
      }
    });
  };

  back = () => {
    redirectTo('/personnel/roles');
  };

  onRegionPopupVisibleChange = (isRegionPopoverVisible) => {
    this.setState({ isRegionPopoverVisible });
  };

  addRegion = (code) => {
    const { role: { data = {}, setData } } = this.props;
    const cities = _.get(data, 'extAttr.cityList', []);
    if (code) {
      cities.push(code);
      _.set(data, 'extAttr.cityList', _.uniq(cities));
      setData({ data });
      this.setState({ regionCode: code });
    }
  };

  removeRegion = (code) => () => {
    const { role: { data, setData } } = this.props;
    const cities = _.get(data, 'extAttr.cityList', []);
    _.remove(cities, cityCode => cityCode === code);
    setData({ data });
  };

  onProductChange = (value) => {
    const { role: { data, setData } } = this.props;
    _.set(data, 'extAttr.productList', value);
    setData({ data });
  };

  onMounted = (shining) => {
    this.shining = shining;
  };

  render() {
    const { onCheck, onProductChange, onRegionPopupVisibleChange, onMounted, addRegion, save, back } = this;
    const { isRegionPopoverVisible, regionCode } = this.state;
    const { role: { form, data: role = {}, loading }, permissions: { data: nodes = [], starting, loading: treeLoading } } = this.props;
    const { name, remark, permissionCodeList: permissions = [], extAttr = {} } = role;
    const { cityList: cities = [], productList: products = [] } = extAttr;
    const actions = [
      { text: '清空', onClick: this.clear },
      { text: treeLoading ? <Icon type="loading"/> : '刷新', className: classNames(styles.refresh, treeLoading ? 'no-event' : null), onClick: this.refresh },
    ];
    const fields = [
      { name: 'name', label: '角色名称', value: name, max: 30, required: true },
      { name: 'remark', label: '角色说明', value: remark, max: 100 },
    ];
    const regionProps = {
      value: regionCode,
      placeholder: '请选择要添加的地区',
      className: styles.regionSelector,
      onChange: addRegion,
      onPopupVisibleChange: onRegionPopupVisibleChange,
    };
    const addPopProps = {
      icon: false,
      strictly: isRegionPopoverVisible,
      content: <Region {...regionProps}/>,
      cancelText: false,
      okText: '关闭',
    };
    return (
      <PageHeaderLayout className="flex-column" wrapperClassName="main-fixed">
        <div className={classNames(styles.role, 'flex-item flex-row')}>
          <Card bordered={false} title="权限列表" className={classNames('flex-column', styles.treeContainer)} extra={<Action items={actions}/>} loading={starting}>
            <Shining onMounted={onMounted}>
              <Tree checkedKeys={permissions} onCheck={onCheck} selectable={false} checkStrictly checkable>{this.getNodes(nodes)}</Tree>
            </Shining>
          </Card>
          <Card bordered={false} title="角色基本信息" className="flex-item" loading={loading}>
            <FormItemGroup className={styles.form} items={fields} form={form} cols={[8, 16]}/>
            <Tabs defaultActiveKey="product" animated={false}>
              <TabPane tab="产品线" key="product" className={styles.tabPane}>
                <CheckboxGroup options={enums('PRODUCT_LINE')} defaultValue={products} onChange={onProductChange}/>
              </TabPane>
              <TabPane tab="地区" key="region" className={styles.tabPane}>
                <div className={styles.regions}>
                  {cities.map(code => <RegionView key={code} code={code} closable={true} afterClose={this.removeRegion(code)}/>)}
                  <Popconfirm {...addPopProps}>
                    <Tag className={styles.addRegion}><Icon type="plus"/> 添加地区</Tag>
                  </Popconfirm>
                </div>
              </TabPane>
            </Tabs>
          </Card>
        </div>
        <div className={styles.footer}>
          <Button onClick={back}>取 消</Button>
          <Button type="primary" onClick={save}>保存角色配置</Button>
        </div>
      </PageHeaderLayout>
    );
  }
}
