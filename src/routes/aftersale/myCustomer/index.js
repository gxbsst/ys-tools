import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {Link, hashHistory, routerRedux} from 'dva/router';
import _ from 'lodash';
import moment from 'moment'
import request from '../../../utils/request';
import autodata from '../../../decorators/AutoData';
import can from "../../../decorators/Can";
import {Region} from '../../../components/Cascader';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import {Action, Select, Ellipsis, Stars} from '../../../components/Helpers';
import {enums} from '../../../utils';
import {getCustomerStatus} from '../../../utils/helpers'
import common from '../../Personnel/common/index.less';
import styles from './index.less'
import {
  Card,
  Table,
  Menu,
  Badge,
  Cascader,
  DatePicker
} from 'antd';

const {RangePicker} = DatePicker;
const protect = [
  {value: 2, label: '金牌'},
  {value: 0, label: '银牌'},
  {value: 1, label: '铜牌'},
  {value: '', label: '全部'}
];
const customerstate = [
  {value: 1, label: '活跃'},
  {value: 2, label: '冻结'},
  {value: '', label: '全部'}
];
const fromSource = [
  {value: 1, label: '新零售'},
  {value: 2, label: '到店'}
];
@connect(state => (
    state
  )
)
//@can([10009000], true)
@autodata('/api/customer/customersSelf', [
  {
    name: 'fromSource', label: '来源类型',
    component: Select,
    valueType: Number,
    defaultValue: 1,
    props: {
      options: fromSource,
      placeholder: '来源类型'
    }
  },
  {name: 'customerName', label: '客户名称'},
  {
    name: 'areaCode',
    label: '地区',
    render: () => (
      <Region/>
    )
  },
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
  }, {
    name: 'afterSaleTimeBegin,afterSaleTimeEnd',
    label: '进入售后时间',
    colspan: 1.5,
    component: RangePicker,
    valueType: moment,
    props: {format: 'YYYY-MM-DD', placeholder: ['开始日期', '结束日期']}
  },
  {
    name: 'status',
    label: '客户状态',
    valueType: Number,
    component: Select,
    props: {
      allowClear: true,
      options: customerstate,
      placeholder: '客户状态'
    }
  },
  {
    name: 'lastOpenTimeBegin,lastOpenTimeEnd',
    label: '最近开通时间',
    colspan: 1.5,
    component: RangePicker,
    valueType: moment,
    props: {format: 'YYYY-MM-DD', placeholder: ['开始日期', '结束日期']}
  },
])
export default class Mycustomer extends PureComponent {
  state = {
    details: [],
  };
  // 越权登陆
  override = record => async () => {
    let newWindow = window.open();
    const {productId, weimobAccount} = this.state;
    const {data: {url}, message: msg} = await request(`api/customer/login/${record.productId}/${record.weimobAccount}`);
    if (url) {
      newWindow.location.href = url;
    }
  };
  columns = [
    {
      title: '操作',
      key: 'action',
      render: (text, record) => {
        const {can} = this.props;
        return (
          <div className={common.operate}>
            {
              //can(10009001) &&
              <Link to={`/aftersale/details/${record.id}`}>客户详情</Link>
            }
          </div>
        )
      }
    }, {
      title: '客户名称',
      dataIndex: 'customerName',
    }, {
      title: '地区',
      dataIndex: 'area',
    }, {
      title: '售后客服',
      dataIndex: 'afterSaleName',
    }, {
      title: '客户等级',
      dataIndex: 'level',
      height: 44,
      render: value => <Stars count={value}/>
    }, {
      title: '客户状态',
      dataIndex: 'status',
      render: getCustomerStatus
    }, {
      title: '最近开通时间',
      dataIndex: 'lastOpenTime',
    }, {
      title: '进入售后日期',
      dataIndex: 'afterSaleTime',
    }
  ];
  expandedRowRender = ({id}) => {
    const {$data: {data: contracts}} = this.props;
    const contract = _.find(contracts, {id});
    console.info('contract', contract);
    const {sublevel, loading} = contract;
    const columns = [
      {
        title: '操作',
        dataIndex: 'override',
        render: (text, record) => {
          const {can} = this.props;
          return (
            <div className={common.operate}>
              {
                //can(10009002) &&
                record.weimobAccount &&
                <span className={common.item} style={{cursor: "pointer"}} onClick={this.override(record)}>越权登陆</span>
              }
            </div>
          )
        }
      },
      {title: '软件系列', dataIndex: 'productName'},
      {title: '微盟账号', dataIndex: 'weimobAccount'},
      {title: '店铺名称', dataIndex: 'shopName'},
      {title: '服务开始日期', dataIndex: 'serviceStartTime'},
      {
        title: '服务结束日期',
        dataIndex: 'serviceEndTime',
      },
    ];
    return (
      <Table
        columns={columns}
        dataSource={sublevel}
        pagination={false}
        loading={loading}
        rowKey="id"
        width="80%"
      />
    );
  };
  unfold = async (expanded, record) => {
    if (expanded) {
      const {id} = record;
      const {$data: {data: contracts, setData}} = this.props;
      const contract = _.find(contracts, {id});
      contract.loading = true;
      if (_.isUndefined(contract.sublevel)) {
        const {data} = await request(`api/customer/${id}/orderItems`);
        contract.loading = false;
        contract.sublevel = data;
        setData({data: [].concat(contracts)});
      }
      contract.loading = false;
    }
  };

  render() {
    const {columns} = this;
    const {$data: {searcher, data: dataSource, pagination, loading}, can} = this.props;
    const tableProps = {
      size: 'middle',
      rowKey: 'id',
      columns,
      dataSource,
      pagination,
      loading,
      onExpand: this.unfold,
      expandedRowRender: this.expandedRowRender,

    };
    return (
      <PageHeaderLayout>
        <Card>
          {searcher}
          <Table {...tableProps}/>
        </Card>
      </PageHeaderLayout>
    );
  }
}
