import React, { PureComponent } from 'react';
import { Table, Card } from 'antd';
import { connect } from 'dva';
import Timer from '../../components/Timer';

@connect(({ callCenter }) => ({ callCenter }))
export default class CallCenterCalling extends PureComponent {
  getTimer = (value, { joinTime }) => joinTime ? <Timer from={joinTime}/> : null;

  getStatus = value => value ? '响铃' : '排队';

  getOverflow = value => value || 0;

  getPosition = (value, record, index) => index + 1;

  render() {
    const { callCenter: { callings: dataSource } } = this.props;
    const columns = [
      { title: '主叫号码', dataIndex: 'customerNumber', fixed: 'left', width: 150 },
      { title: '来电时间', dataIndex: 'startTime' },
      { title: '进入队列时间', dataIndex: 'joinTime' },
      { title: '排队时长', dataIndex: 'waitTime', width: 120, render: this.getTimer },
      { title: '呼叫状态', dataIndex: 'call_status', width: 100, render: this.getStatus },
      { title: '溢出次数', dataIndex: 'overflow', width: 100, render: this.getOverflow },
      { title: '排队位置', dataIndex: 'position', width: 100, render: this.getPosition },
    ];
    const tableProps = {
      rowKey: 'uniqueId',
      scroll: { x: 900 },
      pagination: { pageSize: 20 },
      columns,
      dataSource,
    };
    return (
      <Card bordered={false}>
        <Table {...tableProps}/>
      </Card>
    );
  }
}
