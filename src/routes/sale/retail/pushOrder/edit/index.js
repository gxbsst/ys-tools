import React, { PureComponent, Fragment } from 'react';
import { Card, Button, Form, Icon, Col, Row, DatePicker, Input, Select, Popover, Radio, Modal } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import Upload from '../../../../../components/WMCUpload';
import PageHeaderLayout from '../../../../../layouts/PageHeaderLayout';
import FooterToolbar from '../../../../../components/FooterToolbar/index';
import BusinessForm from '../BusinessForm';
import PayedWayForm from '../PayedWayForm';
import styles from '../index.less';
import { flattenFields } from '../../../../../utils';

const { Option } = Select;
const { TextArea } = Input;
const RadioGroup = Radio.Group;
const itemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 12 },
};
const fieldLabels = {
  customerName: '客户名称',
  pushPerson: '提单人',
  business: '关联业务',
  'compact.has': '提单合同',
  'compact.no': '合同编号',
  'compact.amount': '合同金额',
  'compact.startTime': '合同开始时间',
  'compact.endTime': '合同结束时间',
  'compact.registerTime': '注册时间',
  'compact.paySign': '买方签字',
  'compact.payedSign': '卖方签字',
  'compact.remark': '备注',
  'compact.fileList': '文件',
  'compact.imgList': '图片',
  payedWay: '付款方式',
}

@connect(({ saleRetail, loading }) =>
  ({ saleRetail, submitting: loading.effects['saleRetail/confirmPushOrder'] })
)
@Form.create()
export default class EditPushOrder extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      width: '100%',
      pushOrderID: this.props.match.params.id || '',
      previewVisible: false, // 预览
      previewImage: '',
    };
  }
  componentDidMount() {
    window.addEventListener('resize', this.resizeFooterToolbar);
    this.props.dispatch({
      type: 'saleRetail/queryPushOrderDetail',
      payload: {
        pushOrderID: this.state.pushOrderID,
      },
    });
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeFooterToolbar);
  }
  resizeFooterToolbar = () => {
    const sider = document.querySelectorAll('.ant-layout-sider')[0];
    const width = `calc(100% - ${sider.style.width})`;
    if (this.state.width !== width) {
      this.setState({ width });
    }
  }
  normFile = (e) => {
    // console.log('Upload event:', e);
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  }
  handleCancel = () => this.setState({ previewVisible: false })

  handlePreview = (file) => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true,
    });
  }

  render() {
    const { form, dispatch, submitting } = this.props;
    const { pushOrderID, currentPushOrder } = this.props.saleRetail;
    if (!currentPushOrder) {
      return null;
    }
    const { getFieldDecorator, validateFieldsAndScroll, getFieldsError, getFieldValue } = form;
    const validate = () => {
      validateFieldsAndScroll((error, values) => {
        // console.info(values)
        if (!error) {
          const { compact } = values;
          const newCompact = {
            ...compact,
            startTime: compact.startTime.format('YYYY-MM-DD'),
            endTime: compact.endTime.format('YYYY-MM-DD'),
            registerTime: compact.registerTime.format('YYYY-MM-DD'),
          }
          dispatch({
            type: 'saleRetail/confirmPushOrder',
            payload: {
              ...values,
              compact: {
                ...newCompact,
              },
              pushOrderID,
            },
          });
        }
      });
    };
    const errors = getFieldsError(); // 返回的error是嵌套的
    // console.info(errors)
    const getErrorInfo = () => {
      const newError = flattenFields(errors, key => Object.keys(fieldLabels).includes(key), '找不到表单域');
      const errorCount = Object.keys(newError).filter(key => newError[key]).length;
      if (!errors || errorCount === 0) {
        return null;
      }
      const scrollToField = (fieldKey) => {
        const labelNode = document.querySelector(`label[for="${fieldKey}"]`);
        if (labelNode) {
          labelNode.scrollIntoView(true);
        }
      };
      const errorList = Object.keys(newError).map((key) => {
        if (!newError[key]) {
          return null;
        }
        return (
          <li key={key} className={styles.errorListItem} onClick={() => scrollToField(key)}>
            <Icon type="cross-circle-o" className={styles.errorIcon} />
            <div className={styles.errorMessage}>{newError[key][0]}</div>
            <div className={styles.errorField}>{fieldLabels[key]}</div>
          </li>
        );
      });
      return (
        <span className={styles.errorIcon}>
          <Popover
            title="表单校验信息"
            content={errorList}
            overlayClassName={styles.errorPopover}
            trigger="click"
            getPopupContainer={trigger => trigger.parentNode}
          >
            <Icon type="exclamation-circle" />
          </Popover>
          {errorCount}
        </span>
      );
    };
    const amount = currentPushOrder.orderItems.reduce((count, cur) => count + cur.productAmount + cur.serviceAmount, 0);
    return (
      <PageHeaderLayout
        title="提单"
        wrapperClassName={styles.advancedForm}
      >
        <Card className={styles.card} bordered={false}>
          <Form layout="horizontal">
            <Row gutter={16}>
              <Col xl={{ span: 8, offset: 2 }} lg={{ span: 12 }} md={{ span: 24 }} sm={24}>
                <Form.Item label="客户名称" {...itemLayout}>
                  {getFieldDecorator('customerName', {
                    initialValue: currentPushOrder.customerName,
                  })}
                  <span>{currentPushOrder.customerName}</span>
                </Form.Item>
              </Col>
              <Col xl={{ span: 8, offset: 2 }} lg={{ span: 12 }} md={{ span: 24 }} sm={24}>
                <Form.Item label="提单人" {...itemLayout}>
                  {getFieldDecorator('createUser', {
                    initialValue: currentPushOrder.createUser,
                  })}
                  <span>{currentPushOrder.createUser}</span>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>
        <Card title="业务关联" className={styles.card} bordered={false}>
          <Row gutter={16}>
            <Col>
              <Form.Item>
                {getFieldDecorator('business', {
                  initialValue: { ids: currentPushOrder.orderItems, amount },
                  rules: [{
                    validator: (r, v, c) => {
                      if (v.amount <= 0) {
                        c('请选择业务');
                      }
                      c();
                    },
                  }],
                })(<BusinessForm data={currentPushOrder.orderItems} />)}
              </Form.Item>
            </Col>
          </Row>
        </Card>
        <Card
          className={styles.card}
          bordered={false}
        >
          <Form layout="horizontal" >
            <Row gutter={16}>
              <Col lg={{ span: 12 }} md={{ span: 12 }} sm={24}>
                <Form.Item label="提单合同" {...itemLayout}>
                  {getFieldDecorator('compact.has', {
                    initialValue: currentPushOrder.isContract,
                    rules: [{ required: true, message: '请选择' }],
                  })(
                    <RadioGroup>
                      <Radio value={1}>提合同</Radio>
                      <Radio value={0}>不提合同</Radio>
                    </RadioGroup>
                  )}
                </Form.Item>
              </Col>
            </Row>
            {
              getFieldValue('compact').has === 1 &&
              <Fragment>
                <Row gutter={16}>
                  <Col lg={{span: 12}} md={{span: 12}} sm={24}>
                    <Form.Item label="合同编号" {...itemLayout}>
                      {getFieldDecorator('compact.no', {
                        initialValue: currentPushOrder.basic.contractCode,
                        rules: [{required: true, message: '请输入'}],
                      })(
                        <Input placeholder="请输入" />
                      )}
                    </Form.Item>
                  </Col>
                  <Col lg={{span: 12}} md={{span: 12}} sm={24}>
                    <Form.Item label="合同金额" {...itemLayout}>
                      {getFieldDecorator('compact.amount', {
                        initialValue: getFieldValue('business').amount,
                      })}
                      <span>{getFieldValue('business').amount}</span>
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col lg={12} md={12} sm={24}>
                    <Form.Item label="开始日期" {...itemLayout}>
                      {getFieldDecorator('compact.startTime', {
                        initialValue: moment(currentPushOrder.basic.contractBegin),
                        rules: [{required: true, message: '请选择开始时间'}],
                      })(
                        <DatePicker placeholder="请输入" />
                      )}
                    </Form.Item>
                  </Col>
                  <Col lg={{ span: 12 }} md={{ span: 12 }} sm={24}>
                    <Form.Item label="结束日期" {...itemLayout}>
                      {getFieldDecorator('compact.endTime', {
                        initialValue: moment(currentPushOrder.basic.contractEnd),
                        rules: [{required: true, message: '请选择结束时间'}],
                      })(
                        <DatePicker placeholder="请输入" />
                      )}
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col lg={12} md={12} sm={24}>
                    <Form.Item label="签订日期" {...itemLayout}>
                      {getFieldDecorator('compact.registerTime', {
                        initialValue: moment(currentPushOrder.basic.contractDate),
                        rules: [{required: true, message: '请选择签订日期'}],
                      })(
                        <DatePicker placeholder="请输入" />
                      )}
                    </Form.Item>
                  </Col>
                  <Col lg={{ span: 12 }} md={{ span: 12 }} sm={24}>
                    <Form.Item label="买方签字" {...itemLayout}>
                      {getFieldDecorator('compact.paySign', {
                        initialValue: currentPushOrder.basic.buyerSignature,
                        rules: [{required: true, message: '请输入买方名称'}],
                      })(
                        <Input placeholder="请输入" />
                      )}
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col md={{ span: 12 }} sm={24} >
                    <Form.Item label="卖方签字" {...itemLayout}>
                      {getFieldDecorator('compact.payedSign', {
                        initialValue: currentPushOrder.basic.sellerSignature,
                        rules: [{required: true, message: '请输入卖方名称'}],
                      })(
                        <Input placeholder="请输入" />
                      )}
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col md={{ span: 12 }} sm={24} >
                    <Form.Item label="备注" {...itemLayout}>
                      {getFieldDecorator('compact.remark', {
                        initialValue: currentPushOrder.basic.remark,
                      })(
                        <TextArea placeholder="请输入" />
                      )}
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col md={{ span: 12 }} sm={24} >
                    <Form.Item label="上传文件" {...itemLayout}>
                      {getFieldDecorator('compact.fileList', {
                        valuePropName: 'fileList',
                        initialValue: currentPushOrder.attachments.map(item => ({ name: item.fileName, url: item.fileUrl })),
                        getValueFromEvent: this.normFile,
                        rules: [{required: true, message: '请选择文件'}],
                      })(<Upload />)}
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col md={{ span: 24 }} sm={24}>
                    <Form.Item label="付款方式" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}>
                      {getFieldDecorator('payedWay', {
                        initialValue: currentPushOrder.payModes,
                        rules: [{
                          validator: (r, v, c) => {
                            if (v.reduce((amount, cur) => amount + cur.price, 0) !== getFieldValue('business').amount) {
                              c('金额不匹配,请修改付款!');
                            }
                            c();
                          },
                        }],
                      })(<PayedWayForm amount={getFieldValue('business').amount} />)}
                    </Form.Item>
                  </Col>
                </Row>
              </Fragment>
            }
          </Form>
        </Card>
        <FooterToolbar style={{ width: this.state.width }} extra="">
          {getErrorInfo()}
          <Button type="ghost" onClick={() => window.history.back()} style={{ marginRight: '20px' }}>
            取消
          </Button>
          <Button type="primary" onClick={validate} loading={submitting}>
            提交
          </Button>
        </FooterToolbar>
        <Modal visible={this.state.previewVisible} footer={null} onCancel={this.handleCancel} >
          <img alt="previwe" style={{ width: '100%' }} src={this.state.previewImage} />
        </Modal>
      </PageHeaderLayout>
    );
  }
}

