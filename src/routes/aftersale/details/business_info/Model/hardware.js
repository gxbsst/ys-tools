import React, {PureComponent} from "react";
import Product from '../../../../../components/Product'
import {Select} from '../../../../../components/Helpers';
import {request, toSafePositiveInteger} from '../../../../../utils';
import {
  Form,
  Input,
  Radio,
  Modal,
  message,
  InputNumber,
  Row,
  Col
} from 'antd';
import {getPercent, checkParames} from '../../../../../utils/helpers'

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
  timeout = setTimeout(async () => {
    const key = _.first(_.keys(value));
    const originalValue = _.first(_.values(value));
    const normalize = _.get(that.props.form.getFieldInstance(key), 'props.data-__meta.normalize');
    if (_.isFunction(normalize)) {
      values[key] = normalize(originalValue, originalValue, values);
    }
    const {discountProductAmount, discountServiceAmount, dredgeTimes} = values;
    const {productId = ''} = that.state;
    if (productId && dredgeTimes > 0) {
      const query = {
        discountProductAmount: discountProductAmount || 0,
        discountServiceAmount: discountServiceAmount || 0,
        relationId: productId,
        dredgeTimes
      };
      if (!_.isEqual(oldValues, query) && checkParames(query)) {
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
export default class NewHardWare extends PureComponent {
  state = {
    productDetail: {},
    StoreName: [],
    linkman: [],
    discountRate: 1,
    productAmount: 0,
    serviceAmount: 0,
  }
  getProductDetail = async (res, value) => {
    if (value) {
      const {relationId, relationId: productId, chargeMode} = value;
      this.setState({productId, chargeMode});
      this.props.form.resetFields();
      let productDetail = await request(`/api/product/relation/${relationId}`);
      if (productDetail.code === 0 && productDetail.data) {
        productDetail = productDetail.data;
        this.setState({productDetail});
      }
    }
    this.setState({
      discountRate: 1,
      productAmount: 0,
      serviceAmount: 0
    });
  }
  // 获取业务联系人
  getlinkman = async (id) => {
    const {data} = await request(`/api/customer/${id}/link`);
    this.setState({
      linkman: data ? data : []
    })
  }

  componentDidMount() {
    const {customerId} = this.props;
    this.getlinkman(customerId)
  }

  // 新开业务
  newbusiness = async (value) => {
    const {gethardware, page, customerId} = this.props;
    const {data, message: msg} = await request(`/api/business/add`, {
      method: 'POST',
      body: {...value},
    })
    gethardware(customerId, page);
    data && message.success(msg)
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
      productDetail: {serviceTime, chargeMode, price, servicePrice, costPrice},
      productDetail,
      StoreName,
      linkman,
      productId,
      discountRate,
      productAmount,
      serviceAmount,
    } = this.state;
    const handleOk = () => {
      validateFields((err, values) => {
        let linkmanItem = linkman.filter(item => (item.id === values.contactsNo));
        const contactsName = linkmanItem[0] && linkmanItem[0].linkName;
        if (!err) {
          // values.customerId = customerId;
          values = Object.assign({}, values, {
            customerId,
            passRemark: values.remark,
            discountRate: 0,
            productId,
            contactsName
          });
          this.newbusiness(values);
          onCancel();
          resetFields();
        }
      });
    };
    const handleCancel = () => {
      resetFields();
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
                })(<Product onChange={this.getProductDetail} type={type} source={3} sourceId={customerId}/>)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <FormItem {...formItemLayout} label="产品数量">
                {getFieldDecorator('dredgeTimes', {
                  normalize: (value, prevValue) => toSafePositiveInteger(value),
                  rules: [{required: true, message: '产品数量不能为空'},],
                })(<Input placeholder="产品数量"
                          style={{width: '100%'}}
                          addonAfter={productDetail.chargeUnit === 1 ? '个' : '件'}/>)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem {...formItemLayout} label="产品金额">
                {getFieldDecorator('productAmount', {
                  rules: [{required: true, message: '产品金额'}],
                  initialValue: productAmount
                })(
                  <InputNumber placeholder="产品金额" min={0} disabled style={{width: '100%'}}/>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <FormItem {...formItemLayout} label="折扣率">
                {getFieldDecorator('discountRate', {
                  rules: [{required: true, message: '折扣率'}],
                  initialValue: getPercent(discountRate)
                })(<Input placeholder="折扣率" disabled/>)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem {...formItemLayout} label="产品优惠">
                {getFieldDecorator('discountProductAmount', {
                  normalize: (value, prevValue, {productAmount}) => toSafePositiveInteger(value, productAmount),
                  rules: [
                    {required: true, message: '产品优惠'},
                    {
                      validator: (rule, value, callback) => {
                        const {getFieldValue} = this.props.form;
                        if (value && value > getFieldValue('productAmount')) {
                          callback('不能大于产品金额！')
                        }
                        callback()
                      }
                    }
                  ],
                })(
                  <Input
                    placeholder="产品优惠"
                    style={{width: '100%'}}/>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <FormItem {...formItemLayout} label="业务联系人">
                {getFieldDecorator('contactsNo', {
                  rules: [{required: true, message: '业务联系人'}]
                })(
                  <Select style={{width: '100%'}}
                          options={linkman}
                          valuePropName="id"
                          placeholder="业务联系人"
                          labelPropName="linkName"
                          key="id"/>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={12}>
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

