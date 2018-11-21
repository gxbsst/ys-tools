import React, {PureComponent} from "react";
import {Link} from "dva/router";
import {
  Card,
  Table,
  Form,
  Button
} from 'antd';
import DescriptionList from '../../../components/DescriptionList';
import request from '../../../utils/request';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import FooterToolbar from '../../../components/FooterToolbar/index';
import common from '../../Personnel/common/index.less'
import {
  getPaidStatus,
  getPaymentAccountBase,
  getPaymentMode,
  getCurrency,
  getBusinessType,
  getAssociateStatus,
  getPaymentAccount
} from "../../../utils/helpers";

const {Description} = DescriptionList;

export default class CheckContract extends PureComponent {
  state = {
    applyPayBussiess: [],
    attachmentDtos: [],
    surplus: '',
  }
  getDetails = async (id) => {
    const {data} = await request(`/api/applyPays/${id}`);
    const {applyPayBussiess, attachmentDtos, ...surplus} = data;
    this.setState({
      applyPayBussiess,
      attachmentDtos,
      surplus
    })
  }

  componentDidMount() {
    const {match: {params: {id}}} = this.props;
    this.getDetails(id)
  }

  columns = [{
    title: '产品类型',
    dataIndex: 'productType',
  }, {
    title: '业务类型',
    dataIndex: 'itemType',
    render: getBusinessType
  }, {
    title: '产品名称',
    dataIndex: 'productName',
  }, {
    title: '产品金额',
    dataIndex: 'productAmount',
    render: getCurrency
  }, {
    title: '服务费金额',
    dataIndex: 'serviceAmount',
    render: getCurrency
  }, {
    title: '折扣率',
    dataIndex: 'discountRate',
  }, {
    title: '回款状态',
    dataIndex: 'backPayStatus',
    render: getPaidStatus
  }, {
    title: '创建人',
    dataIndex: 'createUserName',
  }];

  render() {
    const {invoiceInfo, applyPayBussiess, attachmentDtos, surplus} = this.state;
    return (
      <PageHeaderLayout>
        <Card className={common.marginTop} title="认款详情">
          <DescriptionList col="4" gutter={0} size="large">
            <Description term="客户名称">{surplus.customerName}</Description>
            <Description term="客户编号">{surplus.customerId}</Description>
            <Description term="财务出纳">{surplus.cashier}</Description>
            <Description term="回款认领人">{surplus.claimName}</Description>
            <Description term="认领人编号">{surplus.claimNo}</Description>
            <Description term="创建时间">{surplus.createTime}</Description>
            <Description term="创建人">{surplus.createUser}</Description>
            <Description term="入账账户">{getPaymentAccount(surplus.openBank)}</Description>
            <Description term="入账金额	">{getCurrency(surplus.payAmount)}</Description>
            <Description term="打款名称">{surplus.payName}</Description>
            <Description term="入账日期">{surplus.recordedDate}</Description>
            <Description term="入账类型">{getPaymentMode(surplus.recordedType)}</Description>
            <Description term="关联回款状态">{getAssociateStatus(surplus.relPaymentStatus)}</Description>
          </DescriptionList>
        </Card>
        <Card className={common.marginTop} title="关联业务">
          <Table
            columns={this.columns}
            dataSource={applyPayBussiess}
            bordered
            pagination={false}
            rowKey="id"
            size="small"
          />
        </Card>
        {
          attachmentDtos.length &&
          <Card className={common.marginTop} style={{marginBottom: 50}} title="认款附件">
            <div>
              {attachmentDtos.map(item => (
                <DescriptionList col="8" gutter={0} size="large" key={item.id}>
                  <Description term="文件名称">{item.fileName}</Description>
                  <Description/>
                  <Description term="文件地址"><a href={item.fileUrl} target="_blank">文件URL</a></Description>
                </DescriptionList>
              ))}
            </div>
          </Card>
        }
        <FooterToolbar>
          <Button type="ghost" onClick={() => window.history.back()} style={{marginRight: '20px'}}>
            返回
          </Button>
        </FooterToolbar>
      </PageHeaderLayout>
    )
  }
}
