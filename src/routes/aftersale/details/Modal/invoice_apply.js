import React, {PureComponent} from "react";
import styles from '../index.less'
import common from '../../../Personnel/common/index.less'
import moment from 'moment';
import request from '../../../../utils/request';
import regExp from '../../../../utils/regexp';
import {getDate, getCurrency, getBusinessType, getBackpayStatus} from '../../../../utils/helpers'
import {
  Form,
  Input,
  Radio,
  Select,
  Button,
  AutoComplete,
  DatePicker,
  Modal,
  Table,
  message
} from 'antd';

const FormItem = Form.Item;
const Option = Select.Option;
const AutoCompleteOption = AutoComplete.Option;
const RadioGroup = Radio.Group;
const {TextArea} = Input;
const formItemLayout = {
  labelCol: {span: 4},
  wrapperCol: {span: 20},
};
@Form.create()
export default class InvoiceApply extends PureComponent {
  state = {
    customerId: '',
    customerName: '',
    business: [],
    orderItemList: [],
    relType: 0,
    invoiceType: 0,
    amount: '',
    taxpayer: {},

  };
  submitinvoice = async (parms) => {
    const {page, getinvoice, customerId, onCancel} = this.props;
    const {message: msg} = await request(`/api/invoice`, {
      method: 'POST',
      body: {
        ...parms
      }
    })
    message.info(msg)
    onCancel()
    getinvoice(customerId, page)
    this.props.form.resetFields();
  };
  handleOk = (e) => {
    const {form: {getFieldValue}} = this.props;
    const {relType} = this.state;
    if (!relType) {
      this.props.form.validateFields((err, values) => {
        const {customerId} = this.props;
        const {orderItemList = []} = this.state;
        const demandDate = getDate(values.demandDate);
        if (!err && orderItemList.length) {
          let parms = Object.assign({}, values, {orderItemList, customerId, demandDate})
          this.submitinvoice(parms)
        } else {
          message.info('请先关联业务')
        }
      });
    } else {
      console.info(222);
      this.props.form.validateFields((err, values) => {
        const {customerId} = this.props;
        const demandDate = getDate(values.demandDate);
        if (!err) {
          let parms = Object.assign({}, values, {customerId, demandDate});
          this.submitinvoice(parms)
        }
      });
    }
  };
  handleCancel = (e) => {
    const {onCancel} = this.props;
    onCancel();
    this.props.form.resetFields();
  };
// table
  columns = [{
    title: '产品类型',
    dataIndex: 'productType'

  }, {
    title: '业务类型',
    dataIndex: 'itemType',
    render: getBusinessType
  }, {
    title: '产品名称',
    dataIndex: 'productName',
  }, {
    title: '产品金额',
    dataIndex: 'productAmount',
    render: getCurrency
  }, {
    title: '服务费金额',
    dataIndex: 'serviceAmount',
    render: getCurrency
  }, {
    title: '回款状态',
    dataIndex: 'backPayStatus',
    render: getBackpayStatus,
  }, {
    title: '创建人',
    dataIndex: 'createUserName',
  }];
  rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      const productAmount = selectedRows.map(item => (item.productAmount));
      const serviceAmount = selectedRows.map(item => (item.serviceAmount));
      const amount = productAmount.concat(serviceAmount).reduce((preValue, curValue) => (preValue + curValue), 0);
      this.setState({
        amount
      })
      const orderItemList = selectedRows.map(item => ({id: item.id, amount: item.amount}))
      this.setState({
        orderItemList: orderItemList || []
      })
    }
  };
  businessList = async (customerId) => {
    const {data} = await request(`/api/invoice/orderItems`, {
      method: 'GET',
      query: {
        customerId,
      }
    });
    this.setState({
      business: data ? data : []
    });
  }
  // 获取纳税人信息
  getTaxpayer = async (customerId) => {
    const {data: taxpayer} = await request(`/api/companyTaxInfo`, {
      query: {customerId}
    })
    this.setState({
      taxpayer
    })
  }

  componentDidMount() {
    const {customerId, customerName} = this.props;
    if (customerId) {
      this.setState({
        customerId,
        customerName
      });
      this.getTaxpayer(customerId);
      this.businessList(customerId)
    }
  }

  componentWillReceiveProps({customerId, customerName}) {
    if (customerId !== this.props.customerId && customerId) {
      this.setState({
        customerId,
        customerName
      });
      this.businessList(customerId);
      this.getTaxpayer(customerId);
    }
  }

// 处理关联业务状态
  handleChange = (value) => {
    this.setState({
      relType: value
    })
  };
// 处理发票类型
  selectInvoiceType = (e) => {
    this.setState({
      invoiceType: e.target.value
    })
  }

  render() {
    const {form, customerName, baseInfo, ...receiveProps} = this.props;
    const {business, relType, invoiceType, amount, taxpayer = {}} = this.state;
    const {getFieldDecorator, validateFields} = form;
    const formTwoLayout = {
      labelCol: {
        sm: {span: 6},
        xs: {span: 6}
      },
      wrapperCol: {
        sm: {span: 17, offset: 1},
        xs: {span: 17, offset: 1},
      },
    };
    return (
      <div>
        <Modal
          title="申请发票"
          onOk={this.handleOk}
          width={700}
          destroyOnClose
          {...receiveProps}
          onCancel={this.handleCancel}
        >
          <div className={styles.addLinkman}>
            <Form layout='inline'>
              <div className={styles.input_item}>
                <FormItem
                  {...formItemLayout}
                  label='客户名称'>
                  {
                    getFieldDecorator('customerName', {
                      rules: [{required: true}],
                      initialValue: customerName
                    })(
                      <Input style={{border: 'none', background: 'none'}}/>
                    )
                  }
                </FormItem>
              </div>
              <div className={styles.input_item}>
                <FormItem
                  {...formItemLayout}
                  label='要求开票日期'>
                  {
                    getFieldDecorator('demandDate', {})(
                      <DatePicker
                        style={{width: '100%'}}
                        placeholder="开票日期"
                      />
                    )
                  }
                </FormItem>
              </div>
              <div className={styles.input_item}>
                <FormItem
                  {...formItemLayout}
                  label='开票要求'>
                  {
                    getFieldDecorator('demand', {})(
                      <TextArea placeholder="开票要求" autosize/>
                    )
                  }
                </FormItem>
              </div>
              <div className={styles.input_item}>
                <FormItem
                  {...formItemLayout}
                  label='关联类型'>
                  {
                    getFieldDecorator('relType', {
                      rules: [{required: true, message: '请输入输入关联类型'}],
                      initialValue: 0
                    })(
                      <Select onChange={this.handleChange}>
                        <Option value={0}>先关联业务</Option>
                        <Option value={1}>后关联业务</Option>
                      </Select>
                    )
                  }
                </FormItem>
              </div>
              {
                !relType &&
                <div className={styles.table}>
                  <Table rowSelection={this.rowSelection}
                         columns={this.columns}
                         dataSource={business}
                         size="small"
                         rowKey="id"
                         bordered={true}
                         pagination={false}/>
                </div>
              }
              <div className={styles.input_item}>
                <FormItem
                  {...formItemLayout}
                  label='开票金额'>
                  {
                    getFieldDecorator('invoiceAmount', {
                      rules: [
                        {required: true, message: '请输入开票金额'},
                        {
                          validator: (r, v, c) => {
                            if (Number(v) < 0) {
                              c('金额不能为负');
                            } else if (isNaN(v * 1)) {
                              c('请输入正确的金额');
                            }
                            c();
                          },
                        }
                      ],
                      initialValue: amount
                    })(
                      <Input placeholder="开票金额" disabled={!relType}/>
                    )
                  }
                </FormItem>
              </div>
              <div className={styles.input_item}>
                <FormItem
                  {...formItemLayout}
                  label='开票类型'>
                  {
                    getFieldDecorator('invoiceType', {
                      rules: [{required: true, message: '开票类型'}],
                      initialValue: 0
                    })(
                      <RadioGroup onChange={this.selectInvoiceType}>
                        <Radio value={0}>增值税普通发票</Radio>
                        <Radio value={1}>增值税专用发票</Radio>
                      </RadioGroup>
                    )
                  }

                </FormItem>
              </div>
              <div className={styles.input_item}>
                <FormItem
                  {...formItemLayout}
                  label='纳税人识别号'>
                  {
                    getFieldDecorator('taxpayerNum', {
                      rules: [{required: true, message: '纳税人识别号'}, {
                        validator: (r, v, c) => {
                          let reg = new RegExp("[\\u4E00-\\u9FFF]+", "g");
                          if (reg.test(v)) {
                            c('输入账号格式不正确');
                          }
                          if (v && v.length > 20) {
                            c('请确定识别码是否正确');
                          }
                          c();
                        },
                      }]
                    })(
                      <Input placeholder="纳税人识别号"/>
                    )
                  }
                </FormItem>
              </div>
              {
                invoiceType ? (
                  <div>
                    <div className={styles.input_item}>
                      <FormItem
                        {...formItemLayout}
                        label='注册地址'>
                        {
                          getFieldDecorator('registerAddress', {
                            rules: [{required: true, message: '注册地址'}],
                          })(
                            <Input placeholder="注册地址"/>
                          )
                        }
                      </FormItem>
                    </div>
                    <div className={styles.input_item}>
                      <FormItem
                        {...formItemLayout}
                        label='电话'>
                        {
                          getFieldDecorator('phone', {
                            rules: [{required: true, message: '请输入手机号码', pattern: regExp.REG_MOBILE}],
                          })(
                            <Input placeholder="请输入手机号码"/>
                          )
                        }
                      </FormItem>
                    </div>
                    <div className={styles.input_item}>
                      <FormItem
                        {...formItemLayout}
                        label='开户行'>
                        {
                          getFieldDecorator('openBank', {
                            rules: [{required: true, message: '请输入开户行'}],
                          })(
                            <Input placeholder="开户行"/>
                          )
                        }
                      </FormItem>
                    </div>
                    <div className={styles.input_item}>
                      <FormItem
                        {...formItemLayout}
                        label='账号'>
                        {
                          getFieldDecorator('bankAccount', {
                            rules: [{required: true, message: '请输入账号'}, {
                              validator: (r, v, c) => {
                                let reg = /^([1-9]{1})(\d{14}|\d{18})$/;
                                if (!reg.test(v)) {
                                  c('输入账号格式不正确');
                                }
                                c();
                              },
                            }],
                          })(
                            <Input placeholder="请输入账号"/>
                          )
                        }
                      </FormItem>
                    </div>
                  </div>
                ) : ''
              }
            </Form>
          </div>
        </Modal>
      </div>
    );
  }
}
