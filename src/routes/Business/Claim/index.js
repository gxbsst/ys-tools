import React, { PureComponent } from 'react';
import { Link } from 'react-router-dom';
import { Card, DatePicker, Table } from 'antd';
import moment from 'moment';
import { Cascader } from '../../../components';
import { Select, Action } from '../../../components/Helpers';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import { autodata, can } from '../../../decorators';
import { getCurrency, getAssociateStatus, getPaymentAccount, getPaymentMode, getPaymentModesWithAccount, getDate } from '../../../utils/helpers';
import { request, enums } from '../../../utils';

const { RangePicker } = DatePicker;
@autodata('/api/applyPays', [
  {
    name: 'fromSource',
    label: '来源类型',
    valueType: Number,
    defaultValue: 1,
    render: () => <Select options={enums('PRODUCT_LINE')}/>
  },
  { name: 'customerName', label: '客户名称' },
  { name: 'claimName', label: '回款认领人' },
  {
    name: 'relPaymentStatus',
    label: '关联状态',
    valueType: Number,
    component: Select,
    props: {
      allowClear: true,
      options: enums('ASSOCIATE_STATUS'),
      placeholder: '请选择关联状态'
    }
  },
  {
    name: 'accountType, openBank',
    label: '入账账号',
    valueType: Number,
    component: Cascader,
    props: {
      allowClear: true,
      options: getPaymentModesWithAccount(),
      placeholder: '请选择入账账号',
      normalize: (value, option, values) => values,
    }
  },
  {
    name: 'accountBeginTime, accountEndTime',
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
  },
])
@can()
export default class BusinessClaim extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      payAccount: []
    };
  }

  unassociated = id => async () => {
    await request(`/api/applyPays/${id}`, { method: 'DELETE' });
    this.props.$data.reload();
  };

  getAction = (value, { id, relPaymentStatus: status }) => {
    const items = [
      { component: Link, text: '查看', to: `/business/claims/${id}` },
    ];
    if (status === 1) {
      items.push({ type: 'confirm', text: '取消关联', title: '您确定要取消关联回款吗？', onClick: this.unassociated(id) });
    } else {
      items.push({ component: Link, text: '关联回款', to: `/business/claims/${id}/associate` });
    }
    return <Action items={items}/>;
  };

  render() {
    const { $data: { searcher, data: dataSource, pagination, loading, starting }, can } = this.props;
    const columns = [
      { title: '客户名称', dataIndex: 'customerName' },
      { title: '入账类型', dataIndex: 'recordedType', width: 100, render: getPaymentMode },
      { title: '入账账号', dataIndex: 'openBank', width: 220, render: getPaymentAccount },
      { title: '财务出纳', dataIndex: 'cashier', width: 150 },
      { title: '入账日期', dataIndex: 'recordedDate', width: 110, render: getDate },
      { title: '入账金额', dataIndex: 'payAmount', width: 120, render: getCurrency },
      { title: '回款认领人', dataIndex: 'claimName', width: 130 },
      { title: '关联状态', dataIndex: 'relPaymentStatus', width: 120, render: getAssociateStatus },
      { title: '创建人', dataIndex: 'createUser', width: 150 },
      { title: '创建时间', dataIndex: 'createTime', width: 120, render: getDate },
      { title: '操作', fixed: 'right', width: 130, render: this.getAction }
    ];
    const tableProps = {
      rowKey: 'id',
      scroll: { x: 1650 },
      dataSource,
      pagination,
      columns,
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
