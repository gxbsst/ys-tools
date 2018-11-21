import React, {PureComponent} from "react";
import request from '../../../../../utils/request';
import {
  Table,
  Pagination
} from 'antd';

export default class OsVisit extends PureComponent {
  state = {
    osvisit: [],
    pagination: {},
    current: '',
    loading: true,
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
  visit = async (clewId, page = 1, pageSize = 10) => {
    this.setState({loading: true});
    const {data, pagination} = await request(`/api/customer/${clewId}/visitLogs?type=os`, {
      query: {page, pageSize}
    });
    this.setState({
      osvisit: data || [],
      pagination,
      current: pagination.page,
      loading: false
    })
  };

  componentDidMount() {
    const {clewId} = this.props;
    clewId && this.visit(clewId);
    console.info('test1', 111)
  }

  componentWillReceiveProps({clewId}) {
    clewId !== this.props.clewId && this.setState({clewId});
    if (!this.loaded && clewId) {
      this.visit(clewId);
      this.loaded = true;
      console.info('test1', 222)
    }
  }

  paging = (page, pageSize) => {
    const {clewId} = this.props;
    this.setState({
      current: page,
    });
    clewId && this.visit(clewId, page)
  }

  render() {
    const {columns, state: {osvisit: dataSource, pagination: paginfo, current, loading}} = this;
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
