import React, { PureComponent } from 'react';
import { Card, DatePicker, Table } from 'antd';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import moment from 'moment';
import { Select, Action } from '../../../components/Helpers';
import autodata from '../../../decorators/AutoData';
import can from '../../../decorators/Can';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import { request, enums } from '../../../utils';
import { getPaidStatus, getPaymentStatus, getServiceDuration, getOrderStatus, getContractStatus, getCurrency, getDate } from '../../../utils/helpers';

const { RangePicker } = DatePicker;

@autodata('/api/contracts/list', [
  {
    name: 'fromType',
    label: '来源类型',
    valueType: Number,
    defaultValue: 1,
    render: () => <Select options={enums('PRODUCT_LINE')}/>
  },
  { name: 'contractCode', label: '合同编号' },
  { name: 'customerName', label: '客户名称' },
  {
    name: 'backPayStatus',
    label: '回款状态',
    valueType: Number,
    component: Select,
    props: {
      allowClear: true,
      options: enums('PAID_STATUS'),
      placeholder: '请选择回款状态'
    }
  },
  { name: 'createUserName', label: '创建人员' },
  {
    name: 'createTimeFrom,createTimeOver',
    label: '创建日期',
    colspan: 1.5,
    component: RangePicker,
    valueType: moment,
    props: { format: 'YYYY-MM-DD', placeholder: ['开始日期', '结束日期'] }
  },
  {
    name: 'contractBeginFrom,contractBeginOver',
    label: '开始日期',
    colspan: 1.5,
    component: RangePicker,
    valueType: moment,
    props: { format: 'YYYY-MM-DD', placeholder: ['开始日期', '结束日期'] }
  },
  {
    name: 'contractEndFrom,contractEndOver',
    label: '结束日期',
    colspan: 1.5,
    component: RangePicker,
    valueType: moment,
    props: { format: 'YYYY-MM-DD', placeholder: ['开始日期', '结束日期'] }
  },
  {
    name: 'paymentStatus',
    label: '付款执行',
    valueType: Number,
    component: Select,
    props: {
      allowClear: true,
      options: enums('PAYMENT_STATUS'),
      placeholder: '请选择付款状态'
    }
  },
  {
    name: 'status',
    label: '合同状态',
    valueType: Number,
    component: Select,
    props: {
      allowClear: true,
      options: enums('CONTRACT_STATUS'),
      placeholder: '请选择合同状态'
    }
  },
])
@can()
export default class Contracts extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      contractItem: [],
      expandedRowKeys: [],
    };
  }

  getAction = (value, { id, status }) => {
    const items = [
      { component: Link, text: '查看', to: `contracts/${id}` },
      { text: '作废', type: 'confirm', title: '您确定要废除这个合同吗？', onClick: this.cancel(id), is: status === 0 }
    ];
    return <Action items={items}/>;
  };

  expandedRowRender = ({ id }) => {
    const { $data: { data: contracts } } = this.props;
    const contract = _.find(contracts, { id });
    let { orders: dataSource } = contract;
    const columns = [
      { title: '产品类型', dataIndex: 'productType' },
      { title: '产品名称', dataIndex: 'productName' },
      { title: '购买 / 赠送', dataIndex: 'chargeUnit', render: getServiceDuration },
      { title: '软件金额', dataIndex: 'productAmount', render: getCurrency },
      { title: '服务金额', dataIndex: 'serviceAmount', render: getCurrency },
      { title: '回款金额', dataIndex: 'paymentAmount', render: getCurrency },
      { title: '回款状态', dataIndex: 'backPayStatus', render: getPaidStatus },
      { title: '开通状态', dataIndex: 'orderStatus', render: getOrderStatus }
    ];
    const tableProps = {
      rowKey: 'id',
      size: 'middle',
      pagination: false,
      columns,
      dataSource,
    };
    return <Table {...tableProps}/>;
  };

  onExpand = async (expanded, { id, contractCode }) => {
    if (expanded) {
      const { $data: { data: contracts, setData } } = this.props;
      const contract = _.find(contracts, { id });
      if (_.isUndefined(contract.orders)) {
        const { data } = await request(`/api/contracts/orderItems?contractNo=${contractCode}`);
        contract.orders = data;
        setData({ data: [].concat(contracts) });
      }
    }
    this.setState({ expandedRowKeys: expanded ? [id] : [] });
  };

  cancel = id => async () => {
    await request(`/api/contracts/${id}`, { method: 'DELETE' });
    this.props.$data.reload();
  };

  render() {
    const { onExpand, expandedRowRender, getAction } = this;
    const { expandedRowKeys = [] } = this.state;
    const { $data: { searcher, data: dataSource, pagination, loading, starting }, can } = this.props;
    const columns = [
      { title: '合同编号', dataIndex: 'contractCode', width: 100 },
      { title: '客户名称', dataIndex: 'customerName' },
      { title: '合同金额', dataIndex: 'amount', width: 110, render: getCurrency },
      { title: '回款金额', dataIndex: 'paymentAmount', width: 110, render: getCurrency },
      { title: '开始日期', dataIndex: 'contractBegin', width: 120, render: getDate },
      { title: '结束日期', dataIndex: 'contractEnd', width: 120, render: getDate },
      { title: '尾款日期', dataIndex: 'endPayTime', width: 120, render: getDate },
      { title: '回款状态', dataIndex: 'backPayStatus', width: 100, render: getPaidStatus },
      { title: '付款执行', dataIndex: 'paymentStatus', width: 100, render: getPaymentStatus },
      { title: '合同状态', dataIndex: 'status', width: 100, render: getContractStatus },
      { title: '创建人', dataIndex: 'salesName', width: 130 },
      { title: '操作', fixed: 'right', width: 120, render: getAction }
    ];
    const tableProps = {
      rowKey: 'id',
      scroll: { x: 1450 },
      onExpand,
      expandedRowRender,
      expandedRowKeys,
      columns,
      pagination,
      dataSource,
      loading,
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
