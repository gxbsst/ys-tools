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
    fetchingOptions: state.loading.effects['saleRetail/querySelectOptions'],
    id: state.saleRetail.id,
    submitting: state.loading.effects['saleRetail/addFollowRecord'],
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
        type: 'saleRetail/querySelectOptions',
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
        }, id, submitting, dispatch, fetchingOptions, ...modalProps
    } = this.props;
    const { followRecordsContacts } = this.state;
    const handleOk = () => {
      validateFields((errors, fieldsValue) => {
        if (errors) {
          return;
        }
        const data = {
          id,
          ...fieldsValue,
        };
        dispatch({
          type: 'saleRetail/addContactRecord',
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
    getFieldDecorator('linkName');
    return (
      <Modal {...modalOpts} title="新增联系记录">
        <Form layout="horizontal">
          <Row gutter={16}>
            <Col>
              <Form.Item label="联系人" {...itemLayout}>
                {getFieldDecorator('linkNameId', {
                  rules: [
                    { required: true, message: '请选择联系人' },
                  ],
                })(
                  <Select
                    placeholder="请选择"
                    onChange={val => setFieldsValue({
                      linkName: (val = followRecordsContacts.find(_ => _.id == val)) && val.linkName
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
            <Col>
              <Form.Item label="联系方式" {...itemLayout}>
                {getFieldDecorator('linkMethod', {
                })(
                  <Select>
                    <Option value="电话">电话</Option>
                    <Option value="QQ">QQ</Option>
                    <Option value="微信">微信</Option>
                    <Option value="邮件">邮件</Option>
                    <Option value="其他">其他</Option>
                  </Select>
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col>
              <Form.Item label="联系类型" {...itemLayout}>
                {getFieldDecorator('linkType', {
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
              <Form.Item label="联系结果" {...itemLayout}>
                {getFieldDecorator('linkResult', {
                })(
                  <Select>
                    <Option value="无购买意愿">无购买意愿</Option>
                    <Option value="感兴趣">感兴趣</Option>
                    <Option value="购买意愿强烈">购买意愿强烈</Option>
                  </Select>
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col>
              <Form.Item label="备注" {...itemLayout}>
                {getFieldDecorator('remark', {
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
