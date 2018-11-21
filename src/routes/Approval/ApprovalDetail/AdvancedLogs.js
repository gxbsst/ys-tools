import React, { PureComponent } from 'react';
import { Table } from 'antd';
import autodata from '../../../decorators/AutoData';

const advancedRecordsColumns = [
  {
    title: '跟进时间',
    dataIndex: 'followTime',
    key: 'followTime'
  },
  {
    title: '联系类型',
    dataIndex: 'followType',
    key: 'followType'
  },
  {
    title: '联系主题',
    dataIndex: 'linkSubject',
    key: 'linkSubject'
  },
  {
    title: '联系内容',
    dataIndex: 'linkContent',
    key: 'linkContent'
  },
  {
    title: '联系人',
    dataIndex: 'linkCustomer',
    key: 'linkCustomer'
  },
  {
    title: '跟进人',
    dataIndex: 'followName',
    key: 'followName'
  }
];

@autodata({
  url: 'api/chances/:id/follow?type=os',
  mergeQueryFromLocation: false
})
export default class AdvancedLogs extends PureComponent {
  render() {
    const { $data: { data, pagination, loading } } = this.props;
    return (
      <Table
        columns={advancedRecordsColumns}
        dataSource={data}
        pagination={pagination}
        loading={loading}
        rowKey="id"
      />
    );
  }
}
