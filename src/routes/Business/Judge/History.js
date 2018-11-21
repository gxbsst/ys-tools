import React, { PureComponent } from 'react';
import { DatePicker, Table, Card } from 'antd';
import moment from 'moment';
import autodata from '../../../decorators/AutoData';
import { Select } from '../../../components/Helpers';
import { enums } from '../../../utils';
import { getPaidStatus, getOrderStatus, getProductType, getServiceDuration, getCurrency, getDate } from '../../../utils/helpers';

const { RangePicker } = DatePicker;
@autodata('/api/judgeOrders', [
  {
    name: 'fromType',
    label: '产品线',
    valueType: Number,
    defaultValue: 1,
    render: () => <Select options={enums('PRODUCT_LINE')}/>
  },
  { name: 'customerName', label: '客户名称'  },
  { name: 'createUserName', label: '业务创建人' },
  {
    name: 'beginTime,endTime',
    label: '创建时间',
    colspan: 1.5,
    component: RangePicker,
    valueType: moment,
    props: { format: 'YYYY-MM-DD', placeholder: ['开始日期', '结束日期'] }
  },
  {
    name: 'judgeBeginTime,jundgeEndTime',
    label: '判单时间',
    colspan: 1.5,
    component: RangePicker,
    valueType: moment,
    props: { format: 'YYYY-MM-DD', placeholder: ['开始日期', '结束日期'] }
  },

])
export default class History extends PureComponent {
  render() {
    const { $data: { searcher, data: dataSource, pagination, loading, starting } } = this.props;
    const columns = [
      { title: '业务ID', dataIndex: 'orderId', width: 100 },
      { title: '客户名称', dataIndex: 'customerName' },
      { title: '产品类型', dataIndex: 'productType', width: 100, render: getProductType },
      { title: '产品名称', dataIndex: 'productName', width: 200 },
      { title: '购买 / 赠送', dataIndex: 'chargeUnit', width: 100, render: getServiceDuration },
      { title: '软件金额', dataIndex: 'productAmount', width: 120, render: getCurrency },
      { title: '服务金额', dataIndex: 'serviceAmount', width: 120, render: getCurrency },
      { title: '回款金额', dataIndex: 'paymentAmount', width: 120, render: getCurrency },
      { title: '回款状态', dataIndex: 'backPayStatus', width: 100, render: getPaidStatus },
      { title: '开通状态', dataIndex: 'orderStatus', width: 110, render: getOrderStatus },
      { title: '创建人', dataIndex: 'createUserName', width: 130 },
      { title: '创建时间', dataIndex: 'createTime', width: 110, render: getDate },
      { title: '判单时间', dataIndex: 'judgeTime', width: 110, render: getDate },
      { title: '判单人', dataIndex: 'judgeUserName', width: 130 },
      { title: '受益人', dataIndex: 'receiptorName', width: 130, fixed: 'right' }
    ];
    const tableProps = {
      rowKey: 'id',
      scroll: { x: 1900 },
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
