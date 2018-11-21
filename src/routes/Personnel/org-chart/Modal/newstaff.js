import React, {PureComponent} from "react";
import moment from 'moment';
import style from '../index.less'
import common from '../../common/index.less'
import styles from '../../personnel-info/check/index.less'
import AutoComplete from '../../../../components/AutoComplete'
import {
  Form,
  Input,
  Radio,
  Select,
  DatePicker,
  Modal,
  Breadcrumb,
  message
} from 'antd';

const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const format = "YYYY-MM-DD";
const formItemLayout = {
  labelCol: {
    span: 8
  },
  wrapperCol: {
    span: 16
  }
};
@Form.create()
export default class Newstaff extends React.Component {
  constructor(props) {
    super(props);
  }

  state = {
    autoCompleteResult: [],
    startValue: null,
    endValue: null,
    endOpen: false,
    email: '',
  };
  // 时间插件
  disabledStartDate = (startValue) => {
    const endValue = this.state.endValue;
    if (!startValue || !endValue) {
      return false;
    }
    return startValue.valueOf() > endValue.valueOf();
  };

  disabledEndDate = (endValue) => {
    const startValue = this.state.startValue;
    if (!endValue || !startValue) {
      return false;
    }
    return endValue.valueOf() <= startValue.valueOf();
  };

  onChange = (field, value) => {
    this.setState({
      [field]: value,
    });
  };

  onStartChange = (value) => {
    this.onChange('startValue', value);
  };

  onEndChange = (value) => {
    this.onChange('endValue', value);
  };

  handleStartOpenChange = (open) => {
    if (!open) {
      this.setState({endOpen: true});
    }
  };

  handleEndOpenChange = (open) => {
    this.setState({endOpen: open});
  };
  onEmailChange = (e) => {
    const {staffAllList} = this.props;
    const email = e.target.value;
    setTimeout(() => {
      if (!staffAllList.includes(email)) {
        this.setState({
          email
        })
      } else {
        message.info('该邮箱已存在');
      }
    }, 0);
  };

  render() {
    const {visible, onCancel, onCreate, form, selectedTissue} = this.props;
    const {getFieldDecorator, validateFields} = form;
    const {autoCompleteResult} = this.state;
    const email = this.state.email;
    const loginName = email.substring(0, email.indexOf('@'));
    const AutoCompleteProps = {
      dataSource: '/api/personnel/employee/think',
      valuePropName: 'id',
      keywordPropName: 'name',
      labelRender: record => `${record.name} (${record.username})`
    }
    return (
      <Modal
        title="新建员工"
        style={{width: '80%'}}
        className={style.addstaffModel}
        visible={visible}
        okText="确定"
        onCancel={onCancel}
        onOk={onCreate}
      >
        <div>
          <Form layout='inline'>
            <div className={styles.item}>
              <FormItem  {...formItemLayout} label='邮箱'>
                {
                  getFieldDecorator('email', {
                    rules: [{required: true, message: '请输入邮箱', type: 'email'}],
                  })(
                    <Input onChange={this.onEmailChange}/>
                  )
                }
              </FormItem>
              <FormItem {...formItemLayout} label='登录名'>
                {
                  getFieldDecorator('username', {
                    rules: [{required: true, message: '请输入登陆名'}],
                    initialValue: loginName
                  })(
                    <Input disabled={true}/>
                  )
                }
              </FormItem>
            </div>
            <div className={styles.item}>
              <FormItem {...formItemLayout} label='姓名'>
                {
                  getFieldDecorator('name', {
                    rules: [{required: true, message: '请输入姓名'}],
                  })(
                    <Input/>
                  )
                }
              </FormItem>
              <FormItem {...formItemLayout} label='手机号'>
                {
                  getFieldDecorator('mobile', {
                    rules: [{required: true, message: '请输入手机号'}],
                  })(
                    <Input/>
                  )
                }
              </FormItem>
            </div>
            <div className={styles.item}>
              <FormItem  {...formItemLayout} label='职位名称'>
                {
                  getFieldDecorator('position', {
                    rules: [{required: true, message: '请输入职位名称'}],
                  })(
                    <Input/>
                  )
                }
              </FormItem>
              <FormItem {...formItemLayout} label='在职状态'>
                {
                  getFieldDecorator('isOnJob', {
                    rules: [{required: true, message: '在职状态'}],
                    initialValue: true
                  })(
                    <Select>
                      <Option value={true}>在职</Option>
                      <Option value={false}>离职</Option>
                    </Select>
                  )
                }
              </FormItem>
            </div>
            <div className={styles.item}>
              <FormItem {...formItemLayout} label='入职时间'>
                {
                  getFieldDecorator('joinTime', {
                    rules: [{required: true, message: '请选择您的入职时间'}],
                  })(
                    <DatePicker
                      disabledDate={this.disabledStartDate}
                      showTime
                      style={{width: '100%'}}
                      format={format}
                      placeholder="入职时间"
                      onChange={this.onStartChange}
                      onOpenChange={this.handleStartOpenChange}
                    />
                  )
                }
              </FormItem>
              <FormItem {...formItemLayout} label='离职时间'>
                {
                  getFieldDecorator('leftTime', {})(
                    <DatePicker
                      disabledDate={this.disabledEndDate}
                      showTime
                      style={{width: '100%'}}
                      format={format}
                      placeholder="离职时间"
                      onChange={this.onEndChange}
                      open={this.state.endOpen}
                      onOpenChange={this.handleEndOpenChange}
                    />
                  )
                }
              </FormItem>
            </div>
            {/*组织架构*/}
            <div className={styles.item} style={{width: '80%'}}>
            <span className={common.columnsTwo + ' ' + common.left + ' ' + common.right + ' ' + common.important}
                  style={{width: '19%'}}>所选组织：</span>
              <span>{selectedTissue}</span>
            </div>
            <div className={styles.item}>
              <FormItem {...formItemLayout} label='组织负责人'>
                {
                  getFieldDecorator('isLeader', {
                    rules: [{required: true, message: '请确认是否是组织负责人'}],
                    initialValue: false
                  })(
                    <RadioGroup>
                      <Radio value={true}>是</Radio>
                      <Radio value={false}>否</Radio>
                    </RadioGroup>
                  )
                }
              </FormItem>
            </div>
            <div className={styles.item}>
              <FormItem {...formItemLayout} label='直接上级'>
                {
                  getFieldDecorator('leaderId', {
                    trigger: 'onSelect',
                    getValueFromEvent: record => record.id,
                  })(
                    <AutoComplete placeholder="请输入直接上级" {...AutoCompleteProps}/>
                  )
                }
              </FormItem>
            </div>
            <div className={styles.item}>
              <FormItem {...formItemLayout} label='担保额度'>
                {
                  getFieldDecorator('guaranteeAmount', {
                    rules: [{message: '担保额度'}],
                  })(
                    <Input/>
                  )
                }
              </FormItem>
            </div>
            <div>
            </div>
          </Form>
        </div>
      </Modal>
    );
  }
}

