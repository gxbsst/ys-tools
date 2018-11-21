import React, {PureComponent} from "react";
import _ from 'lodash'
import DescriptionList from '../../../../../components/DescriptionList';
import styles from '../index.less'
import {Select, ColumnGroup} from '../../../../../components/Helpers';
import {getDate} from '../../../../../utils/helpers'
import {request, toSafePositiveInteger, toSafeInteger} from '../../../../../utils';
import {
  Form,
  Input,
  Modal,
  message,
  Divider,
  InputNumber,
  Row,
  Col
} from 'antd';
import {getPercent, checkParames} from '../../../../../utils/helpers'

const FormItem = Form.Item;
const {TextArea} = Input;
const {Description} = DescriptionList;
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
    const {buyStoreCount, discountProductAmount} = values;
    const {parentId} = that.props;
    const {relationId = ''} = that.props;
    if (relationId) {
      const query = {
        buyStoreCount: buyStoreCount,
        discountProductAmount: discountProductAmount || 0,
        relationId,
        parentId,
        isStroe: true
      };
      if (!_.isEqual(oldValues, query) && checkParames(query) && buyStoreCount > 0) {
        oldValues = query;
        const {data = {}} = await request(`/api/business/product/compute`, {query});
        const {discountRate, productAmount, serviceAmount} = data;
        that.setState({
          discountRate,
          productAmount,
          serviceAmount,
        });
      }
    }
  }, 100);
};
@Form.create({onValuesChange})
export default class AddShop extends PureComponent {
  state = {
    productDetail: {},
    StoreName: [],
    linkman: [],
    info: {},
    discountRate: 1,
    productAmount: 0,
    serviceAmount: 0,
  }
  // 获取业务联系人
  getcontacts = async (id) => {
    const {data} = await request(`/api/customer/${id}/link`);
    this.setState({
      contacts: data || data
    })
  }
  // 获取业务信息
  customerInfo = async (parentId) => {
    const {data: info = {}} = await request(`/api/business/bizorder/${parentId}`);
    this.setState({info})
  }

  componentDidMount() {
    const {customerId, parentId} = this.props;
    this.getcontacts(customerId);
    this.customerInfo(parentId);
  }

  // 加门店
  newbusiness = async (value) => {
    const {parentId, mainParentId, getBusinesses, page, getsoftware, customerId} = this.props;
    const {data, message: msg, code} = await request(`api/orderOper/${parentId}/addStore`, {
      method: 'POST',
      body: {...value},
    })
    code === 0 && message.success(msg);
    getsoftware(customerId, page);
    mainParentId && getBusinesses(mainParentId, true)
    this.props.onCancel();
    this.props.form.resetFields();
  }

  render() {
    that = this;
    const {
      form,
      form: {
        getFieldDecorator, validateFields, getFieldsError, getFieldValue, resetFields
      }, onOk, onCancel, customername, customerId, type, parentId, ...receiveProps
    } = this.props;
    const {
      contacts, info,
      discountRate,
      productAmount,
      serviceAmount,
    } = this.state;
    if (_.isEmpty(info)) return null;
    const handleOk = () => {
      validateFields((err, values) => {
        let contactsItem = contacts.filter(item => (item.id === values.contactsNo));
        const contactsName = contactsItem[0].linkName;
        const {buyStoreCount, discountRate, remark, contactsNo} = values;
        if (!err) {
          this.newbusiness({
            ...values,
            contactsName,
            discountRate: 0,
            parentId
          });
        }
      });
    };
    const transform = (time) => {
      return time && ((time >= 12 && time % 12 === 0) ? `${time / 12} 年` : `${time} 月`);
    }
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
    const items = [
      {label: '客户名称', value: info.customerName},
      {label: '产品名称', value: info.productName},
      {label: '服务期限', value: transform(info.dredgeTimes)},
      {label: '赠送期限', value: transform(info.giftTimes)},
      {label: '赠送门店数量', value: info.giftStoreCount},
      {label: '购买门店数量', value: info.buyStoreCount},
      {label: '购买微信墙数量', value: info.buyWechatCount},
      {label: '赠送微信墙数量', value: info.giftWechatCount},
      {label: '服务开始日期', value: getDate(info.serviceStartTime)},
      {label: '服务结束日期', value: getDate(info.serviceEndTime)},
      {label: '微盟注册号', value: info.weimobAccount},
      {label: '店铺名称', value: info.shopName},
    ];
    return (
      <Modal
        {...selfProps}
      >
        <div>
          <ColumnGroup items={items} col={8}/>
          <Divider/>
          <Row gutter={12}>
            <Col span={12}>
              <FormItem {...formItemLayout} label="业务联系人">
                {getFieldDecorator('contactsNo', {
                  rules: [{required: true, message: '业务联系人'}]
                })(
                  <Select style={{width: '100%'}}
                          options={contacts}
                          valuePropName="id"
                          placeholder="请选择业务联系人"
                          labelPropName="linkName"
                          key="id"/>
                )}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem {...formItemLayout} label="购买门店数量">
                {getFieldDecorator('buyStoreCount', {
                  normalize: (value, prevValue) => toSafePositiveInteger(value),
                  rules: [{required: true, message: '购买门店数量'},],
                })(<Input placeholder="购买门店数量"
                          style={{width: '100%'}}/>)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <FormItem {...formItemLayout} label="产品金额">
                {getFieldDecorator('productAmount', {
                  rules: [{required: true, message: '产品金额'}],
                  initialValue: productAmount
                })(
                  <InputNumber placeholder="产品金额"
                               disabled min={0}
                               style={{width: '100%'}}/>
                )}
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
                  <Input placeholder="产品优惠"
                         style={{width: '100%'}}/>
                )}
              </FormItem>
            </Col>
          </Row>
        </div>
        <Row gutter={12}>
          <Col span={12}>
            <FormItem {...formItemLayout} label="折扣率">
              {getFieldDecorator('discountRate', {
                rules: [{required: true, message: '折扣率'}],
                initialValue: getPercent(discountRate)
              })(<Input placeholder="折扣率" disabled/>)}
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
      </Modal>
    );
  }
}

