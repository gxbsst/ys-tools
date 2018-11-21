import React, {PureComponent} from 'react';
import {Link} from 'dva/router';
import {
  Card,
  Table,
  Button
} from 'antd';
import common from '../../../Personnel/common/index.less';
import RkApply from '../Modal/rk_apply';
import request from '../../../../utils/request';
import boundary from '../../../../decorators/Boundary';
import can from "../../../../decorators/Can";
import {getDate, getPaymentAccount, getPaymentMode, getCurrency} from '../../../../utils/helpers';

@can([10006000])
@boundary
export default class ReturnedMoney extends PureComponent {
  state = {
    returned: [],
    pagination: {},
    current: '',
    loading: true,
    id: '',
    visible: false,
  };
  columns = [{
    title: '客户名称',
    dataIndex: 'customerName',
  }, {
    title: '入账类型',
    dataIndex: 'recordedType',
    render: getPaymentMode
  }, {
    title: '入账账户',
    dataIndex: 'openBank',
    render: getPaymentAccount
  }, {
    title: '入账日期',
    dataIndex: 'recordedDate',
    render: getDate
  }, {
    title: '入账金额',
    dataIndex: 'payAmount',
    render: getCurrency
  }, {
    title: '回款认领人',
    dataIndex: 'claimName',
  }, {
    title: '入账凭证',
    dataIndex: 'payVoucher',
  }, {
    title: '创建时间',
    dataIndex: 'createTime',
    render: getDate
  }, {
    title: '操作',
    key: 'action',
    render: (text, record) => {
      const {service: {data: service = []}, can} = this.props;
      return (
        <div className={common.operate}>
          {
            can([10006003, service]) && !!service.length &&
            <Link to={`/aftersale/returned/${record.id}`} className={common.item}>查看</Link>
          }
        </div>
      )
    }
  },
  ];
  getReturned = async (id, page = 1, pageSize = 10) => {
    this.setState({
      loading: true
    });
    const {data, pagination} = await request(`/api/customer/${id}/applyPayments`, {
      query: {page, pageSize}
    });
    this.setState({
      returned: data,
      pagination,
      current: pagination.page,
      loading: false
    });
  };
  paging = (page, pageSize) => {
    const {id} = this.state;
    this.setState({
      current: page,
      loading: true
    });
    this.getReturned(id, page);
  };

  componentWillReceiveProps({baseInfo: {data: baseInfo = {}}}) {
    const {id} = baseInfo;
    id !== this.props.id && this.setState({id});
    if (!this.loaded && id) {
      this.getReturned(id);
      this.loaded = true;
    }
  }

  showModal = () => {
    this.setState({
      visible: true
    })
  }
  onCancel = () => {
    this.setState({
      visible: false
    })
  }

  render() {
    const {columns, state: {returned: dataSource, pagination: paginfo, current, loading, visible}} = this;
    const {baseInfo: {data: baseInfo = {}, loading: baseInfoLoading}, service: {data: service = []}, can} = this.props;
    const {id, customerName} = baseInfo;
    const {page, pageCount, pageSize, totalCount: total} = paginfo;
    const pagination = {
      current,
      pageSize,
      total,
      onChange: this.paging,
    };
    const tableProps = {
      size: 'middle',
      rowKey: 'id',
      columns,
      dataSource,
      loading
    };
    return (
      <Card bordered={false}>
        {
          can([10006002, service]) && !!service.length &&
          <Button type="primary" onClick={this.showModal}>认款申请</Button>
        }
        {
          visible &&
          <RkApply customerId={id}
                   onCancel={this.onCancel}
                   visible={visible}
                   customerName={customerName}
                   getReturned={this.getReturned}
                   current={current}/>
        }
        <Table {...tableProps}/>
      </Card>
    );
  }
}
