import React, { PureComponent } from 'react';
import { Card, Table } from 'antd';
import autodata from '../../../decorators/AutoData';
import { Action, ColumnGroup } from '../../../components/Helpers';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import {
  getCurrency, getBusinessType, getDate, getPercent, getBytes, getContractStatus,
  getContractType, getOrderStatus, getPaidStatus, getPaymentStatus, download, getPayCondition
} from '../../../utils/helpers';

const getAction = (value, { fileUrl }) => <Action items={[{ text: '下载附件', onClick: download(fileUrl) }]}/>;

const relationColumns = [
  { title: '合同编号', dataIndex: 'contractNo' },
  { title: '产品类型', dataIndex: 'productType' },
  { title: '产品金额', dataIndex: 'productAmount', render: getCurrency },
  { title: '客户名称', dataIndex: 'customerName' },
  { title: '业务类型', dataIndex: 'itemType', render: getBusinessType },
  { title: '业务金额', dataIndex: 'amount', render: getCurrency },
  { title: '回款金额', dataIndex: 'paymentAmount', render: getCurrency },
  { title: '回款状态', dataIndex: 'backPayStatus', render: getPaidStatus },
  { title: '开通状态', dataIndex: 'orderStatus', render: getOrderStatus },
  { title: '创建人', dataIndex: 'createUserName' },
  { title: '创建时间', dataIndex: 'createTime', render: getDate }
];
const paymentColumns = [
  { title: '创建人', dataIndex: 'createUser' },
  { title: '创建时间', dataIndex: 'createTime', render: getDate },
  { title: '付款金额', dataIndex: 'amount', render: getCurrency },
  { title: '付款条件', dataIndex: 'payCondition', render: getPayCondition },
  { title: '付款时间', dataIndex: 'payTime', render: getDate },
  { title: '付款占比', dataIndex: 'payScale', render: getPercent },
  { title: '备注', dataIndex: ' remark' }
];
const attachmentColumns = [
  { title: '文件名', dataIndex: 'fileName' },
  { title: '创建时间', dataIndex: 'createTime', render: getDate },
  { title: '创建人', dataIndex: 'createUser' },
  { title: '文件大小', dataIndex: 'fileSize', render: getBytes },
  { title: '文件类型', dataIndex: 'fileType' },
  { title: '备注', dataIndex: 'comment' },
  { title: '操作', dataIndex: 'action', render: getAction }
];

@autodata({ namespace: 'baseInfo', url: '/api/contracts/:id' })
@autodata({ namespace: 'payments', url: '/api/contracts/:id/payModes' })
@autodata({ namespace: 'attachments', url: '/api/contracts/:id/attachments' })
export default class BusinessContractDetail extends PureComponent {
  render() {
    const {
      baseInfo: { data: contract = {}, loading: baseInfoLoading },
      payments: { data: payments, loading: paymentLoading },
      attachments: { data: attachments, loading: attachmentLoading }
    } = this.props;
    const {
      contractCode: contractNo, customerName, contractType, status, paymentStatus, amount, discountRate,
      contractDate, contractBegin, buyerSignature, sellerSignature, salesName, createTime, comment
    } = contract;
    const paymentProps = {
      rowKey: 'id',
      pagination: false,
      columns: paymentColumns,
      dataSource: payments
    };
    const attachmentProps = {
      rowKey: 'id',
      pagination: false,
      columns: attachmentColumns,
      dataSource: attachments
    };
    let relation = null;
    if (contract && contractNo) {
      relation = <Relation query={{ contractNo }}/>;
    }
    const columns = [
      { label: '合同编号', value: contractNo },
      { label: '客户名称', value: customerName },
      { label: '合同类型', value: getContractType(contractType) },
      { label: '合同状态', value: getContractStatus(status) },
      { label: '付款执行', value: getPaymentStatus(paymentStatus) },
      { label: '合同金额', value: getCurrency(amount) },
      { label: '折扣率', value: getPercent(discountRate) },
      { label: '签订日期', value: getDate(contractDate) },
      { label: '结束日期', value: getDate(contractBegin) },
      { label: '买方签字', value: buyerSignature },
      { label: '卖方签字', value: sellerSignature },
      { label: '创建人', value: salesName },
      { label: '创建时间', value: getDate(createTime) },
      { label: '备注', value: comment },
    ];
    return (
      <PageHeaderLayout>
        <div className="card-group">
          <Card title="合同基本信息" bordered={false} loading={baseInfoLoading}>
            <ColumnGroup items={columns} col={6}/>
          </Card>
          <Card title="付款方式" bordered={false} loading={paymentLoading}>
            <Table {...paymentProps}/>
          </Card>
          <Card title="关联的业务" loading={!relation} bordered={false}>
            {relation}
          </Card>
          <Card title="合同附件" bordered={false} loading={attachmentLoading}>
            <Table {...attachmentProps}/>
          </Card>
        </div>
      </PageHeaderLayout>
    );
  }
}

@autodata('/api/contracts/orderItems')
class Relation extends PureComponent {
  render() {
    const { $data: { data: dataSource } } = this.props;
    const tableProps = {
      rowKey: 'id',
      pagination: false,
      columns: relationColumns,
      dataSource,
    };
    return <Table {...tableProps}/>;
  }
}
