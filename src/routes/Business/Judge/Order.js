import React, { PureComponent, Fragment } from 'react';
import { DatePicker, Form, Input, Table, Card, Alert } from 'antd';
import moment from 'moment';
import { autodata, can } from '../../../decorators';
import { Dialog, AutoComplete } from '../../../components';
import { Action, Select } from '../../../components/Helpers';
import { getCurrency, getDate, getServiceDuration, getPaidStatus, getOrderStatus, getProductType } from '../../../utils/helpers';
import { enums } from '../../../utils';
import styles from './index.less';

const { RangePicker } = DatePicker;

@autodata('/api/judgeOrders/orders', [
  {
    name: 'fromType',
    label: '产品线',
    valueType: Number,
    defaultValue: 1,
    render: () => <Select options={enums('PRODUCT_LINE')}/>
  },
  { name: 'customerName', label: '客户名称' },
  { name: 'createUserName', label: '业务创建人' },
  {
    name: 'beginTime,endTime',
    label: '创建时间',
    colspan: 1.5,
    component: RangePicker,
    valueType: moment,
    props: { format: 'YYYY-MM-DD', placeholder: ['开始日期', '结束日期'] }
  }
])
@can()
export default class Order extends PureComponent {
  judge = ({ id }) => () => {
    const { onSubmitted } = this;
    Dialog.open({
      title: '业务判单',
      formProps: {
        action: '/api/judgeOrders',
        method: 'POST',
        onSubmitted
      },
      render() {
        const { form: { getFieldDecorator } } = this.props;
        const itemProps = { labelCol: { span: 4 }, wrapperCol: { span: 20 } };
        const autoCompleteProps = {
          dataSource: '/api/personnel/employee/think',
          valuePropName: 'id',
          keywordPropName: 'name',
          labelRender: record => `${record.name} (${record.username})`
        };
        return (
          <Fragment>
            <Alert className={styles.warning} message="警告：判单后，此条业务的提成受益人将改变！" type="warning" showIcon/>
            <Form.Item>
              {getFieldDecorator('orderId', {
                initialValue: id,
              })(<Input hidden={true}/>)}
            </Form.Item>
            <Form.Item {...itemProps} label="受益人">
              {getFieldDecorator('receiptorId', {
                trigger: 'onSelect',
                getValueFromEvent: record => record.username,
                rules: [{ required: true, message: '受益人不能为空' }]
              })(<AutoComplete placeholder="请选择业务受益人" {...autoCompleteProps}/>)}
            </Form.Item>
          </Fragment>
        );
      }
    });
  };

  onSubmitted = () => {
    this.props.$data.reload();
  };

  getAction = (value, record) => {
    return <Action items={[{ text: '判单', onClick: this.judge(record) }]}/>;
  };

  render() {
    const { $data: { searcher, data: dataSource, pagination, loading, starting }, can } = this.props;
    const columns = [
      { title: '合同编号', dataIndex: 'contractNo', width: 100, fixed: 'left' },
      { title: '客户名称', dataIndex: 'customerName' },
      { title: '产品类型', dataIndex: 'productType', width: 120, render: getProductType },
      { title: '产品名称', dataIndex: 'productName', width: 150 },
      { title: '购买 / 赠送', dataIndex: 'chargeUnit', width: 100, render: getServiceDuration },
      { title: '软件金额', dataIndex: 'productAmount', width: 120, render: getCurrency },
      { title: '服务金额', dataIndex: 'serviceAmount', width: 120, render: getCurrency },
      { title: '回款金额', dataIndex: 'paymentAmount', width: 120, render: getCurrency },
      { title: '回款状态', dataIndex: 'backPayStatus', width: 100, render: getPaidStatus },
      { title: '开通状态', dataIndex: 'orderStatus', width: 110, render: getOrderStatus },
      { title: '创建人', dataIndex: 'createUserName', width: 130 },
      { title: '创建时间', dataIndex: 'createTime', width: 110, render: getDate },
      { title: '操作', key: 'action', width: 70, fixed: 'right', render: this.getAction }
    ];
    const tableProps = {
      rowKey: 'id',
      scroll: { x: 1550 },
      columns,
      pagination,
      dataSource,
      loading
    };
    return (
      <Card className="flex-item" bordered={false} loading={starting}>
        {searcher}
        <Table {...tableProps}/>
      </Card>
    );
  }
}
