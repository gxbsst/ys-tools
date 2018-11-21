import React, { Component } from 'react';
import { Card, Table } from 'antd';
import DescriptionList from '../../../components/DescriptionList';
import {
  clewFieldLabels,
  customerFieldLabels,
  contactsColumns,
  clewBaseInfoLabels,
  clewTypeMap,
  cleanTagMap,
  clewStatusMap,
  customerTypeMap,
} from '../../../utils/paramsMap';

const { Description } = DescriptionList;

const baseInfo = ({ clewId: '线索ID', ...clewFieldLabels, ...customerFieldLabels }, clewBaseInfoLabels);
const chainStoreColumns = [
  {
    title: '门店名',
    dataIndex: 'storeName',
    width: 100,
  }, {
    title: '经营状态',
    dataIndex: 'status',
    width: 100,
  }, {
    title: '地区',
    dataIndex: 'area',
    width: 100,
  }, {
    title: '地址',
    dataIndex: 'address',
    width: 150,
  }, {
    title: '备注',
    dataIndex: 'remark',
    width: 150,
  },
];

export default class BaseInfo extends Component {
  render() {
    const {
      clewInfo, contacts, stores
    } = this.props.baseInfo;
    const infoKeyMap = {
      clewType: v => clewTypeMap.get(v),
      customerType: v => customerTypeMap.get(v),
      customerName: v => clewInfo.customerType == 1 ? clewInfo.idNumber : v,
      firstFromSource: () => clewInfo.firstFromSourceName,
      secondFromSource: () => clewInfo.secondFromSourceName,
      areaCode: () => clewInfo.area,
    }
    const descriptions = Object.entries(baseInfo).map(([key, v]) => {
      const value = key == 'customerName' && clewInfo.customerType == 1 ? '身份证号' : v;
      const detail = infoKeyMap[key] ? infoKeyMap[key](clewInfo[key]) : clewInfo[key];
      return <Description key={key} term={value}>{detail}</Description>;
    })
    const cleanTag = [2, 5].includes(clewInfo.clewStatus) ? `清洗标签: ${cleanTag ? cleanTagMap.get(clewInfo.cleanTag) : '未清洗'}` : '';
    const currentStatus = (() => {
      const statusLabel = '当前状态: ';
      switch (clewInfo.clewStatus) {
        case 0: return '未知状态';
        case 2:
        case 5: return `${statusLabel}清洗中 - ${clewInfo.handlerName || ''}`;
        case 6: return `${statusLabel}待审核 - ${clewInfo.handlerName || ''}`;
        default: return `${statusLabel}${clewStatusMap.get(clewInfo.clewStatus) || ''}`;
      }
    })()
    const extra = (
      <pre style={{marginBottom: 0}}>
        {cleanTag}   {currentStatus}
      </pre>
    );

    return (
      <div>
        <Card title="基本信息" extra={extra} style={{ marginBottom: 24 }} bordered={false}>
          <DescriptionList col="4" gutter={0} size="large" style={{ marginBottom: 32 }}>
            {descriptions}
          </DescriptionList>
        </Card>
        <Card title="联系人信息" style={{ marginBottom: 24 }} bordered={false}>
          <Table
            columns={contactsColumns}
            dataSource={contacts || []}
            pagination={false}
            rowKey="id"
          />
        </Card>
        {
          stores && stores.length ?
          <Card title="连锁门店信息" style={{ marginBottom: 24 }} bordered={false}>
            <Table
              columns={chainStoreColumns}
              dataSource={stores || []}
              pagination={false}
              rowKey="id"
              expandedRowRender={record => (
                <Table
                  columns={contactsColumns}
                  dataSource={record.contacts || []}
                  size="small"
                  pagination={false}
                  title={() => '联系人信息'}
                  rowKey="id"
                />)}
            />
          </Card> : null
        }
      </div>
    );
  }
}
