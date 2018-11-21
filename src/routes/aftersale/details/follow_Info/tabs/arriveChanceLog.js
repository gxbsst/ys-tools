import React, {PureComponent} from "react";
import {getChanceOpType} from '../../../../../utils/helpers'
import request from '../../../../../utils/request';
import {
  Table,
  Pagination
} from 'antd';

export default class ArriveChanceLog extends PureComponent {
  state = {
    arriveChance: [],
    pagination: {},
    current: '',
    loading: true,
  }
  columns = [{
    title: '日志类型',
    dataIndex: 'opType',
    render: getChanceOpType
  }, {
    title: '时间',
    dataIndex: 'opTime',
  }, {
    title: '处理人',
    dataIndex: 'opUserName',
  }, {
    title: '处理结果',
    dataIndex: 'opResult',
  }, {
    title: '备注',
    dataIndex: 'remark',
  }];
  // 获取提单记录
  getchancelog = async (id, page = 1, pageSize = 10) => {
    this.setState({loading: true});
    const {data, pagination} = await request(`/api/customer/${id}/logs`, {
      query: {page, pageSize}
    });
    this.setState({
      arriveChance: data || [],
      pagination,
      current: pagination.page,
      loading: false
    })
  };

  componentDidMount() {
    const {id} = this.props;
    id && this.getchancelog(id)
  }

  paging = (page, pageSize) => {
    const {id} = this.props;
    this.setState({
      current: page,
    });
    id && this.getchancelog(id, page)
  }

  render() {
    const {id, type} = this.props;
    const {columns, state: {arriveChance: dataSource, pagination: paginfo, current, loading}} = this;
    const {page, pageCount, pageSize, totalCount: total} = paginfo;
    const pagination = {
      current,
      pageSize,
      total,
      onChange: this.paging,
    }
    const tableProps = {
      size: 'middle',
      rowKey: 'id',
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
