import React, { PureComponent } from 'react';
import { Card, Table } from 'antd';
import autodata from '../../../decorators/AutoData';
import { ColumnGroup, Action } from '../../../components/Helpers';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import { getCurrency, getMergerUserName, getBusinessType, getPaidStatus, getPaymentAccount, getPaymentMode, getDate, getBytes, download } from '../../../utils/helpers';

const getAction = (value, { fileUrl }) => <Action items={[{ text: '下载附件', onClick: download(fileUrl) }]}/>;

const businessColumns = [
  { title: '客户名称', dataIndex: 'customerName' },
  { title: '业务类型', dataIndex: 'itemType', render: getBusinessType },
  { title: '业务金额', dataIndex: 'amount', render: getCurrency },
  { title: '产品金额', dataIndex: 'productAmount', render: getCurrency },
  { title: '服务金额', dataIndex: 'serviceAmount', render: getCurrency },
  { title: '回款状态', dataIndex: 'backPayStatus', render: getPaidStatus },
  { title: '创建人', dataIndex: 'createUserName' },
  { title: '创建时间', dataIndex: 'createTime', render: getDate },
];
const attachmentColumns = [
  { title: '文件名', dataIndex: 'fileName' },
  { title: '创建时间', dataIndex: 'createTime', width: 150, render: getDate },
  { title: '操作', width: 150, render: getAction }
];

@autodata('/api/applyPays/:id')
export default class BusinessClaimDetail extends PureComponent {
  render() {
    const { $data: { data: claim = {}, loading } } = this.props;
    const {
      customerName, payName, recordedDate, openBank, recordedType,
      payAmount, cashier, createTime, claimName, claimNo, applyRemark,
      applyPayBussiess: businesses, attachmentDtos: attachments
    } = claim;
    const columns = [
      { label: '客户名称', value: customerName },
      { label: '打款名称', value: payName },
      { label: '入账日期', value: getDate(recordedDate) },
      { label: '入账类型', value: getPaymentMode(recordedType) },
      { label: '入账账号', value: getPaymentAccount(openBank) },
      { label: '入账金额', value: getCurrency(payAmount) },
      { label: '财务出纳', value: cashier },
      { label: '创建时间', value: getDate(createTime) },
      { label: '回款认领人', value: getMergerUserName(claimName, claimNo) },
      { label: '申请备注', col: 18, value: applyRemark },
    ];
    return (
      <PageHeaderLayout>
        <div className="card-group">
          <Card title="基本信息" bordered={false} loading={loading}>
            <ColumnGroup items={columns} col={6}/>
          </Card>
          <Card title="关联业务" bordered={false} loading={loading}>
            <Table pagination={false} dataSource={businesses} rowKey="id" columns={businessColumns}/>
          </Card>
          <Card title="回款附件" bordered={false} loading={loading}>
            <Table pagination={false} dataSource={attachments} rowKey="id" columns={attachmentColumns}/>
          </Card>
        </div>
      </PageHeaderLayout>
    );
  }
}
