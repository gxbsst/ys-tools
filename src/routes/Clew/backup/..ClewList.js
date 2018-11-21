import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Select, Radio, Tabs, Card, Form, Popconfirm, Button, Menu, message } from 'antd';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import ClewAssignModal from '../Modal/ClewAssignModal';
import StandardTable from './_ClewTable';
import ClewSearcher from './_ClewSearcher';
import ClewRejectModal from '../Modal/ClewRejectModal';
import { rolePermissions, tabRolesMap } from '../../../utils/paramsMap';
import styles from './style.less';

const hasPermission = (has = [], should = []) => has.some(item => should.includes(item));
const { TabPane } = Tabs;
const { Option } = Select;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const getValue = obj => Object.keys(obj).map(key => obj[key]).join(',');

function mockPermissionsByRoleTerm(multiTermOne, role) {
  return (rolePermissions[role || 0].permissions || []).filter(i => Math.floor(i / 1000) == Math.floor(multiTermOne / 1000))
}
//多重角色，包括售前、新零售、到店的时候
function getMultiRole(permissions) {
  const multiPermission = permissions.filter((i) => [3001000, 4001000, 4002000, 5001000].includes(i));
  // console.log('multiPermission', multiPermission);
  return Array.from(new Set(multiPermission.filter(i => [300, 400, 500].includes(Math.floor(i / 10000))).map(i => Math.floor(i / 10000) * 10000)));
}
//多重组织，包括线索和订单（针对新零售）
function getMultiTerm(permissions, multiRoleOne) {
  return multiRoleOne / 10000 == 400 ? permissions.filter((i) => [4001000, 4002000].includes(i)) : [((multiRoleOne / 1000) + 1) * 1000];
}
const multiRole = getMultiRole(rolePermissions[0].permissions);
// console.log('multiRole', multiRole);
const multiTerm = getMultiTerm(rolePermissions[0].permissions, multiRole[0]);
// console.log('multiTerm', multiTerm);

@connect(state => ({
  clews: state.clews,
}))
@Form.create()
export default class ClewList extends PureComponent {
  state = {
    role: 0,
    permissions: rolePermissions[0].permissions || [],
    actualPermissions: mockPermissionsByRoleTerm(multiTerm[0]),
    multiRole,
    multiRoleOne: multiRole[0],
    multiTerm,
    multiTermOne: multiTerm[0],
    key: '',
    assignModalVisible: 0,
    rejectModalVisible: 0,
    assignConfirmLoading: false,
    rejectConfirmLoading: false,
    expandForm: true,
    selectedRows: [],
    formValues: {},
  };
  componentDidMount() {
    this.changeTabByRole();
  }
  changeTabByRole = () => {
    const tabKey = Object.keys(tabRolesMap).filter(p => this.state.actualPermissions.includes(~~p)).map(i => tabRolesMap[i]);
    const { key } = tabKey[0];
    if (key) {
      this.searcher.resetFields();
      this.setState({
        key,
      });
      this.fetchClewList({values: {}, key});
    }
  }
  changeMultiRole = async (e) => {
    const { value } = e.target;
    const multiTerm = getMultiTerm(rolePermissions[0].permissions, value);
    await this.setState({
      multiTerm,
      multiRoleOne: value,
      multiTermOne: multiTerm[0],
      actualPermissions: mockPermissionsByRoleTerm(multiTerm[0]),
    })
    this.changeTabByRole();
  }

  changeMultiTerm = async (e) => {
    const { value } = e.target;
    await this.setState({
      multiTermOne: value,
      actualPermissions: mockPermissionsByRoleTerm(value),
    })
    this.changeTabByRole();
  }

  changeRole = async (role) => {
    const { permissions } = rolePermissions[role];
    const multiRole = getMultiRole(permissions);
    const multiTerm = getMultiTerm(permissions, multiRole[0]);
    await this.setState({
      role,
      permissions,
      actualPermissions: mockPermissionsByRoleTerm(multiTerm[0], role),
      multiRole,
      multiRoleOne: multiRole[0],
      multiTerm,
      multiTermOne: multiTerm[0],
    });
    this.changeTabByRole();
  }
  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const { formValues, key } = this.state;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const params = {
      page: pagination.current,
      pageSize: pagination.pageSize,
      ...formValues,
      ...filters,
      tabCode: key,
    };
    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }

    dispatch({
      type: 'clews/fetch',
      payload: params,
    });
  }

  handleFormReset = () => {
    const { form } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    this.fetchClewList();
  }

  toggleForm = () => {
    this.setState({
      expandForm: !this.state.expandForm,
    });
  }

  handleMenuClick = (e) => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;

    if (!selectedRows) return;

    switch (e.key) {
      case 'remove':
        dispatch({
          type: 'clews/remove',
          payload: {
            no: selectedRows.map(row => row.no).join(','),
          },
          callback: () => {
            this.setState({
              selectedRows: [],
            });
          },
        });
        break;
      default:
        break;
    }
  }

  handleSelectRows = (rows) => {
    this.setState({
      selectedRows: rows,
    });
  }

  handleSearch = (values) => {
    this.setState({
      formValues: values,
    });
    this.fetchClewList({values});
  }
  fetchClewList = ({values, key} = {}) => {
    const { formValues } = this.state;
    const tabCode = key || this.state.key;
    this.props.dispatch({
      type: 'clews/fetch',
      payload: {
        ...(values || formValues),
        tabCode,
      },
    });
  }
  actionBatchCheck = (result, id) => {
    const {selectedRows} = this.state;
    this.props.dispatch({
      type: 'clews/batchCheck',
      payload: {
        ids: id ? [id] : selectedRows.map(row => row.processId),
        result,
      },
    }).then(res => {
      res.code || this.fetchClewList();
    })
  }

  actionReject = () => {
    const { rejectModalVisible} = this.state;
    this.setState({
      rejectConfirmLoading: true,
    })
    this.props.dispatch({
      type: 'clews/check',
      payload: {
        id: rejectModalVisible,
        result: 1,
      },
    }).then(res => {
      this.setState({
        rejectConfirmLoading: false,
      })
      this.handleRejectModalCancel();
      if (!res) return;
      this.fetchClewList();
      this.setState({
        selectedRows: [],
      });
    })
  }
  applyAction = () => {
    const { selectedRows} = this.state;
    this.props.dispatch({
      type: 'clews/apply',
      payload: {
        clewIds: selectedRows.map(row => row.clewId),
      },
    }).then(res => {
      if (!res) return;
      if (!res.code) {
        message.success(res.message);
        this.fetchClewList();
        this.setState({
          selectedRows: [],
        });
      } else {
        message.error(res.message);
      }
    })
  }
  actionAbandon = () => {
    const { selectedRows} = this.state;
    this.props.dispatch({
      type: 'clews/abandon',
      payload: {
        ids: selectedRows.map(row => row.clewId),
      },
    }).then(res => {
      if (!res) return;
      if (!res.code) {
        message.success(res.message);
        this.fetchClewList();
        this.setState({
          selectedRows: [],
        });
      } else {
        message.error(res.message);
      }
    })
  }
  actionAssign = (member) => {
    const {assignModalVisible, selectedRows} = this.state;
    this.setState({
      assignConfirmLoading: true,
    })
    this.props.dispatch({
      type: 'clews/assign',
      payload: {
        ...member,
        clewIds: assignModalVisible > 0 ? [assignModalVisible] : selectedRows.map(row => row.clewId),
      },
    }).then(res => {
      this.setState({
        assignConfirmLoading: false,
      })
      this.handleAssignModalCancel();
      if (!res) return;
      this.fetchClewList();
      this.setState({
        selectedRows: [],
      });
    })
  }
  handleTabChange = async (key) => { //Tab切换
    this.searcher.resetFields();
    await this.setState({
      key,
      formValues: {},
      selectedRows: [],
    })
    this.fetchClewList({key});
  }

  renderTabs = (tabList, key, count) => tabList.map(item => {
    const counts = item.key == key && !['0'].includes(item.key) ? ` (${count})` : '';
    return <TabPane tab={`${item.tab}${counts && ''}`} key={item.key}>{item.tan}</TabPane>
  });
  showAssignModal = (id) => {
    this.setState({
      assignModalVisible: id || -1,
    })
  }
  showRejectModal = (id) => {
    this.setState({
      rejectModalVisible: id || -1,
    })
  }
  handleAssignModalOk = () => {
    message.success('分配成功!');
  }
  handleAssignModalCancel = () => {
    this.setState({assignModalVisible: 0})
  }
  handleRejectModalCancel = () => {
    this.setState({rejectModalVisible: 0})
  }
  onOption = (type, id) => {
    const {dispatch} = this.props;
    switch (type) {
      case 'abandon':
        return dispatch({
          type: 'clews/check',
          payload: {
            id,
            result: -1,
          },
        }).then(res => {
          res.code || this.fetchClewList();
        });
      // case 'abandon':
      //   return dispatch({
      //     type: `clews/${type}`,
      //     payload: { ids: [id] },
      //   }).then(res => {
      //     if (!res.code) {
      //       message.success(res.message);
      //     } else {
      //       message.error(res.message);
      //     }
      //   });
      case 'pass':
        return this.props.dispatch({
          type: 'clews/check',
          payload: {
            id,
            result: 0,
          },
        }).then(res => {
          if (!res.code) {
            res.code || this.fetchClewList();
          }
        })
      case 'reject':
        this.showRejectModal(id);
        break;
      case 'apply':
        return dispatch({
          type: `clews/${type}`,
          payload: { clewIds: [id] },
        }).then(res => {
          if (!res.code) {
            message.success(res.message);
            this.fetchClewList();
          }
        });
      default:
        return dispatch({
          type: `clews/${type}`,
          payload: { id },
        }).then(res => {
          if (!res.code) {
            message.success(res.message);
            this.fetchClewList();
          }
        })
    }
  }

  render() {
    const { multiRole, multiTerm, multiRoleOne } = this.state;
    const multiRoleTab = Array.from(new Set(multiRole.filter(i => [300, 400, 500].includes(Math.floor(i / 10000))).map(i => Math.floor(i / 10000) * 10000)));
    const action = (
      <React.Fragment>
        {
          multiRoleOne == 4000000 && multiTerm && Array.isArray(multiTerm) && multiTerm.length > 1 &&
          <RadioGroup onChange={this.changeMultiTerm} style={{ marginRight: 30 }} defaultValue={multiTerm[0]} value={this.state.multiTermOne}>
            <Radio value={4001000}>线索组</Radio>
            <Radio value={4002000}>订单组</Radio>
          </RadioGroup>
          // <RadioButton value={4001000}>线索组</RadioButton>
          // <RadioButton value={4002000}>订单组</RadioButton>
        }
        {
          multiRoleTab && Array.isArray(multiRoleTab) && multiRoleTab.length > 1 &&
          // <Select placeholder="请选择产品线" style={{ width: 150, marginRight: 20 }} onChange={this.changeMultiRole} defaultValue={multiRoleTab[0]}>
          //   { multiRoleTab.map(item => <Option key={item} value={item}>{({3000000: '售前客服', 4000000: '新零售销售', 5000000: '到店销售'})[item]}</Option>) }
          // </Select>
          <RadioGroup onChange={this.changeMultiRole} defaultValue={multiRoleTab[0]} value={this.state.multiRoleOne}>
            { multiRoleTab.map(item => <RadioButton key={item} value={item}>{({3000000: '售前客服', 4000000: '新零售销售', 5000000: '到店销售'})[item]}</RadioButton>) }
          </RadioGroup>
        }
      </React.Fragment>
    )
    const pageHeaderProps = {
      activeTabKey: 'clew',
      action,
    }
    const { clews: { loading, data } } = this.props;
    const { key, selectedRows, actualPermissions: permissions } = this.state;
    const {pagination: {page, pageCount, pageSize, totalCount}} = data;
    const pagination = {current: page, pageSize, total: totalCount};
    const menu = (
      <Menu onClick={this.handleMenuClick} selectedKeys={[]}>
        <Menu.Item key="remove">删除</Menu.Item>
        <Menu.Item key="approval">批量审批</Menu.Item>
      </Menu>
    );

    const modalProps = {
      visible: !!this.state.assignModalVisible,
      onOk: this.actionAssign,
      onCancel: this.handleAssignModalCancel,
      confirmLoading: this.state.assignConfirmLoading,
      destroyOnClose: true,
    }
    const rejectModalProps = {
      visible: !!this.state.rejectModalVisible,
      onOk: this.actionReject,
      onCancel: this.handleRejectModalCancel,
      destroyOnClose: true,
      confirmLoading: this.state.rejectConfirmLoading,
    }
    const tableProps = {
      data,
      type: key,
      loading,
      pagination,
      permissions,
      selectedRows,
      rowKey: 'clewId',
      onOption: this.onOption,
      actionCheck: this.actionCheck,
      onActionAssign: this.showAssignModal,
      onSelectRow: this.handleSelectRows,
      onChange: this.handleStandardTableChange,
    }
    const isAbled = selectedRows.length > 0;
    const tabList = Object.keys(tabRolesMap).filter(p => permissions.includes(~~p)).map(i => tabRolesMap[i]);

    return (
      <PageHeaderLayout {...pageHeaderProps}>
        <Select placeholder="请选择角色" style={{ width: 150, marginBottom: 20 }} onChange={this.changeRole} defaultValue={this.state.role}>
          { rolePermissions.map((item, i) => <Option key={item.name} value={i}>{item.name}</Option>) }
        </Select>
        <Card bordered={false}>
          <Tabs activeKey={key} onChange={this.handleTabChange}>
            {this.renderTabs(tabList, key, totalCount)}
          </Tabs>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>
              <ClewSearcher ref={(searcher) => { this.searcher = searcher; }} code={key} permissions={permissions} handleSearch={this.handleSearch} />
            </div>
            <div className={styles.tableListOperator}>
              {
                ['4001002'].includes(key) &&
                <React.Fragment>
                  <Button type="primary" disabled={!isAbled} onClick={() => this.actionBatchCheck(0)}>通过</Button>
                  <Button type="default" disabled={!isAbled} onClick={() => this.actionBatchCheck(1)}>驳回</Button>
                  <Button type="danger" disabled={!isAbled} onClick={() => this.actionBatchCheck(-1)}>废弃</Button>
                </React.Fragment>
                // <Button type="danger" disabled={!isAbled} onClick={() => this.actionAbandon()}>废弃</Button>
              }
              {
                ['3001002', '4001003', '4002002', '5001002'].includes(key) &&
                <Button type="default" disabled={!isAbled} onClick={this.showAssignModal}>分配</Button>
              }
              {
                ['5001003'].includes(key) &&
                <React.Fragment>
                  <Popconfirm title="确定申领此线索吗?" onConfirm={() => this.applyAction()} okText="确定" cancelText="取消">
                    <Button type="default" disabled={!isAbled} style={{ marginLeft: 8 }}>申领</Button>
                  </Popconfirm>
                </React.Fragment>
              }
            </div>
            <StandardTable {...tableProps}/>
          </div>
        </Card>
        <ClewAssignModal {...modalProps} />
        <ClewRejectModal {... rejectModalProps} />
      </PageHeaderLayout>
    );
  }
}
