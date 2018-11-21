import React, {PureComponent} from "react";
import {Link} from "dva/router";
import InvoiceApply from '../Modal/invoice_apply'
import {getDate, getCurrency, getBackpayStatus} from '../../../../utils/helpers'
import {
  Card,
  Table,
  Menu,
  Badge,
  Button
} from 'antd';
import styles from './index.less';
import boundary from '../../../../decorators/Boundary';
import can from "../../../../decorators/Can";
import request from '../../../../utils/request';
import common from '../../../Personnel/common/index.less'

@can([10008000])
@boundary
export default class InvoiceInfo extends PureComponent {
  state = {
    child: [],
    invoice: [],
    id: '',
    pagination: {},
    current: '',
    loading: true,
    visible: false,
  }
  columns = [{
    title: '客户名称',
    dataIndex: 'customerName',
  }, {
    title: '要求开票日期',
    dataIndex: 'demandDate',
  }, {
    title: '申请人',
    dataIndex: 'createUser',
  }, {
    title: '开票类型',
    dataIndex: 'invoiceType',
    render: (item) => (['增值税普通发票', '增值税专用发票'][item])
  }, {
    title: '开票金额',
    dataIndex: 'invoiceAmount',
    render: getCurrency
  }, {
    title: '业务关联状态',
    dataIndex: 'relStatus',
    render: (item) => (['未关联业务', '部分关联业务', '已关联业务'][item])
  }, {
    title: '开票人员',
    dataIndex: 'invoiceUser',
  }, {
    title: '开票日期',
    dataIndex: 'invoiceTime',
  }, {
    title: '发票编号',
    dataIndex: 'invoiceNo',
  }
  ];
  expandedRowRender = ({id}) => {
    const {invoice} = this.state;
    const invoiceItme = _.find(invoice, {id});
    console.info('contract', invoiceItme);
    const {sublevel, loading} = invoiceItme;
    const columns = [
      {title: '产品类型', dataIndex: 'productType'},
      {title: '产品名称', dataIndex: 'productName'},
      {
        title: '产品金额', dataIndex: 'productAmount',
        render: getCurrency
      },
      {
        title: '服务费金额', dataIndex: 'serviceAmount',
        render: getCurrency
      },
      {
        title: '回款金额',
        dataIndex: 'paymentAmount',
        render: getCurrency
      },
      {
        title: '关联发票金额',
        dataIndex: 'relAmount',
        render: getCurrency
      },
    ];
    return (
      <Table
        pagination={false}
        columns={columns}
        dataSource={sublevel}
        loading={loading}
        rowKey="id"
        width="80%"
      />
    );
  };

  componentWillReceiveProps({baseInfo: {data: baseInfo = {}}}) {
    const {id} = baseInfo;
    id !== this.props.id && this.setState({id});
    if (!this.loaded && id) {
      this.getinvoice(id);
      this.loaded = true;
    }
  }

  // 展开
  onExpand = async (expanded, record) => {
    if (expanded) {
      if (expanded) {
        const {id} = record;
        let {invoice} = this.state;
        const invoiceItem = _.find(invoice, {id});
        invoiceItem.loading = true;
        if (_.isUndefined(invoiceItem.sublevel)) {
          const {data} = await request(`/api/invoice/${id}/orders`);
          invoiceItem.loading = false;
          invoiceItem.sublevel = data ? data : [];
          this.setState({invoice: [].concat(invoice)})
        }
        invoiceItem.loading = false;
      }
    }
  }

  getinvoice = async (id, page = 1, pageSize = 10) => {
    this.setState({
      loading: true
    })
    const {data, pagination} = await request(`/api/customer/${id}/invoices`, {
      query: {page, pageSize}
    });
    this.setState({
      invoice: data,
      pagination,
      current: pagination.page,
      loading: false
    })
  }
  paging = (page, pageSize) => {
    const {id} = this.state;
    this.setState({
      current: page,
      loading: true
    });
    this.getinvoice(id, page)
  }
  showModal = () => {
    this.setState({
      visible: true,
    });
  };
  handleCancel = () => {
    this.setState({
      visible: false,
    });
  }

  render() {
    const {
      props: {baseInfo: {data: baseInfo = {},}, service: {data: service = []}, can},
      columns,
      state: {invoice: dataSource, pagination: paginfo, current, loading, visible}
    } = this;
    const {id, customerName} = baseInfo;
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
      expandedRowRender: this.expandedRowRender,
      onExpand: this.onExpand
    };
    return (
      <Card>
        {
          can([10008002, service]) && !!service.length &&
          <Button type="primary" onClick={this.showModal}>发票申请</Button>
        }
        {
          visible &&
          <InvoiceApply
            customerId={id}
            getinvoice={this.getinvoice}
            page={current}
            visible={visible}
            baseInfo={baseInfo}
            onCancel={this.handleCancel}
            customerName={customerName}/>
        }

        <Table {...tableProps}/>
      </Card>)
  }
}
