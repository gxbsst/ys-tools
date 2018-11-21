import React, { PureComponent } from 'react';
import { Table, Card, Spin, Input, Button } from 'antd';
import _ from 'lodash';
import moment from 'moment';
import { autodata, can } from '../../../decorators';
import { Dialog } from '../../../components';
import { Action, ColumnGroup, Select } from '../../../components/Helpers';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import StaffForm from './StaffForm';
import { redirectTo } from '../../../utils';
import { getDate, getJobStatus, getJobStatusTag } from '../../../utils/helpers';
import styles from './index.less';
import PropTypes from 'prop-types';

const { Search: InputSearch } = Input;
const filterOption = (value, option) => option.props.children.toUpperCase().indexOf(value.toUpperCase()) > -1;

export function valuesFilter(values) {
  const { staff: { data: { departmentIds = [] } } } = this.props;
  let { joinTime, leftTime } = values;
  if (moment.isMoment(joinTime)) {
    joinTime = joinTime.format('YYYY-MM-DD');
  }
  if (moment.isMoment(leftTime)) {
    leftTime = leftTime.format('YYYY-MM-DD');
  }
  return _.omitBy({ ...values, joinTime, leftTime, departmentIds: departmentIds.map(({ id }) => ({ id })) }, _.isNull);
}

@autodata({
  namespace: 'staff',
  url: '/api/personnel/employee',
})
export default class Staff extends PureComponent {
  static contextTypes = {
    query: PropTypes.object,
    location: PropTypes.object,
  };

  edit = (id) => () => {
    Dialog.open({
      title: '编辑人员信息',
      width: 700,
      autodata: { staff: `/api/personnel/employee/${id}` },
      formProps: {
        action: `/api/personnel/employee/${id}`,
        method: 'PUT',
        valuesFilter,
        onSubmitted: () => {
          this.props.staff.reload();
        }
      },
      onEmailChange({ target: { value } }) {
        const { form: { setFieldsValue } } = this.props;
        setFieldsValue({ username: (value || '').split('@')[0] });
      },
      render() {
        const { staff, form } = this.props;
        return <StaffForm form={form} staff={staff}/>;
      }
    });
  };

  show = (id) => () => {
    Dialog.open({
      title: '查看人员信息',
      width: 700,
      autodata: `/api/personnel/employee/${id}`,
      footerRender() {
        return <Button type="primary" onClick={this.destroy}>关 闭</Button>;
      },
      render() {
        const { $data: { data = {}, loading } } = this.props;
        const { email, username, name, mobile, position, isOnJob, joinTime, leftTime, guaranteeAmount } = data;
        const columns = [
          { label: '邮箱地址', value: email },
          { label: '登录帐号', value: username },
          { label: '员工姓名', value: name },
          { label: '手机号码', value: mobile },
          { label: '职位名称', value: position },
          { label: '在职状态', value: getJobStatus(isOnJob) },
          { label: '入职时间', value: getDate(joinTime) },
          { label: '离职时间', value: getDate(leftTime) },
          { label: '担保额度', value: guaranteeAmount },
        ];
        return <ColumnGroup items={columns} col={12} loading={loading}/>;
      }
    });
  };

  role = (username) => () => {
    Dialog.open({
      autodata: {
        all: { url: '/api/role', query: { pageSize: 100 } },
        roles: `/api/role/employee/${username}/fix`,
      },
      formProps: {
        action: `/api/role/employee/${username}/fix`,
        method: 'POST',
        valuesFilter: ({ roles }) => roles.map(id => ~~id)
      },
      titleRender() {
        const { roles: { data: roles } } = this.props;
        const isMaster = _.some(roles, { isMaster: 1 });
        return `人员角色管理${isMaster ? '（超级管理员）' : ''}`;
      },
      render() {
        const { all: { data: all = [] }, roles: { data: roles = [], loading }, form: { getFieldDecorator } } = this.props;
        const initialValue = _.reject(roles, { isMaster: 1 }).map(({ id }) => id);
        const options = all.map(({ id: value, name: label }) => ({value, label}));
        const selectProps = {
          mode: 'multiple',
          placeholder: '请选择要添加的角色',
          notFoundContent: '没有找到相关角色',
          filterOption,
          options,
        };
        return (
          <Spin spinning={loading} delay={20}>
            {getFieldDecorator('roles', { initialValue })(<Select {...selectProps}/>)}
          </Spin>
        );
      }
    });
  };

  onSearch = (name) => {
    const { location: { pathname }, query } = this.context;
    redirectTo(pathname, _.pickBy({ ...query, name, }, e => e));
  };

  getAction = (value, { id, username }) => {
    const items = [
      { onClick: this.edit(id) },
      { text: '查看', onClick: this.show(id) },
      { text: '角色管理', onClick: this.role(username) },
    ];
    return <Action items={items}/>;
  };

  render() {
    const { onSearch, getAction } = this;
    const { staff: { data: dataSource = [], pagination, loading, starting } } = this.props;
    const { query: { name: defaultValue } } = this.context;
    const searchProps = {
      className: styles.search,
      placeholder: `请输入您要查询的姓名`,
      enterButton: true,
      defaultValue,
      onSearch,
    };
    const columns = [
      { title: '姓名', dataIndex: 'name', width: 120 },
      { title: '邮箱', dataIndex: 'email' },
      { title: '手机号', dataIndex: 'mobile', width: 120 },
      { title: '岗位名称', dataIndex: 'position', width: 150 },
      { title: '在职状态', dataIndex: 'isOnJob', width: 100, render: getJobStatusTag },
      { title: '直接上级', dataIndex: 'leaderName', width: 120 },
      { title: '操作', fixed: 'right', width: 175, render: getAction }
    ];
    const tableProps = {
      rowKey: 'id',
      scroll: { x: 1000 },
      dataSource,
      pagination,
      columns,
      loading,
    };
    return (
      <PageHeaderLayout className="flex-column" action={<InputSearch {...searchProps}/>}>
        <Card className="flex-item flex-column" bordered={false} loading={starting}>
          <Table {...tableProps}/>
        </Card>
      </PageHeaderLayout>
    );
  }
}
