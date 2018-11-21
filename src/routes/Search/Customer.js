import React, { PureComponent } from 'react';
import { Table, Card } from 'antd';
import { Link } from 'react-router-dom';
import autodata from '../../decorators/AutoData';
import can from '../../decorators/Can';
import { Action, Ellipsis } from '../../components/Helpers';
import { getCustomerStatusTag, getSource } from '../../utils/helpers';

@autodata('/api/sources/customers')
@can()
export default class SearchCustomer extends PureComponent {
  getAction = (value, { id }) => {
    const items = [
      { component: Link, text: '查看', to: `/aftersale/details/${id}` },
    ];
    return <Action items={items}/>;
  };

  render() {
    const { $data: { data: dataSource, pagination, loading }, can } = this.props;
    const columns = [
      { title: '客户ID', dataIndex: 'id', width: 100 },
      { title: '客户名称', dataIndex: 'customerName', render: value => <Ellipsis maxWidth={180}>{value}</Ellipsis> },
      { title: '地区', dataIndex: 'area', width: 180 },
      { title: '行业', dataIndex: 'industry', width: 150 },
      { title: '客户来源', key: 'source', width: 260, render: getSource },
      { title: '创建时间', dataIndex: 'createTime', width: 120, render: value => value.split(' ')[0] },
      { title: '状态', dataIndex: 'status', width: 80, render: getCustomerStatusTag },
      { title: '处理人', dataIndex: 'saleName', width: 100 },
      { title: '操作', key: 'action', width: 65, fixed: 'right', render: this.getAction }
    ];
    const tableProps = {
      rowKey: 'id',
      scroll: { x: 1260 },
      columns,
      dataSource,
      pagination,
      loading,
    };
    return <Card bordered={false}><Table {...tableProps}/></Card>;
  }
}
