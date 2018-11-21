import React, {Component, Fragment} from 'react';
import {connect} from 'dva';
import {Form, Input, Select, Modal, Row, Col, InputNumber, message, Spin} from 'antd';
import Product from '../../../../components/Product';
import {request} from '../../../../utils/';
import {getProductType} from "../../../../utils/helpers";

const {TextArea} = Input;
const itemLayout = {
  labelCol: {span: 8},
  wrapperCol: {span: 14},
};
const {Option} = Select;
@Form.create()
@connect(state => (
  {
    fetchingOptions: state.loading.effects['saleRetail/querySelectOptions'],
  }
))
export default class CreateBusinessModal extends Component {
  constructor(props) {
    super(props);
    this.getShopName = this.getShopName.bind(this);
  }
  lastWeimobAccount = null;
  state = {
    productDetail: null,
    productTypeId: null,
    followRecordsContacts: [],
    loading: false,
    shopInfo: [],
  }
  getProductDetail = async (id, pro) => {
    const {form: {setFieldsValue}} = this.props;
    const {relationId = ''} = pro;
    let productDetail = await request(`/api/product/relation/${relationId}`);
    if (productDetail.code === 0 && productDetail.data) {
      productDetail = productDetail.data;
      this.setState({productDetail}, () => {
        setFieldsValue({
          productName: pro.name,
          productId: pro.relationId,
        })
      });
    }
  }

  getSelectOptions(type) {
    if (this.state[type].length === 0) { // 选项为空
      this.props.dispatch({
        type: 'saleRetail/querySelectOptions',
        payload: {type, id: this.props.id},
      }).then((val) => {
        if (val) {
          this.setState({
            [type]: val,
          });
        }
      });
    }
  }
  async getShopName(){
    const { form: { getFieldValue, setFieldsValue } } = this.props;
    const weimobAccount = getFieldValue('weimobAccount');
    if (weimobAccount && this.lastWeimobAccount !== weimobAccount) {
      const res = await request(`/api/business/${weimobAccount}/store`)
      if (res.code == 0) {
        this.setState({
          shopInfo: res.data || [],
        })
      }
    }
    if(!weimobAccount) {
      this.setState({ shopInfo :[] });
      setFieldsValue({ shop: [] })
    }
    this.lastWeimobAccount = weimobAccount;
  }
  showTotal = (countWay) => {
    const { getFieldsValue } = this.props.form;
    let { type, chargeMode, price, servicePrice, storeNum, wechatWallNum } = this.state.productDetail; // chargeMode: 1服务期限类 2产品数量类, type: 1软件产品 2硬件产品 3增值产品
    // price 价格, servicePrice 服务价格, storeNum 包含门店 , wechatWallNum 包含微信
    let { discountRate = 0, productAmount = 0, buyStoreCount = 0, buyWechatCount = 0, dredgeTimes = 0, discountProductAmount = 0, discountServiceAmount = 0 } = getFieldsValue();
    if( countWay=='productPrice' ) {
      if ( type == 1 ) {
        let wechatTotal = buyWechatCount*100;
        let stroeAmount = 0;
        if( chargeMode == 1 ) {
          let i =0;
          while ( buyStoreCount>0 ){
            i++;
            if( storeNum == 0 ){
              buyStoreCount--;
              if(i<=10){
                stroeAmount += buyStoreCount*1000;
              }else if(i > 10 && i <= 50){
                stroeAmount += buyStoreCount*600;
              }else{
                stroeAmount += buyStoreCount*300;
              }
            }else {
              storeNum--;
            }
          }
          console.info(buyStoreCount,stroeAmount);
          return productAmount = stroeAmount + wechatTotal + price;
        }else if ( chargeMode == 2 ) {
          return productAmount = dredgeTimes * price;
        }
      } else if( type == 2) {
        return productAmount = dredgeTimes * price;
      } else {
        return productAmount = price;
      }
    }
    if( countWay=='discount' ) {
      if(type==1){
        if(chargeMode==1){
          discountRate = (( productAmount +servicePrice ) - ( discountProductAmount + discountServiceAmount ))/(productAmount+servicePrice)
          return discountRate = 0 ? 0 : ((discountRate).toFixed(2))*1;
        }else if(chargeMode==2){
          discountRate = (( productAmount +servicePrice ) - ( discountProductAmount + discountServiceAmount ))/(productAmount+servicePrice)
          return discountRate = 0 ? 0 : ((discountRate).toFixed(2))*1;
        }
      }else if(type ==2) {
        discountRate = (( productAmount +servicePrice ) - ( discountProductAmount + discountServiceAmount ))/(productAmount+servicePrice)
        return discountRate = 0 ? 0 : ((discountRate).toFixed(2))*1;
      }else if(type==3) {
        discountRate = (( productAmount - discountProductAmount) + ( servicePrice - discountServiceAmount ))/(productAmount+servicePrice)
        return discountRate = 0 ? 0 : ((discountRate).toFixed(2))*1;
      }
    }
  }
  renderProductDetail() {

    const {productDetail, followRecordsContacts, loading, shopInfo} = this.state;
    if (!productDetail) {
      return null
    }
    const {chargeMode} = productDetail;
    const {
      currentDetail,
      form:
        {
          getFieldDecorator, validateFields, getFieldValue,
        }, fetchingOptions, ...modalProps
    } = this.props;
    const {customerName} = currentDetail;
    getFieldDecorator('productName', {
      initialValue : ''
    });
    getFieldDecorator('productId', {
      initialValue : ''
    });
    return (
      <Spin spinning={loading}>
        {
          productDetail && productDetail.type ==1 &&
          <div>
            {
              chargeMode !== undefined && chargeMode == 1 &&
              <div>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="服务期限" {...itemLayout}>
                      {getFieldDecorator('dredgeTimes', {
                        initialValue: productDetail.serviceTime,
                        rules: [{required: true, message: '请填写服务期限'}],
                      })(
                        <InputNumber
                          style={{width: '170px'}}
                          min={0}
                          disabled
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="赠送期限" {...itemLayout}>
                      {getFieldDecorator('giftTimes', {
                        initialValue: productDetail.presentTime,
                        rules: [{required: true, message: '请填写赠送期限'}],
                      })(
                        <InputNumber style={{width: '170px'}} min={0} disabled/>
                      )}
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="赠送门店数量" {...itemLayout}>
                      {getFieldDecorator('giftStoreCount', {
                        initialValue: productDetail.storeNum,
                        rules: [{required: true, message: '请选择赠送门店数量'}],
                      })(
                        <InputNumber style={{width: '170px'}} min={0} disabled/>
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="购买门店数量" {...itemLayout}>
                      {getFieldDecorator('buyStoreCount', {
                        initialValue: 0,
                        rules: [{required: true, message: '请选择购买门店数量'}],
                      })(
                        <InputNumber
                          style={{width: '170px'}}
                          min={0}
                        />
                      )}
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="赠送微信墙数量" {...itemLayout}>
                      {getFieldDecorator('giftWechatCount', {
                        initialValue: productDetail.wechatWallNum,
                        rules: [{required: true, message: '请选择购买门店数量'}],
                      })(
                        <InputNumber style={{width: '170px'}} min={0} disabled/>
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="购买微信墙数量" {...itemLayout}>
                      {getFieldDecorator('buyWechatCount', {
                        initialValue: 0,
                        rules: [{required: true, message: '请选择购买微信墙数量'}],
                      })(
                        <InputNumber
                          style={{width: '170px'}}
                          min={0}
                        />
                      )}
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            }
            {
              chargeMode !== undefined && chargeMode == 2 &&
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="产品数量" {...itemLayout}>
                    {getFieldDecorator('dredgeTimes', {
                      initialValue: 1,
                      rules: [{required: true, message: '请填写产品数量'}],
                    })(
                      <InputNumber
                        style={{width: '170px'}}
                        min={1}
                      />
                    )}
                  </Form.Item>
                </Col>
              </Row>
            }
          </div>
        }
        {
          productDetail && productDetail.type ==2 &&
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="产品数量" {...itemLayout}>
                {getFieldDecorator('dredgeTimes', {
                  initialValue: 1,
                  rules: [{required: true, message: '请填写产品数量'}],
                })(
                  <InputNumber
                    style={{width: '170px'}}
                    min={1}
                  />
                )}
              </Form.Item>
            </Col>
          </Row>
        }
        {
          productDetail && productDetail.type ==3 &&
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="产品数量" {...itemLayout}>
                {getFieldDecorator('dredgeTimes', {
                  initialValue: 1,
                  rules: [{required: true, message: '请填写产品数量'}],
                })(
                  <InputNumber
                    style={{width: '170px'}}
                    min={1}
                  />
                )}
              </Form.Item>
            </Col>
          </Row>
        }
        {
          productDetail && productDetail.type ==3 &&
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="服务期限" {...itemLayout}>
                {getFieldDecorator('dredgeTimes', {
                  initialValue: productDetail.serviceTime,
                  rules: [{required: true, message: '请填写服务期限'}],
                })(
                  <InputNumber style={{width: '170px'}} min={0} disabled/>
                )}
              </Form.Item>
            </Col>
            <Col span={12} />
          </Row>
        }
      </Spin>
    )
  }
  renderCountInfo() {
    const { productDetail } = this.state;
    if (!productDetail) {
      return null
    }
    const {
      currentDetail,
      form:
        {
          getFieldDecorator, validateFields, getFieldValue,
        }, fetchingOptions, ...modalProps
    } = this.props;
    return (
      <div>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="产品金额" {...itemLayout}>
              {getFieldDecorator('productAmount', {
                initialValue: this.showTotal('productPrice'),
                rules: [{required: true, message: '请填写产品金额'}],
              })(
                <InputNumber
                  style={{width: '170px'}}
                  min={0}
                  disabled
                />
              )}
            </Form.Item>
          </Col>
          {
            (productDetail.type == 1 || productDetail.type == 3) &&
            <Col span={12}>
              <Form.Item label="服务金额" {...itemLayout}>
                {getFieldDecorator('serviceAmount', {
                  initialValue: productDetail.servicePrice,
                  rules: [{required: true, message: '请填写服务金额'}],
                })(
                  <InputNumber style={{width: '170px'}} disabled/>
                )}
              </Form.Item>
            </Col>
          }
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="产品优惠金额" {...itemLayout}>
              {getFieldDecorator('discountProductAmount', {
                initialValue: 0,
                rules: [
                  // {
                  //   required: true,
                  // },
                  {validator: (rule, value, callback) =>{
                      const { getFieldValue } = this.props.form;
                      if (value && value > getFieldValue('productAmount') ) {
                        callback('不能大于产品金额！')
                      }
                      callback()
                    }}
                ],
              })(
                <InputNumber
                  style={{width: '170px'}}
                  min={0}
                />
              )}
            </Form.Item>
          </Col>
          {
            (productDetail.type == 1 || productDetail.type == 3) &&
            <Col span={12}>
              <Form.Item label="服务优惠金额" {...itemLayout}>
                {getFieldDecorator('discountServiceAmount', {
                  initialValue: 0,
                  rules: [
                    // {
                    //   required: true,
                    // },
                    {
                      validator: (rule, value, callback) =>{
                        const { getFieldValue } = this.props.form;
                        if (value && value > getFieldValue('serviceAmount') ) {
                          callback('不能大于服务金额！')
                        }
                        callback()
                      }
                    }
                  ],
                })(
                  <InputNumber
                    style={{width: '170px'}}
                    min={0}
                  />
                )}
              </Form.Item>
            </Col>
          }
        </Row>
        <Row gutter={16}>
          <Col span={24} pull={4}>
            <Form.Item label="折扣率" {...itemLayout}>
              {getFieldDecorator('discountRate', {
                initialValue: this.showTotal('discount'),
                rules: [{required: true, message: '请选择客户名称'}],
              })(
                <Input
                  style={{width: '170px'}}
                  disabled
                  min={0}
                />
              )}
            </Form.Item>
          </Col>
        </Row>
      </div>
    )
  }
  renderWeiMobAccount() {
    const {productDetail, followRecordsContacts, loading, shopInfo} = this.state;
    if (!productDetail) {
      return null
    }
    const {chargeMode} = productDetail;
    const {
      currentDetail,
      form:
        {
          getFieldDecorator, validateFields, getFieldValue,
        }, fetchingOptions, ...modalProps
    } = this.props;
    const {customerName} = currentDetail;
    return (
      <div>
        {
          productDetail.type == 1 &&
          <Row gutter={16}>
            <Col span={24} pull={4}>
              <Form.Item label="微盟注册账号" {...itemLayout}>
                {getFieldDecorator('weimobAccount', {
                  rules: [{required: true, message: '请填写微盟账号'}],
                })(
                  <Input onBlur={this.getShopName}/>
                )}
              </Form.Item>
            </Col>
          </Row>
        }
        {
          productDetail.type == 1 && productDetail.softwareSeries == 1 &&
          <Row gutter={16}>
            <Col span={24} pull={4}>
              <Form.Item label="店铺名称" {...itemLayout}>
                {getFieldDecorator('shop', {
                  rules: [{required: true, message: '请选择店铺名称'}],
                })(
                  <Select>
                    {
                      shopInfo.map(_ => (
                        <Option value={`${_.id}-${_.merchantName}`} key={_.id}>{_.merchantName}</Option>
                      ))
                    }
                  </Select>
                )}
              </Form.Item>
            </Col>
          </Row>
        }
      </div>
    )
  }
  renderLinkMan() {
    const {productDetail, followRecordsContacts, loading, shopInfo} = this.state;
    if (!productDetail) {
      return null
    }
    const {
      currentDetail,
      form:
        {
          getFieldDecorator, validateFields, getFieldValue,
        }, fetchingOptions, ...modalProps
    } = this.props;
    const {customerName} = currentDetail;
    return(
      <div>
        <Row gutter={16}>
          <Col span={24} pull={4}>
            <Form.Item label="业务联系人" {...itemLayout}>
              {getFieldDecorator('contactsNo', {
                rules: [
                  {required: true, message: '请选择业务联系人'},
                ],
              })(
                <Select
                  placeholder="请选择"
                  onFocus={this.getSelectOptions.bind(this, 'followRecordsContacts')}
                  notFoundContent={fetchingOptions ? <Spin size="small"/> : null}
                >
                  {followRecordsContacts.map(_ => (
                    <Option value={_.id} key={_.id}>{_.linkName}</Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24} pull={4}>
            <Form.Item label="备注" {...itemLayout}>
              {getFieldDecorator('remark', {})(
                <TextArea/>
              )}
            </Form.Item>
          </Col>
        </Row>
      </div>
    )
  }
  render() {
    const {
      currentDetail,
      form:
        {
          getFieldDecorator, validateFields, getFieldValue, setFieldsValue
        }, ...modalProps
    } = this.props;
    const {customerName} = currentDetail;
    const handleOk = () => {
      validateFields((errors, fieldsValue) => {
        if (errors) {
          return;
        }
        const {productId, shop, productName} = fieldsValue;
        const [shopId, shopName] = shop ? shop.split('-') : ['',''];
        this.props.dispatch({
          type: 'saleRetail/addBusiness',
          payload: {
            ...fieldsValue,
            shopId,
            shopName,
            productId: productId,
            productName: productName,
            chanceId: this.props.id,
          },
        }).then(val => {
          this.props.onCancel();
        });
      });
    };
    const modalOpts = {
      ...modalProps,
      onOk: handleOk,
      width: '720px',
    };

    return (
      <Modal {...modalOpts} title="新开业务">
        <Form layout="horizontal">
          <Row gutter={16}>
            <Col span={24} pull={4}>
              <Form.Item label="客户名称" {...itemLayout}>
                {getFieldDecorator('customerName', {
                  initialValue: customerName,
                  rules: [{required: true, message: '请选择客户名称'}],
                })(
                  <Input disabled/>
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24} pull={4}>
              <Form.Item label="选择产品类型" {...itemLayout}>
                {getFieldDecorator('productTypeId', {
                  rules: [{required: true, message: '请选择产品类型'}],
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
          </Row>
          <Row gutter={16}>
            <Col span={24} pull={4}>
              <Form.Item label="产品名称" {...itemLayout}>
                {getFieldDecorator('productId', {
                  rules: [{required: true, message: '请选择产品名称'}],
                })(
                  <Product type={getFieldValue('productTypeId')} onChange={this.getProductDetail}/>
                )}
              </Form.Item>
            </Col>
          </Row>
          {
            this.renderProductDetail()
          }
          {
            this.renderCountInfo()
          }
          {
            this.renderWeiMobAccount()
          }
          {
            this.renderLinkMan()
          }
        </Form>
      </Modal>
    );
  }
}
