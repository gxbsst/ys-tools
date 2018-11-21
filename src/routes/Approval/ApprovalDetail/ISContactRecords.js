import React, { PureComponent } from 'react';
import { Table } from 'antd';
import autodata from '../../../decorators/AutoData';
import { getLinkType } from '../../../utils/helpers';

const contactRecordsColumns = [
  {
    title: '时间',
    dataIndex: 'createTime',
    key: 'createTime'
  },
  {
    title: '联系人',
    dataIndex: 'linkName',
    key: 'linkName'
  },
  {
    title: '处理人',
    dataIndex: 'updateUser',
    key: 'updateUser'
  },
  {
    title: '联系方式',
    dataIndex: 'contactWay',
    key: 'contactWay'
  },
  {
    title: '联系类型',
    dataIndex: 'linkType',
    key: 'linkType',
    render: getLinkType
  },
  {
    title: '联系结果',
    dataIndex: 'contactResult',
    key: 'contactResult'
  },
  {
    title: '备注',
    dataIndex: 'remark',
    key: 'remark'
  }
];

@autodata({
  url: 'api/chances/:id/linkLog?type=is',
  mergeQueryFromLocation: false
})
export default class ISContactRecords extends PureComponent {
  render() {
    const { $data: { data, pagination, loading } } = this.props;
    return (
      <Table
        columns={contactRecordsColumns}
        dataSource={data}
        pagination={pagination}
        loading={loading}
        rowKey="id"
      />
    );
  }
}
