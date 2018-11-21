import React, {PureComponent} from 'react';
import {Link} from 'dva/router';
import {connect} from 'dva';
import _ from 'lodash';
import {Dialog} from '../../../../../../components';
import {ColumnGroup, Select} from '../../../../../../components/Helpers';
import DescriptionList from '../../../../../../components/DescriptionList';
import request from '../../../../../../utils/request';
import NewOpen from '../Model/newlybusiness';
import common from '../../../../../Personnel/common/index.less';
import styles from '../index.less';
import { stringify } from 'qs';
import {
  Table,
  Button,
  Input,
  Form,
  message,
  Popconfirm,
  InputNumber,
  Col,
  Row,
  Divider,
} from 'antd';
import {
  getServiceDuration,
  getBusinessType,
  getPaidStatus,
  getOrderStatus,
  getDate,
  getCurrency,
  getBackpayStatus
} from '../../../../../../utils/helpers';

const {TextArea} = Input;
const FormItem = Form.Item;
const Option = Select.Option;
const {Description} = DescriptionList;
const formItemLayout = {
  labelCol: {
    span: 8
  },
  wrapperCol: {
    span: 16
  }
};
const formItem = {
  labelCol: {
    span: 4
  },
  wrapperCol: {
    span: 20
  }
};
const timer = [
  {value: 3, label: '年'},
  {value: 2, label: '月'},
  {value: 1, label: '日'}
];
const selectAfter = (
  <Select options={timer} defaultValue={3} valuePropName="value" labelPropName="label" style={{width: 60}}/>
);

const protect = [
  {value: 2, label: '金牌'},
  {value: 0, label: '银牌'},
  {value: 1, label: '铜牌'}
];
const itemTypes = [
  {value: 6, label: '降级续费'},
  {value: 7, label: '正常续费'},
  {value: 5, label: '升级续费'},
];
// 树格式
const simpleFormat = {
  id: 'id',
  pId: 'parentId',
  rootPId: 0,
};
@connect(({ arriveShop, user }) =>
  ({
    currentDetail: arriveShop.currentDetail,
    user,
  })
)
export default class SoftWare extends PureComponent {
  state = {
    product: [],
    productMenu: '',
    productInfo: '',
    visible: false,
    businessInfo: {},
    softList: [],
    pagination: {},
    current: '',
    loading: true,
    chanceId: '',
    businessId: '',
    renewInfo: {},
    relationId: '',
    expanded: '',
    record: '',
  };
  renderAction(record) {
    const { currentUser: { username } } = this.props.user;
    const { bindAccount, opStatus } = this.props.currentDetail;
    return (
      <div className={common.operate}>
        {
          (bindAccount && bindAccount === username) &&
          <Link className={common.item} to={`/arriveShop/business/${record.id}`}>查看</Link>
        }
        {
          (bindAccount && bindAccount === username) && record.backPayStatus == -2 && opStatus !=5 &&
          <a>
            <span className={common.item} onClick={this.edit(record.id, record)}>编辑</span>
            <Popconfirm placement="leftTop" title='确定要删除该项业务？' onConfirm={this.del(record.id, record)} okText="确认"
                        className={common.item}
                        cancelText="取消">
              <span className={common.item}>删除</span>
            </Popconfirm>
          </a>
        }
      </div>
    )
  }
  columns = [
   {
      title: '微盟账号',
      dataIndex: 'weimobAccount',
    }, {
      title: '店铺名称',
      dataIndex: 'shopName',
    }, {
      title: '当前门店数量',
      dataIndex: 'storeCount',
    }, {
      title: '服务开始日期',
      dataIndex: 'serviceStartTime',
      render: getDate
    }, {
      title: '服务结束日期',
      dataIndex: 'serviceEndTime',
      render: getDate
    }
  ];
  // 弹出model
  hadleClick = (record, visible) => () => {
    this.setState({
      businessId: record.id,
      relationId: record.productId,
      visible
    });
  };
  expandedRowRender = (record) => {
    const {businesses, loading, id} = record;
    const column = [
      {title: '业务类型', dataIndex: 'itemType', render: getBusinessType},
      {
        title: '购买 / 赠送', dataIndex: 'chargeUnit',
        render: getServiceDuration,
      },
      {
        title: '产品金额',
        dataIndex: 'productAmount',
        render: (text, record) => {
          return getCurrency(text - record.discountProductAmount);
        }
      },
      {
        title: '服务金额',
        dataIndex: 'serviceAmount',
        render: (text, record) => {
          return getCurrency(text - record.discountServiceAmount);
        }
      },
      {
        title: '回款金额',
        dataIndex: 'paymentAmount',
        render: getCurrency
      },
      {
        title: '回款状态',
        dataIndex: 'backPayStatus',
        render: getBackpayStatus
      },
      {
        title: '业务状态',
        dataIndex: 'orderStatus',
        render: getOrderStatus
      },
      {
        title: '服务开始日期',
        dataIndex: 'serviceStartTime',
        render: getDate
      },
      {
        title: '服务结束日期',
        dataIndex: 'serviceEndTime',
        render: getDate
      },
      {
        title: '合同关联',
        dataIndex: 'contractNo',
      },
      {
        title: '发票关联',
        dataIndex: 'invoiceNo',
      },
      {
        title: '创建人',
        dataIndex: 'createUser',
      }, {
        title: '操作',
        dataIndex: 'operate',
        render: (text, record) => this.renderAction(record)
      }
    ];
    return (
      <Table
        columns={column}
        dataSource={businesses}
        pagination={false}
        loading={loading}
        rowKey="id"
      />
    );
  };

  componentDidMount() {
    const {chanceId} = this.props;
    if (chanceId) {
      this.setState({chanceId});
      this.getsoftware(chanceId);
    }
  }

  componentWillReceiveProps({chanceId}) {
    console.info('chanceId', chanceId);
    if (chanceId !== this.props.chanceId && chanceId) {
      this.setState({chanceId});
      this.getsoftware(chanceId);
    }
  }

  // 编辑
  edit = (parentId, record) => () => {
    const {id} = record;
    const {props: {chanceId}, state: {current: page}} = this;
    Dialog.open({
      title: '联系人编辑',
      formProps: {
        action: `/api/business/${id}/updateLink`,
        method: 'PUT',
        onSubmitted: ({message: msg}) => {
          message.success('处理成功');
          this.getBusinesses(parentId, true);
        }
      },
      render({props: {form: {getFieldDecorator}}}) {
        return (
          <div>
            <FormItem {...formItem} label="联系人名称">
              {getFieldDecorator('contactsName', {
                initialValue: record.contactsName ? record.contactsName : "",
                rules: [{required: true, message: '联系人名称'}]
              })(<Input placeholder="联系人名称"/>)}
            </FormItem>
            <FormItem {...formItem} label="联系人编号">
              {getFieldDecorator('contactsNo', {
                initialValue: record.contactsNo ? record.contactsNo : '',
              })(<Input placeholder="联系人编号"/>)}
            </FormItem>
            <FormItem {...formItem} label="备注">
              {getFieldDecorator('remark', {
                initialValue: record.remark ? record.remark : "",
              })(<Input placeholder="备注"/>)}
            </FormItem>
          </div>
        );
      }
    });
  };

  // 删除业务
  del = (parentId, {id}) => async () => {
    const {props: {chanceId}, state: {current: page}} = this;
    await request(`/api/orderOper/delete/${id}`, {method: 'PUT'});
    this.getBusinesses(parentId, true);
  };

  getBusinesses = async (id, force) => {
    const {softList} = this.state;
    const soft = _.find(softList, {id});
    if (force || _.isUndefined(soft.businesses)) {
      soft.loading = true;
      this.setState({softList: [].concat(softList)});
      const {data: businesses} = await request(`api/orderOper/${id}/orderItems`);
      Object.assign(soft, {loading: false, businesses});
      this.setState({softList: [].concat(softList)});
    }
  };


  unfold = async (expanded, {id}) => {
    expanded && this.getBusinesses(id);
  };
  // 业务列表
  getsoftware = async (chanceId, page = 1, pageSize = 10) => {
    this.setState({loading: true});
    const querySoftWareData = {
      page,
      pageSize,
      tagSource: 'chance',
      productType: 1,
    }
    const {data, pagination} = await request(`/api/orderOper/${chanceId}/orderItemsTab?${stringify(querySoftWareData)}`);
    this.setState({
      softList: data ? data : [],
      pagination,
      current: pagination.page,
      loading: false
    });
  };
  paging = (page, pageSize) => {
    const {chanceId} = this.state;
    this.setState({
      current: page,
      loading: true
    });
    this.getsoftware(chanceId, page);
  };

  // 关闭弹窗
  handleCancel = () => {
    this.setState({
      visible: false,
    });
  };

  render() {
    const {columns} = this;
    const {can, customername, chanceId} = this.props;
    const {
      productMenu, productInfo, visible, product,
      softList: dataSource,
      pagination: paginfo, current, loading, businessId, relationId
    } = this.state;
    const {page, pageCount, pageSize, totalCount: total} = paginfo;
    const { currentUser: { username } } = this.props.user;
    const { bindAccount, opStatus } = this.props.currentDetail;
    const pagination = {
      current,
      pageSize,
      total,
      onChange: this.paging,
    };
    const tableProps = {
      size: 'middle',
      rowKey: 'id',
      columns,
      dataSource,
      loading,
      pagination,
      expandedRowRender: this.expandedRowRender,
      onExpand: this.unfold
    };
    return (
      <div>
        <div className={common.btnBox + ' ' + styles.margin}>
          {
            (bindAccount && bindAccount === username) && opStatus !=5 &&
            <Button type='primary' className={styles.btn} onClick={() => {
              this.setState({visible: 1});
            }}>新开业务</Button>
          }
        </div>
        <Table {...tableProps} scroll={{x: 1600}} className={`${common.tableBody} ${common.foldtable}`}/>
        {
          visible === 1 &&
          <NewOpen
            title="新开业务"
            visible={visible === 1}
            okText="确定"
            width={700}
            type="1"
            page={current}
            getsoftware={this.getsoftware}
            customername={customername}
            chanceId={chanceId}
            onCancel={this.handleCancel}
          />
        }

      </div>
    );
  }
}
