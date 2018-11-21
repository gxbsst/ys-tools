import React from 'react';
import { Table, Divider, Tooltip, Icon } from 'antd';
import styles from './ProductList.less'

const columns = [{
  title: '产品名称',
  dataIndex: 'name',
  key: 'name',
}, {
  title: '成本价格',
  dataIndex: 'costPrice',
  key: 'costPrice',
}, {
  title: '产品价格',
  dataIndex: 'price',
  key: 'price',
}, {
  title: '服务价格',
  dataIndex: 'servicePrice',
  key: 'servicePrice',
}, {
  title: '计费单位',
  dataIndex: 'chargeUnit',
  key: 'chargeUnit',
  render: val => ['次', '个'][val],
}];

export default function HardwareProductList({type, onOptionClick, ...props}) {
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
