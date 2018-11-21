import React, {Component} from 'react';
import {Form, Input, Select, Modal, Row, Col} from 'antd';
import regExp from '../../utils/regexp';

const itemLayout = {
  labelCol: {span: 6},
  wrapperCol: {span: 14},
}
const {Option} = Select;

@Form.create()
export default class ContactModal extends Component {
  render() {
    const {
      form: {getFieldDecorator, validateFields, getFieldsValue}, onOK, item = {}, ...modalProps
    } = this.props;
    const handleOk = () => {
      validateFields((errors) => {
        if (errors) {
          return;
        }
        const data = {
          ...item,
          ...getFieldsValue(),
        }
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
            <Col md={{span: 12}} sm={24}>
              <Form.Item label="类型" {...itemLayout}>
                {getFieldDecorator('linkType', {
                  rules: [{required: true, message: '请选择联系人类型'}],
                  initialValue: item.linkType || undefined,
                })(
                  <Select placeholder="请选择联系人类型">
                    <Option value={1}>主决策人</Option>
                    <Option value={2}>其他</Option>
                  </Select>
                )}
              </Form.Item>
            </Col>
            <Col md={{span: 12}} sm={24}>
              <Form.Item label="职务" {...itemLayout}>
                {getFieldDecorator('position', {
                  initialValue: item.position,
                })(
                  <Input/>
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col md={{span: 12}} sm={24}>
              <Form.Item label="姓名" {...itemLayout}>
                {getFieldDecorator('linkName', {
                  rules: [{required: true, message: '请输入姓名'}],
                  initialValue: item.linkName,
                })(
                  <Input/>
                )}
              </Form.Item>
            </Col>
            <Col md={{span: 12}} sm={24}>
              <Form.Item label="部门" {...itemLayout}>
                {getFieldDecorator('department', {
                  initialValue: item.department,
                })(
                  <Input/>
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col md={{span: 12}} sm={24}>
              <Form.Item label="性别" {...itemLayout}>
                {getFieldDecorator('sex', {
                  initialValue: item.sex || undefined,
                })(
                  <Select placeholder="请选择性别">
                    <Option value={1}>男</Option>
                    <Option value={2}>女</Option>
                  </Select>
                )}
              </Form.Item>
            </Col>
            <Col md={{span: 12}} sm={24}>
              <Form.Item label="qq" {...itemLayout}>
                {getFieldDecorator('qq', {
                  initialValue: item.qq,
                  rules: [{ message: '正确格式的QQ', pattern: regExp.REG_QQ}],
                })(
                  <Input/>
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col md={{span: 12}} sm={24}>
              <Form.Item label="手机" {...itemLayout}>
                {getFieldDecorator('mobile', {
                  rules: [{required: true, message: '请输入正确的手机号'}],
                  initialValue: item.mobile
                })(
                  <Input/>
                )}
              </Form.Item>
            </Col>
            <Col md={{span: 12}} sm={24}>
              <Form.Item label="邮箱" {...itemLayout}>
                {getFieldDecorator('email', {
                  rules: [{ message: '邮箱格式不正确', pattern: regExp.REG_EMAIL}],
                  initialValue: item.email,
                })(
                  <Input/>
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col md={{span: 12}} sm={24}>
              <Form.Item label="电话" {...itemLayout}>
                {getFieldDecorator('phone', {
                  initialValue: item.phone,
                })(
                  <Input/>
                )}
              </Form.Item>
            </Col>
            <Col md={{span: 12}} sm={24}>
              <Form.Item label="微信" {...itemLayout}>
                {getFieldDecorator('wechat', {
                  initialValue: item.wechat,
                })(
                  <Input/>
                )}
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>)
  }
}
