import React, {PureComponent} from "react";
import {connect} from 'dva';
import {
  Table, Card, Input, Form,
  Select,
  DatePicker,
  Button,
} from 'antd';
import moment from 'moment';
import Dialog from '../../../components/Dialog';
import CheckItem from './check/index'
import RoleManage from './roleManage/index'
import request from '../../../utils/request';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import {Link} from "react-router-dom";
import {browserHistory} from 'react-router'
import autodata from '../../../decorators/AutoData';
import styles from './index.less';
import common from '../common/index.less'

const FormItem = Form.Item;
const Search = Input.Search;
const Option = Select.Option;
const dateFormat = 'YYYY-MM-DD';
const formItemLayout = {
  labelCol: {
    span: 8
  },
  wrapperCol: {
    span: 16
  }
};

@connect(state => {
  return {
    list: state.personal_info.list.data,
  }
})
@autodata('/api/personnel/employee')
export default class PersonnelInfo extends PureComponent {
  constructor() {
    super(...arguments);
  }

  state = {
    list: '',
    confirmDirty: false,
    Result: '',
    ban: false,
    visible: false,
    roleVisible: false,
    personItem: {},
    roleList: [],
    username: '',
    employeeRole: []
  };
  searchItem = (value) => async () => {
    !value && this.setState({Result: []})
    const {data} = await request(`/api/personnel/employee?name=${value}`);
    this.props.$data.reload();
    this.setState({
      Result: data || []
    });
  }
  // 查看
  checkItem = record => async () => {
    const {data} = await request(`/api/personnel/employee/${record.id}`);
    this.setState({
      personItem: data,
      visible: true
    })
  }
  // 所有角色列表
  getRoleList = async () => {
    const {data} = await request(`/api/role`, {
      query: {page: 1, pageSize: 100}
    });
    this.setState({
      roleList: data || []
    })
  };

  componentDidMount() {
    this.getRoleList()
  }

  edit = record => async () => {
    const {data} = await request(`/api/personnel/employee/${record.id}`);
    this.setState({
      ban: true
    })
    Dialog.open({
      title: '编辑人员信息',
      width: 700,
      formProps: {
        action: '/api/personnel/employee/' + record.id + '',
        method: 'PUT',
        valuesFilter: values => _.merge(record, values,
          {joinTime: moment(values.joinTime).format(dateFormat), leftTime: moment(values.leftTime).format(dateFormat)}),
        onSubmitted: () => {
          this.props.$data.reload();
          this.setState({
            ban: false
          })
        }
      },
      onCancel() {
        this.destroy();
        this.setState({
          ban: true
        })
      },
      render({props: {form: {getFieldDecorator}}}) {
        return (
          <div>
            <div className={styles.item}>
              <FormItem  {...formItemLayout} label='邮箱'>
                {
                  getFieldDecorator('email', {
                    rules: [{required: true, message: '请输入正确的邮箱地址', type: 'email'}],
                    initialValue: data.email
                  })(
                    <Input placeholder="请输入正确的邮箱地址"/>
                  )
                }
              </FormItem>
              <FormItem {...formItemLayout} label='登陆名'>
                {
                  getFieldDecorator('username', {
                    rules: [{required: true, message: '请输入登陆名'}],
                    initialValue: data.username
                  })(
                    <Input placeholder="请输入登陆名"/>
                  )
                }
              </FormItem>
            </div>
            <div className={styles.item}>
              <FormItem {...formItemLayout} label='姓名'>
                {
                  getFieldDecorator('name', {
                    rules: [{required: true, message: '请输入您的姓名', type: 'string'}],
                    initialValue: data.name
                  })(
                    <Input placeholder="请输入您的姓名"/>
                  )
                }
              </FormItem>
              <FormItem {...formItemLayout} label='手机号'>
                {
                  getFieldDecorator('mobile', {
                    rules: [{required: true, message: '请输入正确的手机号'}],
                    initialValue: data.mobile
                  })(
                    <Input placeholder="请输入您的手机号"/>
                  )
                }
              </FormItem>
            </div>
            <div className={styles.item}>
              <FormItem  {...formItemLayout} label='职位名称'>
                {
                  getFieldDecorator('position', {
                    rules: [{required: true, message: '请输入您的职位名称', type: 'string'}],
                    initialValue: data.position
                  })(
                    <Input placeholder="请输入您的职位名称"/>
                  )
                }
              </FormItem>
              <FormItem {...formItemLayout} label='在职状态'>
                {
                  getFieldDecorator('isOnJob', {
                    rules: [{required: true, message: '请选择您的在职状态'}],
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
            <div className={styles.item}>
              <FormItem {...formItemLayout} label='入职时间'>
                {
                  getFieldDecorator('joinTime', {
                    rules: [{required: true, message: '请选择您的入职时间'}],
                  })(
                    <DatePicker
                      style={{width: '100%'}}
                      placeholder="请输入您的入职时间"
                    />
                  )
                }
              </FormItem>
              <FormItem {...formItemLayout} label='离职时间'>
                {
                  getFieldDecorator('leftTime', {})(
                    <DatePicker
                      style={{width: '100%'}}
                      placeholder="请输入您的离职时间"
                    />
                  )
                }
              </FormItem>
            </div>
            <div className={styles.item}>
              <FormItem {...formItemLayout} label='担保额度'>
                {
                  getFieldDecorator('guaranteeAmount', {
                    rules: [{required: true, message: '请输入您的担保额度'}],
                    initialValue: data.guaranteeAmount
                  })(
                    <Input placeholder="请输入您的担保额度"/>
                  )
                }
              </FormItem>
            </div>
          </div>
        );
      }
    });
  };
  handleCancel = () => {
    this.setState({
      visible: false,
      roleVisible: false,
    })
  }
  employeeRole = ({username}) => async () => {
    const {data} = await request(`/api/role/employee/${username}/fix`)
    this.setState({
      employeeRole: data ? data : [],
      username,
      roleVisible: true
    })
  }
  render() {
    const {ban, Result, visible, personItem, roleVisible, employeeRole, roleList, username} = this.state;
    const {$data: {searcher, data: dataSource = [], pagination, loading, reload}} = this.props;
    const columns = [{
      title: '姓名',
      dataIndex: 'name',
    }, {
      title: '邮箱',
      dataIndex: 'email',
    }, {
      title: '手机号',
      dataIndex: 'mobile',
    }, {
      title: '岗位名称',
      dataIndex: 'position',
    }, {
      title: '在职状态',
      dataIndex: 'isOnJob',
      render: (text, reload) => (
        <span>{reload.isOnJob ? '离职' : '在职'}</span>
      )
    }, {
      title: '直接上级',
      dataIndex: 'leaderName',
    }, {
      title: '操作',
      key: 'action',
      render: (text, record) => (
        <div className={common.operate} style={{position: 'relative'}}>
          <button className={common.item + ' ' + common.borderNone} onClick={this.edit(record)}>编辑</button>
          <span className={common.item + ' ' + common.borderNone} onClick={this.checkItem(record)}>查看</span>
          <span className={common.item} onClick={this.employeeRole(record)}>角色管理</span>
        </div>
      ),
    },
    ];
    const action = (
      <div>
        <Search
          placeholder="请输入员工姓名"
          onSearch={value => this.searchItem(value)()}
          style={{width: 300}}
          enterButton
        />
      </div>
    );
    return (
      <PageHeaderLayout
        action={action}
      >
        <Card>
          <Table columns={columns}
                 dataSource={Result ? Result : dataSource}
                 pagination={pagination}
                 loading={loading}
                 rowKey="id"/>
        </Card>
        <CheckItem
          info={personItem}
          visible={visible}
          title="人员信息"
          onCancel={this.handleCancel}
        />
        <RoleManage
          visible={roleVisible}
          employeeRole={employeeRole}
          title="角色管理"
          roleList={roleList}
          onCancel={this.handleCancel}
          username={username}
        />
      </PageHeaderLayout>
    );
  }
}
