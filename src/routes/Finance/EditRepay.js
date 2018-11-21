import React, { PureComponent } from 'react';
import {
  Form,
  Input,
  Row,
  Col,
  Table,
  Divider,
  DatePicker,
  Select,
  Modal
} from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import Image from '../../components/Image';
import { getBusinessStatus, getBackpayStatus } from '../../utils/helpers';

const FormItem = Form.Item,
  { Option } = Select,
  { TextArea } = Input;

const repayBusinessColumns = [
  {
    title: '产品类型',
    key: 'productType',
    dataIndex: 'productType'
  },
  {
    title: '业务类型',
    dataIndex: 'itemType',
    key: 'itemType',
    render: getBusinessStatus
  },
  {
    title: '产品名称',
    key: 'productName',
    dataIndex: 'productName'
  },
  {
    title: '产品金额',
    key: 'productPrice',
    dataIndex: 'productPrice',
    render: text => {
      return `￥${text}`;
    }
  },
  {
    title: '服务费金额',
    key: 'servicePrice',
    dataIndex: 'servicePrice',
    render: text => {
      return `￥${text}`;
    }
  },
  {
    title: '回款状态',
    dataIndex: 'paymentStatus',
    key: 'paymentStatus',
    render: getBackpayStatus
  },
  {
    title: '创建人',
    key: 'bizUserName',
    dataIndex: 'bizUserName'
  }
];

const formItemLayout = {
  labelCol: {
    span: 8
  },
  wrapperCol: {
    span: 16
  }
};

@connect(state => ({
  repay: state.repay
}))
@Form.create()
class EditRepay extends PureComponent {
  state = {
    openBankList: [
      {
        label: '微盟银行3536',
        value: 1
      },
      {
        label: '盟耀银行0147',
        value: 2
      }
    ]
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'repay/editRepay',
      payload: this.props.editRepayId
    });
  }

  componentWillReceiveProps(nextProps) {
    if (
      'repay' in nextProps &&
      nextProps.repay.isModalClose &&
      this.props.repay.isModalClose !== nextProps.repay.isModalClose
    ) {
      if (nextProps.repay.isModalClose) {
        this.props.handleEditPayCancel();
      }
    }
  }

  handleChange = value => {
    //入账类型改变时，将入账账户选择框的值置为空
    this.props.form.setFieldsValue({
      openBank: ''
    });
    switch (value) {
      case 1:
      case 2:
      case 3:
      case 4:
        this.setState({
          openBankList: [
            {
              label: '微盟银行3536',
              value: 1
            },
            {
              label: '盟耀银行0147',
              value: 2
            }
          ]
        });
        break;
      case 5:
        this.setState({
          openBankList: [
            {
              label: '微盟支付宝weimob_wm01@126.com',
              value: 3
            },
            {
              label: '盟耀支付宝weimob_my@163.com',
              value: 4
            }
          ]
        });
        break;
      case 6:
        this.setState({
          openBankList: [
            {
              label: '微盟现金',
              value: 5
            },
            {
              label: '盟耀现金',
              value: 6
            }
          ]
        });
        break;
      default:
        this.setState({
          openBankList: [
            {
              label: '微盟银行3536',
              value: 1
            },
            {
              label: '盟耀银行0147',
              value: 2
            }
          ]
        });
    }
  };

  handleEditPayOk = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { dispatch } = this.props;
        const params = {
          ...values,
          recordedDate: values.recordedDate.format('YYYY-MM-DD 00:00:00'),
          id: this.props.editRepayId
        };
        dispatch({
          type: 'repay/saveEdit',
          payload: params
        }).then(res => {
          if (!res.code) {
            this.props.handleEditPayCancel();
            this.props.reload();
          }
        });
      }
    });
  };

  render() {
    const { openBankList } = this.state,
      { repay: { editRepayInfo } } = this.props,
      { repay: { confirmLoading } } = this.props,
      { getFieldDecorator } = this.props.form;
    return (
      <Modal
        title="编辑回款"
        visible={this.props.editPayModalVisible}
        onOk={this.handleEditPayOk}
        confirmLoading={confirmLoading}
        onCancel={this.props.handleEditPayCancel}
        destroyOnClose
        width="800px"
      >
        <Form layout="horizontal">
          <Row>
            <Col span={12}>
              <FormItem label="客户名称" {...formItemLayout}>
                {getFieldDecorator('customerName', {
                  initialValue: editRepayInfo.customerName
                })(<Input disabled />)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <FormItem label="打款名称" {...formItemLayout}>
                {getFieldDecorator('payName', {
                  rules: [
                    {
                      required: !editRepayInfo.customerName,
                      message: '请输入打款名称！'
                    }
                  ],
                  initialValue: editRepayInfo.payName
                })(<Input disabled={!!editRepayInfo.customerName} />)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label="入账日期" {...formItemLayout}>
                {getFieldDecorator('recordedDate', {
                  rules: [
                    {
                      required: !editRepayInfo.customerName,
                      message: '请选择入账日期！'
                    }
                  ],
                  initialValue: moment(editRepayInfo.recordedDate)
                })(
                  <DatePicker
                    style={{ width: '250px' }}
                    disabled={!!editRepayInfo.customerName}
                  />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <FormItem label="入账类型" {...formItemLayout}>
                {getFieldDecorator('recordedType', {
                  rules: [
                    {
                      required: !editRepayInfo.customerName,
                      message: '请选择入账类型！'
                    }
                  ],
                  initialValue: editRepayInfo.recordedType || 1
                })(
                  <Select
                    style={{ width: '250px' }}
                    onChange={this.handleChange}
                    disabled={!!editRepayInfo.customerName}
                  >
                    <Option value={1}>银行转账</Option>
                    <Option value={2}>支票</Option>
                    <Option value={3}>pos机</Option>
                    <Option value={4}>承兑汇票</Option>
                    <Option value={5}>支付宝</Option>
                    <Option value={6}>现金</Option>
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label="入账账户" {...formItemLayout}>
                {getFieldDecorator('openBank', {
                  rules: [
                    {
                      required: !editRepayInfo.customerName,
                      message: '请选择入账账户！'
                    }
                  ],
                  initialValue: editRepayInfo.openBank
                })(
                  <Select
                    style={{ width: '250px' }}
                    disabled={!!editRepayInfo.customerName}
                  >
                    {openBankList.map(oneOption => {
                      return (
                        <Option key={oneOption.value} value={oneOption.value}>
                          {oneOption.label}
                        </Option>
                      );
                    })}
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <FormItem label="入账金额" {...formItemLayout}>
                {getFieldDecorator('payAmount', {
                  rules: [
                    {
                      required: !editRepayInfo.customerName,
                      message: '请输入入账金额！'
                    }
                  ],
                  initialValue: editRepayInfo.payAmount
                })(<Input disabled={!!editRepayInfo.customerName} />)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label="入账凭证" {...formItemLayout}>
                {getFieldDecorator('payVoucher', {
                  initialValue: editRepayInfo.payVoucher
                })(<Input disabled={!!editRepayInfo.customerName} />)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <FormItem
                label="回款备注"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 20 }}
              >
                {getFieldDecorator('remark', {
                  initialValue: editRepayInfo.remark
                })(<TextArea rows={2} />)}
              </FormItem>
            </Col>
          </Row>
          {editRepayInfo.customerName && (
            <div>
              <Divider dashed />

              <Row style={{ marginBottom: '8px' }}>
                <Col span={24}>
                  <FormItem
                    label="回款业务"
                    labelCol={{ span: 4 }}
                    wrapperCol={{ span: 20 }}
                  >
                    <Table
                      columns={repayBusinessColumns}
                      dataSource={editRepayInfo.paymentBusinessRelDto}
                      size="small"
                      pagination={false}
                    />
                  </FormItem>
                </Col>
              </Row>
              <Row style={{ marginBottom: '8px' }}>
                <Col span={24}>
                  <FormItem
                    label="申请备注"
                    labelCol={{ span: 4 }}
                    wrapperCol={{ span: 20 }}
                  >
                    <TextArea
                      rows={3}
                      placeholder="申请认领时的备注内容"
                      disabled
                      value={editRepayInfo.applyRemark}
                    />
                  </FormItem>
                </Col>
              </Row>
              <Row style={{ marginBottom: '8px' }}>
                <Col span={24}>
                  <FormItem
                    label="回款附件"
                    labelCol={{ span: 4 }}
                    wrapperCol={{ span: 20 }}
                  >
                    <Image
                      style={{ width: '80px' }}
                      src={editRepayInfo.applyPic}
                      alt="回款截图"
                      preview
                    />
                  </FormItem>
                </Col>
              </Row>
            </div>
          )}
        </Form>
      </Modal>
    );
  }
}

export default EditRepay;
