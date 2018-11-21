import React from 'react';
import PropTypes from 'prop-types';
import { Table, Divider, Tooltip, Icon } from 'antd';
import columns from './columns';
import styles from './ProductList.less'

/**
 * product list
 * @param       {String} type             software, hardware, increment
 * @param       {Function} onOptionClick  event of Table options
 */
export default function ProductList({type, onOptionClick, ...props}) {
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
    <Table columns={[...columns[type], actions]} rowKey="id" {...props} />
  );
}

ProductList.propTypes = {
  type: PropTypes.string.isRequired,
}
