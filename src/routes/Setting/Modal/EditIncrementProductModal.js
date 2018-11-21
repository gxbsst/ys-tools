import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Input, Radio, Select, Modal, Row, Col, Spin } from 'antd';
import ProductsTree from './../_ProductsTree';

const { Option } = Select;

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16},
};

const formItemInlineLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 12},
};

const productFieldLabels = {
  name: '产品名称',
  chargeMode: '计费方式',
  chargeUnit: '计费单位',
  price: '产品价格',
  servicePrice: '服务价格',
  directoryIds: '产品目录',
  product: {},
}

@connect(({loading}) => ({
  loading: loading.effects['products/getProductInfo'],
}))
@Form.create()
export default class EditProductsIncrementModal extends PureComponent {
  state={
    chargeMode: 1,
    product: {},
  }
  async componentDidMount() {
    const { id, dispatch, onCancel } = this.props;
    if (!id) return;
    await dispatch({
      type: 'products/getProductInfo',
      payload: id,
    }).then(res => {
      if (!res.code) {
        this.setState({
          product: res.data,
          chargeMode: res.data.chargeMode,
        })
      } else {
        throw new Error('failed');
      }
    }).catch(() => {
      onCancel();
    })
  }
  render() {
    const {
      form: {
        getFieldDecorator, validateFields,
      }, onOk, treeData, treeDataSimpleMode, option, ...receiveProps } = this.props;
    const { chargeMode, product } = this.state;
    const readOnly = option === 'read';
    const handleOk = () => {
      if (readOnly) return onOk();
      validateFields((err, values) => {
        if (!err) {
          onOk({ id: product.id, ...values, chargeMode });
        }
      });
    };
    const selfProps = {
      ...receiveProps,
      onOk: handleOk,
    }
    return (
      <Modal {...selfProps}>
        <Spin spinning={!!this.props.id && this.props.loading}>
          <Row>
            <Col span={16}>
              <Form layout="horizontal" hideRequiredMark>
                <Form.Item
                  {...formItemLayout}
                  label="产品名称"
                >
                  {
                    readOnly ? product.name :
                    getFieldDecorator('name', {
                    initialValue: product.name,
                    rules: [
                      { required: true, message: `请输入 ${productFieldLabels.name}` },
                      { max: 20, message: '长度限制在20以内' },
                    ],
                  })(
                    <Input />
                  )}
                </Form.Item>
                <Form.Item
                  {...formItemLayout}
                  label="计费方式"
                  required
                >
                  {
                    readOnly ? ['', '按期限计费', '按数量计费'][product.chargeMode] :
                    <Radio.Group value={product.chargeMode !== undefined ? product.chargeMode : this.state.chargeMode}>
                      <Radio value={1}>按期限计费</Radio>
                      <Radio value={2}>按数量计费</Radio>
                    </Radio.Group>
                  }
                {/*getFieldDecorator('chargeMode', {
                  initialValue: product.chargeMode,
                  rules: [{ required: true, message: `请输入 ${productFieldLabels.chargeMode}` }],
                })(

                )*/}
                </Form.Item>
                <Form.Item
                  {...formItemLayout}
                  label="计费单位"
                  required
                >
                {
                  readOnly ? ({3: '年', 4: '月'}[product.chargeUnit]) :
                  getFieldDecorator('chargeUnit', {
                  initialValue: product.chargeUnit || undefined,
                  rules: [{ required: true, message: `请选择 ${productFieldLabels.chargeUnit}` }],
                })(
                  <Select allowClear>
                    <Option value={3}>年</Option>
                    <Option value={4}>月</Option>
                  </Select>
                )}

                </Form.Item>
                <Row>
                  <Col span={12}>
                    <Form.Item
                      {...formItemInlineLayout}
                      label="产品价格"
                      required
                    >
                    {
                      readOnly ? product.price :
                      getFieldDecorator('price', {
                      initialValue: product.price,
                      rules: [
                        { required: true, pattern: /^\d{1,8}(\.\d*$|$)/, message: `请输入正确的${productFieldLabels.price}` },
                      ],
                    })(
                      <Input type="number" step="0.01" min="0.01" />
                    )}
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      {...formItemInlineLayout}
                      label="服务价格"
                    >
                    {
                      readOnly ? product.servicePrice :
                      getFieldDecorator('servicePrice', {
                      initialValue: product.servicePrice,
                      rules: [
                        { required: true, pattern: /^\d{1,8}(\.\d*$|$)/, message: `请输入正确的${productFieldLabels.servicePrice}` },
                      ],
                    })(
                      <Input type="number" step="0.01" min="0.01" />
                    )}
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Col>
            <Col span={8}>
              <Form.Item style={{maxHeight: 350, overflow: 'auto'}}>
              {getFieldDecorator('directoryIds', {
                initialValue: product.directoryIds,
                rules: [{ required: true, message: `请选择 ${productFieldLabels.directoryIds}` }],
              })(
                <ProductsTree
                  checkable
                  readOnly={readOnly}
                  treeData={treeData}
                  treeDataSimpleMode={treeDataSimpleMode}
                />
              )}
              </Form.Item>
            </Col>
          </Row>
        </Spin>
      </Modal>
    )
  }
}
