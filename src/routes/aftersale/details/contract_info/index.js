import React, {PureComponent} from "react";
import {Link} from "dva/router";
import common from '../../../Personnel/common/index.less'
import boundary from '../../../../decorators/Boundary';
import request from '../../../../utils/request';
import {
  getDate,
  getCurrency,
  getPaidStatus,
  getBackpayStatus,
  getOrderStatus
} from '../../../../utils/helpers'
import can from "../../../../decorators/Can";
import {
  Card,
  Table,
  Pagination
} from 'antd';

@can([10007000])
@boundary
export default class ContractInfo extends PureComponent {
  state = {
    id: '',
    child: [],
    contract: [],
    pagination: {},
    current: '',
    loading: true,
  }
  columns = [
    {
      title: '操作',
      dataIndex: 'action',
      render: (text, record) => {
        const {can, service: {data: service = []}} = this.props;
        return (
          <div className={common.operate}>
            {
              can(10007002) && !!service.length &&
              <Link to={`/aftersale/contract/${record.id}/${record.contractCode}`} className={common.item}>查看</Link>
            }
          </div>
        )
      }
    },
    {
      title: '客户名称',
      dataIndex: 'customerName',
    }, {
      title: '合同编号',
      dataIndex: 'contractCode',
    }, {
      title: '创建日期',
      dataIndex: 'createTime',
    }, {
      title: '创建人',
      dataIndex: 'createUser',
    }, {
      title: '合同金额',
      dataIndex: 'amount',
      render: getCurrency
    }, {
      title: '合同开始日期',
      dataIndex: 'contractBegin',
    }, {
      title: '合同结束日期',
      dataIndex: 'contractEnd',
    }, {
      title: '回款状态',
      dataIndex: 'backPayStatus',
      render: getPaidStatus
    }
  ];
  // 子table
  expandedRowRender = ({id}) => {
    const {contract} = this.state;
    const contractItme = _.find(contract, {id});
    console.info('contract', contractItme);
    const {sublevel, loading} = contractItme;
    const columns = [
      {title: '产品类型', dataIndex: 'productType'},
      {title: '产品名称', dataIndex: 'productName'},
      {title: '产品金额', dataIndex: 'productAmount'},
      {
        title: '服务金额',
        dataIndex: 'serviceAmount',
      },
      {
        title: '回款金额',
        dataIndex: 'paymentAmount',
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
  // 展开
  onExpand = async (expanded, record) => {
    if (expanded) {
      const {contractCode, id} = record;
      let {contract} = this.state;
      const contractItem = _.find(contract, {id});
      contractItem.loading = true;
      if (_.isUndefined(contractItem.sublevel)) {
        const {data} = await request(`/api/contracts/orderItems?contractNo=${contractCode}`);
        contractItem.loading = false;
        contractItem.sublevel = data;
        this.setState({contract: [].concat(contract)})
      }
      contract.loading = false;
    }
  }
  getContract = async (id, page = 1, pageSize = 10) => {
    const {loading} = this.state;
    const {data, pagination = {}} = await request(`/api/customer/${id}/contracts`, {
      query: {page, pageSize}
    });
    this.setState({
      contract: data,
      pagination,
      current: pagination.page ? pagination.page : '',
      loading: false
    })
  }

  componentWillReceiveProps({baseInfo: {data: baseInfo = {}}}) {
    const {id} = baseInfo;
    id !== this.props.id && this.setState({id});
    if (!this.loaded && id) {
      this.getContract(id);
      this.loaded = true;
    }
  }

  paging = (page, pageSize) => {
    const {id} = this.state;
    this.setState({
      current: page,
      loading: true
    });
    this.getContract(id, page)
  }

  render() {
    const {columns, state: {contract: dataSource, pagination: paginfo, current, loading}} = this;
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
      expandedRowRender: this.expandedRowRender,
      onExpand: this.onExpand
    };
    return (
      <Card>
        <Table {...tableProps} className={common.foldtable}/>
      </Card>
    )
  }
}
