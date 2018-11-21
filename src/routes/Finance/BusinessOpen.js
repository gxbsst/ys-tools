import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { DatePicker, Table, Card, Popconfirm } from 'antd';
import moment from 'moment/moment';
import can from '../../decorators/Can';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import autodata from '../../decorators/AutoData';
import { Select } from '../../components/Helpers';
import { enums } from '../../utils';
import {
  getOrderStatusBusi,
  getBackpayStatus,
  getProductType,
  getServiceDuration
} from '../../utils/helpers';

const { RangePicker } = DatePicker;

@can([8003000])
@autodata('/api/business', [
  { name: 'customerName', label: '客户名称' },
  {
    name: 'applyTimeStart, applyTimeEnd',
    label: '开通申请时间',
    colspan: 2,
    valueType: moment,
    component: RangePicker,
    props: { format: 'YYYY-MM-DD', placeholder: ['开始日期', '结束日期'] }
  },
  {
    name: 'establishTimeStart, establishTimeEnd',
    label: '需要开通日期',
    colspan: 2,
    valueType: moment,
    component: RangePicker,
    props: { format: 'YYYY-MM-DD', placeholder: ['开始日期', '结束日期'] }
  },
  { name: 'applyUser', label: '开通申请人' },
  { name: 'dredgeAccountName', label: '开通人' },
  {
    name: 'orderStatus',
    label: '业务状态',
    valueType: Number,
    component: Select,
    props: {
      allowClear: true,
      options: enums('ORDER_STATUS_BUSI'),
      placeholder: '请选择业务状态'
    }
  },
  {
    name: 'backPayStatus',
    label: '回款状态',
    valueType: Number,
    component: Select,
    props: {
      allowClear: true,
      options: enums('RECEIPT_STATUS'),
      placeholder: '请选择回款状态'
    }
  },
  { name: 'weimobAccount', label: '微盟账号' }
])
@connect(state => ({
  busiopen: state.busiopen
}))
export default class BusinessOpen extends PureComponent {
  openService = id => {
    const { dispatch } = this.props;
    const { $data: { reload } } = this.props;
    dispatch({
      type: 'busiopen/openService',
      payload: id
    }).then(res => {
      if (!res.code) {
        reload();
      }
    });
  };

  render() {
    const serviceOpen = 8003002; //服务开通操作
    const { can } = this.props;
    const businessOpenColumns = [
      {
        title: '开通申请时间',
        dataIndex: 'applyTime',
        key: 'applyTime'
      },
      {
        title: '开通申请人',
        dataIndex: 'applyUserName',
        key: 'applyUserName',
        width: 120
      },
      {
        title: '开通时间',
        dataIndex: 'establishTime',
        key: 'establishTime'
      },
      {
        title: '开通人',
        dataIndex: 'dredgeAccountName',
        key: 'dredgeAccountName',
        width: 120
      },
      {
        title: '业务状态',
        dataIndex: 'orderStatus',
        key: 'orderStatus',
        render: getOrderStatusBusi
      },
      {
        title: '客户名称',
        dataIndex: 'customerName',
        key: 'customerName',
        width: 170
      },
      {
        title: '微盟账号',
        dataIndex: 'weimobAccount',
        key: 'weimobAccount'
      },
      {
        title: '店铺名称',
        dataIndex: 'shopName',
        key: 'shopName'
      },
      {
        title: '产品类型',
        dataIndex: 'productType',
        key: 'productType',
        render: getProductType
      },
      {
        title: '产品名称',
        dataIndex: 'productName',
        key: 'productName'
      },
      {
        title: '购买 / 赠送',
        key: 'serviceGiftYears',
        render: getServiceDuration
      },
      {
        title: '软件金额',
        dataIndex: 'productAmount',
        key: 'productAmount',
        render: (text, record) => {
          return `￥${record.productAmount - record.discountProductAmount}`;
        }
      },
      {
        title: '服务金额',
        dataIndex: 'serviceAmount',
        key: 'serviceAmount',
        render: (text, record) => {
          return `￥${record.serviceAmount - record.discountServiceAmount}`;
        }
      },
      {
        title: '回款金额',
        dataIndex: 'paymentAmount',
        key: 'paymentAmount',
        render: text => {
          return `￥${text}`;
        }
      },
      {
        title: '回款状态',
        dataIndex: 'backPayStatus',
        key: 'backPayStatus',
        render: getBackpayStatus
      },
      {
        title: '服务开始日期',
        dataIndex: 'serviceStartTime',
        key: 'serviceStartTime'
      },
      {
        title: '服务结束日期',
        dataIndex: 'serviceEndTime',
        key: 'serviceEndTime'
      },
      {
        title: '服务作废日期',
        dataIndex: 'cancelTime',
        key: 'cancelTime'
      },
      {
        title: '关联合同',
        dataIndex: 'contractNo',
        key: 'contractNo'
      },
      {
        title: '关联发票',
        dataIndex: 'invoiceNo',
        key: 'invoiceNo'
      },
      {
        title: '开通备注',
        dataIndex: 'remark',
        key: 'remark'
      },
      {
        title: '操作',
        key: 'action',
        fixed: 'right',
        width: 100,
        render: (text, record) => (
          <span>
            {record.orderStatus === 3 &&
              can(serviceOpen) && (
                <Popconfirm
                  title="确定开通该服务吗?"
                  onConfirm={() => this.openService(record.id)}
                  okText="确认"
                  cancelText="取消"
                >
                  <a>服务开通</a>
                </Popconfirm>
              )}
          </span>
        )
      }
    ];
    const {
      $data: { searcher, data, pagination, loading }
    } = this.props;
    return (
      <div>
        <PageHeaderLayout>
          <Card bordered={false}>
            {searcher}
            <Table
              columns={businessOpenColumns}
              dataSource={data}
              rowKey="id"
              scroll={{ x: 3300 }}
              pagination={{
                ...pagination,
                showTotal: () => `共${pagination.total}条`
              }}
              loading={loading}
            />
          </Card>
        </PageHeaderLayout>
      </div>
    );
  }
}
