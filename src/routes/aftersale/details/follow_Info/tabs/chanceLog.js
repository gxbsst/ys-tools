import React, {PureComponent} from "react";
import request from '../../../../../utils/request';
import {getChanceOpType} from '../../../../../utils/helpers'
import {
  Table,
  Pagination
} from 'antd';

export default class ChanceLog extends PureComponent {
  state = {
    oschance: [],
    ischance: [],
    pagination: {},
    current: '',
    loading: true,
    id: ''
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
  getchancelog = async (id, type, page = 1, pageSize = 10) => {
    this.setState({loading: true});
    let {data, pagination} = await request(`/api/customer/${id}/chance?type=${type}`, {
      query: {page, pageSize}
    });
    if (type === 'os') {
      this.setState({
        oschance: data || [],
        pagination,
        current: pagination.page,
        loading: false
      })
    } else if (type === 'is') {
      this.setState({
        ischance: data || [],
        pagination,
        current: pagination.page,
        loading: false
      })
    }
  }

  componentDidMount() {
    const {id, type} = this.props;
    id && this.getchancelog(id, type)
  }

  paging = (page, pageSize) => {
    const {id, type} = this.props;
    this.setState({
      current: page,
    });
    id && this.getchancelog(id, type, page)
  }

  render() {
    const {id, type} = this.props;
    const {columns, state: {oschance, ischance, pagination: paginfo, current, loading}} = this;
    const {page, pageCount, pageSize, totalCount: total} = paginfo;
    let dataSource = type === 'os' ? oschance : ischance;
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
