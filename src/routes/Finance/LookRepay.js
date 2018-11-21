import React, { PureComponent } from 'react';
import { Divider, Table } from 'antd';
import moment from 'moment/moment';
import { connect } from 'dva';
import DescriptionList from '../../components/DescriptionList';
import Image from '../../components/Image';
import {
  getBusinessStatus,
  getBackpayStatus,
  getPaymentMode
} from '../../utils/helpers';

const { Description } = DescriptionList;

const repayBusinessColumns = [
  {
    title: '产品类型',
    key: 'productType',
    dataIndex: 'productType'
  },
  {
    title: '业务类型',
    dataIndex: 'itemType',
    key: 'itemType',
    render: getBusinessStatus
  },
  {
    title: '产品名称',
    key: 'productName',
    dataIndex: 'productName'
  },
  {
    title: '产品金额',
    key: 'productPrice',
    dataIndex: 'productPrice',
    render: (text) => {
      return `￥${text}`;
    }
  },
  {
    title: '服务费金额',
    key: 'servicePrice',
    dataIndex: 'servicePrice',
    render: (text) => {
      return `￥${text}`;
    }
  },
  {
    title: '回款状态',
    dataIndex: 'paymentStatus',
    key: 'paymentStatus',
    render: getBackpayStatus
  },
  {
    title: '创建人',
    key: 'bizUserName',
    dataIndex: 'bizUserName'
  }
];

@connect(state => ({
  repay: state.repay
}))
export default class LookRepay extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'repay/lookRepay',
      payload: this.props.lookRepayId
    });
  }

  render() {
    const { repay: { lookRepayInfo } } = this.props;
    return (
      <div>
        <DescriptionList size="large" col={2}>
          <Description term="客户名称">
            {lookRepayInfo.customerName}
          </Description>
          <Description term="打款名称">{lookRepayInfo.payName}</Description>
          <Description term="入账日期">
            {moment(lookRepayInfo.recordedDate).format('YYYY-MM-DD')}
          </Description>
          <Description term="入账类型">
            {getPaymentMode(lookRepayInfo.recordedType)}
          </Description>
          <Description term="入账账户">
            {
              [
                '',
                '微盟银行3536',
                '盟耀银行0147',
                '微盟支付宝weimob_wm01@126.com',
                '盟耀支付宝weimob_my@163.com',
                '微盟现金',
                '盟耀现金'
              ][lookRepayInfo.openBank]
            }
          </Description>
          <Description term="入账金额">
            {`￥${lookRepayInfo.payAmount}`}
          </Description>
          <Description term="入账凭证">{lookRepayInfo.payVoucher}</Description>
          <Description term="回款备注">{lookRepayInfo.remark}</Description>
        </DescriptionList>

        {lookRepayInfo.customerName && (
          <div>
            <Divider dashed />
            <DescriptionList size="large" col={1}>
              <Description term="回款业务">
                <Table
                  columns={repayBusinessColumns}
                  dataSource={lookRepayInfo.paymentBusinessRelDto}
                  size="small"
                  pagination={false}
                />
              </Description>
              <Description term="申请备注">
                {lookRepayInfo.applyRemark}
              </Description>
              <Description term="回款附件">
                <Image
                  style={{ width: '80px' }}
                  src={lookRepayInfo.applyPic}
                  alt="回款截图"
                  preview
                />
              </Description>
            </DescriptionList>
          </div>
        )}
      </div>
    );
  }
}
