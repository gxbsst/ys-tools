import React, { PureComponent } from 'react';
import { Table, Card } from 'antd';
import { Link } from 'react-router-dom';
import { autodata, can } from '../../../decorators';
import { Region } from '../../../components/Cascader';
import { Action, Select, Stars } from '../../../components/Helpers';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import { enums } from '../../../utils';
import { getCustomerStatusTag, getRegionMergerName } from '../../../utils/helpers';

@autodata('/api/customer/search', [
  {
    name: 'status',
    label: '客户状态',
    valueType: Number,
    component: Select,
    props: {
      allowClear: true,
      options: enums('CUSTOMER_STATUS'),
      placeholder: '请选择客户状态'
    }
  },
  {
    name: 'level',
    label: '客户等级',
    valueType: Number,
    component: Select,
    props: {
      allowClear: true,
      options: enums('CUSTOMER_LEVEL'),
      placeholder: '请选择客户等级'
    }
  },
  { name: 'customerName', label: '客户名称' },
  { name: 'weimobAccount', label: '微盟账号' },
  { name: 'phone', label: '电话号码' },
  { name: 'areaCode', label: '所在地区', component: Region },
])
@can()
export default class SearchCustomer extends PureComponent {
  getAction = (value, { id }) => {
    const items = [
      { component: Link, text: '查看详情', to: `/aftersale/details/${id}?from=business` },
    ];
    return <Action items={items}/>;
  };

  render() {
    const { $data: { data: dataSource, searcher, pagination, loading, starting }, can } = this.props;
    const columns = [
      { title: '客户名称', dataIndex: 'customerName', fixed: 'left' },
      { title: '地区', dataIndex: 'area', width: 260, render: getRegionMergerName },
      { title: '客户等级', dataIndex: 'level', width: 100, render: value => <Stars count={value}/> },
      { title: '客户状态', dataIndex: 'status', width: 100, render: getCustomerStatusTag },
      { title: '操作', key: 'action', width: 110, fixed: 'right', render: this.getAction }
    ];
    const tableProps = {
      rowKey: 'id',
      scroll: { x: 1000 },
      columns,
      dataSource,
      pagination,
      loading,
    };
    return (
      <PageHeaderLayout>
        <Card className="flex-item" bordered={false} loading={starting}>
          {searcher}
          <Table {...tableProps}/>
        </Card>
      </PageHeaderLayout>
    );
  }
}
