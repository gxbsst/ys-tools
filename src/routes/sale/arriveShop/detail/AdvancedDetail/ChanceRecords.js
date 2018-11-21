import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Table } from 'antd';
import { chanceOpTypesColumns } from '../../tableColumns';

@connect(({ arriveShop }) =>
  ({
    records: arriveShop.chanceRecords,
  })
)
export class ChanceRecords extends PureComponent {
  componentDidMount() {
    this.props.dispatch({
      type: 'arriveShop/queryRecords',
      payload: {
        tab: 'chanceRecords',
        type: 'init',
      },
    });
  }
  componentWillReceiveProps(nextProps){
    // console.info(prevProps.type, this.props.type)
    if (nextProps.type !== this.props.type) {
      this.props.dispatch({
        type: 'saleRetail/queryRecords',
        payload: {
          tab: 'chanceRecords',
          type: nextProps.type,
        },
      });
    }
  }
  render() {
    const { records } = this.props;
    const recordsColumns = [
      ...chanceOpTypesColumns,
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
      }];
    const recordsPagination = {
      current: records.pagination.page,
      showSizeChanger: true,
      pageSize: records.pagination.pageSize,
      total: records.pagination.totalCount,
      showTotal: () => `共${records.pagination.totalCount}条`,
      onChange: (page, size) => {
        this.props.dispatch({
          type: 'arriveShop/queryRecords',
          payload: {
            pageSize: size,
            page,
            tab: 'chanceRecords',
            type: 'init',
          },
        });
      },
      onShowSizeChange: (page, size) => {
        this.props.dispatch({
          type: 'arriveShop/queryRecords',
          payload: {
            pageSize: size,
            page: 1,
            tab: 'chanceRecords',
            type: 'init',
          },
        });
      },
    };
    return (
      <Table
        columns={recordsColumns}
        dataSource={records.data}
        pagination={recordsPagination}
        rowKey={record => `${record.id}`}
      />
    );
  }
}
