import React, {PureComponent} from "react";
import _ from 'lodash'
import Product from '../../../../../components/Product'
import {Select} from '../../../../../components/Helpers';
import {request, toSafePositiveInteger} from '../../../../../utils';
import {convertUnit, getPercent, checkParames} from '../../../../../utils/helpers'
import {
  Form,
  Input,
  Radio,
  Modal,
  Cascader,
  message,
  InputNumber,
  Row,
  Col
} from 'antd';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const {TextArea} = Input;
const formItemLayout = {
  labelCol: {
    span: 8
  },
  wrapperCol: {
    span: 16
  }
};
const formItem = {
  labelCol: {
    span: 4
  },
  wrapperCol: {
    span: 20
  }
};

let timeout;
let oldValues;
let that;
const onValuesChange = (props, value, values) => {
  clearTimeout(timeout);
  let {productDetail: {chargeMode}} = that.state;
  timeout = setTimeout(async () => {
    const key = _.first(_.keys(value));
    const originalValue = _.first(_.values(value));
    const normalize = _.get(that.props.form.getFieldInstance(key), 'props.data-__meta.normalize');
    if (_.isFunction(normalize)) {
      values[key] = normalize(originalValue, originalValue, values);
    }
    const {buyStoreCount, buyWechatCount, discountProductAmount, discountServiceAmount} = values;
    const dredgeCountTimes = that.props.form.getFieldValue('dredgeCountTimes');
    const {productId = '', chargeMode = ''} = that.state;
    if (productId) {
      const query = {
        buyStoreCount: buyStoreCount || 0,
        buyWechatCount: buyWechatCount || 0,
        discountProductAmount: discountProductAmount || 0,
        discountServiceAmount: discountServiceAmount || 0,
        relationId: productId,
        dredgeTimes: chargeMode === 2 ? dredgeCountTimes : 1,
      };
      if (!_.isEqual(oldValues, query) && checkParames(query) && query.dredgeTimes) {
        oldValues = query;
        const {data = {}} = await request(`/api/business/product/compute`, {query});
        const {discountRate, productAmount, serviceAmount} = data;
        that.setState({
          discountRate: discountRate || 1,
          productAmount: productAmount || 0,
          serviceAmount: serviceAmount || 0,
        });
      }
    }
  }, 100);
};
@Form.create({onValuesChange})
export default class NewOpen extends PureComponent {
  state = {
    productDetail: {},
    storeName: [],
    linkman: [],
    productId: '',
    discountRate: 1,
    productAmount: 0,
    serviceAmount: 0,
    execute: false,
    chargeMode: ''
  }
  lastWeimobAccount = null;
  getProductDetail = async (res, value) => {
    if (value) {
      const {relationId, relationId: productId, chargeMode} = value;
      this.setState({productId, chargeMode});
      this.props.form.resetFields();
      const {code, data} = await request(`/api/product/relation/${relationId}`);
      if (code === 0 && data) {
        this.setState({productDetail: data || {}});
      }
    }
    this.setState({
      discountRate: 1,
      productAmount: 0,
      serviceAmount: 0,
      execute: true
    });
  }
  // 获取门店信息
  getStoreName = async (weimobAccount) => {
    const {data} = await request(`/api/business/${weimobAccount}/store`);
    this.setState({
      StoreName: data || []
    });
  }
  // 获取业务联系人
  getlinkman = async (id) => {
    const {data} = await request(`/api/customer/${id}/link`);
    this.setState({
      linkman: data || []
    })
  }
  getShop = async (e) => {
    const {
      form: {getFieldValue, setFieldsValue}
    } = this.props;
    const weimobAccount = getFieldValue('weimobAccount');
    if (weimobAccount && this.lastWeimobAccount !== weimobAccount) {
      const {data, code} = await request(`/api/business/${weimobAccount}/store`);
      if (code === 0) {
        this.setState({
          storeName: data || []
        });
      }
      if (!weimobAccount) {
        this.setState({storeName: []});
        setFieldsValue({shopId: []})
      }

    }
    this.lastWeimobAccount = weimobAccount;
  }

  componentDidMount() {
    const {customerId} = this.props;
    if (customerId) {
      this.getlinkman(customerId)
    }
  }

  componentWillReceiveProps({customerId}) {
    if (customerId !== this.props.customerId && customerId) {
      this.getlinkman(customerId)
    }
  }

  // 新开业务
  newbusiness = async (value) => {
    const {getsoftware, page, customerId, onCancel, getBusinesses, mainParentId} = this.props;
    const {data, message: msg} = await request(`/api/business/add`, {
      method: 'POST',
      body: {...value},
    });
    message.success(msg);
    this.props.form.resetFields();
    onCancel();
    customerId && getsoftware(customerId, page);
    mainParentId && getBusinesses(mainParentId, true);
  }

  render() {
    that = this;
    const {
      form,
      form: {
        getFieldDecorator, validateFields, getFieldsError, getFieldValue, resetFields
      }, onOk, onCancel, customername, customerId, type, ...receiveProps
    } = this.props;
    const {
      productDetail: {softwareSeries, chargeMode, id = '', canBuyStore = 0, canBuyWechatWall = 0},
      productDetail,
      storeName,
      linkman,
      productId,
      discountRate,
      productAmount,
      serviceAmount
    } = this.state;
    const handleOk = () => {
      const {chargeMode} = this.state;
      validateFields((err, values) => {
        let storeNameItme = storeName.filter(item => (item.id === values.shopId));
        let linkmanItem = linkman.filter(item => (item.id === values.contactsNo));
        const shopName = storeNameItme[0] && storeNameItme[0].merchantName;
        const contactsName = linkmanItem[0] && linkmanItem[0].linkName;
        if (!err) {
          // values.customerId = customerId;
          values = Object.assign({}, values, {
            customerId,
            passRemark: values.remark,
            productId,
            shopName,
            contactsName,
            discountRate: 0,
            dredgeTimes: chargeMode === 2 ? values.dredgeCountTimes : values.dredgeTimes
          });
          this.newbusiness(values);
          resetFields();
        }
      });
    };
    const handleCancel = () => {
      this.props.form.resetFields();
      onCancel();
    };
    const selfProps = {
      ...receiveProps,
      onOk: handleOk,
      onCancel: handleCancel,
      destroyOnClose: true,
    }
    return (
      <Modal
        {...selfProps}
      >
        <Form layout="horizontal">
          <Row gutter={12}>
            <Col span={12}>
              <FormItem {...formItemLayout} label="客户名称">
                {getFieldDecorator('customerName', {
                  rules: [{required: true, message: '客户名称'}],
                  initialValue: customername,
                })(<Input placeholder="请输入客户名称" disabled/>)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={24}>
              <FormItem {...formItem} label="产品名称">
                {getFieldDecorator('productId', {
                  rules: [{required: true, message: '产品不能为空'}]
                })(<Product onChange={this.getProductDetail} type={type} style={{width: '100%'}} source={3}
                            sourceId={customerId}/>)}
              </FormItem>
            </Col>
          </Row>
          {
            chargeMode === 1 && (
              <div>
                <Row gutter={12}>
                  <Col span={12}>
                    <FormItem {...formItemLayout} label="服务期限">
                      {getFieldDecorator('dredgeTimes', {
                        initialValue: convertUnit(productDetail.serviceTime)
                      })(<Input placeholder="服务期限"
                                min={0} disabled
                                addonAfter={(productDetail.serviceTime >= 12 && productDetail.serviceTime % 12 === 0) ? '年' : '月'}
                                style={{width: '100%'}}/>)}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem {...formItemLayout} label="赠送期限">
                      {getFieldDecorator('giftTimes', {
                        initialValue: convertUnit(productDetail.presentTime)
                      })(<Input placeholder="赠送期限" min={0}
                                addonAfter={(productDetail.presentTime >= 12 && productDetail.presentTime % 12 === 0) ? '年' : '月'}
                                disabled style={{width: '100%'}}/>)}
                    </FormItem>
                  </Col>
                </Row>
                {
                  !canBuyStore &&
                  <Row gutter={12}>
                    <Col span={12}>
                      <FormItem {...formItemLayout} label="购买门店数量">
                        {getFieldDecorator('buyStoreCount', {
                          normalize: (value, prevValue) => toSafePositiveInteger(value),
                          rules: [
                            {required: true, message: '购买门店数量'},
                          ],
                        })(<Input
                          placeholder="购买门店数量"
                          style={{width: '100%'}}/>)}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...formItemLayout} label="赠送门店数量">
                        {getFieldDecorator('giftStoreCount', {
                          initialValue: productDetail.storeNum,
                        })(<InputNumber placeholder="赠送门店数量" min={0} disabled style={{width: '100%'}}/>)}
                      </FormItem>
                    </Col>
                  </Row>

                }
                {
                  !canBuyWechatWall &&
                  <Row gutter={12}>
                    <Col span={12}>
                      <FormItem {...formItemLayout} label="购买微信墙数量">
                        {getFieldDecorator('buyWechatCount', {
                          normalize: (value, prevValue) => toSafePositiveInteger(value),
                          rules: [{required: true, message: '购买微信墙数量'}]
                        })(<Input
                          placeholder="购买微信墙数量"
                          style={{width: '100%'}}/>)}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...formItemLayout} label="赠送微信墙数量">
                        {getFieldDecorator('giftWechatCount', {
                          initialValue: productDetail.wechatWallNum
                        })(<InputNumber placeholder="赠送微信墙数量" min={0} disabled style={{width: '100%'}}/>)}
                      </FormItem>
                    </Col>
                  </Row>
                }
                <Row gutter={12}>
                  <Col span={12}>
                    <FormItem {...formItemLayout} label="产品金额">
                      {getFieldDecorator('productAmount', {
                        rules: [{required: true, message: '产品金额'}],
                        initialValue: productAmount,
                      })(
                        <InputNumber placeholder="产品金额" min={0} disabled style={{width: '100%'}}/>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem {...formItemLayout} label="服务金额">
                      {getFieldDecorator('serviceAmount', {
                        rules: [{required: true, message: '服务金额'}],
                        initialValue: serviceAmount
                      })(<InputNumber placeholder="服务金额" min={0} disabled style={{width: '100%'}}/>)}
                    </FormItem>
                  </Col>
                </Row>
              </div>
            )}
          {
            chargeMode === 2 && (
              <div>
                <Row gutter={12}>
                  <Col span={12}>
                    <FormItem {...formItemLayout} label="产品数量">
                      {getFieldDecorator('dredgeCountTimes', {
                        normalize: (value, prevValue) => toSafePositiveInteger(value),
                        rules: [
                          {required: true, message: '产品数量不能为空'},
                          {
                            validator: (r, v, c) => {
                              if (!(/(^[1-9]\d*$)/.test(v * 1))) {
                                c('请输入正整数');
                              }
                              c();
                            },
                          }
                        ],
                      })(<Input placeholder="产品数量"
                                style={{width: '100%'}}/>)}
                    </FormItem>
                  </Col>
                </Row>
                <Row gutter={12}>
                  <Col span={12}>
                    <FormItem {...formItemLayout} label="产品金额">
                      {getFieldDecorator('productAmount', {
                        rules: [{required: true, message: '产品金额'}],
                        initialValue: productAmount,
                      })(
                        <InputNumber placeholder="产品金额" min={0} disabled style={{width: '100%'}}/>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem {...formItemLayout} label="服务金额">
                      {getFieldDecorator('serviceAmount', {
                        rules: [{required: true, message: '服务金额'}],
                        initialValue: serviceAmount
                      })(<InputNumber placeholder="服务金额" min={0} disabled style={{width: '100%'}}/>)}
                    </FormItem>
                  </Col>
                </Row>
              </div>
            )
          }
          <Row gutter={12}>
            <Col span={12}>
              <FormItem {...formItemLayout} label="产品优惠">
                {getFieldDecorator('discountProductAmount', {
                  normalize: (value, prevValue, {productAmount}) => toSafePositiveInteger(value, productAmount),
                  rules: [{required: true, message: '产品优惠'},
                    {
                      validator: (rule, value, callback) => {
                        const {getFieldValue} = this.props.form;
                        if (value && value >= getFieldValue('productAmount')) {
                          callback('不能大于产品金额！')
                        }
                        callback()
                      }
                    }
                  ],
                })(
                  <Input placeholder="产品优惠"
                         style={{width: '100%'}}/>
                )}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem {...formItemLayout} label="服务优惠">
                {getFieldDecorator('discountServiceAmount', {
                  normalize: (value, prevValue, {serviceAmount}) => toSafePositiveInteger(value, serviceAmount),
                  rules: [{required: true, message: '服务优惠'},
                    {
                      validator: (rule, value, callback) => {
                        const {getFieldValue} = this.props.form;
                        if (value && value >= getFieldValue('serviceAmount')) {
                          callback('不能大于服务金额！')
                        }
                        callback()
                      }
                    }
                  ],
                })(<Input placeholder="服务优惠"
                          style={{width: '100%'}}/>)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <FormItem {...formItemLayout} label="折扣率">
                {getFieldDecorator('discountRate', {
                  rules: [{required: true, message: '折扣率'}],
                  initialValue: getPercent(discountRate),
                })(<Input placeholder="折扣率" disabled/>)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem {...formItemLayout} label="微盟注册号">
                {getFieldDecorator('weimobAccount', {
                  rules: [{required: true, message: '微盟注册号'}]
                })(<Input placeholder="微盟注册号" onBlur={this.getShop}/>)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={12}>
            {
              softwareSeries && softwareSeries === 1 &&
              <Col span={12}>
                <FormItem {...formItemLayout} label="店铺名称">
                  {getFieldDecorator('shopId', {
                    rules: [
                      {required: true, message: '店铺名称'},
                    ]
                  })(<Select style={{width: '100%'}} options={storeName} valuePropName="id"
                             labelPropName="merchantName"
                             key="id"/>)}
                </FormItem>
              </Col>
            }
            <Col span={12}>
              <FormItem {...formItemLayout} label="业务联系人">
                {getFieldDecorator('contactsNo', {
                  rules: [{required: true, message: '业务联系人'}]
                })(
                  <Select style={{width: '100%'}} options={linkman} valuePropName="id" labelPropName="linkName"
                          key="id"/>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <FormItem {...formItem} label="备注">
                {getFieldDecorator('remark', {})(<TextArea placeholder="备注"/>)}
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Modal>
    )
      ;
  }
}

