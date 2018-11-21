import React, { PureComponent } from 'react';
import { Select, Table, Card, DatePicker, Cascader } from 'antd';
import moment from 'moment/moment';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import { Action } from '../../../components/Helpers';
import { autodata, can } from '../../../decorators';
import { request, enums } from '../../../utils';
import { getCurrency, getDate, getPaymentAccount, getPaymentMode } from '../../../utils/helpers';

const { RangePicker } = DatePicker;
const accounts = [
  {
    value: 1,
    label: '微盟银行3536'
  },
  {
    value: 2,
    label: '盟耀银行0147'
  },
];
const accountOptions = [
  {
    value: '',
    label: '全部',
  }, {
    value: 1,
    label: '银行转账',
    children: accounts
  }, {
    value: 3,
    label: 'POS机',
    children: accounts
  }, {
    value: 4,
    label: '承兑汇票',
    children: accounts
  }, {
    value: 5,
    label: '支付宝',
    children: [
      {
        value: 3,
        label: '微盟支付宝'
      },
      {
        value: 4,
        label: '盟耀支付宝'
      },
    ]
  }, {
    value: 6,
    label: '现金',
    children: [
      {
        value: 5,
        label: '微盟现金'
      },
      {
        value: 6,
        label: '盟耀现金'
      },
    ]
  }
];

@autodata('/api/applyPays/payments', [
  { name: 'cashier', label: '财务出纳' },
  { name: 'payAmount', label: '入账金额' },
  {
    name: 'recordedType,payAccount',
    label: '入账账号',
    valueType: Number,
    component: Cascader,
    props: { options: enums('PAYMENT_ACCOUNT'), placeholder: '请选择入帐帐号' }
  },
  {
    name: 'accountBeginTime,accountEndTime',
    label: '入账日期',
    colspan: 1.5,
    component: RangePicker,
    valueType: moment,
    props: { format: 'YYYY-MM-DD', placeholder: ['开始日期', '结束日期'] }
  },
  {
    name: 'createBeginTime,createEndTime',
    label: '创建时间',
    colspan: 1.5,
    component: RangePicker,
    valueType: moment,
    props: { format: 'YYYY-MM-DD', placeholder: ['开始日期', '结束日期'] }
  }
])
@can()
export default class BusinessClaimAssociate extends PureComponent {
  associate = backId => async () => {
    const { params: { id: applyId } } = this.props.match;
    await request(`/api/applyPays/relPayment`, {
      method: 'GET',
      query: { applyId, backId }
    });
    this.props.$data.reload();
  };

  getAction = (value, { id }) => {
    const items = [
      { text: '关联回款', type: 'confirm', onClick: this.associate(id) },
    ];
    return <Action items={items}/>;
  };

  render() {
    const { $data: { searcher, data: dataSource = [], pagination, loading, starting }, can } = this.props;
    const columns = [
      { title: '打款名称', dataIndex: 'payName', width: 120 },
      { title: '入账类型', dataIndex: 'recordedType', width: 90, render: getPaymentMode },
      { title: '入账账号', dataIndex: 'openBank', render: getPaymentAccount },
      { title: '财务出纳', dataIndex: 'cashier', width: 120 },
      { title: '入账日期', dataIndex: 'recordedDate', width: 120, render: getDate },
      { title: '已关联金额', dataIndex: 'relAmount', width: 120, render: getCurrency },
      { title: '可关联金额', dataIndex: 'notRelAmount', width: 120, render: getCurrency },
      { title: '创建人', dataIndex: 'createUser', width: 150 },
      { title: '创建时间', dataIndex: 'createTime', width: 120, render: getDate },
      { title: '操作', fixed: 'right', width: 80, render: this.getAction }
    ];
    const tableProps = {
      rowKey: 'id',
      scroll: { x: 1300 },
      pagination,
      dataSource,
      loading,
      columns,
    };
    return (
      <PageHeaderLayout>
        <Card className="flex-item" bordered={false} loading={starting}>
          {searcher}
          <Table {...tableProps}/>
        </Card>
      </PageHeaderLayout>
    );
  }
}
