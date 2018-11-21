import React, {PureComponent} from "react";
import request from '../../../../../utils/request';
import {
  Table,
  Pagination
} from 'antd';

export default class VisitLog extends PureComponent {
  state = {
    visitLog: [],
    pagination: {},
    current: '',
    loading: true,
    id: ''
  }
  columns = [{
    title: '拜访时间',
    dataIndex: 'visitTime',
  }, {
    title: '拜访地点',
    dataIndex: 'visitAddress',
  }, {
    title: '拜访人',
    dataIndex: 'visitName',
  }, {
    title: '处理人',
    dataIndex: 'opUserName',
  }, {
    title: '拜访结果',
    dataIndex: 'visitResult',
  }, {
    title: '备注',
    dataIndex: 'remark',
  }];
  visitLog = async (clewId, page = 1, pageSize = 10) => {
    this.setState({loading: true});
    const {data, pagination} = await request(`/api/customer/${clewId}/visitLogs`, {
      query: {page, pageSize}
    });
    this.setState({
      visitLog: data || [],
      pagination,
      current: pagination.page,
      loading: false
    })
  };

  componentDidMount() {
    const {clewId} = this.props;
    clewId && this.visitLog(clewId)
  }

  componentWillReceiveProps({clewId}) {
    clewId !== this.props.clewId && this.setState({clewId});
    if (!this.loaded && clewId) {
      this.visitLog(clewId);
      this.loaded = true;
    }
  }

  paging = (page, pageSize) => {
    const {clewId} = this.props;
    this.setState({
      current: page,
    });
    clewId && this.visitLog(clewId, page)
  }

  render() {
    const {columns, state: {visitLog: dataSource, pagination: paginfo, current, loading}} = this;
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
