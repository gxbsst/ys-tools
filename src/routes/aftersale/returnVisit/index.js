import React, {PureComponent} from "react";
import _ from 'lodash';
import moment from 'moment'
import {Link, hashHistory, routerRedux} from "dva/router";
import {Call} from '../../../components';
import Dialog from '../../../components/Dialog';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import autodata from '../../../decorators/AutoData';
import can from "../../../decorators/Can";
import common from '../../Personnel/common/index.less'
import request from '../../../utils/request';
import {enums} from '../../../utils';
import {Action, Select, Ellipsis, Stars} from '../../../components/Helpers';
import {getBusinessStatus, getBackpayStatus, getOrderStatus} from '../../../utils/helpers';
import styles from './index.less'
import {
  Button,
  Card,
  Tabs,
  Table,
  Radio,
  Form,
  Input,
  Collapse,
  DatePicker,
} from 'antd';

const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
const {RangePicker} = DatePicker;
const FormItem = Form.Item;
const Panel = Collapse.Panel;

const days = [
  {value: 3, label: '3天未联系'},
  {value: 5, label: '5天未联系'},
  {value: 7, label: '7天未联系'},
  {value: 15, label: '15天未联系'},
  {value: 30, label: '30天未联系'},
  {value: 31, label: '30天以上未联系'},
];
const renew = [
  {value: 10, label: '10天内'},
  {value: 30, label: '30天内'},
  {value: 90, label: '90天内'},
]
const fromSource = [
  {value: 1, label: '新零售'},
  {value: 2, label: '到店'},
];
const formItemLayout = {
  labelCol: {span: 4},
  wrapperCol: {span: 20},
};

//@can([10010000], true)
@autodata('/api/customerRenewVisit/list', [
  {
    name: 'fromSource', label: '来源类型',
    component: Select,
    defaultValue: 1,
    valueType: Number,
    props: {
      options: fromSource,
      placeholder: '来源类型'
    }
  },
  {name: 'customerName', label: '客户名称'},
  {
    name: 'serviceStartTimeBegin,serviceStartTimeEnd',
    label: '服务开始时间',
    colspan: 1.5,
    component: RangePicker,
    valueType: moment,
    props: {format: 'YYYY-MM-DD', placeholder: ['开始日期', '结束日期']}
  },
  {
    name: 'serviceEndTimeBegin,serviceEndTimeEnd',
    label: '服务结束时间',
    colspan: 1.5,
    component: RangePicker,
    valueType: moment,
    props: {format: 'YYYY-MM-DD', placeholder: ['开始日期', '结束日期']}
  },
  {
    name: 'warnDatetimeBegin,warnDatetimeEnd',
    label: '下次提醒时间',
    colspan: 1.5,
    component: RangePicker,
    valueType: moment,
    props: {format: 'YYYY-MM-DD', placeholder: ['开始日期', '结束日期']}
  },
  {
    name: 'diffDay',
    label: '未联系天数',
    valueType: Number,
    component: Select,
    props: {
      allowClear: true,
      options: days,
      placeholder: '未联系天数'
    }
  },
  {
    name: 'diffRenewDay',
    label: '距续费天数',
    valueType: Number,
    component: Select,
    props: {
      allowClear: true,
      options: renew,
      placeholder: '距续费天数'
    }
  },
  {name: 'weimobAccount', label: '微盟账号'},
  {name: 'serviceName', label: '客服人员'},
  {
    name: 'level',
    label: '客户等级',
    valueType: Number,
    component: Select,
    props: {
      allowClear: true,
      options: enums('CUSTOMER_LEVEL'),
      placeholder: '请选择客户等级'
    }
  },

])
export default class Mycustomer extends PureComponent {
  state = {
    childData: [],
    expandedRowKeys: []
  }
  // 越权登陆
  override = record => async () => {
    let newWindow = window.open('', '_blank', '');
    const {data: {url}} = await request(`api/customer/login/${record.productId}/${record.weimobAccount}`);
    if (url) {
      newWindow.location.href = url;
    }
  }
  columns = [{
    title: '操作',
    dataIndex: 'seat_status',
    width: 140,
    render: (text, record) => {
      const {can} = this.props;
      return (
        <div className={common.operate}>
          {
            // can(10010002) &&
            record.weimobAccount &&
            <span className={common.item} style={{cursor: "pointer"}} onClick={this.override(record)}>越权登陆</span>
          }
          {
            // can(10010001) &&
            <Link className={common.item}
                  to={`/aftersale/details/${record.id}`}>客户详情</Link>
          }
        </div>
      )
    }
  },
    {
      title: '客户名称',
      dataIndex: 'customerName',
    }, {
      title: '客户等级',
      dataIndex: 'level',
      render: value => <Stars count={value}/>
    }, {
      title: '微盟账号',
      dataIndex: 'weimobAccount',
    }, {
      title: '店铺名称',
      dataIndex: 'shopName',
    }, {
      title: '软件系列',
      dataIndex: 'productName',
    }, {
      title: '当前门店数量',
      dataIndex: 'storeCount',
    }, {
      title: '最近联系时间',
      dataIndex: 'lasterDatetime',
    }, {
      title: '未联系天数',
      dataIndex: 'diffDay',
    }, {
      title: '下次提醒时间',
      dataIndex: 'warnDatetime',
    }, {
      title: '服务开始日期',
      dataIndex: 'serviceStartTime',
    }, {
      title: '服务结束日期',
      dataIndex: 'serviceEndTime',
    }, {
      title: '售后客服',
      dataIndex: 'serviceName',
    }, {
      title: '品牌分',
      dataIndex: 'brandClass',
    }, {
      title: '效果分',
      dataIndex: 'operationClass',
    }, {
      title: '活跃分',
      dataIndex: 'livenessClass',
    }, {
      title: '续费分',
      dataIndex: 'renewClass',
    }, {
      title: '影响分',
      dataIndex: 'influenceClass',
    }, {
      title: '产品分',
      dataIndex: 'proSatisfactionClass',
    }, {
      title: '服务分',
      dataIndex: 'serverSatisfactionClass',
    }, {
      title: '备注',
      dataIndex: 'remark',
    }
  ];
  expandedRowRender = ({customerBizId}) => {
    const {$data: {data: contracts}} = this.props;
    const contract = _.find(contracts, {customerBizId});
    const {businesses, loading} = contract;
    const columns = [
      {
        title: '',
        dataIndex: 'handle',
        render: (text, record) => (
          <div className={common.operate}>
            <span className={common.item} onClick={this.edit(customerBizId, record)}>编辑</span>
            <Call tel={record.mobile} readyOnly>呼叫</Call>
          </div>
        )
      },
      {
        title: '业务类型',
        dataIndex: 'itemType',
        render: getBusinessStatus
      },
      {title: '软件系列', dataIndex: 'productType', key: 1},
      {title: '版本', dataIndex: 'account'},
      {
        title: '业务量/赠送量', dataIndex: 'portfolio',
        render: (text, record) => (
          <span>{record.dredgeTimes}/{record.giftTimes}</span>
        )
      },
      {title: '产品金额', dataIndex: 'productAmount'},
      {title: '服务金额', dataIndex: 'serviceAmount'},
      {title: '回款金额', key: 'paymentAmount'},
      {
        title: '回款状态', dataIndex: 'backPayStatus',
        render: getBackpayStatus
      },
      {
        title: '开通状态', dataIndex: 'orderStatus', key: 2,
        render: getOrderStatus
      },
      {title: '软件开通日期', dataIndex: 'createTime', key: 3},
      {title: '服务开始日期', dataIndex: 'serviceStartTime', key: 4},
      {title: '服务结束日期', dataIndex: 'serviceEndTime', key: 5},
      {title: '服务关闭日期', dataIndex: 'into_sh', key: 6},
      {title: '合同关联', dataIndex: 'contractNo', key: 7},
      {title: '发票关联', dataIndex: 'invoiceNo', key: 8},
      {title: '创建人', dataIndex: 'createUser', key: 9},
    ];
    return (
      <Table
        columns={columns}
        dataSource={businesses}
        pagination={false}
        loading={loading}
        rowKey="id"
        width="80%"
      />
    );
  };
  // 刷先页面
  getBusinesses = async (customerBizId, force) => {
    const {$data: {data: contracts, setData}} = this.props;
    const contract = _.find(contracts, {customerBizId});
    if (force || _.isUndefined(contract.businesses)) {
      contract.loading = true;
      const {data: businesses} = await request(`/api/orderOper/${customerBizId}/orderItems`);
      Object.assign(contract, {loading: false, businesses});
      setData({data: [].concat(contracts)});
    }
  };
  onExpand = async (expanded, {customerBizId}) => {
    expanded && this.getBusinesses(customerBizId)
    this.setState({expandedRowKeys: expanded ? [customerBizId] : []});
  };
  // 编辑
  edit = (customerBizId, record) => () => {
    const {id} = record;
    Dialog.open({
      title: '联系人编辑',
      formProps: {
        action: `/api/business/${id}/updateLink`,
        method: 'PUT',
        onSubmitted: () => {
          this.getBusinesses(customerBizId, true)
        }
      },
      render({props: {form: {getFieldDecorator}}}) {
        return (
          <div>
            <FormItem {...formItemLayout} label="联系人名称">
              {getFieldDecorator('contactsName', {
                initialValue: record.contactsName ? record.contactsName : "",
                rules: [{required: true, message: '联系人名称'}]
              })(<Input placeholder="联系人名称"/>)}
            </FormItem>
            <FormItem {...formItemLayout} label="联系人编号">
              {getFieldDecorator('contactsNo', {
                initialValue: record.contactsNo ? record.contactsNo : '',
              })(<Input placeholder="联系人编号"/>)}
            </FormItem>
            <FormItem {...formItemLayout} label="备注">
              {getFieldDecorator('remark', {
                initialValue: record.remark ? record.remark : "",
              })(<Input placeholder="备注"/>)}
            </FormItem>
          </div>
        );
      }
    });
  };

  render() {
    const {columns} = this;
    const {$data: {searcher, data: dataSource, pagination, loading}} = this.props;
    const {expandedRowKeys = []} = this.state;
    const tableProps = {
      size: 'middle',
      columns,
      dataSource,
      pagination,
      loading,
      rowKey: 'customerBizId',
      expandedRowKeys,
      expandedRowRender: this.expandedRowRender,
      onExpand: this.onExpand
    };
    return (
      <PageHeaderLayout action={this.action}>
        <Card>
          {searcher}
          <Table {...tableProps} scroll={{x: 1800}}/>
        </Card>
      </PageHeaderLayout>
    )
  }
}
