import React, {PureComponent} from "react";
import {Link} from "dva/router";
import {connect} from 'dva'
import {hashHistory, routerRedux} from 'dva/router'
import request from '../../../../utils/request';
import {getCurrency} from '../../../../utils/request'
import can from "../../../../decorators/Can";
import {
  Button,
  Card,
  Table,
  message,
  Pagination
} from 'antd';
import styles from './index.less';
import common from '../../../Personnel/common/index.less'

@can([10004000])
@connect(state => (
    state
  )
)
export default class BillInfo extends PureComponent {
  state = {
    billInfo: [],
    pagination: {},
    current: '',
    loading: true,
    id: ''
  }
  columns = [{
    title: '提单时间',
    dataIndex: 'receiptsTime',
  }, {
    title: '提单人',
    dataIndex: 'createUser',
  }, {
    title: '提单金额',
    dataIndex: 'receiptsPrice',
  }, {
    title: '软件金额',
    dataIndex: 'softPrice',
    render: getCurrency
  }, {
    title: '服务金额',
    dataIndex: 'servicePrice',
    render: getCurrency
  }, {
    title: '合同编号',
    dataIndex: 'contractNo',
    render: (text, record) => (record.hasContract ? text : '')
  }, {
    title: '提单状态',
    dataIndex: 'receiptStatus',
    render: (item) => {
      switch (item) {
        case 0:
          return '提单中';
        case 1:
          return '提单通过 ';
        case -1:
          return '提单失败'
      }
    }
  }, {
    title: '审核意见',
    dataIndex: 'auditContent',
  }, {
    title: '操作',
    key: 'action',
    render: (text, record) => {
      const {service: {data: service = []}, can} = this.props;
      return (
        <div className={common.operate}>
          {
            can([10004004, service]) && !!service.length &&
            <Link to={`/aftersale/bill/detail/${record.id}`} className={common.item}>查看</Link>
          }
          {
            can([10004006, service]) && (record.receiptStatus === -1 || record.receiptStatus === 0 ) && !!service.length &&
            <span className={common.item} onClick={this.del(record)}>删除</span>
          }
        </div>
      )
    }
  },
  ];

  componentWillReceiveProps({baseInfo: {data: baseInfo = {}}}) {
    const {clewId, id} = baseInfo;
    id !== this.props.id && this.setState({id});
    if (!this.loaded && id) {
      this.getBillInfo(id);
      this.loaded = true;
    }
  }

  // 获取提单信息
  getBillInfo = async (id, page = 1, pageSize = 10) => {
    this.setState({loading: true});
    const {data, pagination} = await request(`/api/billingReceipts/customerBillingList/${id}`, {
      query: {page, pageSize}
    })
    this.setState({
      billInfo: data,
      pagination,
      current: pagination.page,
      loading: false
    })
  }
  paging = (page, pageSize) => {
    const {id} = this.state;
    this.setState({
      current: page
    });
    this.getBillInfo(id, page)
  }
  del = record => async () => {
    const {current, id} = this.state;
    const {data} = await request(`/api/billingReceipts?id=${record.id}`, {
      method: "delete"
    });
    this.getBillInfo(id, current)
  };

  render() {
    const {
      columns,
      state: {billInfo: dataSource, pagination: paginfo, current, loading},
      props: {baseInfo: {data: baseInfo = {}}, service: {data: service = []}, can}
    } = this;
    const {page, pageCount, pageSize, totalCount: total} = paginfo;
    const {id} = baseInfo;
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
      <Card>
        {
          can([10004002, service]) && !!service.length &&
          <Link style={{marginBottom: 20}} to={`/aftersale/bill/${id}`}><Button type="primary">提单</Button></Link>
        }
        <Table {...tableProps}/>
      </Card>
    )
  }
}
