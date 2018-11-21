import React, {PureComponent} from "react";
import request from '../../../../../utils/request';
import {
  Table,
  Pagination
} from 'antd';

export default class LinkLog extends PureComponent {
  state = {
    linkLog: [],
    pagination: {},
    current: '',
    loading: true,
    id: ''
  }
  columns = [{
    title: '时间',
    dataIndex: 'createTime',
  }, {
    title: '联系人',
    dataIndex: 'linkName',
  }, {
    title: '处理人',
    dataIndex: 'opUserName',
  }, {
    title: '联系方式',
    dataIndex: 'linkMethod',
  }, {
    title: '联系类型',
    dataIndex: 'linkType',
  }, {
    title: '联系结果',
    dataIndex: 'linkResult',
  }, {
    title: '备注',
    dataIndex: 'remark',
  }];
  link = async (id, page = 1, pageSize = 10) => {
    this.setState({loading: true});
    const {data, pagination} = await request(`/api/customer/${id}/linkLog`, {
      query: {page, pageSize}
    });
    this.setState({
      linkLog: data || [],
      pagination,
      current: pagination.page,
      loading: false
    })
  };

  componentDidMount() {
    const {id} = this.props;
    id && this.link(id);
  }

  paging = (page, pageSize) => {
    const {id} = this.props;
    this.setState({
      current: page,
    });
    id && this.link(id, page)
  }

  render() {
    const {columns, state: {linkLog: dataSource, pagination: paginfo, current, loading}} = this;
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
