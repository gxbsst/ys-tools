import React from 'react';
import { Table, Divider, Tooltip, Icon } from 'antd';
import styles from './ProductList.less'

const columns = [{
  title: '产品名称',
  dataIndex: 'name',
  key: 'name',
}, {
  title: '软件系列',
  dataIndex: 'softwareSeriesName',
  key: 'softwareSeriesName',
}, {
  title: '期限版本',
  dataIndex: 'saleVersionName',
  key: 'saleVersionName',
}, {
  title: '服务期限',
  dataIndex: 'serviceTime',
  key: 'serviceTime',
  render: (val) => {
    return val && ((val >= 12 && val % 12 == 0) ? `${val / 12} 年` : `${val} 月`)
  }
}, {
  title: '赠送期限',
  dataIndex: 'presentTime',
  key: 'presentTime',
  render: (val) => {
    return val && ((val >= 12 && val % 12 == 0) ? `${val / 12} 年` : `${val} 月`)
  }
}, {
  title: '门店数量',
  dataIndex: 'storeNum',
  key: 'storeNum',
}, {
  title: '产品价格',
  dataIndex: 'price',
  key: 'price',
}, {
  title: '服务价格',
  dataIndex: 'servicePrice',
  key: 'servicePrice',
}];

export default function SoftwareProductList({type, onOptionClick, ...props}) {
  const actions = {
    title: '操作',
    key: 'action',
    render: (text, record) => (
      <span>
        <Tooltip title="查看">
          <a className={styles.actionIcon} onClick={() => onOptionClick(record, 'read')}><Icon type="search" /></a>
        </Tooltip>
        <Divider type="vertical" />
        <Tooltip title="编辑">
          <a className={styles.actionIcon} onClick={() => onOptionClick(record, 'update')}><Icon type="edit" /></a>
        </Tooltip>
      </span>
    ),
  };
  return (
    <Table columns={[...columns, actions]} rowKey="id" {...props} />
  );
}
