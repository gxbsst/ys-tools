import React, {PureComponent} from "react";
import {Link} from "dva/router";
import _ from 'lodash';
import moment from 'moment';
import classnames from 'classnames';
import {
  Card,
  Select,
  Input,
  DatePicker,
  Form,
  Radio,
  Button,
  Icon,
  message
} from 'antd';
import DescriptionList from '../../../components/DescriptionList';
import BusinessForm from './relevanceForm'
import PayedWayForm from './PayedWayForm'
import WMCUpload from '../../../components/WMCUpload';
import request from '../../../utils/request';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import FooterToolbar from '../../../components/FooterToolbar/index';
import {accAdd} from "../../../utils/helpers";
import styles from './index.less'
import common from '../../Personnel/common/index.less'

const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const {Description} = DescriptionList;


const formItemLayout = {
  labelCol: {
    span: 6
  },
  wrapperCol: {
    span: 16
  }
};
const fullLayout = {
  labelCol: {
    span: 2
  },
  wrapperCol: {
    span: 22
  }
};
@Form.create()
export default class TBill extends PureComponent {
  state = {
    mainbill: '',
    accessory: {},
    isContract: true,
  }
  // 提单主接口
  mainbill = async (sourceId, sourceType) => {
    const {data} = await request(`/api/billingReceipts/billingMain/${sourceId}/${sourceType}`)
    this.setState({
      mainbill: data,
      relevance: data.orderList
    })
  }
  handleContractType = (e) => {
    this.setState({
      isContract: e.target.value
    })
  }

  componentDidMount() {
    const {match: {params: {customerId}}} = this.props;
    this.mainbill(customerId, 2);
  }

  info = (text) => {
    message.info(text);
  };
  normFile = (e) => {
    const {fileList} = e;
    return fileList.map(file => {
      console.info('file', file);
      if (file.status === 'done') {
        return {
          ...file,
          fileSize: file.response.data.fileSize,
          fileName: file.response.data.name,
          fileUrl: file.response.data.url,
        }
      }
      return file;
    })
  }
  marginBottom = {marginBottom: 56};


  render() {
    const dateFormat = 'YYYY-MM-DD';
    const {form, location: {query}, match: {params: {customerId}}} = this.props;
    const {getFieldDecorator, validateFieldsAndScroll, getFieldsError, getFieldValue, validateFields, setFieldsValue} = form;
    const {mainbill = {}, relevance, isContract} = this.state;
    if (_.isEmpty(mainbill)) return null;
    const validate = () => {
      validateFieldsAndScroll((error, values) => {
        let {
          isContract,
          contractInfo = {},
          attachmentDtoList = [],
          orderIdList: {ids: orderIdList},
          payModeDtoList = [],
        } = values;
        let compact = {
          isContract,
          contractInfo,
          attachmentDtoList,
          payModeDtoList,
          orderIdList,
          sourceId: customerId,
          sourceType: 2
        };
        if (!error) {
          if (isContract) {
            const {contractInfo: {contractBegin, contractEnd, contractDate}} = values;
            _.merge(
              contractInfo,
              {
                contractBegin: moment(contractBegin).format(dateFormat),
                contractEnd: moment(contractEnd).format(dateFormat),
                contractDate: moment(contractDate).format(dateFormat)
              })
            attachmentDtoList = attachmentDtoList.map(({fileSize, fileName, fileUrl}) => ({
              fileSize,
              fileName,
              fileUrl
            }));
            compact = _.assign(values, {
              contractInfo: _.omit(contractInfo, ['amount']),
              attachmentDtoList,
              orderIdList,
              sourceId: customerId,
              sourceType: 2
            })
          }
          request(`/api/billingReceipts/billingUninOrder`, {
            method: 'POST',
            body: compact,
          }).then(({code, message: msg, data}) => {
            message.success(msg);
            window.history.go(-1);
          });

        }
      });
    };
    const itemClasses = classnames(styles.item, {[styles.hide]: !isContract});
    return (
      <PageHeaderLayout>
        <Card>
          <div className={styles.clientInfo}>
            <span className={styles.InfoLeft}>
              <span className={common.important + ' ' + styles.left}>客户名称：</span>
              <span>{mainbill.customerName}</span>
            </span>
            <span>
              <span className={common.important + ' ' + styles.left}>提单人：</span>
              <span>{mainbill.salesName}</span>
            </span>
          </div>
        </Card>
        <Card className={common.marginTop}>
          <p><span className={common.important}>关联业务：</span></p>
          <Form.Item>
            {getFieldDecorator('orderIdList', {
              initialValue: {ids: [], amount: 0},
              rules: [{
                validator: (r, v, c) => {
                  if (v.ids.length === 0) {
                    c('请选择业务');
                  }
                  c();
                },
              }],
              //  等待提单table
            })(<BusinessForm data={relevance} onChange={(val) => {
              if (val.ids.length > 0 && val.amount <= 0) {
                setFieldsValue({payModeDtoList: [], 'isContract': false});
              } else {
                setFieldsValue({payModeDtoList: []});
              }
            }}/>)}
          </Form.Item>
        </Card>
        <Card className={common.marginTop} style={this.marginBottom}>
          <Form layout='inline'>
            <div className={styles.item}>
              <FormItem {...formItemLayout} label='提单合同'>
                {
                  getFieldDecorator('isContract', {
                    rules: [{required: true, message: '提单合同'}],
                    initialValue: true
                  })(
                    <RadioGroup onChange={this.handleContractType}>
                      <Radio value={true}>提合同</Radio>
                      <Radio value={false}>暂不提合同</Radio>
                    </RadioGroup>
                  )
                }
              </FormItem>
            </div>
            {
              isContract &&
              <div>
                <div className={styles.item}>
                  <FormItem {...formItemLayout} label='合同类型'>
                    {
                      getFieldDecorator('contractInfo.contractType', {
                        rules: [{required: true, message: '合同类型'}],
                        initialValue: 1
                      })(
                        <RadioGroup>
                          <Radio value={1}>标准合同</Radio>
                          <Radio value={0}>非标准合同</Radio>
                        </RadioGroup>
                      )
                    }
                  </FormItem>
                </div>
                <div className={itemClasses}>
                  <FormItem  {...formItemLayout} label='合同编号'>
                    {
                      getFieldDecorator('contractInfo.contractCode', {
                        rules: [{required: true, message: '合同编号'}],
                      })(
                        <Input placeholder="合同编号" disabled={!isContract}/>
                      )
                    }
                  </FormItem>
                  <FormItem {...formItemLayout} label='合同金额'>
                    {
                      getFieldDecorator('contractInfo.amount', {
                        rules: [{required: true, message: '合同金额'}],
                        initialValue: getFieldValue('orderIdList').amount,
                      })(
                        <span>{getFieldValue('orderIdList').amount}</span>
                      )
                    }
                  </FormItem>
                </div>
                <div className={itemClasses}>
                  <FormItem {...formItemLayout} label='合同开始日期'>
                    {
                      getFieldDecorator('contractInfo.contractBegin', {
                        rules: [{required: true, message: '合同开始日期'}],
                      })(
                        <DatePicker
                          disabled={!isContract}
                          style={{width: '100%'}}
                          format={dateFormat}
                          placeholder="合同开始日期"
                        />
                      )
                    }
                  </FormItem>
                  <FormItem {...formItemLayout} label='合同结束日期'>
                    {
                      getFieldDecorator('contractInfo.contractEnd', {
                        rules: [{required: true, message: '合同结束日期'}],
                      })(
                        <DatePicker
                          disabled={!isContract}
                          style={{width: '100%'}}
                          format={dateFormat}
                          placeholder="合同结束日期"
                        />
                      )
                    }
                  </FormItem>
                </div>
                <div className={itemClasses}>
                  <FormItem {...formItemLayout} label='合同签订日期'>
                    {
                      getFieldDecorator('contractInfo.contractDate', {
                        rules: [{required: true, message: '合同签订日期'}],
                      })(
                        <DatePicker
                          disabled={!isContract}
                          style={{width: '100%'}}
                          format={dateFormat}
                          placeholder="合同签订日期"
                        />
                      )
                    }
                  </FormItem>
                  <FormItem {...formItemLayout} label='买方签字'>
                    {
                      getFieldDecorator('contractInfo.buyerSignature', {
                        rules: [{required: true, message: '买方签字'}],
                      })(
                        <Input placeholder="买方签字" disabled={!isContract}/>
                      )
                    }
                  </FormItem>
                </div>
                <div className={itemClasses}>
                  <FormItem  {...formItemLayout} label='卖方签字'>
                    {
                      getFieldDecorator('contractInfo.sellerSignature', {
                        rules: [{required: true, message: '卖方签字'}],
                      })(
                        <Input placeholder="卖方签字" disabled={!isContract}/>
                      )
                    }
                  </FormItem>
                </div>
                <div className={itemClasses}>
                  <FormItem {...formItemLayout} label='合同备注'>
                    {
                      getFieldDecorator('contractInfo.comment', {
                        rules: [{message: '合同备注'}],
                      })(
                        <Input placeholder="合同备注" disabled={!isContract}/>
                      )
                    }
                  </FormItem>
                </div>
                <div className={itemClasses}>
                  <FormItem
                    label="上传文件"
                    {...formItemLayout}
                  >
                    {getFieldDecorator('attachmentDtoList', {
                      valuePropName: 'fileList',
                      getValueFromEvent: this.normFile,
                      rules: [{required: true, message: '请选择文件'}],
                    })(<WMCUpload content={<Icon type="plus"/>} showUploadList={true}/>)}
                  </FormItem>
                </div>
                <div className={styles.input_item + ' ' + itemClasses}>
                  <FormItem
                    label="付款方式"
                    {...fullLayout}
                  >
                    {getFieldDecorator('payModeDtoList', {
                      initialValue: [],
                      rules: [{
                        validator: (r, v, c) => {
                          const amount = v.reduce((amount, cur) => accAdd(amount, parseFloat(cur.amount)), 0);
                          if (amount !== getFieldValue('orderIdList').amount) {
                            c('金额不匹配,请修改付款!');
                          }
                          c();
                        },
                      }],
                    })(<PayedWayForm business={getFieldValue('orderIdList')}/>)}
                  </FormItem>
                </div>
              </div>
            }

          </Form>
        </Card>
        <FooterToolbar style={{width: this.state.width,}} extra="">
          <Button type="ghost" onClick={() => window.history.back()} style={{marginRight: '20px'}}>
            取消
          </Button>
          <Button type="primary" onClick={validate}>
            提交
          </Button>
        </FooterToolbar>
      </PageHeaderLayout>
    )
  }
}
