import React, {Component} from 'react';
import {Form, Input, Select, Modal, Row, Col, DatePicker} from 'antd';
import PriceInput from '../../../components/PriceInput/';

const itemLayout = {
  labelCol: {span: 6},
  wrapperCol: {span: 14},
}
const {Option} = Select;
const {TextArea} = Input;

@Form.create()
export default class PayedWayModal extends Component {
  render() {
    const {
      form: {getFieldDecorator, validateFields, getFieldValue, resetFields}, onOK, item = {}, amount, ...modalProps
    } = this.props;
    const handleOk = () => {
      validateFields((errors, fieldsValue) => {
        if (errors) {
          return;
        }
        const payTime = fieldsValue.payTime.format('YYYY-MM-DD');
        const amount = fieldsValue.amount.number;
        const payScale = parseFloat(fieldsValue.payScale);
        const data = {
          ...item,
          ...fieldsValue,
          payTime,
          amount,
          payScale,
        };
        onOK(data);
      });
    }

    const modalOpts = {
      ...modalProps,
      onOk: handleOk,
      maskClosable: false,
    }

    return (
      <Modal
        {...modalOpts}
      >
        <Form layout="horizontal">
          <Row gutter={16}>
            <Col>
              <Form.Item label="付款条件" {...itemLayout}>
                {getFieldDecorator('payCondition', {
                  rules: [{required: true, message: '请选择条件'}],
                })(
                  <Select
                    placeholder="请选择条件"
                    onChange={() => resetFields(['amount'])}
                  >
                    <Option value="full">全额</Option>
                    <Option value="part">分期</Option>
                  </Select>
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col>
              <Form.Item label="付款金额" {...itemLayout}>
                {getFieldDecorator('amount', {
                  rules: [{
                    validator: (r, v, c) => {
                      if (!/^[+]{0,1}(\d+)$|^[+]{0,1}(\d+\.\d{1,2})$/.test(v.number)) {
                        c('请输入正确的付款金额!');
                      }
                      c();
                    },

                  }],
                  initialValue: getFieldValue('payCondition') === 'full' ? {number: amount} : {number: 0},
                })(
                  <PriceInput
                    disabled={getFieldValue('payCondition') === 'full'}
                  />
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col>
              <Form.Item label="付款占比" {...itemLayout}>
                {getFieldDecorator('payScale', {
                  initialValue: amount === 0 ? 1 : (( Number(getFieldValue('amount').number || 0) / amount)).toFixed(2),
                })(
                  <span>{amount === 0 ? '100%' : `${((Number(getFieldValue('amount').number || 0) / amount) * 100).toFixed(2)} %`}</span>
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col>
              <Form.Item label="付款时间" {...itemLayout}>
                {getFieldDecorator('payTime', {
                  rules: [{required: true, message: '请选择付款时间'}],
                })(
                  <DatePicker style={{width: '100%'}}/>
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col>
              <Form.Item label="备注" {...itemLayout}>
                {getFieldDecorator('remark', {})(
                  <TextArea/>
                )}
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>)
  }
}
