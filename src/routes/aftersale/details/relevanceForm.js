/* eslint-disable no-param-reassign */
import React, {PureComponent} from 'react';
import {Button, Table} from 'antd';
import {Link} from 'dva/router';
import {BusinessColumns} from './tableColumns';

export default class BusinessForm extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      data: props.data,
      value: props.value,
    };
  }

  componentWillReceiveProps(nextProps) {
    if ('value' in nextProps || 'data' in nextProps) {
      this.setState({
        value: nextProps.value,
        data: nextProps.data,
      });
    }
  }

  saveRow(keys, rows) {
    const newValue = {
      ids: keys,
      amount: rows.reduce((amount, cur) => amount + cur.amount, 0),
    }
    this.setState({value: {...newValue}});
    this.props.onChange({...newValue});
  }

  checkBusiness(record) {

  }

  render() {
    const columns = [
      ...BusinessColumns,
      {
        title: '操作',
        key: 'action',
        width: 100,
        render: (text, record) => (<Link to={`/aftersale/business/${record.id}`}>查看</Link>),
      }
    ];
    const {data, value: {ids, amount}} = this.state;
    const rowSelection = {
      selectedRowKeys: ids,
      onChange: this.saveRow.bind(this),
    }
    return (
      <div>
        <Table
          scroll={{y: 700}}
          columns={columns}
          dataSource={data}
          pagination={false}
          rowSelection={rowSelection}
          rowKey={record => record.id}
        />
        <span>所选业务总金额：{amount}元</span>
      </div>
    );
  }
}
