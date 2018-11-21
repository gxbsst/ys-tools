import React, { PureComponent } from 'react';
import { Table } from 'antd';
import { connect } from 'dva';
import moment from 'moment/moment';
import DescriptionList from '../../components/DescriptionList';
import {
  getBackpayStatus,
  getInvoiceType,
  getRelType,
  getRelStatus,
  getInvoiceState
} from '../../utils/helpers';

const { Description } = DescriptionList;

@connect(state => ({
  invoice: state.invoice
}))
export default class InvoiceDetails extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'invoice/fetchDetail',
      payload: this.props.detailInvoiceId
    });
  }

  cancelLink = id => {
    const { dispatch } = this.props;
    dispatch({
      type: 'invoice/cancelLink',
      payload: id
    }).then(res => {
      if (!res.code) {
        dispatch({
          type: 'invoice/fetchDetail',
          payload: this.props.detailInvoiceId
        });
        this.props.reload();
      }
    });
  };

  render() {
    const columns = [
      {
        title: '产品类型',
        dataIndex: 'productType',
        key: 'productType'
      },
      {
        title: '套餐名称',
        dataIndex: 'productName',
        key: 'productName'
      },
      {
        title: '产品金额',
        dataIndex: 'productAmount',
        key: 'productAmount',
        render: (text, record) => {
          return `￥${record.productAmount - record.discountProductAmount}`;
        }
      },
      {
        title: '服务费金额',
        dataIndex: 'serviceAmount',
        key: 'serviceAmount',
        render: (text, record) => {
          return `￥${record.serviceAmount - record.discountServiceAmount}`;
        }
      },
      {
        title: '回款状态',
        dataIndex: 'backPayStatus',
        key: 'backPayStatus',
        render: getBackpayStatus
      },
      {
        title: '关联发票金额',
        dataIndex: 'relAmount',
        key: 'relAmount',
        render: text => {
          return `￥${text}`;
        }
      },
      {
        title: '操作',
        key: 'action',
        render: (text, record) => (
          <a onClick={() => this.cancelLink(record.id)}>取消关联</a>
        )
      }
    ];
    const { invoice: { detailData } } = this.props;
    return (
      <div>
        <DescriptionList size="large" col={2}>
          <Description term="客户名称">{detailData.customerName}</Description>
          <Description term="要求开票日期">
            {moment(detailData.demandDate).format('YYYY-MM-DD')}
          </Description>
          <Description term="申请人">{detailData.createUser}</Description>
          <Description term="开票类型">
            {getInvoiceType(detailData.invoiceType)}
          </Description>
          <Description term="业务类型">
            {getRelType(detailData.relType)}
          </Description>
          <Description term="业务关联状态">
            {getRelStatus(detailData.relStatus)}
          </Description>
          <Description term="开票金额">
            {`￥${detailData.invoiceAmount}`}
          </Description>
          <Description term="开票状态">
            {getInvoiceState(detailData.invoiceState)}
          </Description>
          <Description term="开票要求">{detailData.demand}</Description>
        </DescriptionList>
        <Table
          columns={columns}
          dataSource={detailData.invoiceOrderDto}
          size="small"
          pagination={false}
          style={{ margin: '16px 0px' }}
        />
        <DescriptionList size="large" col={1} style={{ marginBottom: '16px' }}>
          <Description term="纳税人识别号（统一社会信用代码）">
            {detailData.taxpayerNum}
          </Description>
          {detailData.registerAddress ? (
            <Description term="注册地址">
              {detailData.registerAddress}
            </Description>
          ) : (
            <React.Fragment />
          )}
        </DescriptionList>
        <DescriptionList size="large" col={2}>
          {detailData.phone ? (
            <Description term="电话（一般为固话）">
              {detailData.phone}
            </Description>
          ) : (
            <React.Fragment />
          )}
          {detailData.openBank ? (
            <Description term="开户行">{detailData.openBank}</Description>
          ) : (
            <React.Fragment />
          )}
          {detailData.bankAccount ? (
            <Description term="账号">{detailData.bankAccount}</Description>
          ) : (
            <React.Fragment />
          )}
        </DescriptionList>
      </div>
    );
  }
}
