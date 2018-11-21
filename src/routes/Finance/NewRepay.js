import React, { PureComponent } from 'react';
import {
  Form,
  Input,
  DatePicker,
  Select,
  Row,
  Col,
  Modal,
  InputNumber
} from 'antd';
import { connect } from 'dva';
import moment from 'moment';

const FormItem = Form.Item,
  {Option} = Select,
  { TextArea } = Input;

const formItemLayout = {
  labelCol: {
    span: 8
  },
  wrapperCol: {
    span: 16
  }
};

@connect(state => ({
  repay: state.repay
}))
@Form.create()
class NewRepay extends PureComponent {
  state = {
    openBankList: [
      {
        label: '微盟银行3536',
        value: 1
      },
      {
        label: '盟耀银行0147',
        value: 2
      }
    ]
  };

  componentWillReceiveProps(nextProps) {
    if (
      'repay' in nextProps &&
      nextProps.repay.isModalClose &&
      this.props.repay.isModalClose !== nextProps.repay.isModalClose
    ) {
      if (nextProps.repay.isModalClose) {
        this.props.handleNewPayCancel();
      }
    }
  }

  handleChange = value => {
    //入账类型改变时，将入账账户选择框的值置为空
    this.props.form.setFieldsValue({
      openBank: ''
    });
    switch (value) {
      case 1:
      case 2:
      case 3:
      case 4:
        this.setState({
          openBankList: [
            {
              label: '微盟银行3536',
              value: 1
            },
            {
              label: '盟耀银行0147',
              value: 2
            }
          ]
        });
        break;
      case 5:
        this.setState({
          openBankList: [
            {
              label: '微盟支付宝weimob_wm01@126.com',
              value: 3
            },
            {
              label: '盟耀支付宝weimob_my@163.com',
              value: 4
            }
          ]
        });
        break;
      case 6:
        this.setState({
          openBankList: [
            {
              label: '微盟现金',
              value: 5
            },
            {
              label: '盟耀现金',
              value: 6
            }
          ]
        });
        break;
      default:
        this.setState({
          openBankList: [
            {
              label: '微盟银行3536',
              value: 1
            },
            {
              label: '盟耀银行0147',
              value: 2
            }
          ]
        });
    }
  };

  handleNewPayOk = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { dispatch } = this.props;
        const params = {
          ...values,
          recordedDate: values.recordedDate.format('YYYY-MM-DD 00:00:00')
        };
        dispatch({
          type: 'repay/addRepay',
          payload: params
        }).then(res => {
          if (!res.code) {
            this.props.handleNewPayCancel();
            this.props.reload();
          }
        });
      }
    });
  };

  handlePayAmount = (rule, value, callback) => {
    if (
      value &&
      value.toString().split('.').length > 1 &&
      value.toString().split('.')[1].length > 2
    ) {
      callback('入账金额不能超过2位小数！');
    } else if (
      (value &&
        value.toString().split('.').length > 1 &&
        value.toString().split('.')[0].length > 10) ||
      (value &&
        value.toString().split('.').length < 2 &&
        value.toString().length > 10)
    ) {
      callback('入账金额整数位不能超过10位！');
    } else if (value === 0) {
      callback('请输入大于0的入账金额！');
    }
    callback();
  };

  disabledDate = current => {
    return current > moment().endOf('day');
  };

  render() {
    const { openBankList } = this.state,
      { getFieldDecorator } = this.props.form,
      { repay: { confirmLoading } } = this.props;
    return (
      <Modal
        title="新建回款"
        visible={this.props.newPayModalVisible}
        onOk={this.handleNewPayOk}
        confirmLoading={confirmLoading}
        onCancel={this.props.handleNewPayCancel}
        destroyOnClose
        width="800px"
      >
        <Form layout="horizontal">
          <Row>
            <Col span={12}>
              <FormItem label="打款名称" {...formItemLayout}>
                {getFieldDecorator('payName', {
                  rules: [
                    {
                      required: true,
                      message: '请输入打款名称！'
                    },
                    {
                      max: 100,
                      message: '输入字符数不能超过100！'
                    }
                  ]
                })(<Input />)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label="入账日期" {...formItemLayout}>
                {getFieldDecorator('recordedDate', {
                  rules: [
                    {
                      required: true,
                      message: '请选择入账日期！'
                    }
                  ]
                })(
                  <DatePicker
                    style={{ width: '250px' }}
                    disabledDate={this.disabledDate}
                  />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <FormItem label="入账类型" {...formItemLayout}>
                {getFieldDecorator('recordedType', {
                  rules: [
                    {
                      required: true,
                      message: '请选择入账类型！'
                    }
                  ],
                  initialValue: 1
                })(
                  <Select
                    style={{ width: '250px' }}
                    onChange={this.handleChange}
                  >
                    <Option value={1}>银行转账</Option>
                    <Option value={2}>支票</Option>
                    <Option value={3}>pos机</Option>
                    <Option value={4}>承兑汇票</Option>
                    <Option value={5}>支付宝</Option>
                    <Option value={6}>现金</Option>
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label="入账账户" {...formItemLayout}>
                {getFieldDecorator('openBank', {
                  rules: [
                    {
                      required: true,
                      message: '请选择入账账户！'
                    }
                  ]
                })(
                  <Select style={{ width: '250px' }}>
                    {openBankList.map((oneOption) => {
                      return (
                        <Option key={oneOption.value} value={oneOption.value}>
                          {oneOption.label}
                        </Option>
                      );
                    })}
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <FormItem label="入账金额" {...formItemLayout}>
                {getFieldDecorator('payAmount', {
                  rules: [
                    {
                      required: true,
                      message: '请输入入账金额！'
                    },
                    {
                      validator: this.handlePayAmount
                    }
                  ]
                })(
                  <InputNumber
                    min={0}
                    style={{ width: '250px' }}
                    placeholder="人民币金额"
                  />
                )}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label="入账凭证" {...formItemLayout}>
                {getFieldDecorator('payVoucher')(<Input />)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <FormItem
                label="回款备注"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 20 }}
              >
                {getFieldDecorator('remark')(<TextArea rows={2} />)}
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  }
}

const WrappedNewRepayForm = Form.create()(NewRepay);

export default WrappedNewRepayForm;
