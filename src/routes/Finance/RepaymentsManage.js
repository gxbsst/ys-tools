import React, { PureComponent } from 'react';
import {
  Button,
  DatePicker,
  Table,
  Divider,
  Modal,
  Card,
  Popconfirm,
  message
} from 'antd';
import moment from 'moment/moment';
import { connect } from 'dva';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import can from '../../decorators/Can';
import autodata from '../../decorators/AutoData';
import NewRepay from './NewRepay';
import EditRepay from './EditRepay';
import LookRepay from './LookRepay';
import LinkedBusiness from './LinkedBusiness';
import { Select } from '../../components/Helpers';
import { enums } from '../../utils';
import {
  getBackpayStatus,
  getPaymentMode,
  getOrderStatus
} from '../../utils/helpers';
import styles from './RepaymentsManage.less';

const { RangePicker } = DatePicker;

@can([8001000])
@autodata('/api/payment', [
  { name: 'customerName', label: '客户名称' },
  {
    name: 'relCustomer',
    label: '关联客户',
    valueType: Number,
    component: Select,
    props: {
      allowClear: true,
      options: enums('ASSOCIATE_CUSTOMER'),
      placeholder: '请选择是否关联客户'
    }
  },
  {
    name: 'createTimeStart, createTimeEnd',
    label: '创建时间',
    colspan: 2,
    valueType: moment,
    component: RangePicker,
    props: {
      showTime: { format: 'HH:mm:ss' },
      format: 'YYYY-MM-DD HH:mm:ss',
      placeholder: ['开始时间', '结束时间']
    }
  },
  {
    name: 'recordedTimeStart, recordedTimeEnd',
    label: '入账日期',
    colspan: 2,
    valueType: moment,
    component: RangePicker,
    props: { format: 'YYYY-MM-DD', placeholder: ['开始日期', '结束日期'] }
  },
  { name: 'cashier', label: '财务出纳' },
  {
    name: 'recordedType',
    label: '入账类型',
    valueType: Number,
    component: Select,
    props: {
      allowClear: true,
      options: enums('PAYMENT_MODE'),
      placeholder: '请选择入账类型'
    }
  },
  {
    name: 'relStatus',
    label: '关联状态',
    valueType: Number,
    component: Select,
    props: {
      allowClear: true,
      options: enums('REL_STATUS'),
      placeholder: '请选择关联状态'
    }
  },
  { name: 'claimName', label: '回款认领人' }
])
@connect(state => ({
  repay: state.repay
}))
export default class RepaymentsManage extends PureComponent {
  state = {
    newPayModalVisible: false,
    lookPayModalVisible: false,
    editPayModalVisible: false,
    linkBusinessModalVisible: false,
    lookRepayId: 0,
    editRepayId: 0,
    linkRepayId: 0,
    payAmount: 0,
    relAmount: 0
  };

  deleteRepay = (id, business) => {
    let canDelete = true;
    for (const oneBusi of business) {
      if (!oneBusi.canDel) {
        canDelete = false;
        break;
      }
    }
    if (canDelete) {
      const { dispatch } = this.props;
      const { $data: { reload } } = this.props;
      dispatch({
        type: 'repay/deleteRepay',
        payload: id
      }).then(res => {
        if (!res.code) {
          reload();
        }
      });
    } else {
      message.error('该条回款关联了不可取消关联的业务，不能删除！');
    }
  };

  showNewPayment = () => {
    this.setState({
      newPayModalVisible: true
    });
  };

  handleNewPayCancel = () => {
    this.setState({
      newPayModalVisible: false
    });
  };

  editPayment = async id => {
    await this.setState({
      editRepayId: id
    });
    this.setState({
      editPayModalVisible: true
    });
  };

  handleEditPayCancel = () => {
    this.setState({
      editPayModalVisible: false
    });
  };

  lookPayment = async id => {
    await this.setState({
      lookRepayId: id
    });
    this.setState({
      lookPayModalVisible: true
    });
  };

  handleLookPayOk = () => {
    this.setState({
      lookPayModalVisible: false
    });
  };

  handleLookPayCancel = () => {
    this.setState({
      lookPayModalVisible: false
    });
  };

  linkBusiness = async (id, payAmount, relAmount) => {
    await this.setState({
      linkRepayId: id,
      payAmount,
      relAmount
    });
    this.setState({
      linkBusinessModalVisible: true
    });
  };

  handleLinkBusinessCancel = () => {
    this.setState({
      linkBusinessModalVisible: false
    });
  };

  cancelLink = id => {
    const { dispatch } = this.props;
    const { $data: { reload } } = this.props;
    dispatch({
      type: 'repay/cancelLink',
      payload: id
    }).then(res => {
      if (!res.code) {
        reload();
      }
    });
  };

  render() {
    const newRe = 8001002; //新建回款操作
    const editRe = 8001003; //编辑回款操作
    const deleteRe = 8001004; //删除回款操作
    const link = 8001005; //关联业务操作
    const { can } = this.props;
    //回款管理列表模块定义
    const repayListColumns = [
        {
          title: '客户名称',
          dataIndex: 'customerName',
          key: 'customerName',
          width: 170
        },
        {
          title: '打款名称',
          dataIndex: 'payName',
          key: 'payName',
          width: 160
        },
        {
          title: '入账类型',
          dataIndex: 'recordedType',
          key: 'recordedType',
          render: getPaymentMode
        },
        {
          title: '财务出纳',
          dataIndex: 'cashier',
          key: 'cashier',
          width: 140
        },
        {
          title: '入账日期',
          dataIndex: 'recordedDate',
          key: 'recordedDate',
          width: 100,
          render: text => {
            return moment(text).format('YYYY-MM-DD');
          }
        },
        {
          title: '入账金额',
          dataIndex: 'payAmount',
          key: 'payAmount'
        },
        {
          title: '已关联金额',
          dataIndex: 'relAmount',
          key: 'relAmount'
        },
        {
          title: '可关联金额',
          dataIndex: 'notRelAmount',
          key: 'notRelAmount'
        },
        {
          title: '回款认领人',
          dataIndex: 'claimName',
          key: 'claimName',
          width: 120
        },
        {
          title: '创建时间',
          dataIndex: 'createTime',
          key: 'createTime',
          width: 180
        },
        {
          title: '操作',
          key: 'action',
          fixed: 'right',
          width: 220,
          render: (text, record) => (
            <span>
              <span>
                <a onClick={() => this.lookPayment(record.id)}>查看</a>
                <Divider type="vertical" />
              </span>
              {can(editRe) && (
                <span>
                  <a
                    onClick={() =>
                      this.editPayment(record.id, record.customerName)
                    }
                  >
                    编辑
                  </a>
                  <Divider type="vertical" />
                </span>
              )}
              {!!record.canDel &&
                can(deleteRe) && (
                  <span>
                    <Popconfirm
                      title="确定删除这条回款记录吗?"
                      onConfirm={() =>
                        this.deleteRepay(record.id, record.business)
                      }
                      okText="确认"
                      cancelText="取消"
                    >
                      <a>删除</a>
                    </Popconfirm>
                    <Divider type="vertical" />
                  </span>
                )}
              {record.customerName &&
                !!record.notRelAmount &&
                can(link) && (
                  <a
                    onClick={() =>
                      this.linkBusiness(
                        record.id,
                        record.payAmount,
                        record.relAmount
                      )
                    }
                  >
                    关联业务
                  </a>
                )}
            </span>
          )
        }
      ],
      insideColumns = [
        {
          title: '产品类型',
          key: 'productTypeIn',
          dataIndex: 'productType'
        },
        {
          title: '产品名称',
          key: 'productName',
          dataIndex: 'productName'
        },
        {
          title: '产品金额',
          key: 'productPrice',
          dataIndex: 'productPrice'
        },
        {
          title: '服务金额',
          key: 'servicePrice',
          dataIndex: 'servicePrice'
        },
        {
          title: '本次回款金额',
          key: 'relAmount',
          dataIndex: 'relAmount'
        },
        //数据另外处理
        {
          title: '产品费欠款',
          key: 'productNeed',
          dataIndex: 'productNeed'
        },
        //数据另外处理
        {
          title: '服务费欠款',
          key: 'serviceNeed',
          dataIndex: 'serviceNeed'
        },
        {
          title: '回款状态',
          dataIndex: 'paymentStatus',
          key: 'paymentStatus',
          render: getBackpayStatus
        },
        {
          title: '业务状态',
          dataIndex: 'bizType',
          key: 'bizType',
          render: getOrderStatus
        },
        {
          title: '业务创建人',
          key: 'createUser',
          dataIndex: 'createUser',
          width: 120
        },
        {
          title: '操作',
          key: 'action',
          width: 100,
          render: (text, record) => (
            <span>
              {record.canDel && (
                <Popconfirm
                  title="确定取消关联吗?"
                  onConfirm={() => this.cancelLink(record.id)}
                  okText="确认"
                  cancelText="取消"
                >
                  <a>取消关联</a>
                </Popconfirm>
              )}
            </span>
          )
        }
      ];
    const {
      newPayModalVisible,
      lookPayModalVisible,
      editPayModalVisible,
      linkBusinessModalVisible,
      lookRepayId,
      editRepayId,
      linkRepayId,
      payAmount,
      relAmount
    } = this.state;
    const {
      $data: { searcher, data, pagination, loading, reload }
    } = this.props;
    return (
      <div>
        <PageHeaderLayout>
          <Card bordered={false}>
            <div>
              {can(newRe) && (
                <Button
                  type="primary"
                  className={styles.newButton}
                  onClick={this.showNewPayment}
                >
                  新建回款
                </Button>
              )}
              <NewRepay
                newPayModalVisible={newPayModalVisible}
                handleNewPayCancel={this.handleNewPayCancel}
                reload={reload}
              />
              <Modal
                title="查看回款"
                visible={lookPayModalVisible}
                onOk={this.handleLookPayOk}
                onCancel={this.handleLookPayCancel}
                destroyOnClose
                width="800px"
              >
                <LookRepay lookRepayId={lookRepayId} />
              </Modal>
              {editPayModalVisible && (
                <EditRepay
                  editRepayId={editRepayId}
                  editPayModalVisible={editPayModalVisible}
                  handleEditPayCancel={this.handleEditPayCancel}
                  reload={reload}
                />
              )}
              {linkBusinessModalVisible && (
                <LinkedBusiness
                  linkRepayId={linkRepayId}
                  linkBusinessModalVisible={linkBusinessModalVisible}
                  handleLinkBusinessCancel={this.handleLinkBusinessCancel}
                  payAmount={payAmount}
                  relAmount={relAmount}
                  reload={reload}
                />
              )}

              {searcher}
            </div>
            <Table
              columns={repayListColumns}
              dataSource={data}
              rowKey="id"
              scroll={{ x: 1550 }}
              pagination={{
                ...pagination,
                showTotal: () => `共${pagination.total}条`
              }}
              loading={loading}
              expandedRowRender={data => (
                <Table
                  columns={insideColumns}
                  dataSource={data.business}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              )}
            />
          </Card>
        </PageHeaderLayout>
      </div>
    );
  }
}
