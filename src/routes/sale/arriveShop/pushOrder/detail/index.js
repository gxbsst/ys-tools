import React, {Component, Fragment} from 'react';
import {connect} from 'dva';
import {Card, Table, Divider} from 'antd';
import DescriptionList from '../../../../../components/DescriptionList/index';
import Upload from '../../../../../components/WMCUpload';
import { PayModesColumns, BusinessColumns} from '../../tableColumns';

const {Description} = DescriptionList;

@connect(({arriveShop}) =>
  ({currentPushOrder: arriveShop.currentPushOrder})
)
export default class PushOrderDetail extends Component {
  componentDidMount() {
    this.props.dispatch({
      type: 'arriveShop/queryPushOrderDetail',
      payload: {
        pushOrderID: this.props.match.params.id || '',
      },
    });
  }

  renderCompact() {
    const {currentPushOrder: {basic, payModes, attachments}} = this.props;
    const { isContract } = basic;
    if (!isContract) {
      return (
        <DescriptionList size="large" style={{marginBottom: 32}}>
          <Description term="提单合同">暂无</Description>
        </DescriptionList>
      );
    } else {
      const {contractCode, amount, contractBegin, contractEnd, contractDate, buyerSignature, sellerSignature, comment} = basic;
      return (
        <Fragment>
          <DescriptionList size="large" style={{marginBottom: 32}}>
            <Description term="合同编号">{contractCode}</Description>
            <Description term="合同金额">{amount}</Description>
            <Description term="合同开始时间">{contractBegin}</Description>
            <Description term="合同结束时间">{contractEnd}</Description>
            <Description term="合同签订时间">{contractDate}</Description>
            <Description term="买方签字">{buyerSignature}</Description>
            <Description term="卖方签字">{sellerSignature}</Description>
            <Description term="备注">{comment}</Description>
          </DescriptionList>
          <DescriptionList size="large" style={{marginBottom: 32}} col={1}>
            <Description term="附件上传">
              <Upload
                disabled={true}
                showUploadList={true}
                fileList={attachments.map((item, i) => ({
                  name: item.fileName,
                  url: item.fileUrl,
                  uid: i,
                  status: 'done',
                }))}
              />
            </Description>
          </DescriptionList>
          <DescriptionList size="large" style={{marginBottom: 32}} col={1}>
            <Description term="付款方式">
              <Table
                columns={PayModesColumns}
                dataSource={payModes}
                pagination={false}
              />
            </Description>
          </DescriptionList>
        </Fragment>
      );
    }
  }

  render() {
    const {currentPushOrder} = this.props;
    if (!currentPushOrder) {
      return null;
    }
    const {
      orderItems, basic,
    } = currentPushOrder;
    const {customerName, createUser} = basic;

    return (
      <Card bordered={false}>
        <DescriptionList size="large" style={{marginBottom: 32}}>
          <Description term="客户名称">{customerName}</Description>
          <Description term="提单人">{createUser}</Description>
        </DescriptionList>
        <Divider style={{marginBottom: 32}}/>
        <DescriptionList size="large" title="业务关联" style={{marginBottom: 32}}>
          <Table
            columns={BusinessColumns}
            dataSource={orderItems || []}
            pagination={false}
          />
        </DescriptionList>
        {this.renderCompact()}
      </Card>
    );
  }
}
