import React, { PureComponent, Fragment } from 'react';
import { Table, Card, Button, DatePicker, Select, Cascader } from 'antd';
import moment from 'moment/moment';
import autodata from '../../decorators/AutoData';
import can from '../../decorators/Can';
import Can from '../../components/Can';
import Call from '../../components/CallCenter/Call';
import Dialog from '../../components/Dialog';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import request from '../../utils/request';
import EditSeat from './EditSeat';

const { RangePicker } = DatePicker;
const { Option } = Select;

const residences = [{
  value: 'zhejiang',
  label: 'Zhejiang',
  children: [{
    value: 'hangzhou',
    label: 'Hangzhou',
    children: [{
      value: 'xihu',
      label: 'West Lake',
    }],
  }],
}, {
  value: 'jiangsu',
  label: 'Jiangsu',
  children: [{
    value: 'nanjing',
    label: 'Nanjing',
    children: [{
      value: 'zhonghuamen',
      label: 'Zhong Hua Men',
    }],
  }],
}];

@can()
@autodata('/api/callcenter/list', [
  { name: 'seatCno', label: '坐席编号' },
  { name: 'seatName', label: '员工姓名', colspan: 2 },
  { name: 'userId', label: '员工工号' },
  { name: 'seatPhone', label: '绑定电话' },
  {
    name: 'startTime, endTime',
    label: '时间选择',
    colspan: 2,
    valueType: moment,
    component: RangePicker,
    props: { format: 'YYYY-MM-DD', placeholder: ['开始日期', '结束日期'] }
  },
  {
    name: 'province, city, area',
    label: '选择地区',
    colspan: 2,
    defaultValue: ['zhejiang', 'hangzhou', 'xihu'],
    render: () => <Cascader options={residences}/>
  }
])
export default class CallCenterSeat extends PureComponent {
  updateSeat = async () => {
    await request('/api/callcenter/seatSync');
    this.props.$data.reload();
  };

  deleteAction = record => async () => {
    await request(`/xxxx/${record.id}`, { method: 'DELETE' });
    this.props.$data.reload();
  };

  openDialog = () => {
    Dialog.open({
      title: '客户列表',
      autodata: {
        customers: '/api/sources/customers',
        chance: '/api/chances/1000025'
      },
      state: {
        selectedRowKeys: [1]
      },
      props: {
        okText: '好的',
        width: 1000,
      },
      onChange(selectedRowKeys) {
        this.setState({ selectedRowKeys });
        console.log('onChange', selectedRowKeys);
      },
      onSelect(selectedRowKeys) {
        this.setState({ selectedRowKeys });
        console.log('onSelect', selectedRowKeys);
      },
      onOk() {
        const { selectedRowKeys } = this.state;
        console.log('onOk: ', selectedRowKeys);
        this.destory();
      },
      render() {
        const { state: { selectedRowKeys }, onChange, onSelect } = this;
        const { customers: { data, searcher, pagination }, chance: { data: chance = {} } } = this.props;
        const rowSelection = { selectedRowKeys, onChange, onSelect };
        const columns = [
          { title: '客户名称', dataIndex: 'customerName' },
          { title: '商户名称', dataIndex: 'shopName' },
        ];
        return (
          <Fragment>
            {chance.area}: {chance.industry}
            {searcher}
            <Table rowKey="id" size="small" rowSelection={rowSelection} columns={columns} dataSource={data} pagination={pagination}/>
          </Fragment>
        );
      }
    });
  };

  openDialogComponent = () => {
    Dialog.open({
      title: '弹窗2',
      autodata: '/api/callcenter/list',
      component: EditSeat,
      props: {
        okText: '好的',
        width: 1000,
      },
    });
  };

  render() {
    const { $data: { searcher, data, pagination, loading, reload }, can } = this.props;
    const columns = [
      {
        title: '坐席编号',
        dataIndex: 'seatCno',
        width: '10%',
      },
      {
        title: '坐席名称',
        dataIndex: 'seatName',
        width: '15%',
      },
      {
        title: '员工姓名',
        dataIndex: 'userName',
        width: '15%',
      },
      {
        title: '员工工号',
        dataIndex: 'userId',
        width: '10%',
      },
      {
        title: '绑定电话',
        dataIndex: 'seatPhone',
      },
      {
        title: '班长坐席',
        dataIndex: 'seatCno',
        key: 'seatRole',
        width: '15%',
        render: value => value ? '是' : '否'
      },
      {
        title: '操作',
        key: 'action',
        width: 150,
        render: (value, record) => (
          <div>
            <a onClick={this.deleteAction(record)}>删除</a>
          </div>
        )
      },
    ];

    const action = (
      <div>
        {can(1001000) ? <span>有1001000权限</span> : null}
        {can(10000) ? <span>有10000权限</span> : null}
        <Call tel="14782181676"/>
        <Call>14782181676</Call>
        <Can is={10101}><span>有10101权限</span></Can>
        <Can is={20000}><span>有20000权限</span></Can>
        <Button type="primary" onClick={reload}>刷新</Button>
        <Button type="primary" onClick={this.openDialog}>弹窗1</Button>
        <Button type="primary" onClick={this.openDialogComponent}>弹窗2</Button>
        <Button type="primary" onClick={this.updateSeat}>更新坐席</Button>
      </div>
    );

    return (
      <PageHeaderLayout action={action}>
        <Card bordered={false}>
          {searcher}
          <Table columns={columns} dataSource={data} pagination={pagination} loading={loading} rowKey="id"/>
        </Card>
      </PageHeaderLayout>
    );
  }
}
