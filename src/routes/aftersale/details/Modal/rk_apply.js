import React, {PureComponent} from 'react';
import styles from '../index.less';
import common from '../../../Personnel/common/index.less';
import moment from 'moment';
import _ from 'lodash';
import WMCUpload from '../../../../components/WMCUpload';
import {Select} from '../../../../components/Helpers';
import {request, filters, fromValues, enums} from '../../../../utils';
import {
  getDate,
  getPaymentAccount,
  getCurrency,
  getBusinessStatus,
  getBackpayStatus
} from '../../../../utils/helpers';
import {
  Form,
  Input,
  Radio,
  Button,
  AutoComplete,
  DatePicker,
  Modal,
  Table,
  Upload,
  Icon,
  message,
} from 'antd';

const FormItem = Form.Item;
const AutoCompleteOption = AutoComplete.Option;
const RadioGroup = Radio.Group;
const {TextArea} = Input;
const formItemLayout = {
  labelCol: {span: 8},
  wrapperCol: {span: 16},
};
const formItemfullLayout = {
  labelCol: {span: 4},
  wrapperCol: {span: 20},
};
const account = [
  {value: 1, label: '微盟银行3536'},
  {value: 2, label: '盟耀银行'},
  {value: 3, label: '微盟支付宝'},
  {value: 4, label: '盟耀支付宝'},
  {value: 5, label: '微盟现金'},
  {value: 6, label: '盟耀现金'}
];

const accountType = [
  {value: 1, label: '银行转账', children: filters(account, fromValues([1, 2]))},
  {value: 2, label: '支票', children: filters(account, fromValues([1, 2]))},
  {value: 3, label: 'POS机', children: filters(account, fromValues([1, 2]))},
  {value: 4, label: '承兑汇票', children: filters(account, fromValues([1, 2]))},
  {value: 5, label: '支付宝', children: filters(account, fromValues([3, 4]))},
  {value: 6, label: '现金', children: filters(account, fromValues([5, 6]))}
];
const test = [
  [
    {value: 1, label: '微盟银行3536'},
    {value: 2, label: '盟耀银行'},
  ],
  [
    {value: 1, label: '微盟银行3536'},
    {value: 2, label: '盟耀银行'},
  ]
];
@Form.create()
export default class RkApply extends PureComponent {
  state = {
    visible: false,
    customerId: '',
    customerName: '',
    business: [],
    applyPayBussiess: [],
    fileUrl: '',

  };
  info = (text) => {
    message.info(text);
  };
  showModal = () => {
    this.setState({
      visible: true,
    });
  };
  submitinvoice = async (parms) => {
    const {getReturned, current, customerId, onCancel} = this.props;
    const {data, code, message: msg} = await request(`/api/applyPays`, {
      method: 'POST',
      body: {
        ...parms
      }
    });
    getReturned(customerId, current);
    message.success(msg);
    onCancel();
    this.props.form.resetFields()
  };
  handleOk = (e) => {
    const {customerId, customerName, getReturned, current} = this.props;
    const {applyPayBussiess} = this.state;
    this.props.form.validateFields((err, values) => {
      console.info('value', values);
      let {attachmentDtos = []} = values;
      attachmentDtos = attachmentDtos.map(({fileName, fileUrl}) => ({
        fileName,
        fileUrl
      }));
      const recordedDate = getDate(values.recordedDate);
      if (!err && applyPayBussiess.length) {
        values = Object.assign({}, values, {attachmentDtos, recordedDate, customerId, customerName, applyPayBussiess});
        this.submitinvoice(values);
      } else {
        message.info('请选择关关联业务');
      }
    });
  };
  handleCancel = (e) => {
    const {onCancel} = this.props;
    this.props.form.resetFields();
    onCancel()
  };
  // table
  columns = [{
    title: '产品类型',
    width: 84,
    dataIndex: 'productType',
  }, {
    title: '业务类型',
    width: 84,
    dataIndex: 'itemType',
    render: getBusinessStatus
  }, {
    title: '产品名称',
    width: 84,
    dataIndex: 'productName',
  }, {
    title: '产品金额',
    width: 84,
    dataIndex: 'productAmount',
    render: getCurrency
  }, {
    title: '服务费金额',
    width: 84,
    dataIndex: 'serviceAmount',
    render: getCurrency
  }, {
    title: '回款状态',
    width: 84,
    dataIndex: 'backPayStatus',
    render: getBackpayStatus
  }, {
    title: '创建人',
    width: 84,
    dataIndex: 'createUserName',
  }];
  rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      const applyPayBussiess = selectedRows.map(item => ({amount: item.amount, id: item.id}));
      this.setState({
        applyPayBussiess
      });
    }
  };
  businessList = async (customerId) => {
    const {data} = await request(`/api/applyPays/orderItems`, {
      method: 'GET',
      query: {
        customerId,
      }
    });
    this.setState({
      business: data
    });
  };

  componentDidMount() {
    const {customerId} = this.props;
    if (customerId) {
      this.businessList(customerId);
    }
  }

  componentWillReceiveProps({customerId}) {
    if (customerId !== this.props.customerId && customerId) {
      this.businessList(customerId);
    }
  }

  // 上传文件
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
        };
      }
      return file;
    });
  };

  onTypeChange = (value) => {
    const {children: accounts = []} = _.find(enums('PAYMENT_MODE'), {value}) || {};
    this.setState({accounts});
  };

  render() {
    const {fileList, accounts = []} = this.state;
    const {form, customerName, ...receiveProps} = this.props;
    const {business} = this.state;
    const {getFieldDecorator, validateFieldsAndScroll, getFieldsError, getFieldValue} = form;
    const dateFormat = 'YYYY/MM/DD';
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
          title="新建认款申请"
          visible={this.state.visible}
          destroyOnClose
          {...receiveProps}
          onOk={this.handleOk}
          width={700}
          onCancel={this.handleCancel}
        >
          <div className={styles.addLinkman}>
            <Form layout='inline'>
              <div className={styles.item}>
                <FormItem
                  {...formItemLayout}
                  label='客户名称'>
                  <span>{customerName}</span>
                </FormItem>
              </div>
              <div className={styles.item}>
                <FormItem
                  {...formItemLayout}
                  label='打款名称'>
                  {
                    getFieldDecorator('payName', {
                      rules: [{required: true, message: '请输入打款人'}],
                    })(
                      <Input placeholder="对方打过来时的打款人"/>
                    )
                  }
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label='入账日期'>
                  {
                    getFieldDecorator('recordedDate', {
                      rules: [{required: true, message: '请选择入账日期'}],
                    })(
                      <DatePicker
                        style={{width: '100%'}}
                        placeholder="入账日期"
                      />
                    )
                  }
                </FormItem>
              </div>
              <div className={styles.item}>
                <FormItem
                  {...formItemLayout}
                  label='入账类型'>
                  {
                    getFieldDecorator('recordedType', {
                      rules: [{required: true, message: '入账类型'}],
                    })(<Select placeholder="请选择入帐类型" options={enums('PAYMENT_MODE')} onChange={this.onTypeChange}/>)
                  }
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label='入账账户'>
                  {
                    getFieldDecorator('openBank', {
                      rules: [{required: true, message: '入账账户'}]
                    })(<Select placeholder="请选择入帐帐户" labelRender={getPaymentAccount} options={accounts}/>)
                  }
                </FormItem>
              </div>
              <div className={styles.item}>
                <FormItem
                  {...formItemLayout}
                  label='入账金额'>
                  {
                    getFieldDecorator('payAmount', {
                      rules: [{required: true, message: '入账金额'}],
                    })(
                      <Input/>
                    )
                  }
                </FormItem>
              </div>
              <div className={styles.table}>
                <Table rowSelection={this.rowSelection}
                       columns={this.columns}
                       dataSource={business}
                       size="small"
                       rowKey="id"
                       scroll={{y: 240}}
                       bordered={true}
                       pagination={false}/>
              </div>
              <div className={styles.input_item}>
                <FormItem
                  {...formItemfullLayout}
                  label='申请备注'>
                  {
                    getFieldDecorator('apply_remark', {
                      initialValue: 0
                    })(
                      <TextArea placeholder="申请备注"/>
                    )
                  }

                </FormItem>
              </div>
              <div className={styles.input_item}>
                <FormItem
                  {...formItemfullLayout}
                  label='回款附件'>
                  {
                    getFieldDecorator('attachmentDtos', {
                      valuePropName: 'fileList',
                      getValueFromEvent: this.normFile,
                      rules: [{required: true, message: '请选择文件'}],
                    })(
                      <WMCUpload content={<Icon type="plus"/>} showUploadList={true}/>
                    )
                  }
                </FormItem>
              </div>
            </Form>
          </div>
        </Modal>
      </div>
    );
  }
}
