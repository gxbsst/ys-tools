import React, {PureComponent} from "react";
import {
  Button,
  Row,
  Col,
  Card,
  Tree,
  Table,
  Modal,
  Form,
  Input,
  TreeSelect,
  Select,
  DatePicker,
  Radio,
  message,
  Popconfirm
} from 'antd';
import _ from 'lodash';
import moment from 'moment';
import {connect} from 'dva';
import {tree} from '../../../utils/index';
import request from '../../../utils/request';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import autodata from '../../../decorators/AutoData';
import Dialog from '../../../components/Dialog';
import AutoComplete from '../../../components/AutoComplete'
import Addorg from './Modal/neworg'
import Delorg from './Modal/delorg'
import Newstaff from './Modal/newstaff'
import Addstaff from './Modal/addtaff';
import common from '../common/index.less'
import styles from './index.less'

const TreeNode = Tree.TreeNode;
const Search = Input.Search;
const Option = Select.Option;
const {Item: FormItem} = Form;
const RadioGroup = Radio.Group;
const dateFormat = 'YYYY-MM-DD';
const simpleFormat = {
  id: 'id',
  pId: 'parentId',
  rootPId: 0,
};
const formItemLayout = {
  labelCol: {
    span: 8
  },
  wrapperCol: {
    span: 16
  }
};
const ItemLayout = {
  labelCol: {
    span: 4
  },
  wrapperCol: {
    span: 20
  }
};
const AutoCompleteProps = {
  dataSource: '/api/personnel/employee/think',
  valuePropName: 'id',
  keywordPropName: 'name',
  labelRender: record => `${record.name} (${record.username})`
}

class BranchTree extends PureComponent {
  constructor(props) {
    super(...arguments)
  }

  state = {
    expandedKeys: ['0-0-0', '0-0-1'],
    selectedKeys: [],
  };
  renderTreeNodes = (data) => {
    return data.map((item) => {
      if (item.children) {
        return (
          <TreeNode title={item.title} key={item.key} dataRef={item}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode {...item} />;
    });
  }
  getParentPaths = (parentId) => {
    if (!parentId) return '';
    const {branch} = this.props;
    const parentNode = branch.filter(item => (item.id === parentId));
    if (parentNode.length) {
      return `${this.getParentPaths(parentNode[0].parentId)}${parentNode[0].name}/`;
    } else {
      return ''
    }
  }
  onSelect = (selectedKeys, info, e) => {
    const id = selectedKeys[0];
    const {node: {props: {dataRef: {parentId, name}}}} = info;
    const selectedTissue = this.getParentPaths(parentId) + name;
    this.props.handleId(id, selectedTissue);
  };

  render() {
    const {branch} = this.props;
    console.info('branch', branch)
    const treeData = tree(branch);
    return (
      <Tree
        defaultExpandedKeys={this.state.expandedKeys}
        autoExpandParent={true}
        defaultSelectedKeys={['0-0-0', '0-0-1']}
        onSelect={this.onSelect}
      >
        {this.renderTreeNodes(treeData)}
      </Tree>
    );
  }
}

// staffList 员工列表  branchStaffList 部门下的人员列表
@connect(({personal_info}) => (
    {
      branch: personal_info.branch,
      branchStaffList: personal_info.branchStaffList,
      status: personal_info.status,
      loading: personal_info.loading,
      staffAllList: personal_info.staffAllList ? personal_info.staffAllList : []
    }
  )
)
export default class PersonnelInfo extends PureComponent {
  constructor(props) {
    super(props);
  }

  state = {
    visible: false,
    addOrgVisible: false,
    newStaffVisible: false,
    ban: true,
    selectedTissue: '',
    id: 0,
  };

  componentDidMount() {
    const {dispatch} = this.props;
    dispatch({
      type: 'personal_info/branch',
    });
    dispatch({
      type: 'personal_info/getbranchstaff',
      payload: {}
    });
    dispatch({
      type: 'personal_info/getStaffList',
    });
  }

  componentWillReceiveProps(nextProps) {
    console.info('nextProps', nextProps)
  }

  handleId = (id, selectedTissue) => {
    this.setState({
      ban: false
    })
    const {dispatch} = this.props;
    if (id) {
      // 发起获取部门下人员列表的请求
      dispatch({
        type: 'personal_info/getbranchstaff',
        payload: {
          id
        }
      });
      this.setState({
        id
      })
    } else {
      this.setState({
        ban: true
      })
    }
    if (selectedTissue) {
      this.setState({
        selectedTissue
      })
    }
  };
  // 新增员工方法
  showModal = () => {
    this.setState({visible: true});
  };
  handleCancel = () => {
    this.setState({visible: false});
  };
  handleAddStaffCreate = () => {
    const form = this.AddStaffForm;
    const {dispatch} = this.props;
    form.validateFields(async (err, values) => {
      if (err) {
        return;
      }
      const dId = this.state.id;
      const {eId, isLeader} = values;
      await dispatch({
        type: 'personal_info/addStaff',
        dId,
        eId,
        params: {isLeader}
      });
      this.setState({visible: false});
      form.resetFields();
      dispatch({
        type: 'personal_info/getbranchstaff',
        payload: {id: dId}
      });
    });
  };
  saveAddStaffFormRef = (form) => {
    this.AddStaffForm = form;
  };
  // 新建组织方法
  showAddOrgModal = () => {
    this.setState({addOrgVisible: true});
  }
  handleAddOrgCancel = () => {
    const form = this.AddOrgform;
    form.resetFields();
    this.setState({addOrgVisible: false});
  }
  handleCreate = () => {
    const form = this.AddOrgform;
    form.validateFields(async (err, values) => {
      if (err) {
        return;
      }
      const {props: {dispatch}, state: {id}} = this;
      let params = _.cloneDeep(values);
      params.parentId = id;
      await dispatch({type: 'personal_info/addTissue', params})
      dispatch({type: 'personal_info/branch'});
      form.resetFields();
      this.setState({addOrgVisible: false});
    });
  }
  saveFormRef = (form) => {
    this.AddOrgform = form;
  }
  // 删除组织
  delOrg = async () => {
    const {props: {dispatch}, state: {id}} = this;
    id && await dispatch({type: 'personal_info/delTissue', id});
    dispatch({type: 'personal_info/branch'});
  };
  // 新建员工
  showNewStaffModal = () => {
    this.setState({newStaffVisible: true});
  }
  handleNewStaffCancel = () => {
    this.setState({newStaffVisible: false});
  }
  handleNewStaffCreate = () => {
    const form = this.NewStaffForm;
    const {id} = this.state;
    const {dispatch} = this.props;
    const dId = [];
    dId.push({id});
    form.validateFields(async (err, values) => {
      if (err) {
        return;
      }
      const {joinTime, leftTime} = values;
      await dispatch({
        type: 'personal_info/newStaff',
        params: {
          ...values,
          departmentIds: dId,
          joinTime: moment(joinTime).format('YYYY-MM-DD HH:mm:ss'),
          leftTime: moment(leftTime).format('YYYY-MM-DD HH:mm:ss'),
        }
      })
      dispatch({
        type: 'personal_info/getbranchstaff',
        payload: {}
      });
      form.resetFields();
      this.setState({newStaffVisible: false});
    });
  };
  saveNewStaffFormRef = (form) => {
    this.NewStaffForm = form;
  };
  // 删除员工
  handleDel = (record) => async () => {
    let {state: {id: departmentId}, props: {dispatch}} = this;
    departmentId = departmentId === 0 ? 1 : departmentId;
    const {data, code, message: msg} = await request(`/api/personnel/employee/${record.id}`, {
      method: "delete",
      query: {departmentId}
    })
    if (code === 0) {
      message.success(msg)
    } else {
      message.error(msg)
    }
    dispatch({
      type: 'personal_info/getbranchstaff',
      payload: {
        id: departmentId
      }
    });


  };
  // 转移组织架构
  shift = () => () => {
    const {branch, dispatch} = this.props;
    const {selectedTissue, id} = this.state;
    const tree = branch.map(item => ({
      ...item, value: `${item.id}`, title: `${item.name}`
    }))
    Dialog.open({
      title: '转移组织架构',
      formProps: {
        action: '/api/personnel/department/transfer',
        method: 'PUT',
        valuesFilter: values => _.merge(values, {id}),
        onSubmitted: ({message: msg, code}) => {
          if (code === 0) {
            message.success(msg)
          } else {
            message.error(msg)
          }
          dispatch({
            type: 'personal_info/branch',
          });
        }
      },
      render({props: {form: {getFieldDecorator}}}) {
        return (
          <div>
            <FormItem {...ItemLayout} label="转移组织">
              <span>{selectedTissue}</span>
            </FormItem>
            <FormItem {...ItemLayout} label="目标组织">
              {getFieldDecorator('parentId', {
                rules: [{required: true, message: '目标组织'}]
              })(<TreeSelect
                  dropdownStyle={{maxHeight: 400, overflow: 'auto'}}
                  treeDefaultExpandAll
                  treeData={tree}
                  treeDataSimpleMode={simpleFormat}
                />
              )}
            </FormItem>
          </div>
        );
      }
    });
  }
  //
  // 编辑人员信息
  edit = record => async () => {
    const {data, data: {departmentIds}} = await request(`/api/personnel/employee/${record.id}`);
    console.info('编辑', data);
    let id = departmentIds[0].id;
    let depIdName = departmentIds[0].name;
    const {selectedTissue} = this.state;
    const dId = [];
    dId.push({id});
    Dialog.open({
      title: '员工编辑',
      width: 700,
      formProps: {
        action: '/api/personnel/employee/' + record.id + '',
        method: 'PUT',
        valuesFilter: values => _.merge(values, {
          departmentIds: dId,
          joinTime: moment(values.joinTime).format(dateFormat),
          leftTime: moment(values.leftTime).format(dateFormat)
        }),
        onSubmitted: (res) => {
          const {data, message: msg} = res;
          data && message.success(msg);
          this.props.$data.reload();
          this.destroy();
        }
      },
      render({props: {form: {getFieldDecorator}}}) {
        return (
          <div>
            <div className={common.item}>
              <FormItem  {...formItemLayout} label='邮箱'>
                {
                  getFieldDecorator('email', {
                    rules: [{required: true, message: '请输入邮箱', type: 'email'}],
                    initialValue: data.email
                  })(
                    <Input/>
                  )
                }
              </FormItem>
              <FormItem {...formItemLayout} label='登录名'>
                {
                  getFieldDecorator('username', {
                    rules: [{required: true, message: '请输入登陆名'}],
                    initialValue: data.username
                  })(
                    <Input disabled={true}/>
                  )
                }
              </FormItem>
            </div>
            <div className={common.item}>
              <FormItem {...formItemLayout} label='姓名'>
                {
                  getFieldDecorator('name', {
                    rules: [{required: true, message: '请输入姓名'}],
                    initialValue: data.name
                  })(
                    <Input/>
                  )
                }
              </FormItem>
              <FormItem {...formItemLayout} label='手机号'>
                {
                  getFieldDecorator('mobile', {
                    rules: [{required: true, message: '请输入手机号'}],
                    initialValue: data.mobile
                  })(
                    <Input/>
                  )
                }
              </FormItem>
            </div>
            <div className={common.item}>
              <FormItem  {...formItemLayout} label='职位名称'>
                {
                  getFieldDecorator('position', {
                    rules: [{required: true, message: '请输入职位名称'}],
                    initialValue: data.position
                  })(
                    <Input/>
                  )
                }
              </FormItem>
              <FormItem {...formItemLayout} label='在职状态'>
                {
                  getFieldDecorator('isOnJob', {
                    rules: [{required: true, message: '在职状态'}],
                    initialValue: data.isOnJob
                  })(
                    <Select>
                      <Option value={0}>在职</Option>
                      <Option value={1}>离职</Option>
                    </Select>
                  )
                }
              </FormItem>
            </div>
            <div className={common.item}>
              <FormItem {...formItemLayout} label='入职时间'>
                {
                  getFieldDecorator('joinTime', {
                    rules: [{required: true, message: '请选择您的入职时间'}],
                    initialValue: moment(data.joinTime, dateFormat)
                  })(
                    <DatePicker
                      style={{width: '100%'}}
                      format={dateFormat}
                      placeholder="入职时间"
                    />
                  )
                }
              </FormItem>
              <FormItem {...formItemLayout} label='离职时间'>
                {
                  getFieldDecorator('leftTime', {
                    initialValue: moment(data.leftTime, dateFormat)
                  })(
                    <DatePicker
                      style={{width: '100%'}}
                      format={dateFormat}
                      placeholder="离职时间"
                    />
                  )
                }
              </FormItem>
            </div>
            {/*组织架构*/}
            <div className={common.item} style={{width: '46%'}}>
            <span className={common.columnsTwo + ' ' + common.left + ' ' + common.right + ' ' + common.important}
                  style={{width: '32%'}}>所选组织：</span>
              <span>{selectedTissue ? selectedTissue : depIdName}</span>
            </div>
            <div className={common.item}>
              <FormItem {...formItemLayout} label='组织负责人'>
                {
                  getFieldDecorator('isLeader', {
                    rules: [{required: true, message: '请确认是否是组织负责人'}],
                    initialValue: false
                  })(
                    <RadioGroup>
                      <Radio value={true}>是</Radio>
                      <Radio value={false}>否</Radio>
                    </RadioGroup>
                  )
                }
              </FormItem>
            </div>
            <div className={common.item}>
              <FormItem {...formItemLayout} label='直接上级'>
                {
                  getFieldDecorator('leaderId', {
                    trigger: 'onSelect',
                    getValueFromEvent: record => record.id,
                    initialValue: data.leaderId
                  })(
                    <AutoComplete placeholder="请输入直接上级" {...AutoCompleteProps}/>
                  )
                }
              </FormItem>
            </div>
            <div className={common.item}>
              <FormItem {...formItemLayout} label='担保额度'>
                {
                  getFieldDecorator('guaranteeAmount', {
                    initialValue: data.guaranteeAmount
                  })(
                    <Input/>
                  )
                }
              </FormItem>
            </div>
            <div>
            </div>
          </div>
        );
      }
    });
  };

  render() {
    const {ban, selectedTissue} = this.state;
    let {branch, branchStaffList, loading, staffAllList} = this.props;
    console.info('branchStaffList', branchStaffList);
    staffAllList = staffAllList.map(item => _.values((_.pick(item, ['email']))));
    if (branch) {
      branch.forEach((item) => {
        item['key'] = item.id;
        item['title'] = item.name;
      });
    }
    const columns = [{
      title: '组织负责人',
      dataIndex: 'isLeader',
      key: 'dataIndex',
      render: (text, record) => (
        <div>
          {record.isLeader ? '是' : '不是'}
        </div>
      ),
    }, {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    }, {
      title: '岗位名称',
      dataIndex: 'position',
      key: 'position',
    }, {
      title: '在职状态',
      dataIndex: 'isOnJob',
      key: 'isOnJob',
      render: (item) => (
        <span>{item ? '离职' : '在职'}</span>
      )
    }, {
      title: '直接上级',
      dataIndex: 'leaderName',
      key: 'leaderName',
    }, {
      title: '操作',
      key: 'action',
      render: (text, record) => (
        <div className={common.operate}>
          <span className={common.item} onClick={this.edit(record)}>编辑</span>
          <Popconfirm placement="bottom" title="确定要解除绑定该员工组织架构关系" onConfirm={this.handleDel(record)} okText="确定"
                      cancelText="取消">
            <span className={common.item}>删除</span>
          </Popconfirm>
        </div>
      ),
    },
    ];
    // 页码
    const paginationProps = {
      defaultPageSize: 10,
      pageSizeOptions: ["10", "20", "30"],
      showSizeChanger: true,
      showTotal: function (total) {
        return "总共" + total + "条";
      }
    };
    return (
      <PageHeaderLayout>
        <Row gutter={24} className={styles.dataTree}>
          <Col span={6} style={{overflow: 'hidden'}}>
            <Card title="" bordered={false}>
              <Row gutter={60}>
                <Col xl={4}>
                  <div>
                    <Button type="primary" onClick={this.showAddOrgModal}>新建</Button>
                    <Addorg
                      ref={this.saveFormRef}
                      visible={this.state.addOrgVisible}
                      onCancel={this.handleAddOrgCancel}
                      onCreate={this.handleCreate}
                      selectedTissue={selectedTissue}
                    />
                  </div>
                </Col>
                <Col xl={{span: 4, offset: 1}}>
                  <Delorg delOrg={this.delOrg} ban={ban}/>
                </Col>
                <Col xl={{span: 4, offset: 1}}>
                  <Button type="primary" disabled={ban} onClick={this.shift()}>转移</Button>
                </Col>
              </Row>
              <div>
                {
                  branch ? <BranchTree branch={branch} handleId={this.handleId}></BranchTree> : ''
                }
              </div>
            </Card>
          </Col>
          <Col span={18} style={{marginBottom: 24}}>
            <Card title="" bordered={false}>
              {/*新建员工*/}
              <div style={{display: 'inline-block'}}>
                <Button type="primary"
                        style={{marginRight: 10}}
                        disabled={ban}
                        onClick={this.showNewStaffModal}>新建员工</Button>

                <Newstaff
                  selectedTissue={selectedTissue}
                  ref={this.saveNewStaffFormRef}
                  visible={this.state.newStaffVisible}
                  onCancel={this.handleNewStaffCancel}
                  staffAllList={staffAllList}
                  onCreate={this.handleNewStaffCreate}/>
              </div>
              {/*添加员工*/}
              <div style={{display: 'inline-block'}}>
                <Button type="primary"
                        onClick={this.showModal} disabled={ban}>添加员工</Button>
                <Addstaff
                  ref={this.saveAddStaffFormRef}
                  visible={this.state.visible}
                  onCancel={this.handleCancel}
                  onCreate={this.handleAddStaffCreate}
                  selectedTissue={selectedTissue}
                />
              </div>
              <div className={common.marginTop}>
                <Table columns={columns}
                       dataSource={branchStaffList}
                       rowKey='id'
                       loading={loading}
                       className={common.tableBody}/>
              </div>
            </Card>
          </Col>
        </Row>
      </PageHeaderLayout>
    )
  }
}
