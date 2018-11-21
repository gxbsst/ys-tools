import React, { PureComponent } from 'react';
import { Tabs, Card, Table } from 'antd';
import DescriptionList from '../../../components/DescriptionList';
import boundary from '../../../decorators/Boundary';
import ClueCleanAdvanced from './ClueCleanAdvanced';
import {
  getLinkType,
  getGender,
  getLinkStatus,
  getClewType,
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
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    key: 'email'
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    render: getLinkStatus
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

const chainStoreColumns = [
  {
    title: '门店名',
    dataIndex: 'storeName',
    key: 'storeName'
  },
  {
    title: '地区',
    dataIndex: 'area',
    key: 'area'
  },
  {
    title: '地址',
    dataIndex: 'address',
    key: 'address'
  },
  {
    title: '经营状态',
    dataIndex: 'status',
    key: 'status'
  },
  {
    title: '备注',
    dataIndex: 'remark',
    key: 'remark'
  }
];

@boundary
export default class ClewCleanDetail extends PureComponent {
  render() {
    const { clewInfo, contact, stores } = this.props.data;
    return (
      <Tabs defaultActiveKey="1">
        <TabPane tab="基本信息" key="1">
          <Card title="基本信息" style={{ marginBottom: 24 }} bordered={false}>
            <DescriptionList
              col="4"
              gutter={0}
              size="large"
              style={{ marginBottom: 32 }}
            >
              <Description term="线索id">{clewInfo.clewId}</Description>
              <Description term="线索类型">
                {getClewType(clewInfo.clewType)}
              </Description>
              <Description term="客户类型">
                {getCustomerType(clewInfo.customerType)}
              </Description>
              {clewInfo.customerType === 1 ? (
                <Description term="身份证号">{clewInfo.idNumber}</Description>
              ) : (
                <Description term="客户名称">
                  {clewInfo.customerName}
                </Description>
              )}
              <Description term="商户名称">{clewInfo.shopName}</Description>
              <Description term="一级来源">
                {clewInfo.firstFromSourceName}
              </Description>
              <Description term="二级来源">
                {clewInfo.secondFromSourceName}
              </Description>
              <Description term="来源标签">{clewInfo.sourceTag}</Description>
              <Description term="创建时间">{clewInfo.createTime}</Description>

              <Description term="账号主体">
                {clewInfo.accountMainBody}
              </Description>
              <Description term="行业">{clewInfo.industry}</Description>
              <Description term="地区">{clewInfo.area}</Description>
              <Description term="地址">{clewInfo.detailAddress}</Description>
              <Description term="经营状态">{clewInfo.manageStatus}</Description>
              <Description term="经营范围">{clewInfo.manageArea}</Description>
              <Description term="主营产品">
                {clewInfo.manageProduct}
              </Description>

              <Description term="注册时间">{clewInfo.registerTime}</Description>
              <Description term="注册地址">
                {clewInfo.registerAddress}
              </Description>
              <Description term="法人">{clewInfo.legalPerson}</Description>
              <Description term="资质类型">
                {clewInfo.qualificationType}
              </Description>
              <Description term="证件号码">
                {clewInfo.certificateNumber}
              </Description>
              <Description term="公司详情">
                {clewInfo.companyDetail}
              </Description>
            </DescriptionList>
          </Card>
          <Card
            title="联系人信息"
            style={{ marginBottom: 24 }}
            bordered={false}
          >
            <Table
              columns={contactsColumns}
              dataSource={contact}
              pagination={false}
              rowKey="id"
            />
          </Card>
          {clewInfo.customerType === 4 && (
            <Card
              title="连锁门店信息"
              style={{ marginBottom: 24 }}
              bordered={false}
            >
              <Table
                columns={chainStoreColumns}
                dataSource={stores}
                pagination={false}
                rowKey="id"
                expandedRowRender={record => (
                  <Table
                    columns={storeContactColumns}
                    dataSource={record.contacts}
                    size="small"
                    pagination={false}
                    title={() => '联系人信息'}
                    rowKey="id"
                  />
                )}
              />
            </Card>
          )}
        </TabPane>
        <TabPane tab="跟进信息" key="2">
          <ClueCleanAdvanced params={{ id: this.props.id }} />
        </TabPane>
      </Tabs>
    );
  }
}
