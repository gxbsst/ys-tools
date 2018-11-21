import React, { PureComponent } from 'react';
import { Card, Tabs, Table } from 'antd';
import DescriptionList from '../../../components/DescriptionList';
import ISSendListAdvanced from './ISSendListAdvanced';
import {
  getLinkType,
  getGender,
  getCustomerType,
  getFunnelRank
} from '../../../utils/helpers';

const {TabPane} = Tabs,
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
    dataIndex: 'remarks',
    key: 'remarks'
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

export default class ISSendListDetail extends PureComponent {
  render() {
    const { data, id } = this.props,
      {
        chanceInfoDto,
        customerLinkDtoList,
        storeInfoDtoList
      } = this.props.data;
    return (
      <Tabs defaultActiveKey="1">
        <TabPane tab="基本信息" key="1">
          <Card
            title="IS购买意向信息"
            style={{ marginBottom: 24 }}
            bordered={false}
          >
            <DescriptionList size="large" style={{ marginBottom: 32 }}>
              <Description term="漏斗等级">
                {getFunnelRank(data.customerLevel)}
              </Description>
              <Description term="意向产品类型">
                {data.productTypeName}
              </Description>
              <Description term="意向产品">{data.productName}</Description>
              <Description term="意向价格">{`￥${data.minPrice}~￥${
                data.maxPrice
              }`}</Description>
              <Description term="购买时间">{data.intentionTime}</Description>
              <Description term="备注">{data.remark}</Description>
            </DescriptionList>
          </Card>
          <Card title="基本信息" style={{ marginBottom: 24 }} bordered={false}>
            <DescriptionList size="large" style={{ marginBottom: 32 }}>
              <Description term="线索id">{chanceInfoDto.clewId}</Description>
              <Description term="线索类型">
                {chanceInfoDto.chanceType}
              </Description>
              <Description term="客户类型">
                {getCustomerType(chanceInfoDto.customerType)}
              </Description>
              {chanceInfoDto.customerType === 1 ? (
                <Description term="身份证号">
                  {chanceInfoDto.idNumber}
                </Description>
              ) : (
                <Description term="客户名称">
                  {chanceInfoDto.customerName}
                </Description>
              )}
              <Description term="商户名称">
                {chanceInfoDto.shopName}
              </Description>
              <Description term="一级来源">
                {chanceInfoDto.firstFromSourceName}
              </Description>
              <Description term="二级来源">
                {chanceInfoDto.secondFromSourceName}
              </Description>
              <Description term="来源标签">
                {chanceInfoDto.sourceTag}
              </Description>
              <Description term="创建时间">
                {chanceInfoDto.createTime}
              </Description>
              <Description term="账户主体">
                {chanceInfoDto.accountMainBody}
              </Description>
              <Description term="行业">{chanceInfoDto.industry}</Description>
              <Description term="地区">{chanceInfoDto.area}</Description>
              <Description term="地址">
                {chanceInfoDto.detailAddress}
              </Description>
              <Description term="经营状态">
                {chanceInfoDto.manageStatus}
              </Description>
              <Description term="经营范围">
                {chanceInfoDto.manageArea}
              </Description>
              <Description term="主营产品">
                {chanceInfoDto.manageProduct}
              </Description>
              <Description term="注册时间">
                {chanceInfoDto.registerTime}
              </Description>
              <Description term="注册地址">
                {chanceInfoDto.registerAddress}
              </Description>
              <Description term="法人">
                {chanceInfoDto.customerName}
              </Description>
              <Description term="资质类型">
                {chanceInfoDto.qualificationType}
              </Description>
              <Description term="证件号码">
                {chanceInfoDto.certificateNumber}
              </Description>
              <Description term="公司详情">
                {chanceInfoDto.companyDetail}
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
              dataSource={customerLinkDtoList}
              pagination={false}
              rowKey="id"
            />
          </Card>
          {chanceInfoDto.customerType === 4 && (
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
                    size="small"
                    rowKey="id"
                    title={() => '联系人信息'}
                  />
                )}
              />
            </Card>
          )}
        </TabPane>
        <TabPane tab="跟进信息" key="2">
          <ISSendListAdvanced id={id} />
        </TabPane>
      </Tabs>
    );
  }
}
