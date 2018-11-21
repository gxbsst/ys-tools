/* eslint-disable max-len */
import React, { Component } from 'react';
import { Form, Input, Modal, Row, Col, Card, Select } from 'antd';
import { Region } from '../../components/Cascader';
import ContactsForm from './ContactsForm';

const { TextArea } = Input;
const { Option } = Select;
const itemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

@Form.create()
export default class ChainStoreModal extends Component {
  state = {
    area: '',
    changed: false,
  }
  changeArea = (areaCode, area) => {
    this.setState({
      changed: true,
      area: area && area.mergerName,
    })
  }
  render() {
    const { form: { getFieldDecorator, validateFields, getFieldsValue }, onOK, item = {}, ...modalProps } = this.props;

    const handleOk = () => {
      validateFields((errors) => {
        if (errors) {
          return;
        }
        const data = {
          ...item,
          ...getFieldsValue(),
          area: this.state.changed ? this.state.area : item.area,
        };
        console.log('data', data);
        onOK(data);
      });
    };

    const modalOpts = {
      ...modalProps,
      onOk: handleOk,
      maskClosable: false,
    };

    return (
      <Modal {...modalOpts}>
        <Form layout="horizontal">
          <Row gutter={16}>
            <Col>
              <Form.Item label="门店名" {...itemLayout}>
                {getFieldDecorator('storeName', {
                  initialValue: item.storeName,
                })(
                  <Input/>
                )}
              </Form.Item>
            </Col>
            <Col>
              <Form.Item label="经营状态" {...itemLayout}>
                {getFieldDecorator('status', {
                  initialValue: item.status,
                })(
                  <Input/>
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col>
              <Form.Item label="地区" {...itemLayout}>
                {getFieldDecorator('areaCode', {
                  initialValue: item.areaCode,
                })(
                  <Region onChange={this.changeArea} style={{ width: '100%' }}/>
                )}
              </Form.Item>
            </Col>
            <Col>
              <Form.Item label="备注" {...itemLayout}>
                {getFieldDecorator('remark', {
                  initialValue: item.remark,
                })(
                  <TextArea/>
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col>
              <Form.Item label="地址" {...itemLayout}>
                {getFieldDecorator('address', {
                  initialValue: item.address,
                })(
                  <Input/>
                )}
              </Form.Item>
            </Col>
          </Row>
          <Card title="联系人信息" bordered={false}>
            <Form.Item>
              {getFieldDecorator('contacts', {
                initialValue: item.contacts || [],
                rules: [{ required: true, message: '请添加联系方式' }],
              })(<ContactsForm extraTableProps={{ size: 'small' }}/>)}
            </Form.Item>
          </Card>
        </Form>
      </Modal>);
  }
}
