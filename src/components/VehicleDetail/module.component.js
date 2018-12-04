import React, {PureComponent} from 'react';
import classNames from 'classnames';
import {Card, Table, Tag} from 'antd';

import styles from './module.component.less'

const bodyStyle = {padding: 0};

export default class ModuleComponent extends PureComponent {

  columns = [
    {
      title: '名称', dataIndex: 'name', width: 60, key: 'name'
    },
    {
      title: '状态', dataIndex: 'status', width: '25%', key: 'status', render(value, record, index) {
        return <Tag color={['red', 'volcano', 'orange'][index]}>{value}</Tag>;
      }
    },
    {title: '最近活动', dataIndex: 'activeAt', key: 'activeAt'},
    {title: '其他', dataIndex: 'actions', width: '25%', key: 'actions'},
  ];

  render() {
    const {columns} = this;
    const {dataSource} = this.props;
    const cardProps = {
      title: '模块',
      className: styles.module,
      bordered: false,
      bodyStyle,
    };
    const tableProps = {
      rowKey: 'id',
      className: classNames('table-fixed', styles.rank),
      bordered: false,
      pagination: false,
      size: 'small',
      scroll: {y: 224},
      columns,
      dataSource,
    };
    return (
      <Card {...cardProps}>
        <Table {...tableProps}/>
      </Card>
    );
  }
}
