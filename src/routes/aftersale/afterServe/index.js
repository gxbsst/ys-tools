import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {hashHistory, Link, routerRedux} from 'dva/router';
import Distribution from '../common/distribution'
import request from '../../../utils/request';
import autodata from '../../../decorators/AutoData';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import {getUrlParam} from '../../../utils/index';
import {getCustomerStatus} from '../../../utils/helpers'
import common from '../../Personnel/common/index.less'
import {enums} from '../../../utils';
import {Select, Stars} from '../../../components/Helpers';
import moment from 'moment'
import {Region} from '../../../components/Cascader';
import {Button, Card, DatePicker, Table} from 'antd';

const {RangePicker} = DatePicker;
const customerstate = [
  {value: 1, label: '活跃'},
  {value: 2, label: '冻结'},
];
const assigned = [
  {value: 1, label: '已分配'},
  {value: 2, label: '未分配'},
];
const fromSource = [
  {value: 1, label: '新零售'},
  {value: 2, label: '到店'}
];
// @can([10001000, 4007000, 5004000])
let that;
@autodata({
  url: `/api/customer/customers?reqType=afterSale`,
  onSearch() {
    that.setState({
      selectedRowKeys: [],
      disabled: true
    });
  }
}, [
  {
    name: 'fromSource',
    label: '来源类型',
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
  },
  {
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
    name: 'assigned',
    label: '分配状态',
    valueType: Number,
    component: Select,
    props: {
      allowClear: true,
      options: assigned,
      placeholder: '分配状态'
    },
  },
  {name: 'afterSaleName', label: '客服名称'},
  {
    name: 'lastOpenTimeBegin,lastOpenTimeEnd',
    label: '最近开通时间',
    colspan: 1.5,
    component: RangePicker,
    valueType: moment,
    props: {format: 'YYYY-MM-DD', placeholder: ['开始日期', '结束日期']}
  }
])
@connect(state => (
    state
  )
)
export default class Callcenter extends PureComponent {
  state = {
    child: [],
    customerId: [],
    serviceList: [],
    selectedRowKeys: [],
    disabled: true,
    visible: false
  };
  customername = (record) => () => {
    const {dispatch} = this.props;
    dispatch(routerRedux.push({
      pathname: `/aftersale/details/${record.id}`,
      query: {
        customerName: record.customerName
      },
    }));
  };
  columns = [
    {
      title: '操作',
      key: 'action',
      render: (text, record) => (
        <div className={common.operate}>
          {/* <Link to={`/aftersale/details/${record.id}/${record.clewId}`} className={common.item}>客户详情</Link>*/}
          <span className={common.item} onClick={this.customername(record)}>客户详情</span>
        </div>
      ),
    }, {
      title: '客户名称',
      dataIndex: 'customerName',
      height: 44
    }, {
      title: '地区',
      dataIndex: 'area',
      height: 44
    }, {
      title: '售后客服',
      dataIndex: 'afterSaleName',
      height: 44
    }, {
      title: '客户等级',
      dataIndex: 'level',
      height: 44,
      render: value => <Stars count={value}/>
    }, {
      title: '客户状态',
      dataIndex: 'status',
      height: 44,
      render: getCustomerStatus
    }, {
      title: '最近开通时间',
      dataIndex: 'lastOpenTime',
      height: 44
    }, {
      title: '进入售后日期',
      dataIndex: 'afterSaleTime',
      height: 44
    }
  ];
  // 选中的客户id
  onTableRowChange = (selectedRowKeys, selectedRows) => {
    this.setState({
      customerId: selectedRowKeys,
      selectedRowKeys,
      disabled: !selectedRowKeys.length
    });
  };

  // 越权登陆
  override = record => async () => {
    let newWindow = window.open();
    const {productId, weimobAccount} = this.state;
    const {data: {url}} = await request(`api/customer/login/${record.productId}/${record.weimobAccount}`);
    if (url) {
      newWindow.location.href = url;
    }
  };
  expandedRowRender = ({id}) => {
    const {$data: {data: contracts}, can} = this.props;
    const contract = _.find(contracts, {id});
    const ultraLogin = 10001003;
    const {sublevel, loading} = contract;
    const columns = [
      {
        title: '操作',
        dataIndex: 'operate',
        render: (text, record) => (<div className={common.operate}>
          {
            //can(ultraLogin) &&
            record.weimobAccount &&
            <span className={common.item} style={{cursor: "pointer"}} onClick={this.override(record)}>越权登陆</span>
          }
        </div>)
      },
      {title: '软件系列', dataIndex: 'productName'},
      {title: '微盟账号', dataIndex: 'weimobAccount'},
      {title: '店铺名称', key: 'shopName'},
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
      />
    );
  };

  // 获取子table
  afterServeDetails = async (id) => {
    const {data} = await request(`api/customer/${id}/orderItems`);
    this.setState({
      child: data
    })
  };
  // 展开table
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
  showModal = () => {
    this.setState({
      visible: true,
    });
  };
  handleCancel = () => {
    this.setState({
      visible: false,
    });
  };

  render() {
    that = this;
    const {columns, expandedRowRender, onTableRowChange: onChange} = this;
    const {customerId, selectedRowKeys, serviceList, disabled, visible} = this.state;
    const distributionOpen = 10001002;
    const {$data: {searcher, data: dataSource, pagination, loading}, can} = this.props;
    const rowSelection = {
      selectedRowKeys,
      onChange,
    };
    const tableProps = {
      size: 'middle',
      rowKey: 'id',
      columns,
      dataSource,
      pagination,
      loading,
      rowSelection,
      expandedRowRender,
    };
    const fromSource = getUrlParam('fromSource') ? getUrlParam('fromSource') : 1;
    // 分配客服
    const action = (
      <div>
        <Button
          type="primary"
          onClick={this.showModal} disabled={disabled}>分配客服</Button>
        {
          // can(distributionOpen) &&
          visible &&
          <Distribution
            customerId={customerId}
            reload={this.props.$data.reload}
            onCancel={this.handleCancel}
            visible={visible}
            fromSource={fromSource}/>
        }
      </div>
    );
    return (
      <PageHeaderLayout action={action}>
        <Card>
          {searcher}
          <Table {...tableProps} onExpand={this.unfold} wori="1"/>
        </Card>
      </PageHeaderLayout>
    )
  }
}
