import React, { PureComponent, Fragment } from 'react';
import { Icon, Input, Badge, Switch, Tooltip, Divider, Table } from 'antd';
import { connect } from 'dva';
import classNames from 'classnames';
import Timer from '../Timer';
import Customer from './Customer';
import { enums, getLabel, storage } from '../../utils';
import styles from './index.less';

const staffStatuses = enums('CALL_CENTER.STAFF_STATUS');
const deviceStatuses = _.reject(enums('CALL_CENTER.DEVICE_STATUS'), { value: 'idle' });
const seatTypes = enums('CALL_CENTER.SEAT_TYPE');

@connect(({ callCenter }) => ({ callCenter }))
export default class CallCenterWidget extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selector: null,
    };
  }

  logout = () => {
    executeAction('doLogout', { type: 1 });
  };

  pause = () => {
    const { callCenter: { isPause }, dispatch } = this.props;
    executeAction(isPause ? 'doUnpause' : 'doPause', { description: '置忙' });
    dispatch({
      type: 'callCenter/setState',
      payload: { isPause: !isPause }
    });
  };

  call = (tel) => {
    executeAction('doPreviewOutCall', { callType: 3, tel });
  };

  transfer = () => {
    this.setState({ selector: this.state.selector === 'transfer' ? null : 'transfer' });
  };

  threeway = () => {
    this.setState({ selector: this.state.selector === 'threeway' ? null : 'threeway' });
  };

  disconnect = () => {
    executeAction('doPreviewOutcallCancel');
  };

  fixed = () => {
    const { callCenter: { fixed } } = this.props;
    storage('ccWidgetFixed', !fixed);
    this.props.dispatch({
      type: 'callCenter/setState',
      payload: { fixed: !fixed }
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

  getCurrentStatus = () => {
    const { callCenter: { cno, staffs } } = this.props;
    const staff = _.find(staffs, { cno });
    if (staff) {
      const { loginStatus, deviceStatus, statusAt } = staff;
      const status = this.getStatus(loginStatus, { deviceStatus });
      return (
        <Fragment>
          {status}
          {deviceStatus !== 'idle' ? <Timer className={styles.timer} from={statusAt}/> : null}
        </Fragment>
      );
    }
  };

  getType = (value) => getLabel(seatTypes, value);

  getCallPanel = () => {
    const { selector: type } = this.state;
    const { callCenter: { call, calling, staffs: all } } = this.props;
    if (!calling) {
      return (
        <div className={styles.panel}>
          <Input.Search enterButton={<Icon type="phone"/>} placeholder="请输入电话号码" onSearch={call}/>
        </div>
      );
    }
    const { customerNumber, customerAreaCode } = calling;
    const staffs = all.filter(item => item.deviceStatus === 'idle' && item.loginStatus === 'online');
    let selector = null;
    if (type && staffs.length) {
      const columns = [
        { title: '座席状态', dataIndex: 'loginStatus', width: '25%', render: this.getStatus },
        { title: '座席编号', dataIndex: 'cno', width: '25%' },
        { title: '座席名称', dataIndex: 'cname', width: '25%' },
        { title: '座席类型', dataIndex: 'power', width: '25%', render: this.getType },
      ];
      const tableProps = {
        rowKey: 'cid',
        size: 'small',
        pagination: false,
        onRow: this.onRow,
        dataSource: staffs,
        columns,
      };
      selector = (
        <div className={styles.selector}>
          <Table {...tableProps}/>
        </div>
      );
    }
    return (
      <Fragment>
        {selector}
        <div className={styles.calling}>
          <div className={styles.phone}>{customerNumber}</div>
          <div>{customerAreaCode}</div>
          <div>
            <a onClick={this.transfer}>转换</a>
            <Divider type="vertical"/>
            <a onClick={this.threeway}>三方</a>
            <Divider type="vertical"/>
            <a onClick={this.disconnect}>挂断</a>
          </div>
        </div>
      </Fragment>
    );
  };

  getCustomers = () => {
    const { callCenter: { calling } } = this.props;
    return (calling && calling.customerNumber) ? <Customer query={{ mobile: calling.customerNumber }}/> : null;
  };

  onRow = ({ cno }) => ({
    onClick: () => {
      switch (this.state.selector) {
        case 'transfer':
          return executeAction('doTransfer', { transferObject: cno, objectType: 1 });
        case 'threeway':
          executeAction('doConsult', { consultObject: cno, objectType: 1 });
          return executeAction('doConsultThreeway');
      }
    },
  });

  render() {
    const { callCenter: { isReady, isPause, fixed, hover, active, onMouseEnter, onMouseLeave, calling, staffs } } = this.props;
    const widgetProps = {
      className: classNames(styles.widget, (fixed || hover || active) ? styles.active : null, fixed ? styles.fixed : null),
      onMouseEnter,
      onMouseLeave,
    };
    if (!isReady) return null;
    return (
      <div {...widgetProps}>
        <div className={classNames(styles.header, 'flex-row')}>
          <div className="flex-item">{this.getCurrentStatus()}</div>
          <Switch checkedChildren="空闲" unCheckedChildren="置忙" checked={!isPause} onChange={this.pause}/>
          <div className={classNames(styles.fixable, fixed ? null : styles.unfixed)}>
            <Tooltip placement="left" title={fixed ? '自动隐藏' : '固定'}>
              <Icon type="pushpin" onClick={this.fixed}/>
            </Tooltip>
          </div>
        </div>
        <Divider/>
        {this.getCallPanel()}
        {this.getCustomers()}
      </div>
    );
  }
}
