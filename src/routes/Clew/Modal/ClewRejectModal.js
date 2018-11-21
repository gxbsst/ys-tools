import React, { PureComponent } from 'react';
import { Modal, Form, Input, Select, Row, Col } from 'antd';

const { TextArea } = Input;
const itemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};
const { Option } = Select;


@Form.create()
export default class ClewAbandonModal extends PureComponent {
  render() {
    const {
      form: {
        getFieldDecorator, validateFields,
      }, onOk, ...receiveProps } = this.props;

    const handleOk = () => {
      validateFields((err, values) => {
        if (!err) {
          onOk(values);
        }
      });
    };
    const selfProps = {
      ...receiveProps,
      onOk: handleOk,
    }
    return (
      <Modal title="线索驳回" {...selfProps} >
        <Form layout="horizontal">
          {/*<Row gutter={16}>
            <Col>
              <Form.Item label="废弃理由" {...itemLayout}>
                {getFieldDecorator('discardReason')(
                  <Select placeholder="请选择废弃理由">
                    <Option value="1" key="1">理由1</Option>
                    <Option value="2" key="2">理由2</Option>
                    <Option value="3" key="3">理由3</Option>
                  </Select>
                )}
              </Form.Item>
            </Col>
          </Row>*/}
          <Row gutter={16}>
            <Col>
              <Form.Item label="驳回理由" {...itemLayout}>
                {getFieldDecorator('remark')(
                  <TextArea />
                )}
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    )
  }
}
