import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Radio, Tabs, Card, Form, Popconfirm, Button, message, Select, Input } from 'antd';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import can from '../../../decorators/Can';
import ClewAssignModal from '../Modal/ClewAssignModal';
import StandardTable from './_ClewTable';
import ClewSearcher from './_ClewSearcher';
import ClewRejectModal from '../Modal/ClewRejectModal';
import { tabRolesMap, renderOptions } from '../../../utils/paramsMap';
import styles from './style.less';

const hasPermission = (has = [], should = []) => has.some(item => should.includes(item));
const { Group: InputGroup, Search: InputSearch } = Input;
const { TabPane } = Tabs;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const getValue = obj => Object.keys(obj).map(key => obj[key]).join(',');

const roleMap = {
  3000000: '售前客服',
  4000000: '新零售销售',
  5000000: '到店销售',
}
const teamMap = {
  4001000: '线索组',
  4002000: '订单组',
}
const searchMap = new Map([
  ['clewId', '线索ID'],
  ['customerName', '客户名称'],
  ['mobile', '联系电话'],
])
const enCode = (code) => {
  const sign = Math.ceil((Math.random() * 26) + 10)
  return sign + code.toString(sign).split('').reverse().join('');
}
const deCode = (code) => {
  const sign = Number(code.slice(0, 2));
  return parseInt(code.slice(2).split('').reverse().join(''), sign)
}
//多重角色，包括售前、新零售、到店的时候
function getMultiRole(permissions) {
  const multiPermission = permissions.filter((i) => [3001000, 4001000, 4002000, 5001000].includes(i));
  return Array.from(new Set(multiPermission.filter(i => [300, 400, 500].includes(Math.floor(i / 10000))).map(i => Math.floor(i / 10000) * 10000)));
}
//多重组织，包括线索和订单（针对新零售）
function getMultiTerm(permissions, multiRoleOne) {
  return multiRoleOne / 10000 == 400 ? permissions.filter((i) => [4001000, 4002000].includes(i)) : [((multiRoleOne / 1000) + 1) * 1000];
}

@connect(state => ({
  clews: state.clews,
}))
@Form.create()
@can([3001000, 4001000, 4002000, 5001000], true)
export default class ClewList extends PureComponent {
  state = {
    permissions: [],
    actualPermissions: [],
    multiRole: [],
    multiRoleOne: Number,
    multiTerm: [],
    multiTermOne: Number,
    key: '',
    assignModalVisible: 0,
    rejectModalVisible: 0,
    assignConfirmLoading: false,
    rejectConfirmLoading: false,
    expandForm: true,
    selectedRows: [],
    formValues: {},
    searchColumn: 'clewId',
    searchValue: '',
  };
  componentDidMount() {
    this.initRolePermissions();
  }
  mockPermissionsByRoleTerm(multiTermOne, permissions) {
    return (permissions || this.state.permissions || []).filter(i => Math.floor(i / 1000) == Math.floor(multiTermOne / 1000))
  }
  initRolePermissions = async () => {
    const permissions = this.props.permissions.filter(i => i >= 3000000 && i < 6000000);
    const multiRole = getMultiRole(permissions);
    const clewListStorage = sessionStorage.getItem('clewList');
    const tempRoleOne = clewListStorage && JSON.parse(clewListStorage).multiRoleOne;
    const multiRoleOne = multiRole.includes(tempRoleOne) ? tempRoleOne : multiRole[0];
    const multiTerm = getMultiTerm(permissions, multiRoleOne);
    const tempTermOne = clewListStorage && JSON.parse(clewListStorage).multiTermOne;
    const multiTermOne = multiTerm.includes(tempTermOne) ? tempTermOne : multiTerm[0];
    const actualPermissions = this.mockPermissionsByRoleTerm(multiTermOne, permissions);
    await this.setState({
      permissions,
      multiRole,
      multiRoleOne,
      multiTerm,
      multiTermOne,
      actualPermissions,
    });
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
    const { value: multiRoleOne } = e.target;
    const multiTerm = getMultiTerm(this.state.permissions, multiRoleOne);
    const multiTermOne = multiTerm[0];
    await this.setState({
      multiTerm,
      multiRoleOne,
      multiTermOne,
      actualPermissions: this.mockPermissionsByRoleTerm(multiTerm[0]),
    })
    sessionStorage.setItem('clewList', JSON.stringify({multiRoleOne, multiTermOne}));
    this.changeTabByRole();
  }
  changeMultiTerm = async (e) => {
    const { value: multiTermOne } = e.target;
    await this.setState({
      multiTermOne,
      actualPermissions: this.mockPermissionsByRoleTerm(multiTermOne),
    })
    sessionStorage.setItem('clewList', JSON.stringify({...JSON.parse(sessionStorage.getItem('clewList')), multiTermOne}));
    this.changeTabByRole();
  }
  fetchClewList = ({values, key, search} = {}) => {
    console.log('props', this.props);
    const { formValues } = this.state;
    const tabCode = key || this.state.key;
    this.props.dispatch({
      type: 'clews/fetch',
      payload: {
        ...(search || (values || formValues)),
        tabCode,
      },
    });
  }
  onSearchSelect = searchColumn => {
    this.setState({searchColumn});
  }
  onSearchChange = e => {
    this.setState({searchValue: e.target.value});
  }
  onSearch = searchValue => {
    const { searchColumn } = this.state;
    this.fetchClewList({search: {column: searchColumn, value: searchValue}});
  }
  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const { formValues, key, searchColumn, searchValue } = this.state;

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
      payload: searchValue ? {tabCode: key, column: searchColumn, value: searchValue, page: pagination.current, pageSize: pagination.pageSize, } : params,
    });
  }

  handleFormReset = async () => {
    const { form } = this.props;
    form.resetFields();
    await this.setState({
      formValues: {},
      searchValue: '',
    });
    this.fetchClewList();
  }

  toggleForm = () => {
    this.setState({
      expandForm: !this.state.expandForm,
    });
  }

  handleSelectRows = (rows) => {
    this.setState({
      selectedRows: rows,
    });
  }

  handleSearch = async (values) => {
    await this.setState({
      formValues: values,
      searchValue: '',
    });
    this.fetchClewList({values});
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
      searchValue: '',
      searchColumn: 'clewId',
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
    const { multiRole, multiTerm, multiRoleOne, multiTermOne } = this.state;
    const multiRoleTab = Array.from(new Set(multiRole.filter(i => [300, 400, 500].includes(Math.floor(i / 10000))).map(i => Math.floor(i / 10000) * 10000)));
    const action = (
      <React.Fragment>
        <div style={{ float: 'left' }}>
          {`-${roleMap[multiRoleOne]}${multiRoleOne == 4000000 ? `-${teamMap[multiTermOne]}` : ''}`}
        </div>
        {
          multiRoleOne == 4000000 && multiTerm && Array.isArray(multiTerm) && multiTerm.length > 1 &&
          <RadioGroup onChange={this.changeMultiTerm} style={{ marginRight: 30 }} defaultValue={multiTerm[0]} value={this.state.multiTermOne}>
            <Radio value={4001000}>线索组</Radio>
            <Radio value={4002000}>订单组</Radio>
          </RadioGroup>
        }
        {
          multiRoleTab && Array.isArray(multiRoleTab) && multiRoleTab.length > 1 &&
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
    const {pagination: {page, pageSize, totalCount}} = data;
    const pagination = {current: page, pageSize, total: totalCount};

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
      type: ~~key,
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
    const { searchColumn, searchValue } = this.state;
    const extra = (
      [3001001, 4001001, 4001004, 4002001, 5001001].includes(~~key) &&
      <InputGroup compact>
        <Select value={searchColumn} onSelect={this.onSearchSelect}>{renderOptions(searchMap)}</Select>
        <InputSearch value={searchValue} onChange={e => this.onSearchChange(e)} enterButton onSearch={this.onSearch} style={{width: 300}} />
      </InputGroup>
    );
    return (
      <PageHeaderLayout {...pageHeaderProps}>
        <Card bordered={false}>
          <Tabs activeKey={key} onChange={this.handleTabChange} tabBarExtraContent={extra}>
            {this.renderTabs(tabList, key, totalCount)}
          </Tabs>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>
              <ClewSearcher ref={(searcher) => { this.searcher = searcher; }} code={~~key} permissions={permissions} handleSearch={this.handleSearch} />
            </div>
            <div className={styles.tableListOperator}>
              {
                ['4001002'].includes(key) &&
                <React.Fragment>
                  <Button type="primary" disabled={!isAbled} onClick={() => this.actionBatchCheck(0)}>通过</Button>
                  <Button type="default" disabled={!isAbled} onClick={() => this.actionBatchCheck(1)}>驳回</Button>
                  <Button type="danger" disabled={!isAbled} onClick={() => this.actionBatchCheck(-1)}>废弃</Button>
                </React.Fragment>
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
