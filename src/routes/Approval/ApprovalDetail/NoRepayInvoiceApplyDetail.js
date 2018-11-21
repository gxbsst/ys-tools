import React, { PureComponent } from 'react';
import { Card } from 'antd';
import moment from 'moment/moment';
import DescriptionList from '../../../components/DescriptionList';
import { getRelType, getInvoiceType } from '../../../utils/helpers';

const { Description } = DescriptionList;

export default class NoRepayInvoiceApplyDetail extends PureComponent {
  render() {
    const { data } = this.props;
    return (
      <Card>
        <DescriptionList size="large" col={2} style={{ marginBottom: '16px' }}>
          <Description term="客户名称">{data.customerName}</Description>
          <Description term="要求开票日期">
            {moment(data.demandDate).format('YYYY-MM-DD')}
          </Description>
          <Description term="开票要求">{data.demand}</Description>
          <Description term="关联类型">{getRelType(data.relType)}</Description>
          <Description term="开票金额">{`￥${data.invoiceAmount}`}</Description>
          <Description term="开票类型">
            {getInvoiceType(data.invoiceType)}
          </Description>
          <Description term="纳税人识别号">{data.taxpayerNum}</Description>
        </DescriptionList>
      </Card>
    );
  }
}
