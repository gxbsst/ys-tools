import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Input, Radio, Select, Modal, Row, Col, Spin } from 'antd';
import ProductsTree from './../_ProductsTree';
import { ProductSeries } from '../../../components/Selectors';
import {
  saleVersionMap,
  renderOptions,
} from '../../../utils/paramsMap';

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
  softwareSeries: '软件系列',
  saleVersion: '期限版本',
  chargeMode: '计费方式',
  chargeUnit: '计费单位',
  serviceTime: '服务期限',
  presentTime: '赠送期限',
  storeNum: '含门店数',
  price: '软件价格',
  servicePrice: '服务价格',
  directoryIds: '产品目录',
  wechatWallNum: '赠送微信墙数量',
}

@connect(({loading}) => ({
  loading: loading.effects['products/getProductInfo'],
}))
@Form.create()
export default class EditSoftwareProductModal extends PureComponent {
  state = {
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
  onSeriesChange = (value, option) => {
    console.log('option', option);
    const {wechatWall, store, isByCount} = option;
    this.setState({wechatWall, store, isByCount, chargeMode: isByCount ? 2 : 1});
    this.props.form.setFieldsValue({
      chargeMode: isByCount ? 2 : 1,
    });
  }
  onChargeModeChange = (e) => {
    this.setState({
      chargeMode: e.target.value,
    })
  }
  render() {
    const {
      form: {
        getFieldDecorator, validateFields,
      }, onOk, treeData, treeDataSimpleMode, option, ...receiveProps } = this.props;
    const { product } = this.state;
    const readOnly = option === 'read';
    const editable = option === 'create';
    const handleOk = () => {
      if (readOnly) return onOk();
      validateFields((err, values) => {
        if (!err) {
          const {serviceSelectUnit, giveSelectUnit, serviceTime, presentTime, ...restValues} = values;
          onOk({
            serviceTime: serviceTime && serviceSelectUnit && serviceTime * serviceSelectUnit,
            presentTime: presentTime && giveSelectUnit && presentTime * giveSelectUnit,
            id: product.id,
            ...restValues,
          });
        }
      });
    };
    const selfProps = {
      ...receiveProps,
      onOk: handleOk,
    }
    const serviceSelectAfter = (editable) => (
      <React.Fragment>
        {
          getFieldDecorator('serviceSelectUnit', {
          initialValue: product.serviceTime ? ((product.serviceTime >= 12 && product.serviceTime % 12 == 0) ? 12 : 1) : 12,
        })(
          <Select disabled={!editable} style={{ width: 60 }}>
            <Option value={12}>年</Option>
            <Option value={1}>月</Option>
          </Select>
        )}
      </React.Fragment>
    );
    const giveSelectAfter = (
      <React.Fragment>
        {
          getFieldDecorator('giveSelectUnit', {
          initialValue: product.presentTime ? ((product.presentTime >= 12 && product.presentTime % 12 == 0) ? 12 : 1) : 12,
        })(
          <Select style={{ width: 60 }}>
            <Option value={12}>年</Option>
            <Option value={1}>月</Option>
          </Select>
        )}
      </React.Fragment>
    );

    return (
      <Modal {...selfProps}>
        <Spin spinning={!!this.props.id && this.props.loading}>
          <Form layout="horizontal">
            <Row>
              <Col span={16}>
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
                  label="软件系列"
                >
                  {
                    readOnly ? product.softwareSeriesName :
                    getFieldDecorator('softwareSeries', {
                    initialValue: product.softwareSeries,
                    rules: [{ required: true, message: `请选择 ${productFieldLabels.softwareSeries}` }],
                  })(
                    <ProductSeries disabled={!editable} onChange={this.onSeriesChange} placeholder="请选择软件系列" />
                  )}
                </Form.Item>
                <Form.Item
                  {...formItemLayout}
                  label="计费方式"
                >
                {
                  readOnly ? ['', '按期限计费', '按数量计费'][product.chargeMode] :
                  getFieldDecorator('chargeMode', {
                  initialValue: product.chargeMode !== undefined ? product.chargeMode : this.state.chargeMode,
                  rules: [{ required: true, message: `请输入 ${productFieldLabels.chargeMode}` }],
                })(
                  <Radio.Group disabled={this.state.isByCount || product.isByCount} onChange={this.onChargeModeChange}>
                    <Radio value={1}>按期限计费</Radio>
                    <Radio value={2}>按数量计费</Radio>
                  </Radio.Group>
                )}
                </Form.Item>
                {
                  this.state.chargeMode == 2
                    ?
                  <React.Fragment>
                    <Form.Item
                      {...formItemLayout}
                      label="计费单位"
                    >
                      {
                        readOnly ? ({1: '个', 2: '次'}[product.chargeUnit]) :
                        getFieldDecorator('chargeUnit', {
                        initialValue: product.chargeUnit || undefined,
                        rules: [{ required: true, message: `请输入 ${productFieldLabels.chargeUnit}` }],
                      })(
                        <Select allowClear>
                          <Option value={1}>个</Option>
                          <Option value={2}>次</Option>
                        </Select>
                      )}
                    </Form.Item>
                  </React.Fragment>
                    :
                  <React.Fragment>
                    <Form.Item
                      {...formItemLayout}
                      label="期限版本"
                    >
                    {
                      readOnly ? ['', '标准版', '高级版', '豪华版', '至尊版'][product.saleVersion] :
                      getFieldDecorator('saleVersion', {
                      initialValue: product.saleVersion,
                      rules: [{ required: true, message: `请选择 ${productFieldLabels.saleVersion}` }],
                    })(
                      <Select allowClear disabled={!editable}>
                        {renderOptions(saleVersionMap)}
                      </Select>
                    )}

                    </Form.Item>
                    <Row>
                      <Col span={12}>
                        <Form.Item
                          {...formItemInlineLayout}
                          label="服务期限"
                        >
                        {
                          readOnly ? product.serviceTime && ((product.serviceTime >= 12 && product.serviceTime % 12 == 0) ? `${product.serviceTime / 12} 年` : `${product.serviceTime} 月`) :
                          getFieldDecorator('serviceTime', {
                          initialValue: product.serviceTime && ((product.serviceTime >= 12 && product.serviceTime % 12 == 0) ? product.serviceTime / 12 : product.serviceTime),
                          rules: [{ required: true, pattern: /^[0-9]{1,10}$/, message: `请输入正确的${productFieldLabels.serviceTime}` }],
                        })(
                          <Input disabled={!editable} type="number" addonAfter={serviceSelectAfter(editable)}/>
                        )}
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          {...formItemInlineLayout}
                          label="赠送期限"
                        >
                        {
                          readOnly ? product.presentTime && ((product.presentTime >= 12 && product.presentTime % 12 == 0) ? `${product.presentTime / 12} 年` : `${product.presentTime} 月`) :
                          getFieldDecorator('presentTime', {
                          initialValue: product.presentTime && ((product.presentTime >= 12 && product.presentTime % 12 == 0) ? product.presentTime / 12 : product.presentTime),
                          rules: [
                            { required: true, pattern: /^[0-9]{1,10}$/, message: `请输入正确的${productFieldLabels.presentTime}` },
                          ],
                        })(
                          <Input type="number" addonAfter={giveSelectAfter} />
                        )}
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row>
                      {
                        !(this.state.store || product.canBuyStore) &&
                        <Col span={12}>
                          <Form.Item
                            {...formItemInlineLayout}
                            label="含门店数"
                          >
                            {
                              readOnly ? product.storeNum :
                              getFieldDecorator('storeNum', {
                              initialValue: product.storeNum,
                              rules: [{ required: true, pattern: /^[0-9]{1,10}$/, message: `请输入正确的${productFieldLabels.storeNum}` }],
                            })(
                              <Input type="number" />
                            )}
                          </Form.Item>
                        </Col>
                      }
                      {
                        !(this.state.wechatWall || product.canBuyWechatWall) &&
                        <Col span={12}>
                          <Form.Item
                            {...formItemInlineLayout}
                            label="微信墙数"
                          >
                            {
                              readOnly ? product.wechatWallNum :
                              getFieldDecorator('wechatWallNum', {
                              initialValue: product.wechatWallNum,
                              rules: [{ required: true, pattern: /^[0-9]{1,10}$/, message: `请输入正确的${productFieldLabels.wechatWallNum}` }],
                            })(
                              <Input type="number" />
                            )}
                          </Form.Item>
                        </Col>
                      }
                    </Row>
                  </React.Fragment>
                }
                <Row>
                  <Col span={12}>
                    <Form.Item
                      {...formItemInlineLayout}
                      label="软件价格"
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
          </Form>
        </Spin>
      </Modal>
    )
  }
}
