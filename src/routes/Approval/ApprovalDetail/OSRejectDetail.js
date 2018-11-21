import React, { PureComponent } from 'react';
import { Card, Tabs, Table } from 'antd';
import DescriptionList from '../../../components/DescriptionList';
import OSRejectAdvanced from './OSRejectAdvanced';
import {
  getGender,
  getLinkType,
  getCustomerType
} from '../../../utils/helpers';

const { TabPane } = Tabs,
  { Description } = DescriptionList;

const contactsColumns = [
  {
    title: '类型',
    dataIndex: 'linkType',
    key: 'linkType',
    render: getLinkType
  },
  {
    title: '性别',
    dataIndex: 'sex',
    key: 'sex',
    render: getGender
  },
  {
    title: '职务',
    dataIndex: 'position',
    key: 'position'
  },
  {
    title: '姓名',
    dataIndex: 'linkName',
    key: 'linkName'
  },
  {
    title: '部门',
    dataIndex: 'department',
    key: 'department'
  },
  {
    title: 'qq',
    dataIndex: 'qq',
    key: 'qq'
  },
  {
    title: '电话1',
    dataIndex: 'phone',
    key: 'phone'
  },
  {
    title: '电话2',
    dataIndex: 'mobile',
    key: 'mobile'
  },
  {
    title: '微信',
    dataIndex: 'wechat',
    key: 'wechat'
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    key: 'email'
  }
];

const chainStoreColumns = [
  {
    title: '门店名',
    dataIndex: 'storeName',
    key: 'storeName'
  },
  {
    title: '经营状态',
    dataIndex: 'status',
    key: 'status'
  },
  {
    title: '地区',
    dataIndex: 'area',
    key: 'area'
  },
  {
    title: '备注',
    dataIndex: 'remark',
    key: 'remark'
  },
  {
    title: '地址',
    dataIndex: 'address',
    key: 'address'
  }
];

const storeContactColumns = [
  {
    title: '类型',
    dataIndex: 'linkType',
    key: 'linkType',
    render: getLinkType
  },
  {
    title: '姓名',
    dataIndex: 'linkName',
    key: 'linkName'
  },
  {
    title: '性别',
    dataIndex: 'sex',
    key: 'sex',
    render: getGender
  },
  {
    title: '电话1',
    dataIndex: 'phone',
    key: 'phone'
  },
  {
    title: '电话2',
    dataIndex: 'mobile',
    key: 'mobile'
  },
  {
    title: '职务',
    dataIndex: 'position',
    key: 'position'
  },
  {
    title: '部门',
    dataIndex: 'department',
    key: 'department'
  },
  {
    title: 'qq',
    dataIndex: 'qq',
    key: 'qq'
  },
  {
    title: '微信',
    dataIndex: 'wechat',
    key: 'wechat'
  }
];

export default class OSRejectDetail extends PureComponent {
  render() {
    const { data, id } = this.props,
      { customerLinkDtoList, storeInfoDtoList } = this.props.data;
    return (
      <Tabs defaultActiveKey="1">
        <TabPane tab="基本信息" key="1">
          <Card title="基本信息" style={{ marginBottom: 24 }} bordered={false}>
            <DescriptionList size="large" style={{ marginBottom: 32 }}>
              <Description term="线索id">{data.clewId}</Description>
              <Description term="线索类型">{data.chanceType}</Description>
              <Description term="客户类型">
                {getCustomerType(data.customerType)}
              </Description>
              {data.customerType === 1 ? (
                <Description term="身份证号">{data.idNumber}</Description>
              ) : (
                <Description term="客户名称">{data.customerName}</Description>
              )}
              <Description term="商户名称">{data.shopName}</Description>
              <Description term="一级来源">
                {data.firstFromSourceName}
              </Description>
              <Description term="二级来源">
                {data.secondFromSourceName}
              </Description>
              <Description term="来源标签">{data.sourceTag}</Description>
              <Description term="创建时间">{data.createTime}</Description>
              <Description term="账户主体">{data.accountMainBody}</Description>
              <Description term="行业">{data.industry}</Description>
              <Description term="地区">{data.area}</Description>
              <Description term="地址">{data.detailAddress}</Description>
              <Description term="经营状态">{data.manageStatus}</Description>
              <Description term="经营范围">{data.manageArea}</Description>
              <Description term="主营产品">{data.manageProduct}</Description>
              <Description term="注册时间">{data.registerTime}</Description>
              <Description term="注册地址">{data.registerAddress}</Description>
              <Description term="法人">{data.customerName}</Description>
              <Description term="资质类型">
                {data.qualificationType}
              </Description>
              <Description term="证件号码">
                {data.certificateNumber}
              </Description>
              <Description term="公司详情">{data.companyDetail}</Description>
            </DescriptionList>
          </Card>
          <Card
            title="联系人信息"
            style={{ marginBottom: 24 }}
            bordered={false}
          >
            <Table
              columns={contactsColumns}
              dataSource={customerLinkDtoList}
              pagination={false}
              rowKey="id"
            />
          </Card>
          {data.customerType === 4 && (
            <Card
              title="连锁门店信息"
              style={{ marginBottom: 24 }}
              bordered={false}
            >
              <Table
                columns={chainStoreColumns}
                dataSource={storeInfoDtoList}
                pagination={false}
                rowKey="id"
                expandedRowRender={record => (
                  <Table
                    columns={storeContactColumns}
                    dataSource={record.contacts}
                    pagination={false}
                    rowKey="id"
                    size="small"
                    title={() => '联系人信息'}
                  />
                )}
              />
            </Card>
          )}
        </TabPane>
        <TabPane tab="跟进信息" key="2">
          <OSRejectAdvanced id={id} />
        </TabPane>
      </Tabs>
    );
  }
}
