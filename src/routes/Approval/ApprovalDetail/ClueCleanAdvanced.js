import React, { PureComponent } from 'react';
import { Card, Table } from 'antd';
import autodata from '../../../decorators/AutoData';
import { getOpTypes } from '../../../utils/helpers';

const recordsColumns = [
  {
    title: '日志类型',
    dataIndex: 'opType',
    key: 'opType',
    render: getOpTypes
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
  url: 'api/clews/:id/logs',
  mergeQueryFromLocation: false
})
export default class ClueCleanAdvanced extends PureComponent {
  render() {
    const { $data: { data, pagination, loading } } = this.props;
    return (
      <Card title="跟进信息" style={{ marginBottom: 24 }} bordered={false}>
        <Table
          columns={recordsColumns}
          dataSource={data}
          pagination={pagination}
          loading={loading}
          rowKey="id"
        />
      </Card>
    );
  }
}
