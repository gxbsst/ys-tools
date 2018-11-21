import React, { PureComponent } from 'react';
import { Table } from 'antd';
import autodata from '../../../decorators/AutoData';
import { getChanceOpType } from '../../../utils/helpers';

const chanceRecordsColumns = [
  {
    title: '日志类型',
    dataIndex: 'opType',
    key: 'opType',
    render: getChanceOpType
  },
  {
    title: '时间',
    dataIndex: 'opTime',
    key: 'opTime'
  },
  {
    title: '处理人',
    dataIndex: 'opUserName',
    key: 'opUserName'
  },
  {
    title: '处理结果',
    dataIndex: 'opResult',
    key: 'opResult'
  },
  {
    title: '备注',
    dataIndex: 'remark',
    key: 'remark'
  }
];

@autodata({
  url: 'api/chances/:id/logs?type=is',
  mergeQueryFromLocation: false
})
export default class ISChanceLogs extends PureComponent {
  render() {
    const { $data: { data, pagination, loading } } = this.props;
    return (
      <Table
        columns={chanceRecordsColumns}
        dataSource={data}
        pagination={pagination}
        loading={loading}
        rowKey="id"
      />
    );
  }
}
