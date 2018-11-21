import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Input, Select, Modal, Row, Col, Spin } from 'antd';

const { TextArea } = Input;
const itemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};
const { Option } = Select;

@Form.create()
@connect(state => ({
  fetchingOptions: state.loading.effects['saleRetail/querySelectOptions'],
  submitting: state.loading.effects['saleRetail/rejectChance'],
}))
export default class RejectRequestModal extends Component {
  state = {
    rejectReason: [],
  }
  getSelectOptions(type) {
    if (this.state[type].length === 0) { // 选项为空
      this.props.dispatch({
        type: 'saleRetail/querySelectOptions',
        payload: { type },
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
    const { fetchingOptions } = this.props;
    const { rejectReason } = this.state;
    const {
      form:
        {
          getFieldDecorator, validateFields,
        }, id, submitting, dispatch, ...modalProps
    } = this.props;

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
          type: 'saleRetail/rejectChance',
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
    return (
      <Modal {...modalOpts} title="机会驳回申请">
        <Form layout="horizontal">
          <Row gutter={16}>
            <Col>
              <Form.Item label="驳回理由" {...itemLayout}>
                {getFieldDecorator('rejectReason', {
                  rules: [
                    { required: true, message: '请选择驳回理由' },
                  ],
                })(
                  <Select
                    placeholder="请选择"
                    onFocus={this.getSelectOptions.bind(this, 'rejectReason')}
                    notFoundContent={fetchingOptions ? <Spin size="small" /> : null}
                  >
                    {rejectReason.map(
                      cur => <Option value={cur.value} key={cur.value}>{cur.label}</Option>
                    )}
                  </Select>
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col>
              <Form.Item label="备注" {...itemLayout}>
                {getFieldDecorator('rejectRemark', {
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
