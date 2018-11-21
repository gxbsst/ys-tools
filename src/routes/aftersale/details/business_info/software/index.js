import React, {PureComponent} from 'react';
import _ from 'lodash';
import {
  Table,
  Button,
  Input,
  Form,
  message,
  Popconfirm,
  InputNumber,
  Divider, Row, Col
} from 'antd';
import {Link} from 'dva/router';
import {connect} from 'dva';
import {Dialog} from '../../../../../components';
import {toSafePositiveInteger, toSafePositiveFloat} from '../../../../../utils';
import {ColumnGroup, Select} from '../../../../../components/Helpers';
import DescriptionList from '../../../../../components/DescriptionList';
import request from '../../../../../utils/request';
import can from '../../../../../decorators/Can';
import NewOpen from '../Model/newlybusiness';
import WeChat from '../Model/WeChat';
import AddShop from '../Model/addShop';
import common from '../../../../Personnel/common/index.less';
import styles from '../index.less';
import {
  getServiceDuration,
  getBusinessType,
  getPaidStatus,
  getDate,
  getCurrency,
  getBackpayStatus,
  getBusinessStatus,
  getOrderStatus,
  getChargeUnit,
  convertUnit,
  getPercent,
  checkParames,
  getVersionsType
} from '../../../../../utils/helpers';

const {TextArea} = Input;
const FormItem = Form.Item;
const Option = Select.Option;
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
let once = true;
const itemTypes = [
  {value: 6, label: '降级续费'},
  {value: 7, label: '正常续费'},
  {value: 5, label: '升级续费'},
];
const normalizeValues = (values) => {
  _.forEach(values, (value, key) => {
    values[key] = toSafePositiveInteger(value);
  });
  return values;
};
@can([10005000])
@connect(state => (
    state
  )
)
export default class SoftWare extends PureComponent {
  state = {
    product: [],
    productMenu: '',
    productInfo: '',
    visible: false,
    businessInfo: {},
    softList: [],
    pagination: {},
    current: '',
    loading: true,
    customerId: '',
    businessId: '',
    renewInfo: {},
    relationId: '',
    expanded: '',
    record: '',
    expandedRowKeys: [],
  };
  columns = [
    {
      title: '微盟账号',
      width: 216,
      dataIndex: 'weimobAccount',
    }, {
      title: '店铺名称',
      width: 216,
      dataIndex: 'shopName',
    }, {
      title: '当前门店数量',
      width: 216,
      dataIndex: 'storeCount',
    }, {
      title: '服务开始日期',
      width: 216,
      dataIndex: 'serviceStartTime',
      render: getDate
    }, {
      title: '服务结束日期',
      fixed: 'right',
      width: 216,
      dataIndex: 'serviceEndTime',
      render: getDate
    }
  ];
  transform = (time) => {
    return time && ((time >= 12 && time % 12 === 0) ? `${time / 12} 年` : `${time} 月`);
  }
  renew = ({id, productId, customerId, customerName, weimobAccount, dredgeTimes}) => () => {
    let that;
    let oldValues;
    let timer;
    let outThis = this;
    Dialog.open({
      title: '续费业务',
      width: 750,
      height: 600,
      setPropsMerged: false,
      state: {
        itemType: 7,
        productId: null,
        products: null,
        discountRate: 1,
        productAmount: 0,
        serviceAmount: 0,
        isrenew: true
      },
      autodata: {
        product: `/api/product/relation/${productId}`,
        business: `/api/business/bizorder/${id}`,
        businessContacts: `/api/customer/${customerId}/link`,
      },
      formOptions: {
        onValuesChange: (props, value, values) => {
          const {product: {data: {id: productId}}} = that.props;
          const {business: {data: business}} = that.props;
          const {getFieldValue} = that.props.form;
          const {
            dredgeTimes,
            giftStoreCount: oldgiftStoreCount,
            buyStoreCount: oldbuyStoreCount,
          } = business;
          clearTimeout(timer);
          timer = setTimeout(async () => {
            const key = _.first(_.keys(value));
            const originalValue = _.first(_.values(value));
            const normalize = _.get(that.props.form.getFieldInstance(key), 'props.data-__meta.normalize');
            if (_.isFunction(normalize)) {
              values[key] = normalize(originalValue, originalValue, values);
            }

            const {buyStoreCount, buyWechatCount, discountProductAmount, discountServiceAmount} = values;
            const oldStoreCount = oldbuyStoreCount + oldgiftStoreCount;
            const newStoreCount = ((getFieldValue('giftStoreCount') + buyStoreCount) - oldStoreCount >= 0);
            const query = {
              buyStoreCount: buyStoreCount,
              buyWechatCount: buyWechatCount,
              discountProductAmount: discountProductAmount || 0,
              discountServiceAmount: discountServiceAmount || 0,
              relationId: that.state.productId || productId,
              dredgeTimes,
              parentId: id,
              isRenew: true
            };
            if (!_.isEqual(oldValues, query) && checkParames(query) && newStoreCount) {
              oldValues = query;
              const {data = {}} = await request(`/api/business/product/compute`, {query});
              const {discountRate, productAmount, serviceAmount} = data;
              that.setState({discountRate, productAmount, serviceAmount});
            }
          }, 100);
        }
      },
      formProps: {
        action: '/api/business/renew',
        method: 'POST',
        valuesFilter(values) {
          const {businessContacts: {data: contacts}, product: {data: {id: regularId}}} = this.props;
          const {productId} = this.state;
          const contactsItem = contacts.filter(item => (item.id === values.contactsNo));
          const contactsName = contactsItem[0].linkName;
          return _.merge(values, {
            contactsName,
            productId: productId || regularId,
            customerId,
            customerName,
            parentId: id,
            discountRate: 0,
            passRemark: values.remark,
          });
        },
        onSubmitted: (res) => {
          const {data, message: msg} = res;
          const {customerId, current} = outThis.state;
          outThis.setState({expandedRowKeys: []});
          outThis.getsoftware(customerId, current);
          message.success(msg);
        }
      },
      // 选择续费类型
      onItemTypeChange(itemType) {
        const {product: {data, data: {id}}} = this.props;
        this.props.form.resetFields();
        if (itemType !== 7) {
          request(`/api/product/version/${productId}`, {query: {operation: itemType === 6 ? 0 : 1}}).then(({data: products}) => {
            if (products.length) {
              this.setState({itemType, products, productId: _.get(products[0], 'id'), isrenew: true});
            } else {
              this.setState({itemType, products: [], isrenew: false});
            }
          });
        } else {
          this.setState({itemType: 7, productId: id, products: [data], isrenew: true});
        }
        this.setState({discountRate: 1, productAmount: 0, serviceAmount: 0});
      },
      // 选怎产品名称
      onProductChange(productId) {
        this.props.form.resetFields();
        this.setState({productId});
        this.setState({discountRate: 1, productAmount: 0, serviceAmount: 0});
      },
      render() {
        that = this;
        const {itemType, productId, products = [], discountRate, productAmount, serviceAmount, isrenew} = this.state;
        const {
          product: {data: product},
          business: {data: business},
          form: {getFieldDecorator, validateFieldsAndScroll, getFieldsError, getFieldValue, validateFields, setFieldsValue},
          businessContacts: {data: contacts}
        } = this.props;
        if (!product || !business) return null;
        const {
          customerName, productName, serviceTime, giftStoreCount, buyStoreCount, giftWechatCount,
          serviceStartTime, serviceEndTime, weimobAccount, shopName, giftTimes, presentTime, dredgeTimes, buyWechatCount
        } = business;
        let productList = (itemType === 7 ? [product] : products);
        if (!productList.length) {
          productList = [product];
        }
        const options = productList.map(({id: value, name: label, directoryNames}) => ({
          value,
          label: directoryNames + '/' + label
        }));
        const {
          id: currentProductId,
          ...productDetail
        } = _.find(productList, {id: productId}) || productList[0];
        const items = [
          {label: '客户名称', value: customerName},
          {label: '产品名称', value: productName},
          {label: '服务期限', value: outThis.transform(dredgeTimes)},
          {label: '赠送期限', value: outThis.transform(giftTimes)},
          {label: '赠送门店数量', value: giftStoreCount},
          {label: '购买门店数量', value: buyStoreCount},
          {label: '购买微信墙数量', value: buyWechatCount},
          {label: '赠送微信墙数量', value: giftWechatCount},
          {label: '服务开始日期', value: getDate(serviceStartTime)},
          {label: '服务结束日期', value: getDate(serviceEndTime)},
          {label: '微盟注册号', value: weimobAccount},
          {label: '店铺名称', value: shopName},
        ];
        const oldstoreCount = giftStoreCount + buyStoreCount;
        return (
          <div className={styles.scrollBody}>
            <ColumnGroup items={items} col={8}/>
            <Divider/>
            <Row gutter={24}>
              <Col span={12}>
                <FormItem {...formItemLayout} label="续费类型">
                  {getFieldDecorator('itemType', {
                    rules: [{required: true, message: '续费类型'}],
                    initialValue: itemType
                  })(<Select options={itemTypes} onChange={this.onItemTypeChange}/>)}
                </FormItem>
              </Col>
            </Row>
            {
              isrenew &&
              <div>
                <Row gutter={12}>
                  <Col span={24}>
                    <FormItem {...formItem} label="产品名称">
                      {getFieldDecorator('productId', {
                        initialValue: currentProductId,
                        rules: [{required: true, message: '产品名称'}]
                      })(<Select options={options} onChange={this.onProductChange}/>)}
                    </FormItem>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={12}>
                    <FormItem {...formItemLayout} label="服务期限">
                      {getFieldDecorator('dredgeTimes', {
                        initialValue: convertUnit(productDetail.serviceTime),
                        rules: [{required: true, message: '服务期限'}]
                      })(<Input
                        placeholder="服务期限"
                        disabled
                        min={0}
                        addonAfter={(productDetail.serviceTime >= 12 && productDetail.serviceTime % 12 === 0) ? '年' : '月'}
                        style={{width: '100%'}}/>)}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem {...formItemLayout} label="赠送期限">
                      {getFieldDecorator('giftTimes', {
                        initialValue: convertUnit(productDetail.presentTime),
                        rules: [{required: true, message: '赠送期限'}]
                      })(<Input
                        placeholder="赠送期限"
                        disabled min={0}
                        addonAfter={(productDetail.presentTime >= 12 && productDetail.presentTime % 12 === 0) ? '年' : '月'}
                        style={{width: '100%'}}/>)}
                    </FormItem>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={12}>
                    <FormItem {...formItemLayout} label="购买门店数量">
                      {getFieldDecorator('buyStoreCount', {
                        normalize: (value, prevValue) => toSafePositiveInteger(value),
                        rules: [
                          {required: true, message: '购买门店数量'},
                          {
                            validator: (r, v, c) => {
                              const newstoreCount = v + getFieldValue('giftStoreCount');
                              if (oldstoreCount > newstoreCount) {
                                c('续费版本购买门店需大于之前版本');
                              }
                              c();
                            },
                          }
                        ]
                      })(<InputNumber placeholder="购买门店数量"
                                      min={0}
                                      style={{width: '100%'}}/>)}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem {...formItemLayout} label="赠送门店数量">
                      {getFieldDecorator('giftStoreCount', {
                        initialValue: productDetail.storeNum,
                        rules: [{required: true, message: '赠送门店数量'}]
                      })(<InputNumber placeholder="赠送门店数量" min={0} disabled style={{width: '100%'}}/>)}
                    </FormItem>
                  </Col>
                </Row>
                {
                  !productDetail.canBuyWechatWall &&
                  <Row gutter={24}>
                    <Col span={12}>
                      <FormItem {...formItemLayout} label="购买微信墙数">
                        {getFieldDecorator('buyWechatCount', {
                          normalize: (value, prevValue) => toSafePositiveInteger(value),
                          rules: [
                            {required: true, message: '购买微信墙数量'},
                            {
                              validator: (r, v, c) => {
                                if (!(/(^[0-9]\d*$)/.test(v * 1))) {
                                  c('请输入正整数');
                                }
                                c();
                              },
                            }
                          ]
                        })(<InputNumber placeholder="购买微信墙数"
                                        min={0} style={{width: '100%'}}/>)}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...formItemLayout} label="赠送微信墙数量">
                        {getFieldDecorator('giftWechatCount', {
                          initialValue: productDetail.wechatWallNum,
                          rules: [{required: true, message: '赠送微信墙数量'}]
                        })(<InputNumber placeholder="赠送微信墙数量" min={0} disabled style={{width: '100%'}}/>)}
                      </FormItem>
                    </Col>
                  </Row>

                }
                <Row gutter={24}>
                  <Col span={12}>
                    <FormItem {...formItemLayout} label="产品金额">
                      {getFieldDecorator('productAmount', {
                        rules: [{required: true, message: '产品金额'}],
                        initialValue: productAmount,
                      })(<InputNumber placeholder="产品金额" min={0} style={{width: '100%'}} disabled/>)}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem {...formItemLayout} label="服务金额">
                      {getFieldDecorator('serviceAmount', {
                        initialValue: serviceAmount,
                        rules: [{required: true, message: '服务金额'}]
                      })(<InputNumber placeholder="服务金额" disabled style={{width: '100%'}}/>)}
                    </FormItem>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={12}>
                    <FormItem {...formItemLayout} label="产品优惠">
                      {getFieldDecorator('discountProductAmount', {
                        normalize: (value, prevValue, {productAmount}) => toSafePositiveInteger(value, productAmount),
                        rules: [{required: true, message: '产品优惠'}],
                      })(<Input placeholder="请输入产品优惠" style={{width: '100%'}}/>)}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem {...formItemLayout} label="服务优惠">
                      {getFieldDecorator('discountServiceAmount', {
                        normalize: (value, prevValue, {serviceAmount}) => toSafePositiveInteger(value, serviceAmount),
                        rules: [{required: true, message: '服务优惠'}],
                      })(<Input placeholder="请输入服务优惠" style={{width: '100%'}}/>)}
                    </FormItem>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={12}>
                    <FormItem {...formItemLayout} label="折扣率">
                      {getFieldDecorator('discountRate', {
                        rules: [{required: true, message: '折扣率'}],
                        initialValue: getPercent(discountRate),
                      })(<Input placeholder="折扣率" style={{width: '100%'}} disabled/>)}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem {...formItemLayout} label="业务联系人">
                      {getFieldDecorator('contactsNo', {
                        rules: [{required: true, message: '业务联系人'}]
                      })(<Select style={{width: '100%'}} options={contacts} valuePropName="id" labelPropName="linkName"
                      />)}
                    </FormItem>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={24}>
                    <FormItem {...formItem} label="备注">
                      {getFieldDecorator('remark', {})(<TextArea placeholder="备注"/>)}
                    </FormItem>
                  </Col>
                </Row>
              </div>
            }
          </div>
        );
      }
    })
    ;
  };
  // 升级版本
  upgrade = ({id, productId, customerId, customerName, weimobAccount, directoryNames}) => async () => {
    let that;
    let timer;
    let oldValues;
    let outThis = this;
    let once = true;
    Dialog.open({
      title: '升级版本',
      width: 750,
      height: 600,
      setPropsMerged: false,
      state: {productId: null, discountRate: 1, productAmount: 0, serviceAmount: 0},
      autodata: {
        business: `/api/business/bizorder/${id}`,
        businessContacts: `/api/customer/${customerId}/link`,
        products: `/api/product/version/${productId}?operation=1`,
      },
      formOptions: {
        onValuesChange: (props, value, values) => {
          const {business: {data: business}} = that.props;
          const {products: {data: products = []}} = that.props;
          const {id: productId} = products[0];
          const {getFieldValue} = that.props.form;
          const {
            dredgeTimes,
            giftStoreCount: oldgiftStoreCount,
            buyStoreCount: oldbuyStoreCount,
          } = business;
          clearTimeout(timer);
          timer = setTimeout(async () => {
            const key = _.first(_.keys(value));
            const originalValue = _.first(_.values(value));
            const normalize = _.get(that.props.form.getFieldInstance(key), 'props.data-__meta.normalize');
            if (_.isFunction(normalize)) {
              values[key] = normalize(originalValue, originalValue, values);
            }
            const {buyStoreCount, buyWechatCount, discountProductAmount, discountServiceAmount} = values;
            const oldStoreCount = oldbuyStoreCount + oldgiftStoreCount;
            const newStoreCount = ((getFieldValue('giftStoreCount') + buyStoreCount) - oldStoreCount >= 0);
            const query = {
              customerBizId: id,
              buyStoreCount: buyStoreCount,
              buyWechatCount: buyWechatCount,
              discountProductAmount: discountProductAmount || 0,
              discountServiceAmount: discountServiceAmount || 0,
              relationId: that.state.productId || productId,
              parentId: id,
              dredgeTimes
            };
            if (!_.isEqual(oldValues, query) && newStoreCount && checkParames(query)) {
              oldValues = query;
              const {data = {}} = await request(`/api/business/upgrade/compute`, {query});
              const {discountRate, productAmount, serviceAmount} = data;
              that.setState({discountRate, productAmount, serviceAmount});
            }
          }, 200);
        }
      },
      formProps: {
        action: '/api/business/upgrade/version',
        method: 'POST',
        valuesFilter(values) {
          const {products: {data: products = []}} = this.props;
          const {businessContacts: {data: contacts}, business: {data: {giftWechatCount}}, form: {getFieldValue}} = this.props;
          const {id: productId} = products[0];
          const contactsItem = contacts.filter(item => (item.id === values.contactsNo));
          const contactsName = contactsItem[0].linkName;
          return _.merge(values, {
            contactsName,
            weimobAccount,
            productId: this.state.productId || productId,
            parentId: id,
            customerId,
            customerName,
            discountRate: 0,
            passRemark: values.remark,
          });
        },
        onSubmitted: (res) => {
          const {data, message: msg} = res;
          const {customerId, current} = outThis.state;
          outThis.setState({expandedRowKeys: []});
          outThis.getsoftware(customerId, current);
          message.success(msg);
        }
      },
      onProductChange(productId) {
        this.props.form.resetFields();
        this.setState({productId});
        this.setState({discountRate: 1, productAmount: 0, serviceAmount: 0});
      },
      render() {
        that = this;
        const {productId, serviceAmount, discountRate, productAmount} = this.state;
        const {
          business: {data: business},
          products: {data: products},
          form: {getFieldDecorator, validateFieldsAndScroll, getFieldsError, getFieldValue, validateFields, setFieldsValue},
          businessContacts: {data: contacts}
        } = this.props;
        if (!products || !business) return null;
        if (!products.length) {
          once && message.info('暂无可升级版本产品');
          once = false;
          return null
        }
        const {
          customerName, productName, serviceTime, giftStoreCount, buyStoreCount, giftWechatCount,
          serviceStartTime, serviceEndTime, weimobAccount, shopName, presentTime, buyWechatCount, dredgeTimes, giftTimes
        } = business;
        const productList = products;
        const options = productList.map(({id: value, name: label, directoryNames}) => ({
          value,
          label: directoryNames + '/' + label
        }));
        const {
          id: currentProductId, ...productDetail
        } = _.find(productList, {id: productId}) || productList[0];
        const items = [
          {label: '客户名称', value: customerName},
          {label: '产品名称', value: productName},
          {label: '服务期限', value: outThis.transform(dredgeTimes)},
          {label: '赠送期限', value: outThis.transform(giftTimes)},
          {label: '赠送门店数量', value: giftStoreCount},
          {label: '购买门店数量', value: buyStoreCount},
          {label: '购买微信墙数量', value: buyWechatCount},
          {label: '赠送微信墙数量', value: giftWechatCount},
          {label: '服务开始日期', value: getDate(serviceStartTime)},
          {label: '服务结束日期', value: getDate(serviceEndTime)},
          {label: '微盟注册号', value: weimobAccount},
          {label: '店铺名称', value: shopName},
        ];
        const oldstoreCount = giftStoreCount + buyStoreCount;
        return (
          <div className={styles.scrollBody}>
            <ColumnGroup items={items} col={8}/>
            <Divider/>
            <Row gutter={24}>
              <Col span={24}>
                <FormItem {...formItem} label="产品名称">
                  {getFieldDecorator('productId', {
                    initialValue: currentProductId,
                    rules: [{required: true, message: '产品名称'}]
                  })(<Select options={options} onChange={this.onProductChange}/>)}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={12}>
                <FormItem {...formItemLayout} label="服务期限">
                  {getFieldDecorator('dredgeTimes', {
                    initialValue: convertUnit(productDetail.serviceTime),
                  })(<Input placeholder="服务期限"
                            disabled min={0}
                            addonAfter={(productDetail.serviceTime >= 12 && productDetail.serviceTime % 12 === 0) ? '年' : '月'}
                            style={{width: '100%'}}/>)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...formItemLayout} label="赠送期限">
                  {getFieldDecorator('giftTimes', {
                    initialValue: convertUnit(productDetail.presentTime),
                  })(<Input placeholder="赠送期限"
                            addonAfter={(productDetail.serviceTime >= 12 && productDetail.serviceTime % 12 === 0) ? '年' : '月'}
                            disabled min={0} style={{width: '100%'}}/>)}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={12}>
                <FormItem {...formItemLayout} label="赠送门店数量">
                  {getFieldDecorator('giftStoreCount', {
                    initialValue: productDetail.storeNum
                  })(<InputNumber placeholder="赠送门店数量" min={0} disabled style={{width: '100%'}}/>)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...formItemLayout} label="购买门店数量">
                  {getFieldDecorator('buyStoreCount', {
                    normalize: (value, prevValue) => toSafePositiveInteger(value),
                    rules: [
                      {required: true, message: '购买门店数量'},
                      {
                        validator: (r, v, c) => {
                          const newstoreCount = v + getFieldValue('giftStoreCount');
                          if (oldstoreCount > newstoreCount) {
                            c('升级版本购买门店需大于之前版本');
                          }
                          c();
                        },
                      }

                    ]
                  })(<Input
                    placeholder="购买门店数量"
                    style={{width: '100%'}}/>)}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={12}>
                <FormItem {...formItemLayout} label="赠送微信墙数量">
                  {getFieldDecorator('giftWechatCount', {
                    initialValue: productDetail.wechatWallNum,
                  })(<InputNumber
                    placeholder="赠送微信墙数量"
                    min={0}
                    disabled style={{width: '100%'}}/>)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...formItemLayout} label="购买微信墙数">
                  {getFieldDecorator('buyWechatCount', {
                    normalize: (value, prevValue) => toSafePositiveInteger(value),
                    rules: [
                      {required: true, message: '购买微信墙数'}
                    ]
                  })(<Input
                    placeholder="购买微信墙数"
                    style={{width: '100%'}}/>)}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={12}>
                <FormItem {...formItemLayout} label="产品金额">
                  {getFieldDecorator('productAmount', {
                    rules: [{required: true, message: '产品金额'}],
                    initialValue: productAmount,
                  })(<InputNumber placeholder="产品金额" min={0} style={{width: '100%'}} disabled/>)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...formItemLayout} label="服务金额">
                  {getFieldDecorator('serviceAmount', {
                    initialValue: serviceAmount,
                    rules: [{required: true, message: '服务金额'}]
                  })(<InputNumber placeholder="服务金额" disabled style={{width: '100%'}}/>)}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={24}>
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
                            callback('不能大于产品金额！');
                          }
                          callback();
                        }
                      }],
                  })(<Input placeholder="产品优惠"
                            min={0} style={{width: '100%'}}/>)}
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
                          if (value && value > getFieldValue('serviceAmount')) {
                            callback('服务优惠不能大于服务金额');
                          }
                          callback();
                        }
                      }
                    ],
                  })(<Input placeholder="服务优惠"
                            style={{width: '100%'}}/>)}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={12}>
                <FormItem {...formItemLayout} label="折扣率">
                  {getFieldDecorator('discountRate', {
                    rules: [{required: true, message: '折扣率'}],
                    initialValue: getPercent(discountRate),
                  })(<Input placeholder="折扣率" style={{width: '100%'}} disabled/>)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...formItemLayout} label="业务联系人">
                  {getFieldDecorator('contactsNo', {
                    rules: [{required: true, message: '业务联系人'}]
                  })(<Select style={{width: '100%'}} options={contacts} valuePropName="id" labelPropName="linkName"
                  />)}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={24}>
                <FormItem {...formItem} label="备注">
                  {getFieldDecorator('remark', {})(<TextArea placeholder="备注"/>)}
                </FormItem>
              </Col>
            </Row>
          </div>
        );
      }
    });
  };
  // 升级系列
  series = ({id, productId, customerId, customerName, weimobAccount}) => async () => {
    let that;
    let timer;
    let oldValues;
    let outThis = this;
    let once = true;
    Dialog.open({
      title: '升级系列',
      width: 750,
      height: 600,
      setPropsMerged: false,
      state: {productId: null, discountRate: 1, productAmount: 0, serviceAmount: 0},
      autodata: {
        productSeries: `/api/product/series/${productId}`,
        business: `/api/business/bizorder/${id}`,
        businessContacts: `/api/customer/${customerId}/link`,
      },
      formOptions: {
        onValuesChange: (props, value, values) => {
          const {business: {data: business}} = that.props;
          const {getFieldValue} = that.props.form;
          const {
            dredgeTimes,
            giftStoreCount: oldgiftStoreCount,
            buyStoreCount: oldbuyStoreCount,
          } = business;
          const {productSeries: {data: productSeries = []}} = that.props;
          const {id: productId} = productSeries[0];
          clearTimeout(timer);
          timer = setTimeout(async () => {
            const key = _.first(_.keys(value));
            const originalValue = _.first(_.values(value));
            const normalize = _.get(that.props.form.getFieldInstance(key), 'props.data-__meta.normalize');
            if (_.isFunction(normalize)) {
              values[key] = normalize(originalValue, originalValue, values);
            }
            const {buyStoreCount = 0, buyWechatCount = 0, discountProductAmount = 0, discountServiceAmount = 0} = values;
            const oldStoreCount = oldbuyStoreCount + oldgiftStoreCount;
            const newStoreCount = ((getFieldValue('giftStoreCount') + buyStoreCount) - oldStoreCount >= 0);
            const query = {
              buyStoreCount,
              customerBizId: id,
              buyWechatCount: buyWechatCount,
              discountProductAmount: discountProductAmount || 0,
              discountServiceAmount: discountServiceAmount || 0,
              relationId: that.state.productId || productId,
              dredgeTimes,
              parentId: id,
            };
            if (!_.isEqual(oldValues, query) && checkParames(query) && newStoreCount) {
              oldValues = query;
              const {data = {}} = await request(`/api/business/upgrade/compute`, {query});
              const {discountRate, productAmount, serviceAmount} = data;
              that.setState({discountRate, productAmount, serviceAmount});
            }
          }, 100);
        }
      },
      formProps: {
        action: '/api/business/upgrade/series',
        method: 'POST',
        valuesFilter(values) {
          const {businessContacts: {data: contacts}} = this.props;
          const {productSeries: {data: productSeries = []}} = this.props;
          const {id: productId} = productSeries[0];
          const contactsItem = contacts.filter(item => (item.id === values.contactsNo));
          const contactsName = contactsItem[0].linkName;
          return _.merge(values, {
            contactsName,
            weimobAccount,
            productId: this.state.productId || productId,
            parentId: id,
            customerId,
            customerName,
            discountRate: 0,
            passRemark: values.remark,
          });
        },
        onSubmitted: (res) => {
          const {data, message: msg} = res;
          const {customerId, current} = outThis.state;
          outThis.setState({expandedRowKeys: []});
          outThis.getsoftware(customerId, current);
          message.success(msg);
        }
      },
      onProductChange(productId) {
        this.props.form.resetFields();
        this.setState({productId});
        this.setState({discountRate: 1, productAmount: 0, serviceAmount: 0});
      },
      render() {
        that = this;
        const {itemType, productId, discountRate, productAmount, serviceAmount} = this.state;
        const {
          productSeries: {data: productSeries},
          business: {data: business},
          form: {getFieldDecorator, validateFieldsAndScroll, getFieldsError, getFieldValue, validateFields, setFieldsValue},
          businessContacts: {data: contacts}
        } = this.props;
        if (!productSeries || !business) return null;
        if (!productSeries.length) {
          once && message.info(' 暂无可升级系列产品');
          once = false;
          return null
        }
        const {
          customerName, productName, serviceTime, giftStoreCount, buyStoreCount, giftWechatCount, buyWechatCount,
          serviceStartTime, serviceEndTime, weimobAccount, shopName, presentTime, dredgeTimes, giftTimes
        } = business;
        const productSeriesList = productSeries;
        const options = productSeries.map(({id: value, name: label, directoryNames}) => ({
          value,
          label: directoryNames + '/' + label
        }));
        const {
          id: currentProductId, ...productDetail
        } = _.find(productSeriesList, {id: productId}) || productSeriesList[0];
        const items = [
          {label: '客户名称', value: customerName},
          {label: '产品名称', value: productName},
          {label: '服务期限', value: outThis.transform(dredgeTimes)},
          {label: '赠送期限', value: outThis.transform(giftTimes)},
          {label: '赠送门店数量', value: giftStoreCount},
          {label: '购买门店数量', value: buyStoreCount},
          {label: '购买微信墙数量', value: buyWechatCount},
          {label: '赠送微信墙数量', value: giftWechatCount},
          {label: '服务开始日期', value: getDate(serviceStartTime)},
          {label: '服务结束日期', value: getDate(serviceEndTime)},
          {label: '微盟注册号', value: weimobAccount},
          {label: '店铺名称', value: shopName},
        ];
        const oldstoreCount = giftStoreCount + buyStoreCount;
        return (
          <div className={styles.scrollBody}>
            <ColumnGroup items={items} col={8}/>
            <Divider/>
            <Row gutter={12}>
              <Col span={24}>
                <FormItem {...formItem} label="产品名称">
                  {getFieldDecorator('productId', {
                    initialValue: currentProductId,
                    rules: [{required: true, message: '产品名称'}]
                  })(<Select options={options} onChange={this.onProductChange}/>)}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={12}>
                <FormItem {...formItemLayout} label="服务期限">
                  {getFieldDecorator('dredgeTimes', {
                    initialValue: convertUnit(productDetail.serviceTime),
                    rules: [{required: true, message: '服务期限'}]
                  })(<Input placeholder="服务期限"
                            disabled
                            addonAfter={(productDetail.serviceTime >= 12 && productDetail.serviceTime % 12 === 0) ? '年' : '月'}
                            style={{width: '100%'}}/>)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...formItemLayout} label="赠送期限">
                  {getFieldDecorator('giftTimes', {
                    initialValue: convertUnit(productDetail.presentTime),
                    rules: [{required: true, message: '赠送期限'}]
                  })(<Input placeholder="赠送期限"
                            disabled
                            addonAfter={(productDetail.serviceTime >= 12 && productDetail.serviceTime % 12 === 0) ? '年' : '月'}
                            style={{width: '100%'}}/>)}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={12}>
                <FormItem {...formItemLayout} label="赠送门店数量">
                  {getFieldDecorator('giftStoreCount', {
                    initialValue: productDetail.storeNum,
                    rules: [{required: true, message: '赠送门店数量'}]
                  })(<InputNumber placeholder="赠送门店数量" min={0} disabled style={{width: '100%'}}/>)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...formItemLayout} label="购买门店数量">
                  {getFieldDecorator('buyStoreCount', {
                    normalize: (value, prevValue) => toSafePositiveInteger(value),
                    rules: [
                      {required: true, message: '购买门店数量'},
                      {
                        validator: (r, v, c) => {
                          const newstoreCount = v + getFieldValue('giftStoreCount');
                          if (oldstoreCount > newstoreCount) {
                            c('升级系列购买门店需大于之前系列');
                          }
                          c();
                        },
                      }
                    ]
                  })(<Input
                    placeholder="购买门店数量"
                    style={{width: '100%'}}/>)}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={12}>
                <FormItem {...formItemLayout} label="购买微信墙数">
                  {getFieldDecorator('buyWechatCount', {
                    normalize: (value, prevValue) => toSafePositiveInteger(value),
                    rules: [{required: true, message: '购买微信墙数'}]
                  })(<Input placeholder="购买微信墙数"
                            min={0} style={{width: '100%'}}/>)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...formItemLayout} label="赠送微信墙数量">
                  {getFieldDecorator('giftWechatCount', {
                    initialValue: productDetail.wechatWallNum,
                    rules: [{required: true, message: '赠送微信墙数量'}]
                  })(<InputNumber placeholder="赠送微信墙数量" min={0} disabled style={{width: '100%'}}/>)}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={12}>
                <FormItem {...formItemLayout} label="产品金额">
                  {getFieldDecorator('productAmount', {
                    rules: [{required: true, message: '产品金额'}],
                    initialValue: productAmount,
                  })(<InputNumber placeholder="产品金额" min={0} style={{width: '100%'}} disabled/>)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...formItemLayout} label="服务金额">
                  {getFieldDecorator('serviceAmount', {
                    initialValue: serviceAmount,
                    rules: [{required: true, message: '服务金额'}]
                  })(<InputNumber placeholder="服务金额" disabled style={{width: '100%'}}/>)}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={24}>
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
                            callback('不能大于产品金额！');
                          }
                          callback();
                        }
                      }],
                  })(<Input
                    placeholder="产品优惠"
                    style={{width: '100%'}}/>)}
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
                          if (value && value > getFieldValue('serviceAmount')) {
                            callback('服务优惠不能大于服务金额');
                          }
                          callback();
                        }
                      }
                    ],
                  })(<Input
                    placeholder="服务优惠"
                    style={{width: '100%'}}/>)}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={12}>
                <FormItem {...formItemLayout} label="折扣率">
                  {getFieldDecorator('discountRate', {
                    rules: [{required: true, message: '折扣率'}],
                    initialValue: getPercent(discountRate),
                  })(<Input placeholder="折扣率" style={{width: '100%'}} disabled/>)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...formItemLayout} label="业务联系人">
                  {getFieldDecorator('contactsNo', {
                    rules: [{required: true, message: '业务联系人'}]
                  })(<Select style={{width: '100%'}} options={contacts} valuePropName="id" labelPropName="linkName"
                  />)}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={24}>
                <FormItem {...formItem} label="备注">
                  {getFieldDecorator('remark', {})(<TextArea placeholder="备注"/>)}
                </FormItem>
              </Col>
            </Row>
          </div>
        );
      }
    });
  };
  // 弹出model
  hadleClick = (record, visible) => () => {
    this.setState({
      relationId: record.productId,
      parentId: record.id,
      visible
    });
  };
  expandedRowRender = (record) => {
    const {businesses, loading, id} = record;
    const column = [
      {title: '业务类型', dataIndex: 'itemType', width: 100, render: getBusinessStatus},
      {title: '软件系列', width: 100, dataIndex: 'softwareSerieName'},
      {title: '销售版本', width: 100, dataIndex: 'saleVersionName'},
      {
        title: '购买 / 赠送', width: 100, dataIndex: 'chargeUnit',
        render: getServiceDuration
      },
      {
        title: '产品金额',
        width: 100,
        dataIndex: 'productAmount',
        render: (text, record) => {
          return getCurrency(text - record.discountProductAmount);
        }
      },
      {
        title: '服务金额',
        width: 100,
        dataIndex: 'serviceAmount',
        render: (text, record) => {
          return getCurrency(text - record.discountServiceAmount);
        }
      },
      {
        title: '回款金额',
        width: 100,
        dataIndex: 'paymentAmount',
        render: getCurrency
      },
      {
        title: '回款状态',
        width: 100,
        dataIndex: 'backPayStatus',
        render: getBackpayStatus
      },
      {
        title: '业务状态',
        width: 100,
        dataIndex: 'orderStatus',
        render: getOrderStatus
      },
      {
        title: '软件开通日期',
        width: 100,
        dataIndex: 'establishTime',
        render: getDate
      },
      {
        title: '服务开始日期',
        width: 100,
        dataIndex: 'serviceStartTime',
        render: getDate
      },
      {
        title: '服务结束日期',
        width: 100,
        dataIndex: 'serviceEndTime',
        render: getDate
      },
      {
        title: '服务作废日期',
        width: 100,
        dataIndex: 'cancelTime',
        render: getDate
      },
      {
        title: '合同关联',
        width: 100,
        dataIndex: 'contractNo',
      },
      {
        title: '发票关联',
        width: 100,
        dataIndex: 'invoiceNo',
      },
      {
        title: '创建人',
        width: 100,
        dataIndex: 'createUser',
      }, {
        title: '操作',
        width: 350,
        fixed: 'right',
        dataIndex: 'operate',
        render: (text, record) => {
          const {can, service=[]} = this.props;
          return (
            <div className={common.operate}>
              {
                //
                can([10005003, service]) && record.productTypeId === 1 && record.orderStatus === 4 && record.chargeMode === 1 && !record.canRenew && !!service.length &&
                < span className={common.item} onClick={this.renew(record)}>续费</span>
              }
              {
                can([10005004, service]) && !record.canUpgradeVersion && record.orderStatus === 4 && record.productTypeId === 1 && record.chargeMode === 1 && !!service.length &&
                < span className={common.item} onClick={this.upgrade(record)}>升版本</span>
              }
              {
                can([10005005, service]) && !record.canUpgradeSeries && record.orderStatus === 4 && !!service.length &&
                <span className={common.item} onClick={this.series(record)}>升系列</span>
              }
              {
                can([10005006, service]) && !record.canBuyStore && record.orderStatus === 4 && !!service.length &&
                <span className={common.item} onClick={this.hadleClick(record, 3)}>加门店</span>
              }
              {
                can([10005007, service]) && !record.canBuyWechatWall && record.orderStatus === 4 && !!service.length &&
                <span className={common.item} onClick={this.hadleClick(record, 2)}>加微信墙</span>
              }
              {
                can([10005009, service]) && !!service.length &&
                <Link className={common.item} to={`/aftersale/business/${record.id}`}>查看</Link>
              }
              {
                can([10005010, service]) &&
                record.backPayStatus === -2 && !!service.length &&
                <span className={common.item} onClick={this.edit(id, record)}>编辑</span>
              }
              {
                can([10005011, service]) &&
                record.backPayStatus === -2 && !!service.length &&
                < Popconfirm placement="leftTop" title='确定要删除该项业务？' onConfirm={this.del(id, record)} okText="确认"
                             className={common.item}
                             cancelText="取消">
                  <span className={common.item}>删除</span>
                </Popconfirm>
              }
              {
                can([10005008], service) && !!service.length &&
                (record.orderStatus === 0 || record.orderStatus === 1) && (record.backPayStatus === 0 || record.backPayStatus === 1 || record.backPayStatus === 2) &&
                < Popconfirm placement="leftTop" title='确认开通？' onConfirm={this.open(id, record)} okText="确认"
                             cancelText="取消">
                  <span className={common.item}>开通</span>
                </Popconfirm>
              }
            </div>
          );
        }
      }
    ];
    return (
      <Table
        columns={column}
        dataSource={businesses}
        pagination={false}
        loading={loading}
        rowKey="id"
      />
    );
  };

  componentDidMount() {
    const {customerId} = this.props;
    if (customerId) {
      this.setState({customerId});
      this.getsoftware(customerId);
    }
  }

  componentWillReceiveProps({customerId}) {
    if (customerId !== this.props.customerId && customerId) {
      this.setState({customerId});
      this.getsoftware(customerId);
    }
  }

  // 编辑
  edit = (parentId, record) => () => {
    const {id} = record;
    const {props: {customerId}, state: {current: page}} = this;
    Dialog.open({
      title: '联系人编辑',
      formProps: {
        action: `/api/business/${id}/updateLink`,
        method: 'PUT',
        onSubmitted: ({message: msg}) => {
          message.success(msg);
          this.getBusinesses(parentId, true);
        }
      },
      render({props: {form: {getFieldDecorator}}}) {
        return (
          <div>
            <FormItem {...formItem} label="联系人名称">
              {getFieldDecorator('contactsName', {
                initialValue: record.contactsName ? record.contactsName : '',
                rules: [{required: true, message: '联系人名称'}]
              })(<Input placeholder="联系人名称"/>)}
            </FormItem>
            <FormItem {...formItem} label="联系人编号">
              {getFieldDecorator('contactsNo', {
                initialValue: record.contactsNo ? record.contactsNo : '',
              })(<Input placeholder="联系人编号"/>)}
            </FormItem>
            <FormItem {...formItem} label="备注">
              {getFieldDecorator('remark', {
                initialValue: record.remark ? record.remark : '',
              })(<Input placeholder="备注"/>)}
            </FormItem>
          </div>
        );
      }
    });
  };

  // 删除业务
  del = (parentId, {id}) => async () => {
    // const {props: {customerId}, state: {current: page}} = this;
    await request(`/api/orderOper/delete/${id}`, {method: 'PUT'});
    this.getBusinesses(parentId, true);
  };

  getBusinesses = async (id, force) => {
    const {softList} = this.state;
    const soft = _.find(softList, {id});
    if (force || _.isUndefined(soft.businesses)) {
      soft.loading = true;
      this.setState({softList: [].concat(softList)});
      const {data: businesses} = await request(`api/orderOper/${id}/orderItems`);
      Object.assign(soft, {loading: false, businesses});
      this.setState({softList: [].concat(softList)});
    }
  };
  // 开通业务
  open = (parentId, {id}) => async () => {
    // const {props: {customerId}, state: {current: page}} = this;
    const {data, message: msg, code} = await request(`/api/orderOper/openSubmit/${id}`, {
      method: 'POST',
      body: {passRemark: '业务开通'}
    });
    code === 0 && message.success(msg);
    this.getBusinesses(parentId, true);
  };

  unfold = async (expanded, {id}) => {
    expanded && this.getBusinesses(id);
    this.setState({expandedRowKeys: expanded ? [id] : []});
  };
  // 业务列表
  getsoftware = async (customerId, page = 1, pageSize = 10) => {
    this.setState({loading: true});
    const {data, pagination} = await request(`/api/orderOper/${customerId}/orderItemsTab?productType=` + 1, {
      query: {page, pageSize}
    });
    this.setState({
      softList: data ? data : [],
      pagination,
      current: pagination.page,
      loading: false
    });
  };
  paging = (page, pageSize) => {
    const {customerId} = this.props;
    this.setState({
      current: page,
      loading: true
    });
    customerId && this.getsoftware(customerId, page);
  };
  // 关闭弹窗
  handleCancel = () => {
    this.setState({
      visible: false,
    });
  };

  render() {
    const {columns} = this;
    const {can, customername, customerId, service} = this.props;
    const {
      productMenu, productInfo, visible, product,
      softList: dataSource,
      pagination: paginfo, current, loading, relationId, parentId,
      expandedRowKeys = []
    } = this.state;
    const mainParentId = expandedRowKeys[0];
    const {page, pageCount, pageSize, totalCount: total} = paginfo;
    const pagination = {
      current,
      pageSize,
      total,
      onChange: this.paging,
    };
    const tableProps = {
      rowKey: 'id',
      columns,
      dataSource,
      loading,
      pagination,
      expandedRowKeys,
      expandedRowRender: this.expandedRowRender,
      onExpand: this.unfold
    };
    return (
      <div>
        <div className={common.btnBox + ' ' + styles.margin}>
          {
            can([10005002, service]) && !!service.length &&
            <Button type='primary' onClick={() => {
              this.setState({visible: 1});
            }}>新开业务</Button>
          }
        </div>
        <Table {...tableProps} scroll={{x: 2050}}/>
        {
          visible === 1 &&
          <NewOpen
            title="新开业务"
            visible={visible === 1}
            okText="确定"
            width={700}
            type={1}
            page={current}
            getsoftware={this.getsoftware}
            customername={customername}
            customerId={customerId}
            onCancel={this.handleCancel}
            mainParentId={mainParentId}
            getBusinesses={this.getBusinesses}
          />
        }
        {
          visible === 2 &&
          <WeChat
            title="加微信墙"
            visible={visible === 2}
            okText="确定"
            width={700}
            type="1"
            customername={customername}
            relationId={relationId}
            customerId={customerId}
            onCancel={this.handleCancel}
            parentId={parentId}
            mainParentId={mainParentId}
            getBusinesses={this.getBusinesses}
            page={current}
            getsoftware={this.getsoftware}
          />
        }
        {
          visible === 3 &&
          <AddShop
            title="加门店"
            visible={visible === 3}
            okText="确定"
            width={700}
            type="1"
            customername={customername}
            relationId={relationId}
            customerId={customerId}
            onCancel={this.handleCancel}
            parentId={parentId}
            mainParentId={mainParentId}
            getBusinesses={this.getBusinesses}
            page={current}
            getsoftware={this.getsoftware}
          />
        }
      </div>
    );
  }
}
