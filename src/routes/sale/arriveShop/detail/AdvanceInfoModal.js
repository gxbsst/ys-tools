import React, { Component } from 'react';
import { Form, Input, Select, Modal, Row, Col, Spin } from 'antd';
import { connect } from 'dva';

const { TextArea } = Input;
const itemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};
const { Option } = Select;

@connect(state => (
  {
    fetchingOptions: state.loading.effects['arriveShop/querySelectOptions'],
    id: state.arriveShop.id,
    submitting: state.loading.effects['arriveShop/addFollowRecord'],
  }
))
@Form.create()
export default class RelationRecordsModal extends Component {
  state = {
    followRecordsContacts: [],
  }
  getSelectOptions(type) {
    if (this.state[type].length === 0) { // 选项为空
      this.props.dispatch({
        type: 'arriveShop/querySelectOptions',
        payload: { type, id: this.props.id },
      }).then((val) => {
        if (val) {
          this.setState({
            [type]: val,
          });
        }
      });
    }
  }

  render() {
    const {
      form:
        {
          getFieldDecorator, validateFields, setFieldsValue,
        }, id, submitting, dispatch, fetchingOptions, item, ...modalProps
    } = this.props;
    if (!item) {
      return null;
    }
    const { followType, linkSubject, linkContent, linkCustomerId, linkCustomer } = item;
    const { followRecordsContacts } = this.state;
    const handleOk = () => {
      validateFields((errors, fieldsValue) => {
        if (errors) {
          return;
        }
        const data = {
          ...item,
          ...fieldsValue,
          chanceId: id,
        };
        dispatch({
          type: 'arriveShop/addFollowRecord', // 新建跟进记录
          payload: { ...data },
        }).then((val) => {
          if (val) {
            this.props.onOk();
          }
        });
      });
    };

    const modalOpts = {
      ...modalProps,
      onOk: handleOk,
      maskClosable: false,
      confirmLoading: submitting,
    };
    getFieldDecorator('linkCustomer', {
      initialValue: linkCustomer,
    });
    return (
      <Modal {...modalOpts} title="新建跟进信息">
        <Form layout="horizontal">
          <Row gutter={16}>
            <Col>
              <Form.Item label="联系人" {...itemLayout}>
                {getFieldDecorator('linkCustomerId', {
                  initialValue: linkCustomerId,
                  rules: [
                    { required: true, message: '请选择联系人' },
                  ],
                })(
                  <Select
                    placeholder="请选择"
                    onChange={val => setFieldsValue({
                      linkCustomer: (val = followRecordsContacts.find(_ => _.id == val)) && val.linkName
                    })}
                    onFocus={this.getSelectOptions.bind(this, 'followRecordsContacts')}
                    notFoundContent={fetchingOptions ? <Spin size="small" /> : null}
                  >
                    {followRecordsContacts.map(_ => (
                      <Option value={_.id} key={_.id}>{_.linkName}</Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col>
              <Form.Item label="联系类型" {...itemLayout}>
                {getFieldDecorator('followType', {
                  initialValue: followType,
                  rules: [
                    { required: true, message: '请选择联系类型' },
                  ],
                })(
                  <Select>
                    <Option value="初次联系">初次联系</Option>
                    <Option value="关怀访问">关怀访问</Option>
                    <Option value="问题解答">问题解答</Option>
                  </Select>
                )}
              </Form.Item>
            </Col>
            <Col>
              <Form.Item label="联系主题" {...itemLayout}>
                {getFieldDecorator('linkSubject', {
                  initialValue: linkSubject,
                  rules: [
                    { required: true, message: '请填写联系主题' },
                  ],
                })(
                  <Input />
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col>
              <Form.Item label="联系内容" {...itemLayout}>
                {getFieldDecorator('linkContent', {
                  initialValue: linkContent,
                  rules: [
                    { required: true, message: '请填写联系内容' },
                  ],
                })(
                  <TextArea />
                )}
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  }
}
