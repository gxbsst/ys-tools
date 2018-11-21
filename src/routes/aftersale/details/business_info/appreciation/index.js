import React, {PureComponent} from "react";
import {Table, Button, message, Form, Input, Popconfirm} from 'antd';
import Dialog from "../../../../../components/Dialog";
import {Link} from 'dva/router';
import common from '../../../../Personnel/common/index.less'
import styles from '../index.less'
import NewAppreciation from '../Model/appreciation'
import request from '../../../../../utils/request';
import can from "../../../../../decorators/Can";
import {
  getOrderStatus,
  getDate,
  getCurrency,
  getBackpayStatus,
  getServiceDuration,
  getAddOrderStatus,
} from '../../../../../utils/helpers';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: {span: 4},
  wrapperCol: {span: 20},
};
@can([10005000])
export default class Appreciation extends PureComponent {
  state = {
    visible: 0,
    appreciationList: [],
    pagination: {},
    current: '',
    loading: true,
    customerId: ''
  }
  columns = [{
    title: '产品名称',
    dataIndex: 'productName',
  }, {
    title: '业务量/赠送量',
    dataIndex: 'portfolio',
    render: getServiceDuration
  }
    , {
      title: '产品金额',
      dataIndex: 'productAmount',
      render: getCurrency
    }, {
      title: '服务金额',
      dataIndex: 'serviceAmount',
      render: (text, record) => {
        return getCurrency(text - record.discountServiceAmount);
      }
    }, {
      title: '回款状态',
      dataIndex: 'backPayStatus',
      render: getBackpayStatus
    }, {
      title: '业务状态',
      dataIndex: 'orderStatus',
      render: getOrderStatus
    }, {
      title: '服务开始日期',
      dataIndex: 'serviceStartTime',
      render: getDate
    }, {
      title: '服务结束日期',
      dataIndex: 'serviceEndTime',
      render: getDate
    }, {
      title: '业务创建日期',
      dataIndex: 'createTime',
      render: getDate
    }, {
      title: '创建人',
      dataIndex: 'createUser',
    }, {
      title: '操作',
      key: 'action',
      render: (text, record) => {
        const {can, service = []} = this.props;
        return (
          <div className={common.operate}>
            {
              can([10005009, service]) && !!service.length &&
              <Link className={common.item} to={`/aftersale/business/${record.id}`}>查看</Link>
            }
            {
              can([10005010, service]) && record.backPayStatus === -2 && !!service.length &&
              <span className={common.item} onClick={this.edit(record)}>编辑</span>
            }
            {

              can([10005011, service]) && record.backPayStatus === -2 && !!service.length &&
              < Popconfirm placement="leftTop" title='确定要删除该项业务？' onConfirm={this.del(record)} okText="确认"
                           className={common.item}
                           cancelText="取消">
                <span className={common.item}>删除</span>
              </Popconfirm>
            }
            {
              can([10005008, service]) && !!service.length &&
              (record.orderStatus === 0 || record.orderStatus === 1) && (record.backPayStatus === 0 || record.backPayStatus === 1 || record.backPayStatus === 2) &&
              < Popconfirm placement="leftTop" title='确认开通？' onConfirm={this.open(record)} okText="确认"
                           cancelText="取消">
                <span className={common.item}>开通</span>
              </Popconfirm>
            }
          </div>
        )
      }
    },
  ];
  // 开通业务
  open = ({id}) => async () => {
    const {state: {current: page}, props: {customerId}} = this;
    const {data, message: msg, code} = await request(`/api/orderOper/openSubmit/${id}`, {
      method: 'POST',
      body: {passRemark: '业务开通'}
    });
    code === 0 && message.success(msg);
    this.getAppreciation(customerId, page);
  };
  handleCancel = () => {
    this.setState({
      visible: 0,
    })
  }

  componentDidMount() {
    const {customerId} = this.props;
    this.setState({customerId});
    this.getAppreciation(customerId);
  }

  getAppreciation = async (customerId, page = 1, pageSize = 10) => {
    const {data, pagination} = await request(`/api/orderOper/${customerId}/orderItemsTab`, {
      query: {productType: 3, page, pageSize}
    });
    this.setState({
      appreciationList: data || [],
      pagination,
      current: pagination.page,
      loading: false
    })
  }
  del = record => async () => {
    const {state: {current: page}, props: {customerId}} = this;
    const {code, message: msg} = await request(`/api/orderOper/delete/${record.id}`, {
      method: "PUT"
    })
    if (code === 0) {
      this.getAppreciation(customerId, page);
      message.success(msg)
    } else {
      message.error(msg)
    }
  }
  // 编辑
  edit = record => () => {
    const {id} = record;
    const {state: {current: page}, props: {customerId}} = this;
    Dialog.open({
      title: '联系人编辑',
      formProps: {
        action: `/api/business/${id}/updateLink`,
        method: 'PUT',
        onSubmitted: () => {
          this.getAppreciation(customerId, page);
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
  paging = (page, pageSize) => {
    const {customerId} = this.state;
    this.setState({
      current: page,
      loading: true
    });
    this.getAppreciation(customerId, page)
  }

  render() {
    const {columns, state: {visible, appreciationList: dataSource, pagination: paginfo, current, loading}} = this;
    const {can, customername, customerId, service = []} = this.props;
    const {page, pageCount, pageSize, totalCount: total} = paginfo;
    const pagination = {
      current,
      pageSize,
      total,
      onChange: this.paging,
    }
    const tableProps = {
      size: 'middle',
      rowKey: 'id',
      columns,
      dataSource,
      pagination,
      loading,
    };
    return (
      <div>
        <div className={common.btnBox + ' ' + styles.margin}>
          {
            can([10005002, service]) && !!service.length &&
            <Button type='primary' onClick={() => {
              this.setState({visible: 1})
            }}>新开业务</Button>
          }
        </div>
        <Table {...tableProps} className={`${common.tableBody} ${common.foldtable}`}/>
        <NewAppreciation
          title="新开业务"
          visible={visible === 1}
          type={3}
          okText="确定"
          width={700}
          getAppreciation={this.getAppreciation}
          page={current}
          customername={customername}
          customerId={customerId}
          onCancel={this.handleCancel}
        />
      </div>
    )
  }
}
