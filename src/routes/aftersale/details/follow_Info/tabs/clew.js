import React, {PureComponent} from "react";
import request from '../../../../../utils/request';
import {
  Table,
  Pagination
} from 'antd';

export default class ClewLog extends PureComponent {
  state = {
    billLog: [],
    pagination: {},
    current: '',
    loading: true,
  }
  columns = [{
    title: '日志类型',
    dataIndex: 'opTypeName',
    key: 'opTypeName',
    width: 100,
  }, {
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
  // 获取提单记录
  clewrecord = async (clewId, page = 1, pageSize = 10) => {
    this.setState({loading: true});
    const {data, pagination} = await request(`/api/clews/${clewId}/logs`, {
      query: {page, pageSize}
    });
    this.setState({
      billLog: data || [],
      pagination,
      current: pagination.page,
      loading: false
    })
  };

  componentDidMount() {
    const {clewId} = this.props;
    clewId && this.clewrecord(clewId)
  }

  paging = (page, pageSize) => {
    const {clewId} = this.props;
    this.setState({
      current: page,
    });
    clewId && this.clewrecord(clewId, page)
  }

  render() {
    const {clewId} = this.props;
    const {columns, state: {billLog: dataSource, pagination: paginfo, current, loading}} = this;
    const {page, pageCount, pageSize, totalCount: total} = paginfo;
    const pagination = {
      current,
      pageSize,
      total,
      onChange: this.paging,
    }
    const tableProps = {
      size: 'middle',
      rowKey: 'clewId',
      columns,
      dataSource,
      pagination,
      loading,
    };
    return (
      <Table {...tableProps}/>
    )
  }
}
