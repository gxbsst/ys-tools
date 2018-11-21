/* eslint-disable max-len */
import React, { Component } from 'react';
import { Form, Input, Modal, Row, Col, Card, Select } from 'antd';
import ContactsForm from './ContactsForm';
import { Region } from '../../../../components/Cascader';

const { TextArea } = Input;
const { Option } = Select;
const itemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

@Form.create()
export default class ChainStoreModal extends Component {
  render() {
    const { form: { getFieldDecorator, validateFields, getFieldsValue, setFieldsValue }, onOK, item = {}, ...modalProps } = this.props;
    const handleOk = () => {
      validateFields((errors) => {
        if (errors) {
          return;
        }
        const data = {
          ...item,
          ...getFieldsValue(),
          fromSourceType: 2,
        };
        onOK(data);
      });
    };

    const modalOpts = {
      ...modalProps,
      onOk: handleOk,
      maskClosable: false,
    };
    getFieldDecorator('area', {
      initialValue: item.area,
    })
    return (
      <Modal {...modalOpts}>
        <Form layout="horizontal">
          <Row gutter={16}>
            <Col>
              <Form.Item label="门店名" {...itemLayout}>
                {getFieldDecorator('storeName', {
                  initialValue: item.storeName,
                })(
                  <Input />
                )}
              </Form.Item>
            </Col>
            <Col>
              <Form.Item label="经营状态" {...itemLayout}>
                {getFieldDecorator('status', {
                  initialValue: item.status,
                })(
                  <Input placeholder="请输入经营状态"/>
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
                  <Region
                    style={{ width: '100%' }}
                    onChange={(val, selectedOption) => setFieldsValue({ area: selectedOption && selectedOption.mergerName })}
                  />
                )}
              </Form.Item>
            </Col>
            <Col>
              <Form.Item label="备注" {...itemLayout}>
                {getFieldDecorator('remark', {
                  initialValue: item.remark,
                })(
                  <TextArea />
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
                  <Input />
                )}
              </Form.Item>
            </Col>
          </Row>
          <Card title="联系人信息" bordered={false}>
            <Form.Item>
              {getFieldDecorator('contacts', {
                initialValue: item.contacts,
                rules: [
                  {
                    validator: (r, v, c) => {
                      if (v.length < 1) {
                        c('至少有一条联系人记录!');
                      }
                      c();
                    },
                  }
                ]
              })(<ContactsForm extraTableProps={{ size: 'small' }} />)}
            </Form.Item>
          </Card>
        </Form>
      </Modal>);
  }
}
