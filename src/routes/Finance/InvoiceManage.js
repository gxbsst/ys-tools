import React, { PureComponent } from 'react';
import { DatePicker, Divider, Table, Card, Modal, Popconfirm } from 'antd';
import { connect } from 'dva';
import moment from 'moment/moment';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import can from '../../decorators/Can';
import autodata from '../../decorators/AutoData';
import GiveInvoice from './GiveInvoice';
import InvoiceLinkBusiness from './InvoiceLinkBusiness';
import InvoiceDetails from './InvoiceDetails';
import { Select } from '../../components/Helpers';
import { enums } from '../../utils';
import {
  getInvoiceType,
  getRelType,
  getRelStatus,
  getInvoiceState
} from '../../utils/helpers';

const { RangePicker } = DatePicker;

@can([8002000])
@autodata('/api/invoice', [
  { name: 'customerName', label: '客户名称' },
  {
    name: 'demandDateStart, demandDateEnd',
    label: '要求开票日期',
    colspan: 2,
    valueType: moment,
    component: RangePicker,
    props: { format: 'YYYY-MM-DD', placeholder: ['开始日期', '结束日期'] }
  },
  { name: 'applyUserName', label: '申请人' },
  {
    name: 'invoiceType',
    label: '开票类型',
    valueType: Number,
    component: Select,
    props: {
      allowClear: true,
      options: enums('INVOICE_TYPE'),
      placeholder: '请选择开票类型'
    }
  },
  {
    name: 'relType',
    label: '关联类型',
    valueType: Number,
    component: Select,
    props: {
      allowClear: true,
      options: enums('REL_TYPE'),
      placeholder: '请选择关联类型'
    }
  },
  {
    name: 'relStatus',
    label: '业务关联状态',
    valueType: Number,
    component: Select,
    props: {
      allowClear: true,
      options: enums('REL_STATUS'),
      placeholder: '请选择业务关联状态'
    }
  },
  {
    name: 'invoiceTimeStart, invoiceTimeEnd',
    label: '开票时间',
    colspan: 2,
    valueType: moment,
    component: RangePicker,
    props: { format: 'YYYY-MM-DD', placeholder: ['开始日期', '结束日期'] }
  },
  { name: 'invoiceUser', label: '开票人员' }
])
@connect(state => ({
  invoice: state.invoice
}))
export default class InvoiceManage extends PureComponent {
  state = {
    giveInvoiceModalVisible: false,
    linkBusinessModalVisible: false,
    lookDetailsModalVisible: false,
    giveInvoiceId: 0,
    linkInvoiceId: 0,
    detailInvoiceId: 0,
    invoiceType: 0,
    invoiceUser: '',
    invoiceAmount: 0
  };

  deleteInvoice = id => {
    const { dispatch } = this.props;
    const { $data: { reload } } = this.props;
    dispatch({
      type: 'invoice/deleteInvoice',
      payload: id
    }).then(res => {
      if (!res.code) {
        reload();
      }
    });
  };

  giveInvoice = (id, invoiceType, invoiceUser) => {
    const { dispatch } = this.props;
    this.setState({
      giveInvoiceModalVisible: true,
      giveInvoiceId: id,
      invoiceType,
      invoiceUser
    });
    dispatch({
      type: 'invoice/changeModal',
      payload: false
    });
  };

  handleGiveInvoiceCancel = () => {
    this.setState({
      giveInvoiceModalVisible: false
    });
  };

  linkBusiness = async (id, invoiceAmount) => {
    await this.setState({
      linkInvoiceId: id,
      invoiceAmount
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

  lookDetails = async id => {
    await this.setState({
      detailInvoiceId: id
    });
    this.setState({
      lookDetailsModalVisible: true
    });
  };

  handleLookDetailsOk = () => {
    this.setState({
      lookDetailsModalVisible: false
    });
  };

  handleLookDetailsCancel = () => {
    this.setState({
      lookDetailsModalVisible: false
    });
  };

  render() {
    const invoiDetail = 8002002; //发票详情操作
    const giveInvoi = 8002003; //开发票操作
    const deleteInvoi = 8002004; //作废操作
    const link = 8002005; //关联业务操作
    const { can } = this.props;
    const invoiceListColumns = [
      {
        title: '客户名称',
        dataIndex: 'customerName',
        key: 'customerName',
        width: 170
      },
      {
        title: '要求开票日期',
        dataIndex: 'demandDate',
        key: 'demandDate',
        width: 120,
        render: text => {
          return moment(text).format('YYYY-MM-DD');
        }
      },
      {
        title: '申请人',
        dataIndex: 'applyUserName',
        key: 'applyUserName',
        width: 120
      },
      {
        title: '开票类型',
        dataIndex: 'invoiceType',
        key: 'invoiceType',
        width: 130,
        render: getInvoiceType
      },
      {
        title: '关联类型',
        dataIndex: 'relType',
        key: 'relType',
        render: getRelType
      },
      {
        title: '开票金额',
        dataIndex: 'invoiceAmount',
        key: 'invoiceAmount',
        render: text => {
          return `￥${text}`;
        }
      },
      {
        title: '业务关联状态',
        dataIndex: 'relStatus',
        key: 'relStatus',
        render: getRelStatus
      },
      {
        title: '开票状态',
        dataIndex: 'invoiceState',
        key: 'invoiceState',
        render: getInvoiceState
      },
      {
        title: '开票人员',
        dataIndex: 'invoiceUser',
        key: 'invoiceUser',
        width: 120
      },
      {
        title: '开票日期',
        dataIndex: 'invoiceTime',
        key: 'invoiceTime',
        render: text => {
          if (text) {
            return moment(text).format('YYYY-MM-DD');
          }
        }
      },
      {
        title: '发票编号',
        dataIndex: 'invoiceNo',
        key: 'invoiceNo'
      },
      {
        title: '操作',
        key: 'action',
        fixed: 'right',
        width: 200,
        render: (text, record) => (
          <span>
            {record.relType === 1 &&
              record.relStatus !== 2 &&
              record.invoiceState === 1 &&
              can(link) && (
                <span>
                  <a
                    onClick={() =>
                      this.linkBusiness(record.id, record.invoiceAmount)
                    }
                  >
                    关联业务
                  </a>
                  <Divider type="vertical" />
                </span>
              )}
            {record.invoiceState === 0 &&
              can(giveInvoi) && (
                <span>
                  <a
                    onClick={() =>
                      this.giveInvoice(
                        record.id,
                        record.invoiceType,
                        record.invoiceUser
                      )
                    }
                  >
                    开发票
                  </a>
                  <Divider type="vertical" />
                </span>
              )}
            {record.invoiceState === 1 &&
              can(deleteInvoi) && (
                <span>
                  <Popconfirm
                    title="确定将该发票作废吗?"
                    onConfirm={() => this.deleteInvoice(record.id)}
                    okText="确认"
                    cancelText="取消"
                  >
                    <a>作废</a>
                  </Popconfirm>
                  <Divider type="vertical" />
                </span>
              )}
            {can(invoiDetail) && (
              <a onClick={() => this.lookDetails(record.id)}>详情</a>
            )}
          </span>
        )
      }
    ];
    const {
      giveInvoiceModalVisible,
      linkBusinessModalVisible,
      lookDetailsModalVisible,
      giveInvoiceId,
      linkInvoiceId,
      detailInvoiceId,
      invoiceType,
      invoiceUser,
      invoiceAmount
    } = this.state;
    const {
      $data: { searcher, data, pagination, loading, reload }
    } = this.props;
    return (
      <div>
        <PageHeaderLayout>
          <Card bordered={false}>
            {searcher}
            <Table
              columns={invoiceListColumns}
              dataSource={data}
              rowKey="id"
              scroll={{ x: 1550 }}
              pagination={{
                ...pagination,
                showTotal: () => `共${pagination.total}条`
              }}
              loading={loading}
            />
            <GiveInvoice
              giveInvoiceId={giveInvoiceId}
              invoiceType={invoiceType}
              invoiceUser={invoiceUser}
              giveInvoiceModalVisible={giveInvoiceModalVisible}
              handleGiveInvoiceCancel={this.handleGiveInvoiceCancel}
              reload={reload}
            />
            {linkBusinessModalVisible && (
              <InvoiceLinkBusiness
                linkInvoiceId={linkInvoiceId}
                invoiceAmount={invoiceAmount}
                linkBusinessModalVisible={linkBusinessModalVisible}
                handleLinkBusinessCancel={this.handleLinkBusinessCancel}
                reload={reload}
              />
            )}
            <Modal
              title="发票详情"
              visible={lookDetailsModalVisible}
              onOk={this.handleLookDetailsOk}
              onCancel={this.handleLookDetailsCancel}
              destroyOnClose
              width="800px"
            >
              <InvoiceDetails
                detailInvoiceId={detailInvoiceId}
                reload={reload}
              />
            </Modal>
          </Card>
        </PageHeaderLayout>
      </div>
    );
  }
}
