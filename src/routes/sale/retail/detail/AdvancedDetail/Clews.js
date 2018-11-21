import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Table, Card } from 'antd';
import { clewsOpTypesColumns } from '../../tableColumns';

@connect(({ saleRetail }) =>
  ({
    records: saleRetail.linkRecords,
  })
)
export class Clews extends PureComponent {
  componentWillMount() {
    this.props.dispatch({
      type: 'saleRetail/queryRecords',
      payload: {
        tab: 'linkRecords',
      },
    });
  }
  render() {
    const { records } = this.props;
    const recordsColumns = [
      ...clewsOpTypesColumns,
      {
        title: '时间',
        dataIndex: 'opTime',
        key: 'opTime',
        width: 100,
      }, {
        title: '处理人',
        dataIndex: 'opUserName',
        key: 'opUserName',
        width: 100,
      }, {
        title: '处理结果',
        dataIndex: 'opResult',
        key: 'opResult',
        width: 100,
      }, {
        title: '备注',
        dataIndex: 'remark',
        key: 'remark',
        width: 150,
      }
    ];
    const recordsPagination = {
      current: records.pagination.page,
      showSizeChanger: true,
      pageSize: records.pagination.pageSize,
      total: records.pagination.totalCount,
      showTotal: () => `共${records.pagination.totalCount}条`,
      onChange: (page, size) => {
        this.props.dispatch({
          type: 'saleRetail/queryRecords',
          payload: {
            pageSize: size,
            page,
            tab: 'linkRecords',
          },
        });
      },
      onShowSizeChange: (page, size) => {
        this.props.dispatch({
          type: 'saleRetail/queryRecords',
          payload: {
            pageSize: size,
            tab: 'linkRecords',
          },
        });
      },
    };
    return (
      <Card title="线索日志">
        <Table
          columns={recordsColumns}
          dataSource={records.data}
          pagination={recordsPagination}
          rowKey={record => `${record.id}`}
        />
      </Card>
    );
  }
}
