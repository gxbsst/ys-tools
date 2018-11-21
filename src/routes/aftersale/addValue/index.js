import React, {PureComponent, Fragment} from "react";
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import {getUrlParam} from '../../../utils/index';
import request from '../../../utils/request';
import {getOrderStatus, getDate} from '../../../utils/helpers'
import autodata from '../../../decorators/AutoData';
import can from "../../../decorators/Can";
import moment from 'moment'
import common from '../../Personnel/common/index.less'
import FpOperation from '../common/fp_operation'
import {Region} from '../../../components/Cascader';
import {Action, Select, Ellipsis, Stars} from '../../../components/Helpers';
import {Link, hashHistory, routerRedux} from "dva/router";
import {
  Button,
  Card,
  Table,
  Radio,
  Form,
  DatePicker,
  message
} from 'antd';

const RadioGroup = Radio.Group;
const {RangePicker} = DatePicker;
const FormItem = Form.Item;

const distribution = [
  {value: 1, label: '已分配'},
  {value: 0, label: '未分配'},
];
const fromSource = [
  {value: 1, label: '新零售'},
  {value: 2, label: '到店'},
];
let that;
@can()
@autodata({
    url: `/api/auth/customers`,
    onSearch() {
      that.setState({
        selectedRowKeys: [],
        disabled: true
      });
    }
  },
  [{
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
      name: 'areaCode',
      label: '地区',
      render: () => (
        <Region/>
      )
    },
    {
      name: 'serviceStartTimeBegin,serviceStartTimeEnd',
      label: '服务开通日期',
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
      name: 'assigned',
      label: '分配状态',
      valueType: Number,
      component: Select,
      props: {
        allowClear: true,
        options: distribution,
        placeholder: '分配状态'
      },
    },
    {name: 'employeeName', label: '运营人员'},
  ])
export default class AddValue extends PureComponent {
  state = {
    disabled: true,
    customerId: '',
    visible: false,
    selectedRowKeys: []
  }
  columns = [
    {
      title: '操作',
      key: 'action',
      render: (text, record) => {
        const {can} = this.props;
        return (
          <div className={common.operate}>
            {(can(10011003) && !record.finish) ?
              <span className={common.item} onClick={this.finshed(record)}>任务完成</span> : null}
            {
              // can(10011001) &&
              <Link to={`/aftersale/details/${record.customerId}`}
                    className={common.item}>客户详情</Link>
            }
          </div>
        )
      }
    },
    {
      title: '客户名称',
      dataIndex: 'customerName',
    }, {
      title: '地区',
      dataIndex: 'area',
    }, {
      title: '产品类型',
      dataIndex: 'productType',
    }, {
      title: '产品名称',
      dataIndex: 'productName',
    }, {
      title: '运营人员',
      dataIndex: 'saleName',
    }, {
      title: '状态',
      dataIndex: 'finish',
      render: (text) => (['未完', '已完'][text])
    }, {
      title: '业务量/赠送量',
      dataIndex: 'operation',
      render: (text, record) => (
        <span>{record.dredge}/{record.gift}</span>
      )
    }, {
      title: '服务开始日期',
      dataIndex: 'serviceStartTime',
      render: getDate
    }, {
      title: '服务结束时间',
      dataIndex: 'serviceEndTime',
      render: getDate
    }
  ];
// 任务完成
  finshed = record => async () => {
    const {code, message} = await request(`/api/auth/finish/${record.id}`, {
      method: 'PUT',
    })
    message.info(message)
  }
  // 选中的客户id
  onTableRowChange = (selectedRowKeys, selectedRows) => {
    this.setState({
      customerId: selectedRowKeys,
      selectedRowKeys,
      disabled: !selectedRowKeys.length
    });
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
  }

  render() {
    that = this;
    const {columns, onTableRowChange: onChange} = this;
    const {disabled, customerId, visible, selectedRowKeys} = this.state;
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
      rowSelection
    };
    const fromSource = getUrlParam('fromSource') ? getUrlParam('fromSource') : 1;
    const action = (
      <Fragment>
        {can(10011002) ? <Button type="primary" onClick={this.showModal} disabled={disabled}>分配运营</Button> : null}
        {
          visible &&
          <FpOperation
            customerId={customerId}
            fromSource={fromSource}
            onCancel={this.handleCancel}
            visible={visible}
            reload={this.props.$data.reload}/>
        }
      </Fragment>
    );
    return (
      <PageHeaderLayout action={action}>
        <Card>
          {searcher}
          <Table {...tableProps} onExpand={this.unfold}/>
        </Card>
      </PageHeaderLayout>
    )
  }
}
