import React, { PureComponent } from 'react';
import { Table } from 'antd';
import autodata from '../../../decorators/AutoData';

const visitRecordsColumns = [
  {
    title: '拜访时间',
    dataIndex: 'visitTime',
    key: 'visitTime'
  },
  {
    title: '拜访地点',
    dataIndex: 'visitAddress',
    key: 'visitAddress'
  },
  {
    title: '拜访人',
    dataIndex: 'visitName',
    key: 'visitName'
  },
  {
    title: '处理人',
    dataIndex: 'opUserName',
    key: 'opUserName'
  },
  {
    title: '拜访结果',
    dataIndex: 'visitResult',
    key: 'visitResult'
  },
  {
    title: '备注',
    dataIndex: 'remark',
    key: 'remark'
  }
];

@autodata({
  url: '/api/chances/:id/visitLog?type=os',
  mergeQueryFromLocation: false
})
export default class OSVisitRecords extends PureComponent {
  render() {
    const { $data: { data, pagination, loading } } = this.props;
    return (
      <Table
        columns={visitRecordsColumns}
        dataSource={data}
        pagination={pagination}
        loading={loading}
        rowKey="id"
      />
    );
  }
}
