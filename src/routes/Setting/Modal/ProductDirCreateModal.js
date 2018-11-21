import React, { PureComponent } from 'react';
import { Modal, Form, Input, Row, Col } from 'antd';

const { TextArea } = Input;
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16},
};

@Form.create()
export default class ProductDirCreateModal extends PureComponent {
  render() {
    const {
      form: {
        getFieldDecorator, validateFields,
      }, onOk, selectedPath, ...receiveProps } = this.props;

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
      destroyOnClose: true,
    }

    return (
      <Modal {...selfProps}>
      <Form layout="horizontal">
        <FormItem {...formItemLayout} label="产品路径">
            <span>{selectedPath}</span>
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="产品目录"
        >
          {getFieldDecorator('name', {
            rules: [{required: true, message: '请输入产品目录!'}],
          })(
            <Input />
          )}
        </FormItem>
      </Form>
      </Modal>
    )
  }
}
