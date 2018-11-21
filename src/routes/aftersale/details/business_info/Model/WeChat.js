import React, {PureComponent} from "react";
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
import _ from 'lodash'
import {request, toSafePositiveInteger} from '../../../../../utils';
import {Select, ColumnGroup} from '../../../../../components/Helpers';
import {getPercent, checkParames, getDate} from '../../../../../utils/helpers'

const FormItem = Form.Item;
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
    const {discountProductAmount, discountServiceAmount, buyWechatCount} = values;
    const {parentId} = that.props;
    const {relationId = ''} = that.props;
    if (relationId) {
      const query = {
        discountProductAmount: discountProductAmount || 0,
        discountServiceAmount: discountServiceAmount || 0,
        relationId,
        parentId,
        buyWechatCount: buyWechatCount || 1,
        isWeChartWall: true,
      };
      if (!_.isEqual(oldValues, query) && checkParames(query) && buyWechatCount > 0) {
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
export default class WeChat extends PureComponent {
  state = {
    contacts: [],
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

  // 新开业务
  newbusiness = async (value) => {
    const {
      parentId, mainParentId,
      getBusinesses,
      page,
      getsoftware,
      customerId,
      onCancel,
    } = this.props;
    const {data, message: msg, code} = await request(`api/orderOper/${parentId}/buyWeChartWall`, {
      method: 'POST',
      body: {...value},
    })
    code === 0 && message.success(msg);
    getsoftware(customerId, page);
    mainParentId && getBusinesses(mainParentId, true);
    this.props.form.resetFields();
    onCancel();
  }
  transform = (time) => {
    return time && ((time >= 12 && time % 12 === 0) ? `${time / 12} 年` : `${time} 月`);
  }

  render() {
    that = this;
    const {
      form,
      form: {
        getFieldDecorator, validateFields, getFieldsError, getFieldValue, resetFields
      }, onOk, onCancel, customername, customerId, type, parentId, ...receiveProps
    } = this.props;
    const {contacts, info, discountRate, productAmount, serviceAmount,} = this.state;
    if (_.isEmpty(info)) return null;
    const {
      customerName, productName, serviceTime, giftStoreCount, buyStoreCount, giftWechatCount,
      serviceStartTime, serviceEndTime, weimobAccount, shopName, giftTimes, presentTime, dredgeTimes, buyWechatCount
    } = info;
    const handleOk = () => {
      validateFields((err, values) => {
        let contactsItem = contacts.filter(item => (item.id === values.contactsNo));
        const contactsName = contactsItem[0].linkName;
        const {buyWechatCount, discountRate, remark, contactsNo} = values;
        if (!err) {
          this.newbusiness({
            ...values,
            discountRate: 0,
            parentId,
            contactsName
          });
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
    const items = [
      {label: '客户名称', value: customerName},
      {label: '产品名称', value: productName},
      {label: '服务期限', value: this.transform(dredgeTimes)},
      {label: '赠送期限', value: this.transform(giftTimes)},
      {label: '赠送门店数量', value: giftStoreCount},
      {label: '购买门店数量', value: buyStoreCount},
      {label: '购买微信墙数量', value: buyWechatCount},
      {label: '赠送微信墙数量', value: giftWechatCount},
      {label: '服务开始日期', value: getDate(serviceStartTime)},
      {label: '服务结束日期', value: getDate(serviceEndTime)},
      {label: '微盟注册号', value: weimobAccount},
      {label: '店铺名称', value: shopName},
    ];
    return (
      <Modal
        {...selfProps}
      >
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
                        labelPropName="linkName"
                        placeholder="业务联系人"
                        key="id"/>
              )}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem {...formItemLayout} label="购买微信墙数量">
              {getFieldDecorator('buyWechatCount', {
                normalize: (value, prevValue) => toSafePositiveInteger(value),
                rules: [{required: true, message: '微信墙数量不能为空'},],
              })(<Input placeholder="购买微信墙数量"
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
                <InputNumber placeholder="产品金额" disabled min={0} style={{width: '100%'}}/>
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
    )
  }
}

