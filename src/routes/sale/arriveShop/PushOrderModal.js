import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Input, Select, Modal, Row, Col, Spin } from 'antd';
import Product from '../../../components/Product/';
import { getProductType } from '../../../utils/helpers';

const { TextArea } = Input;
const itemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 12 },
};
const { Option } = Select;

@connect(state => (
  {
    fetchingOptions: state.loading.effects['arriveShop/querySelectOptions'],
    submitting: state.loading.effects['arriveShop/pushOrderIntentionConfirm'],
    pushOrderModalInfo: state.arriveShop.pushOrderModalInfo,
    id: state.arriveShop.id,
  }
))
@Form.create()
export default class PushOrderModal extends Component {
  state = {
    levels: [],
  }
  getSelectOptions(type) {
    if (this.state[type].length === 0) { // 选项为空
      this.props.dispatch({
        type: 'arriveShop/querySelectOptions',
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
    const {
      form: {
        getFieldDecorator, validateFields, getFieldValue, setFieldsValue,
      }, fetchingOptions,
      pushOrderModalInfo,
      dispatch,
      submitting,
      ...modalProps
    } = this.props;
    const { levels } = this.state;
    if (!pushOrderModalInfo) {
      return null;
    }
    const handleOk = () => {
      validateFields((errors, fieldsValue) => {
        if (errors) {
          return;
        }
        const data = {
          ...pushOrderModalInfo,
          ...fieldsValue,
          chanceID: this.props.id,
        };
        dispatch({
          type: 'arriveShop/pushOrderIntentionConfirm',
          payload: {
            ...data,
          },
        }).then((val) => {
          if (val) {
            this.props.onCancel();
          }
        });
      });
    };
    const {
      customerLevel,
      productTypeId,
      intentionTime,
      productId,
      productName,
      remark,
      minPrice,
      maxPrice,
      productTypeName,
    } = pushOrderModalInfo;
    const modalOpts = {
      ...modalProps,
      onOk: handleOk,
      maskClosable: false,
      confirmLoading: submitting,
    };
    getFieldDecorator('productTypeName', {
      initialValue: productTypeName,
    });
    getFieldDecorator('productName', {
      initialValue: productName,
    });

    return (
      <Modal
        {...modalOpts}
        title="提单申请"
        okText="提单"
        width={600}
      >
        <Form layout="horizontal">
          <h3>确认购买意向</h3>
          <Row gutter={16}>
            <Col>
              <Form.Item label="漏斗等级" {...itemLayout}>
                {getFieldDecorator('customerLevel', {
                  initialValue: customerLevel,
                  rules: [{ required: true, message: '请选择漏斗等级' }],
                })(
                  <Select
                    placeholder="请选择"
                    style={{ width: 120 }}
                    onFocus={this.getSelectOptions.bind(this, 'levels')}
                    notFoundContent={fetchingOptions ? <Spin size="small" /> : null}
                  >
                    {levels.map(item => (
                      <Option value={item.level} key={item.level}>{item.levelName}</Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col>
              <Form.Item label="意向产品类型" {...itemLayout}>
                {getFieldDecorator('productTypeId', {
                  initialValue: productTypeId,
                  rules: [{ required: true, message: '请选择意向产品类型' }],
                })(
                  <Select onChange={val => setFieldsValue({
                    productTypeName: getProductType(val),
                  })}>
                    <Option value={1} key={1}>软件产品</Option>
                    <Option value={2} key={2}>硬件产品</Option>
                    <Option value={3} key={3}>增值产品</Option>
                  </Select>
                )}
              </Form.Item>
            </Col>
            <Col>
              <Form.Item label="意向产品" {...itemLayout}>
                {getFieldDecorator('productId', {
                  initialValue: productId,
                  rules: [{ required: true, message: '请选择意向产品' }],
                })(
                  <Product type={getFieldValue('productTypeId')} onChange={(_, val) => {
                    setFieldsValue({
                      productName: val.name,
                    })
                  }}/>
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col>
              <Form.Item label="最小意向价格" {...itemLayout}>
                {getFieldDecorator('minPrice', {
                  initialValue: minPrice,
                  rules: [{ required: true, message: '请输入' }],
                })(
                  <Input type="number" style={{ width: 120 }} />
                )}
              </Form.Item>
            </Col>
            <Col>
              <Form.Item label="最大意向价格" {...itemLayout}>
                {getFieldDecorator('maxPrice', {
                  initialValue: maxPrice,
                  rules: [{ required: true, message: '请输入' }],
                })(
                  <Input type="number" style={{ width: 120 }} />
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col>
              <Form.Item label="意向购买时间" {...itemLayout}>
                {getFieldDecorator('intentionTime', {
                  initialValue: intentionTime,
                  rules: [{ required: true, message: '请输入意向购买时间' }],
                })(
                  <Input style={{ width: 200 }} />
                )}
              </Form.Item>
            </Col>
          </Row>
          <h3>填写提单备注</h3>
          <Row gutter={16}>
            <Col>
              <Form.Item label="提单备注" {...itemLayout}>
                {getFieldDecorator('remark', {
                  initialValue: remark,
                  rules: [{ required: true, message: '请输入备注' }],
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
