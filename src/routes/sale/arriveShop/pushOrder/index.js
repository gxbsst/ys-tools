import React, { PureComponent, Fragment } from 'react';
import { Card, Button, Form, Icon, Col, Row, DatePicker, Input, Select, Popover, Radio, Modal } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import Upload from '../../../../components/WMCUpload';
import PageHeaderLayout from '../../../../layouts/PageHeaderLayout';
import FooterToolbar from '../../../../components/FooterToolbar/index';
import BusinessForm from './BusinessForm';
import PayedWayForm from './PayedWayForm';
import styles from './index.less';
import { flattenFields } from '../../../../utils';
import { accAdd } from '../../../../utils/helpers';

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
  'compact.type': '合同类型',
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

@connect(({ arriveShop, loading, user }) =>
  ({ arriveShop, submitting: loading.effects['arriveShop/confirmPushOrder'], user })
)
@Form.create()
export default class PushOrder extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      width: '100%',
      chanceId: this.props.match.params.id || '',
      previewVisible: false, // 预览
      previewImage: '',
    };
  }
  componentDidMount() {
    window.addEventListener('resize', this.resizeFooterToolbar);
    this.props.dispatch({
      type: 'arriveShop/queryPushOrderInfo',
      payload: {
        id: this.state.chanceId,
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
  handleCancel = () => this.setState({ previewVisible: false })

  handlePreview = (file) => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true,
    });
  }
  normFile = (e) => {
    const { fileList } = e;
    return fileList.map(file => {
      if (file.status === 'done') {
        return {
          ...file,
          thumbUrl: file.response.data.url,
          url: file.response.data.url,
        }
      }
      return file;
    })
  }
  render() {
    const { form, dispatch, submitting } = this.props;
    const { id, currentPushOrder } = this.props.arriveShop;
    const { currentUser } = this.props.user;
    if (!id || !currentUser || !currentPushOrder) {
      return null;
    }
    const { basic, orderItems} = currentPushOrder;
    const { getFieldDecorator, validateFieldsAndScroll, getFieldsError, getFieldValue, setFieldsValue } = form;
    const validate = () => {
      validateFieldsAndScroll((error, values) => {
        // console.info(values)
        if (!error) {
          let { compact } = values;
          if (compact.has) {
            compact = {
              ...compact,
              startTime: compact.startTime.format('YYYY-MM-DD'),
              endTime: compact.endTime.format('YYYY-MM-DD'),
              registerTime: compact.registerTime.format('YYYY-MM-DD'),
            }
          }
          dispatch({
            type: 'arriveShop/confirmPushOrder',
            payload: {
              ...values,
              compact,
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
                    initialValue: basic.customerName,
                  })(<span>{basic.customerName}</span>)}
                </Form.Item>
              </Col>
              <Col xl={{ span: 8, offset: 2 }} lg={{ span: 12 }} md={{ span: 24 }} sm={24}>
                <Form.Item label="提单人" {...itemLayout}>
                  {getFieldDecorator('pushPerson', {
                    initialValue: basic.salesName,
                  })(<span>{basic.salesName}</span>)}
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
                  initialValue: { ids: [], amount: 0 },
                  rules: [{
                    validator: (r, v, c) => {
                      if (v.ids.length == 0) {
                        c('请选择业务');
                      }
                      c();
                    },
                  }],
                })(<BusinessForm data={orderItems} onChange={(val) => {
                  if (val.ids.length > 0 && val.amount <= 0) {
                    setFieldsValue({ payedWay: [], 'compact.has': 0 });
                  } else {
                    setFieldsValue({ payedWay: []});
                  }
                }}/>)}
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
                    initialValue: 1,
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
                  <Row gutter={16}>
                    <Col lg={{ span: 12 }} md={{ span: 12 }} sm={24}>
                      <Form.Item label="合同类型" {...itemLayout}>
                        {getFieldDecorator('compact.type', {
                          initialValue: 1,
                          rules: [{ required: true, message: '请选择' }],
                        })(
                          <RadioGroup>
                            <Radio value={1}>标准合同</Radio>
                            <Radio value={0}>非标准合同</Radio>
                          </RadioGroup>
                        )}
                      </Form.Item>
                    </Col>
                  </Row>
                  <Col lg={{span: 12}} md={{span: 12}} sm={24}>
                    <Form.Item label="合同编号" {...itemLayout}>
                      {getFieldDecorator('compact.no', {
                        initialValue: '',
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
                      })(<span>{getFieldValue('business').amount}</span>)}
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col lg={12} md={12} sm={24}>
                    <Form.Item label="开始日期" {...itemLayout}>
                      {getFieldDecorator('compact.startTime', {
                        rules: [{required: true, message: '请选择开始时间'}],
                      })(
                        <DatePicker placeholder="请输入" />
                      )}
                    </Form.Item>
                  </Col>
                  <Col lg={{ span: 12 }} md={{ span: 12 }} sm={24}>
                    <Form.Item label="结束日期" {...itemLayout}>
                      {getFieldDecorator('compact.endTime', {
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
                        rules: [{required: true, message: '请选择签订日期'}],
                      })(
                        <DatePicker placeholder="请输入" />
                      )}
                    </Form.Item>
                  </Col>
                  <Col lg={{ span: 12 }} md={{ span: 12 }} sm={24}>
                    <Form.Item label="买方签字" {...itemLayout}>
                      {getFieldDecorator('compact.paySign', {
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
                      })(
                        <TextArea placeholder="请输入" />
                      )}
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col md={{ span: 24 }} sm={24} >
                    <Form.Item
                      label="上传文件"
                      labelCol={{span: 4}}
                      wrapperCol={{span: 20}}
                    >
                      {getFieldDecorator('compact.fileList', {
                        valuePropName: 'fileList',
                        getValueFromEvent: this.normFile,
                        rules: [{required: true, message: '请选择文件'}],
                      })(<Upload content={<Icon type="plus" />} showUploadList={true} />)}
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col md={{ span: 24 }} sm={24}>
                    <Form.Item label="付款方式" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}>
                      {getFieldDecorator('payedWay', {
                        initialValue: [],
                        rules: [{
                          validator: (r, v, c) => {
                            const amount = v.reduce((amount, cur) => accAdd(amount, parseFloat(cur.amount)), 0);
                            if (amount !== getFieldValue('business').amount) {
                              c('金额不匹配,请修改付款!');
                            }
                            c();
                          },
                        }],
                      })(<PayedWayForm business={getFieldValue('business')} />)}
                    </Form.Item>
                  </Col>
                </Row>
              </Fragment>
            }
          </Form>
        </Card>
        <FooterToolbar style={{ width: this.state.width }} extra="">
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

