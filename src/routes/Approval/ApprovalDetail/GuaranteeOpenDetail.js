import React, { PureComponent } from 'react';
import { Card } from 'antd';
import DescriptionList from '../../../components/DescriptionList';
import { getBusinessStatus, getBackpayStatus } from '../../../utils/helpers';

const { Description } = DescriptionList;

export default class GuaranteeOpenDetail extends PureComponent {
  render() {
    const { data } = this.props;
    return (
      <Card>
        <DescriptionList size="large" col={2}>
          <Description term="产品类型">{data.productType}</Description>
          <Description term="业务类型">
            {getBusinessStatus(data.itemType)}
          </Description>
          <Description term="产品名称">{data.productName}</Description>
          <Description term="产品金额">
            {`￥${data.productAmount - data.discountProductAmount}`}
          </Description>
          <Description term="服务金额">{`￥${data.serviceAmount -
            data.discountServiceAmount}`}</Description>
          <Description term="回款金额">{`￥${data.paymentAmount}`}</Description>
          <Description term="回款状态">
            {getBackpayStatus(data.backPayStatus)}
          </Description>
          <Description term="创建人">{data.createUser}</Description>
          <Description term="开票备注">{data.remark}</Description>
        </DescriptionList>
      </Card>
    );
  }
}
