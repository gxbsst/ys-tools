import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Row, Col, Form, Input, DatePicker, Divider, message } from 'antd';
import { Link } from 'dva/router';
import _ from 'lodash';
import moment from 'moment';
import Dialog from '../../components/Dialog';
import Stars from '../../components/Stars';
import can from '../../decorators/Can';
import { request } from '../../utils';
import styles from './index.less';

const { Item: FormItem } = Form;
const form1Item = { labelCol: { span: 3 }, wrapperCol: { span: 21 } };
const form2Item = { labelCol: { span: 6 }, wrapperCol: { span: 18 } };
const form3Item = { labelCol: { span: 10 }, wrapperCol: { span: 14 } };
const disabledDate = current => current && current < moment().startOf('day');

Object.assign(window, {
  cbLogin(data) {
    const { code, msg, allCallBackCount, enterpriseId, cno, bindTel } = data;
    if (code === '0') {
      this.props.dispatch({
        type: 'callCenter/setState',
        payload: { isReady: true, allCallBackCount, enterpriseId, cno, bindTel }
      });
      executeAction('doQueueStatus');
    } else {
      message.error(msg);
    }
  },
  cbQueueStatus(data) {
    const { callCenter: { enterpriseId }, dispatch } = this.props;
    const { queueStatus } = data;
    const { qid: id, qname: name, memberStatus, queueParams, queueEntry: callings } = queueStatus[0];
    dispatch({
      type: 'callCenter/setState',
      payload: {
        queue: { id, name, ...queueParams },
        staffs: memberStatus.map(staff => {
          const { cid, duration, loginTime } = staff;
          const matchers = cid.match(new RegExp(`^${enterpriseId}([0-9]+)$`));
          if(matchers) {
            staff.cno = matchers[1];
          }
          if (_.isNumber(duration)) {
            staff.statusAt = moment().subtract(duration, 's');
          }
          if (_.isNumber(loginTime)) {
            staff.loginAt = moment().subtract(loginTime, 's');
          }
          return staff;
        }),
        callings,
      }
    });
  },
  cbQueue(data) {
    const { uniqueId, name, customerNumber, startTime, joinTime, overflow } = data;
    const { callCenter: { callings: old }, dispatch } = this.props;
    let callings = old;
    switch (name) {
      case 'joinQueue':
        const newCalling = {
          uniqueId,
          name,
          customerNumber,
          startTime,
          joinTime,
          overflow
        };
        const calling = _.find(callings, { uniqueId });
        if (calling) {
          Object.assign(calling, newCalling);
        } else {
          callings.push(newCalling);
        }
        break;
      case 'leaveQueue':
        callings = _.reject(callings, { uniqueId });
        break;
    }
    dispatch({
      type: 'callCenter/setState',
      payload: { callings: [].concat(callings) }
    });
  },
  cbStatus(data) {
    const { cno, enterpriseId, bindTel, deviceStatus, loginStatus, customerNumber } = data;
    const { callCenter: { staffs }, dispatch } = this.props;
    const staff = _.find(staffs, { cno });
    if (staff) {
      const { loginStatus: oldLoginStatus } = staff;
      Object.assign(staff, {
        cid: `${enterpriseId}${cno}`,
        statusAt: new Date(),
        cno,
        bindTel,
        deviceStatus,
        loginStatus,
        customerNumber,
      });
      if (oldLoginStatus === 'offline' && loginStatus === 'online') {
        staff.loginAt = new Date();
      }
      if (loginStatus === 'offline') {
        delete staff.statusAt;
        delete staff.loginAt;
      }
      dispatch({
        type: 'callCenter/setState',
        payload: { staffs: [].concat(staffs) }
      });
    }
  },
  cbThisStatus(data) {
    const { dispatch } = this.props;
    const { deviceStatus, eventName, name, callType } = data;
    switch (eventName) {
      case 'comeRinging':
      case 'outRinging':
        if (name === 'ringing') { // 响铃
          dispatch({
            type: 'callCenter/setState',
            payload: { calling: data }
          });
        }
        break;
      case 'normalBusy':
        if (name === 'status') {  // 已接听

        }
        if (name === 'consultError') {  // 咨询失败

        }
        break;
      case 'consultLink':
        if (name === 'consultLink') { // 咨询接听

        }
        break;
      case 'neatenStart': // 客户挂断，开始整理

        break;
      case 'neatenEnd': // 整理结束

        break;
      case 'waitLink':
        if (callType === '3') { // 外呼，座席接听，客户响铃

        }
        break;
      case 'outBusy':
        if (name === 'previewOutcallBridge' && callType === '3') {  // 外呼，客户接听

        }
        break;
      case 'onlineUnlink':  // 空闲时外呼，客户无应答，座席挂机

        break;
      case 'pauseUnlink':  // 置忙时外呼，客户挂断或无应答，座席挂机

        break;
    }
    const payload = { active: deviceStatus && deviceStatus !== 'idle' };
    if (deviceStatus && deviceStatus === 'idle') {
      payload.calling = null;
    }
    dispatch({ type: 'callCenter/setState', payload });
  },
  cbOrderCallBack({ addORReduce }) {
    const { callCenter: { reservations }, dispatch } = this.props;
    dispatch({
      type: 'callCenter/setState',
      payload: { reservations: reservations + addORReduce }
    });
  }
});

@connect(({ callCenter }) => ({ callCenter }))
@can(1001000, null)
export default class CallCenter extends PureComponent {
  constructor(props) {
    super(props);
    window.cbLogin = window.cbLogin.bind(this);
    window.cbQueueStatus = window.cbQueueStatus.bind(this);
    window.cbQueue = window.cbQueue.bind(this);
    window.cbStatus = window.cbStatus.bind(this);
    window.cbThisStatus = window.cbThisStatus.bind(this);
    window.cbOrderCallBack = window.cbOrderCallBack.bind(this);
  }

  componentWillMount() {
    const { onMouseEnter, onMouseLeave, bind, contact, call, logout } = this;
    this.props.dispatch({
      type: 'callCenter/setState',
      payload: { onMouseEnter, onMouseLeave, bind, contact, call, logout }
    });
    this.login();
  }

  login = async () => {
    const { data } = await request('/api/callcenter/seatLogin', false);
    if (data) {
      const { seatPhone: bindTel, passsword: pwd, hotLine, seatCno: cno } = data;
      this.props.dispatch({
        type: 'callCenter/setState',
        payload: { isLogin: true, cno, hotLine, bindTel, pwd }
      });
      bindTel && executeAction('doLogin', { hotLine, cno, pwd, bindTel, bindType: 1, initStatus: 'online' });
    }
  };

  logout = () => {
    executeAction('doLogout', { type: 1, removeBinding: 1 });
  };

  bind = () => {
    const { callCenter: { cno, bindTel }, dispatch } = this.props;
    Dialog.open({
      title: '号码绑定',
      width: 350,
      formProps: {
        action: '/api/callcenter/seatBandingTel',
        method: 'GET',
        onSubmitted: (data, { query: { seatPhone: bindTel } }) => {
          dispatch({
            type: 'callCenter/setState',
            payload: { bindTel }
          });
          this.login();
        }
      },
      render({ props: { form: { getFieldDecorator } } }) {
        return (
          <Fragment>
            {getFieldDecorator('seatCno', {
              initialValue: cno,
            })(<Input hidden={true}/>)}
            <Form.Item>
              {getFieldDecorator('seatPhone', {
                initialValue: bindTel,
                rules: [{ required: true, message: '绑定电话' }]
              })(<Input size="large" placeholder="请输入绑定电话" autoFocus/>)}
            </Form.Item>
          </Fragment>
        );
      }
    });
  };

  call = (tel) => {
    if (!tel) return message.error('电话号码不能为空');
    executeAction('doPreviewOutCall', { callType: 3, tel });
  };

  contact = async (businessId, contactType = 1) => {
    const { data: business } = await request(`/api/customerRenewVisit/info/${businessId}`);
    const { mobile } = business;
    if (!mobile) return message.error('该业务数据未包含联系电话');
    this.call(mobile);
    Dialog.open({
      title: '回访呼叫',
      width: 720,
      autoClose: false,
      formProps: {
        action: '/api/customerContact/add',
        method: 'POST',
        valuesFilter: ({ contactType, customerId, linkSubject, linkContent, linkManId, linkManName, linkManTel, serverClass }) => ({
          contactType, customerId, linkSubject, linkContent, linkManId, linkManName, linkManTel, serverClass
        }),
        onSubmitted() {
          const { form } = this.props;
          form.validateFields(async (err, { customerId: id, brandClass, influenceClass, livenessClass, operationClass, proSatisfactionClass, renewClass, warnDatetime }) => {
            await request('/api/customerAddition/edit', {
              method: 'PUT',
              body: { id, brandClass, influenceClass, livenessClass, operationClass, proSatisfactionClass, renewClass, warnDatetime, warnFlag: warnDatetime ? 1 : 0 }
            });
            this.destroy();
          });
        }
      },
      render() {
        const { form: { getFieldDecorator } } = this.props;
        const {
          contactsNo: linkId, linkName, mobile,
          id: customerId, customerName, weimobAccount, shopName,
          brandClass, influenceClass, livenessClass, operationClass, proSatisfactionClass, renewClass
        } = business;
        return (
          <div className={styles.dialog}>
            {getFieldDecorator('contactType', { initialValue: contactType })(<Input type="hidden"/>)}
            {getFieldDecorator('customerId', { initialValue: customerId })(<Input type="hidden"/>)}
            {getFieldDecorator('linkManId', { initialValue: linkId })(<Input type="hidden"/>)}
            {getFieldDecorator('linkManName', { initialValue: linkName })(<Input type="hidden"/>)}
            {getFieldDecorator('linkManTel', { initialValue: mobile })(<Input type="hidden"/>)}
            <Row>
              <Col span={12}>
                <FormItem label="客户名称" {...form2Item}>{customerName}</FormItem>
              </Col>
              <Col span={12}>
                <FormItem label="下次提醒" {...form2Item}>
                  {getFieldDecorator('warnDatetime')(<DatePicker placeholder="选择下次提醒时间" disabledDate={disabledDate} format="YYYY-MM-DD HH:mm" showTime={{ format: 'HH:mm' }}/>)}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <FormItem label="微盟账号" {...form2Item}>{weimobAccount}</FormItem>
              </Col>
              <Col span={12}>
                <FormItem label="店铺名称" {...form2Item}>{shopName}</FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={8}>
                <FormItem label="客户品牌度" {...form3Item}>
                  {getFieldDecorator('brandClass', { initialValue: brandClass })(<Stars writable={true}/>)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label="客户运营效果" {...form3Item}>
                  {getFieldDecorator('operationClass', { initialValue: operationClass })(<Stars writable={true}/>)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label="客户活跃度" {...form3Item}>
                  {getFieldDecorator('livenessClass', { initialValue: livenessClass })(<Stars writable={true}/>)}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={8}>
                <FormItem label="续费意向度" {...form3Item}>
                  {getFieldDecorator('renewClass', { initialValue: renewClass })(<Stars writable={true}/>)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label="业界影响度" {...form3Item}>
                  {getFieldDecorator('influenceClass', { initialValue: influenceClass })(<Stars writable={true}/>)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label="产品满意度" {...form3Item}>
                  {getFieldDecorator('proSatisfactionClass', { initialValue: proSatisfactionClass })(<Stars writable={true}/>)}
                </FormItem>
              </Col>
            </Row>
            <Divider dashed={true}/>
            <Row>
              <Col span={8}>
                <FormItem label="本次联系电话" {...form3Item}>{mobile}</FormItem>
              </Col>
              <Col span={8}>
                <FormItem label="本次联系人" {...form3Item}>{linkName}</FormItem>
              </Col>
              <Col span={8}>
                <FormItem label="本次满意度" {...form3Item}>
                  {getFieldDecorator('serverClass', { initialValue: 0 })(<Stars writable={true}/>)}
                </FormItem>
              </Col>
            </Row>
            <FormItem label="联系主题" {...form1Item}>
              {getFieldDecorator('linkSubject', {
                rules: [{ required: true, message: '联系主题不能为空' }]
              })(<Input placeholder="请输入联系主题"/>)}
            </FormItem>
            <FormItem label="联系内容" {...form1Item}>
              {getFieldDecorator('linkContent', {
                rules: [{ required: true, message: '联系内容不能为空' }]
              })(<Input.TextArea placeholder="请输入联系内容" rows={3}/>)}
            </FormItem>
          </div>
        );
      }
    });
  };

  onMouseEnter = () => {
    clearTimeout(this.enterTimer);
    this.leaveTimer = setTimeout(() => {
      this.props.dispatch({
        type: 'callCenter/setState',
        payload: { hover: true }
      });
    }, 100);
  };

  onMouseLeave = () => {
    clearTimeout(this.leaveTimer);
    this.enterTimer = setTimeout(() => {
      this.props.dispatch({
        type: 'callCenter/setState',
        payload: { hover: false }
      });
    }, 200);
  };

  render() {
    const { onMouseEnter, onMouseLeave } = this;
    const { className } = this.props;
    const linkProps = {
      to: '/call-center',
      className,
      onMouseEnter,
      onMouseLeave,
    };
    return (
      <Fragment>
        <Link {...linkProps}>呼叫中心</Link>
        <Divider type="vertical"/>
      </Fragment>
    );
  }
}
