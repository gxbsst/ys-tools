import React, { PureComponent } from 'react';
import { Table } from 'antd';

export default class EditSeat extends PureComponent {
  render() {
    const columns = [
      {
        title: '坐席编号',
        dataIndex: 'seatCno',
        width: '10%',
      },
      {
        title: '坐席名称',
        dataIndex: 'seatName',
        width: '15%',
      },
      {
        title: '员工姓名',
        dataIndex: 'userName',
        width: '15%',
      },
      {
        title: '员工工号',
        dataIndex: 'userId',
        width: '10%',
      },
      {
        title: '绑定电话',
        dataIndex: 'seatPhone',
      },
      {
        title: '班长坐席',
        dataIndex: 'seatCno',
        key: 'seatRole',
        width: '15%',
        render: value => value ? '是' : '否'
      },
    ];
    const {$data: {data, pagination}} = this.props;

    return <Table columns={columns} dataSource={data} pagination={pagination} rowKey="id"/>;
  }
}