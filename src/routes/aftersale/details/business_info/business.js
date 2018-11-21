import React, {PureComponent} from "react";
import {Link} from "dva/router";
import {
  Card,
  Table,
  Form,
  Button
} from 'antd';
import DescriptionList from '../../../../components/DescriptionList';
import {ColumnGroup, Select} from '../../../../components/Helpers';
import request from '../../../../utils/request';
import PageHeaderLayout from '../../../../layouts/PageHeaderLayout';
import FooterToolbar from '../../../../components/FooterToolbar/index';
import common from '../../../Personnel/common/index.less'
import {
  getPaidStatus,
  getPaymentAccountBase,
  getCurrency,
  getInvoiceType,
  getPaymentMode,
  getBusinessType,
  getBackpayStatus,
  getOrderStatus,
  getInvoiceState
} from "../../../../utils/helpers";

const {Description} = DescriptionList;

export default class BusinessInfo extends PureComponent {
  state = {
    details: {}
  }
  getDetails = async (id) => {
    const {data} = await request(`/api/business/${id}`);
    this.setState({
      details: data,
    })

  }

  componentDidMount() {
    const {match: {params: {id}}} = this.props;
    this.getDetails(id)
  }

  render() {
    const {details} = this.state;
    const items = [
      {label: '客户名称', value: details.customerName},
      {label: '店铺名称', value: details.shopName},
      {label: '服务开始时间', value: details.serviceStartTime},
      {label: '服务结束时间', value: details.serviceEndTime},
      {label: '服务欠款', value: getCurrency(details.serviceAmountRemain)},
      {label: '服务金额', value: getCurrency(details.serviceAmount - details.discountServiceAmount)},
      {label: '产品单价', value: getCurrency(details.productUnitAmount)},
      {label: '产品类型名称', value: details.productType},
      {label: '产品名称', value: details.productName},
      {label: '产品欠款', value: getCurrency(details.productAmountRemain)},
      {label: '产品金额', value: getCurrency(details.productAmount - details.discountProductAmount)},
      {label: '回款金额', value: getCurrency(details.paymentAmount)},
      {label: '业务状态', value: getOrderStatus(details.orderStatus)},
      {label: '业务类型', value: getBusinessType(details.itemType)},
      {label: '发票状态', value: getInvoiceState(details.invoiceStatus)},
      {label: '发票编号', value: details.invoiceNo},
      {label: '赠送微信数量', value: details.giftWechatCount},
      {label: '赠送门店数量', value: details.giftStoreCount},
      {label: '购买数量', value: details.dredgeTimes},
      {label: '优惠服务金额', value: details.discountServiceAmount},
      {label: '折扣率', value: details.discountRate},
      {label: '优惠产品金额', value: getCurrency(details.discountProductAmount)},
      {label: '联系人帐号', value: details.contactsNo},
      {label: '联系人名称', value: details.contactsName},
      {label: '计费方式', value: details.chargeMode === 1 ? '按期限计费' : '按数量计费'},
      {label: '购买微信墙数', value: details.buyWechatCount},
      {label: '购买门店数', value: details.buyStoreCount},
      {label: '回款状态', value: getBackpayStatus(details.backPayStatus)},
      {label: '备注', value: details.remark},
    ];
    return (
      <PageHeaderLayout>
        <Card className={common.marginTop} title="业务详情">
          <ColumnGroup items={items} col={8}/>
        </Card>
        <FooterToolbar>
          <Button type="ghost" onClick={() => window.history.back()} style={{marginRight: '20px'}}>
            返回
          </Button>
        </FooterToolbar>
      </PageHeaderLayout>
    )
  }
}
