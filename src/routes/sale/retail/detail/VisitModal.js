import React, { Component } from 'react';
import { Form, Input, Select, Modal, Row, Col, DatePicker, Spin } from 'antd';
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
    submitting: state.loading.effects['saleRetail/addVisitRecord'],
  }
))
@Form.create()
export default class VisitModal extends Component {
  state = {
    followRecordsContacts: [],
  };
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
          getFieldDecorator, validateFields, getFieldsValue,
        }, id, submitting, dispatch, fetchingOptions, ...modalProps
    } = this.props;
    const { followRecordsContacts } = this.state;
    const handleOk = () => {
      validateFields((errors, fieldsValue) => {
        if (errors) {
          return;
        }
        const { visitTime, visitName } = fieldsValue;
        const data = {
          id,
          chanceType: 'OS',
          ...fieldsValue,
          visitTime: visitTime.format('YYYY-MM-DD'),
          visitName: (visitName && visitName.split('-')[1]) || '',
        };
        dispatch({
          type: 'saleRetail/addVisitRecord',
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
      <Modal {...modalOpts} title="新增拜访记录">
        <Form layout="horizontal">
          <Row gutter={16}>
            <Col>
              <Form.Item label="拜访时间" {...itemLayout}>
                {getFieldDecorator('visitTime', {
                  rules: [{ required: true, message: '请输入拜访时间'}],
                })(
                  <DatePicker />
                )}
              </Form.Item>
            </Col>
            <Col>
              <Form.Item label="拜访地点" {...itemLayout}>
                {getFieldDecorator('visitAddress', {
                  rules: [{ required: true, message: '请输入'} ],
                })(
                  <Input />
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col>
              <Form.Item label="拜访人" {...itemLayout}>
                {getFieldDecorator('visitName', {
                  rules: [{ required: true, message: '请选择拜访人'} ],
                })(
                  <Select
                    placeholder="请选择"
                    onFocus={this.getSelectOptions.bind(this, 'followRecordsContacts')}
                    notFoundContent={fetchingOptions ? <Spin size="small" /> : null}
                  >
                    {followRecordsContacts.map(_ => (
                      <Option value={`${_.id}-${_.linkName}`} key={_.id}>{_.linkName}</Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            </Col>
            <Col>
              <Form.Item label="拜访结果" {...itemLayout}>
                {getFieldDecorator('visitResult', {
                  rules: [{ required: true, message: '请输入'} ],
                })(
                  <Input />
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
