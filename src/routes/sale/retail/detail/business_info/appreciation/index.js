import React, {PureComponent} from "react";
import {Table, Button, message, Form, Input, Popconfirm} from 'antd';
import { connect } from 'dva';
import Dialog from '../../../../../../components/Dialog';
import {Link} from 'dva/router';
import common from '../../../../../Personnel/common/index.less'
import styles from '../index.less'
import NewAppreciation from '../Model/appreciation'
import request from '../../../../../../utils/request';
import { stringify } from 'qs';

import {
  getOrderStatus,
  getDate,
  getCurrency,
  getBackpayStatus, getServiceDuration
} from '../../../../../../utils/helpers';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: {span: 4},
  wrapperCol: {span: 20},
};
@connect(({ saleRetail, user }) =>
  ({
    currentDetail: saleRetail.currentDetail,
    user,
  })
)
export default class Appreciation extends PureComponent {
  state = {
    visible: 0,
    appreciationList: [],
    pagination: {},
    current: '',
    loading: true,
    chanceId: ''
  }
  renderAction(record) {
    const { currentUser: { username } } = this.props.user;
    const { bindAccount, opStatus } = this.props.currentDetail;
    return (
      <div className={common.operate}>
        {
          (bindAccount && bindAccount === username) &&
          <Link className={common.item} to={`/saleRetail/business/${record.id}`}>查看</Link>
        }
        { (bindAccount && bindAccount === username) && record.backPayStatus == -2 && opStatus !=5 && <span className={common.item} onClick={this.edit(record)}>编辑</span> }
        {
          (bindAccount && bindAccount === username) && record.backPayStatus == -2 && opStatus !=5 &&
          < Popconfirm placement="leftTop" title='确定要删除该项业务？' onConfirm={this.del(record)} okText="确认"
                       className={common.item}
                       cancelText="取消">
            <span className={common.item}>删除</span>
          </Popconfirm>
        }
      </div>
    )
  }
  columns = [
    {
      title: '产品名称',
      dataIndex: 'productName',
    }, {
      title: '业务量/赠送量',
      dataIndex: 'portfolio',
      render:getServiceDuration,
    }, {
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
      render: (text, record) => this.renderAction(record),
    },
  ];
  handleCancel = () => {
    this.setState({
      visible: 0,
    })
  }

  componentDidMount() {
    const {chanceId} = this.props;
    this.setState({chanceId});
    this.getAppreciation(chanceId);
  }

  getAppreciation = async (chanceId, page = 1, pageSize = 10) => {
    const {data, pagination} = await request(`/api/orderOper/${chanceId}/orderItemsTab`, {
      query: {productType: 3, page, pageSize, tagSource: 'chance'}
    });
    this.setState({
      appreciationList: data || [],
      pagination,
      current: pagination.page,
      loading: false,
    })
  }
  del = record => async () => {
    const {state: {current: page}, props: {chanceId}} = this;
    const {code, message: msg} = await request(`/api/orderOper/delete/${record.id}`, {
      method: "PUT"
    })
    if (code === 0) {
      this.getAppreciation(chanceId, page);
      message.success(msg)
    } else {
      message.error(msg)
    }
  }
  // 编辑
  edit = record => () => {
    const {id} = record;
    const {state: {current: page}, props: {chanceId}} = this;
    Dialog.open({
      title: '联系人编辑',
      formProps: {
        action: `/api/business/${id}/updateLink`,
        method: 'PUT',
        onSubmitted: () => {
          this.getAppreciation(chanceId, page);
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
    const {chanceId} = this.state;
    this.setState({
      current: page,
      loading: true
    });
    this.getAppreciation(chanceId, page)
  }

  render() {
    const {columns, state: {visible, appreciationList: dataSource, pagination: paginfo, current, loading}} = this;
    const {can, customername, chanceId} = this.props;
    const {page, pageCount, pageSize, totalCount: total} = paginfo;
    const { currentUser: { username } } = this.props.user;
    const { bindAccount, opStatus } = this.props.currentDetail;
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
            (bindAccount && bindAccount === username) && opStatus != 5 &&
            <Button type='primary' className={styles.btn} onClick={() => {
              this.setState({visible: 1})
            }}>新开业务</Button>
          }
        </div>
        <Table {...tableProps} className={`${common.tableBody} ${common.foldtable}`}/>
        <NewAppreciation
          title="新开业务"
          visible={visible === 1}
          type="3"
          okText="确定"
          width={700}
          getAppreciation={this.getAppreciation}
          page={current}
          customername={customername}
          chanceId={chanceId}
          onCancel={this.handleCancel}
        />
      </div>
    )
  }
}
