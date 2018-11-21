import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Table, Card, Badge } from 'antd';
import _ from 'lodash';
import Timer from '../../components/Timer';
import { CheckboxGroup, ColumnGroup, Action } from '../../components/Helpers';
import { enums, getLabel } from '../../utils';
import styles from './index.less';

const staffStatuses = enums('CALL_CENTER.STAFF_STATUS');
const deviceStatuses = _.reject(enums('CALL_CENTER.DEVICE_STATUS'), { value: 'idle' });
const seatTypes = enums('CALL_CENTER.SEAT_TYPE');
const strategies = enums('CALL_CENTER.STRATEGY');

@connect(({ callCenter }) => ({ callCenter }))
export default class CallCenterQueue extends PureComponent {
  onFilter = (filters) => {
    this.props.dispatch({
      type: 'callCenter/setState',
      payload: { filters }
    });
  };

  getStatus = (value, record) => {
    const { badge: status, label: text } = _.find(staffStatuses, { value });
    const props = { status, text };
    const deviceStatus = _.find(deviceStatuses, { value: record.deviceStatus });
    if (deviceStatus) {
      const { badge: status, label: text } = deviceStatus;
      Object.assign(props, { status, text });
    }
    return <Badge {...props}/>;
  };

  getType = (value) => getLabel(seatTypes, value);

  getCount = (value) => value || 0;

  getTimer = (value) => {
    return value ? <Timer from={value}/> : null;
  };

  getAction = (value, record) => {
    const items = [
      { text: '监听', onClick: this.monitor(record) },
      { text: '三方', onClick: this.threeway(record) },
      { text: '耳语', onClick: this.whisper(record) },
      { text: '抢线', onClick: this.preemption(record) },
      { text: '强拆', onClick: this.disconnect(record) },
      { text: '强插', onClick: this.intervene(record) },
    ];
    return <Action items={items}/>;
  };

  getQueueInfo = () => {
    const { callCenter: { queue, staffs } } = this.props;
    if (queue) {
      const { name, strategy } = queue;
      const items = [
        { label: '队列名称', value: name },
        { label: '座席总数', value: staffs.length },
        { label: '分配方式', value: getLabel(strategies, strategy) },
        { label: '班长座席', value: staffs.filter(({ power }) => power).map(({ cname }) => cname).join(', ') },
      ];
      return <ColumnGroup items={items}/>;
    }
  };

  // 监听
  monitor = ({ cno: spiedCno }) => () => {
    const { callCenter: { cno: spyObject } } = this.props;
    executeAction('doSpy', { objectType: 1, spiedCno, spyObject });
  };

  // 三方
  threeway = ({ cno: threewayedCno }) => () => {
    const { callCenter: { cno: threewayedObject } } = this.props;
    executeAction('doThreeewayOk', { objectType: 1, threewayedCno, threewayedObject });
  };

  // 耳语
  whisper = ({ cno: whisperedCno }) => () => {
    const { callCenter: { cno: whisperObject } } = this.props;
    executeAction('doWhisper', { objectType: 1, whisperedCno, whisperObject });
  };

  // 抢线
  preemption = ({ cno: pickupCno }) => () => {
    executeAction('doPickup', { pickupCno });
  };

  // 强拆
  disconnect = ({ cno: disconnectedCno }) => () => {
    executeAction('doDisconnects', { disconnectedCno });
  };

  // 强插
  intervene = ({ cno: bargedCno }) => () => {
    const { callCenter: { cno: bargeObject } } = this.props;
    executeAction('doBarge', { objectType: 1, bargedCno, bargeObject });
  };

  render() {
    const { callCenter: { isReady, staffs, filters } } = this.props;
    if (!isReady) return null;
    const columns = [
      { title: '座席状态', dataIndex: 'loginStatus', fixed: 'left', width: 80, render: this.getStatus },
      { title: '座席编号', dataIndex: 'cno', width: 90 },
      { title: '座席名称', dataIndex: 'cname', width: 120 },
      { title: '座席类型', dataIndex: 'power', width: 100, render: this.getType },
      { title: '接听总数', dataIndex: 'callstaken', width: 100, render: this.getCount },
      { title: '登陆时长', dataIndex: 'loginAt', width: 130, render: this.getTimer },
      { title: '状态时长', dataIndex: 'statusAt', width: 130, render: this.getTimer },
      { title: '主叫号码', dataIndex: 'customerNumber' },
      { title: '操作', dataIndex: 'action', fixed: 'right', width: 280, render: this.getAction },
    ];
    const dataSource = staffs.filter(item => _.includes(filters, item.loginStatus));
    const tableProps = {
      rowKey: 'cid',
      scroll: { x: 1200 },
      pagination: { pageSize: 20 },
      columns,
      dataSource,
    };
    const checkboxGroupProps = {
      withCheckAll: true,
      className: styles.filter,
      options: staffStatuses,
      defaultValue: filters,
      onChange: this.onFilter,
    };
    return (
      <Fragment>
        <Card bordered={false} className={styles.info}>
          {this.getQueueInfo()}
        </Card>
        <Card bordered={false}>
          <CheckboxGroup {...checkboxGroupProps}/>
          <Table {...tableProps}/>
        </Card>
      </Fragment>
    );
  }
}
