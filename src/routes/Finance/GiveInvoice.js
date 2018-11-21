import React, { PureComponent } from 'react';
import { Form, DatePicker, Row, Col, Input, Modal, InputNumber } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import { getInvoiceType } from '../../utils/helpers';

const FormItem = Form.Item;

const formItemLayout = {
  labelCol: {
    span: 8
  },
  wrapperCol: {
    span: 16
  }
};

@connect(state => ({
  invoice: state.invoice,
  user: state.user.currentUser
}))
@Form.create()
class GiveInvoice extends PureComponent {
  componentWillReceiveProps(nextProps) {
    if (
      'invoice' in nextProps &&
      nextProps.invoice.isModalClose &&
      this.props.invoice.isModalClose !== nextProps.invoice.isModalClose
    ) {
      if (nextProps.invoice.isModalClose) {
        this.props.handleGiveInvoiceCancel();
      }
    }
  }

  handleGiveInvoiceOk = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { dispatch, giveInvoiceId } = this.props;
        const params = {
          ...values,
          makeDate: values.makeDate.format('YYYY-MM-DD 00:00:00'),
          id: giveInvoiceId
        };
        dispatch({
          type: 'invoice/giveInvoice',
          payload: params
        }).then(res => {
          if (!res.code) {
            this.props.handleGiveInvoiceCancel();
            this.props.reload();
          }
        });
      }
    });
  };

  disabledDate = current => {
    return current > moment().endOf('day');
  };

  render() {
    const { getFieldDecorator } = this.props.form,
      { invoice: { confirmLoading }, user } = this.props,
      { giveInvoiceModalVisible, invoiceType } = this.props;
    return (
      <Modal
        title="开发票"
        visible={giveInvoiceModalVisible}
        onOk={this.handleGiveInvoiceOk}
        confirmLoading={confirmLoading}
        onCancel={this.props.handleGiveInvoiceCancel}
        destroyOnClose
      >
        <Form layout="horizontal">
          <Row>
            <Col span={12}>
              <FormItem label="开票类型" {...formItemLayout}>
                {getInvoiceType(invoiceType)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <FormItem label="开票人员" {...formItemLayout}>
                {user.givenName}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <FormItem label="开票日期" {...formItemLayout}>
                {getFieldDecorator('makeDate', {
                  rules: [
                    {
                      required: true,
                      message: '请选择开票日期！'
                    }
                  ]
                })(
                  <DatePicker
                    format="YYYY-MM-DD"
                    style={{ width: '240px' }}
                    disabledDate={this.disabledDate}
                  />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <FormItem label="发票编号" {...formItemLayout}>
                {getFieldDecorator('invoiceNo', {
                  rules: [
                    {
                      required: true,
                      message: '请填写发票编号！'
                    },
                    {
                      max: 30,
                      message: '输入字符数不能超过30！'
                    }
                  ]
                })(<Input style={{ width: '240px' }} />)}
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  }
}

const WrappedGiveInvoiceForm = Form.create()(GiveInvoice);

export default WrappedGiveInvoiceForm;
