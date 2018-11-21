import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Card, Table, Divider, Popconfirm, message, Button } from 'antd';
import AllotModal from '../../AllotModal';

import styles from './style.less';

@connect(state => ({
  data: state.saleRetail,
  user: state.user,
  loading: state.loading.effects['saleRetail/queryPrivateSeaList'],
}))
export default class ClaimLibrary extends PureComponent {
  state = {
    currentChance: [],
    showAllotModal: false,
  }
  componentDidMount() {
    this.props.dispatch({
      type: 'saleRetail/queryPrivateSeaList',
      payload: {
        page: 1,
        pageSize: 10,
        fromSource: 1,
        isSubordinate: 0,
        chanceBizType: 2,
        chanceType: 'is',
        applyType: 'library',
      },
    });
    this.props.dispatch({
      type: 'saleRetail/queryPrivateSeaConfig',
      payload: {
        fromSource: 1,
        type: 'library',
      },
    });
  }
  toDetail = (id) => {
    this.props.dispatch({
      type: 'saleRetail/checkCurrentChance',
      payload: {
        id,
      },
    });
  }
  applyChance = (id, type) => { //申领
    this.props.dispatch({
      type: 'saleRetail/applyChance',
      payload: {
        type,
        chanceIds: id,
        fromSource: 1,
      },
    }).then(val => {
      this.props.dispatch({
        type: 'saleRetail/queryPrivateSeaList',
        payload: {
          page: 1,
          pageSize: 10,
          fromSource: 1,
          isSubordinate: 0,
          chanceBizType: 2,
          chanceType: 'is',
          applyType: 'library',
        },
      });
    });
  }
  allot = (id) => { // 分配人员
    if(id.length === 0) {
      message.warning('请选择至少一条机会')
    }else {
      this.setState({ showAllotModal: true, currentChance: id })
    }
  }
  abandonConfirm = (id) => {
    this.props.dispatch({
      type: 'saleRetail/abandonChance',
      payload: {
        id,
      },
    }).then((val) => {
      this.props.dispatch({
        type: 'saleRetail/queryPrivateSeaList',
        payload: {
          page: 1,
          pageSize: 10,
          fromSource: 1,
          isSubordinate: 0,
          chanceBizType: 2,
          chanceType: 'is',
          applyType: 'library',
        },
      });
    });
  }

  abandonCancel = () => {
    message.error('已取消');
  }
  renderAction(record) {
    const { permissions } = this.props.user;
    const isChargeMan = permissions.includes(4004005);
    const isSaleMan = permissions.includes(4004001);
    return (
      <span>
        <a onClick={() => this.toDetail(record.id)}>详情</a>
        <Divider type="vertical" />
        {
          isChargeMan &&
          <Fragment>
            <a onClick={() => this.allot([record.id])}>分配</a>
            <Divider type="vertical" />
          </Fragment>
        }
        {
          isSaleMan &&
          <Fragment>
            <a onClick={this.applyChance.bind(this, record.id, 'protect')}>转客保</a>
            <Divider type="vertical" />
          </Fragment>
        }
        <Popconfirm title="是否放弃?" onConfirm={() => this.abandonConfirm(record.id)} onCancel={this.abandonCancel} okText="确定" cancelText="取消">
          <a>放弃</a>
        </Popconfirm>
      </span>
    );
  }
  render() {
    const { privateSeaData, privateSeaConfig } = this.props.data;
    const { showAllotModal, currentChance } = this.state;
    const { permissions } = this.props.user;
    const isChargeMan = permissions.includes(4004005);
    const isSaleMan = permissions.includes(4004001);
    if (!privateSeaData) {
      return null;
    }
    if (!privateSeaConfig) {
      return null;
    }
    const { data, pagination } = privateSeaData;
    const quantum = privateSeaConfig.data;
    const { totalCount } = pagination;
    const ChanceCount = () => (
      <div>
        <p>申领库机会数量：{totalCount}/{quantum}</p>
        {
          isChargeMan &&
          <Button type="primary" onClick={this.allot.bind(this, this.state.currentChance)}>分配</Button>
        }
      </div>
    );

    const columns = [
      {
        title: '机会ID',
        dataIndex: 'id',
        key: 'id',
      }, {
        title: '客户类型',
        dataIndex: 'customerTypeName',
        key: 'customerTypeName',
      }, {
        title: '客户名',
        dataIndex: 'customerName',
        key: 'customerName',
      }, {
        title: '行业',
        dataIndex: 'industry',
        key: 'industry',
      }, {
        title: '线索来源',
        dataIndex: 'fromSource',
        key: 'fromSource',
        render: (text, row, index) => {
          return (<span>{row.firstFromSourceName} {row.secondFromSourceName}</span>)
        },
      }, {
        title: '漏斗等级',
        dataIndex: 'levelName',
        key: 'levelName',
      }, {
        title: '加急标签',
        dataIndex: 'urgentStatus',
        key: 'urgentStatus',
        render: (text) => (
          <span>{ text == 0 ? '未加急' : '加急'}</span>
        ),
      }, {
        title: '到期时间',
        dataIndex: 'surplusDays',
        key: 'surplusDays',
      }, {
        title: '操作',
        key: 'action',
        render: (text, record) => this.renderAction(record),
      },
    ];

    const paginationProps = {
      current: pagination.page,
      showSizeChanger: true,
      pageSize: pagination.pageSize,
      total: pagination.totalCount,
      showTotal: () => `共${pagination.totalCount}条`,
      onChange: (page, size) => {
        this.props.dispatch({
          type: 'saleRetail/queryPrivateSeaList',
          payload: {
            page,
            pageSize: size,
            fromSource: 1,
            isSubordinate: 0,
            chanceBizType: 2,
            chanceType: 'is',
            applyType: 'library',
          },
        });
      },
      onShowSizeChange: (page, size) => {
        this.props.dispatch({
          type: 'saleRetail/queryPrivateSeaList',
          payload: {
            pageSize: size,
            fromSource: 1,
            isSubordinate: 0,
            chanceBizType: 2,
            chanceType: 'is',
            applyType: 'library',
          },
        });
      },
    };
    const rowSelection = {
      selectedRowKeys: currentChance,
      onChange: (keys) => {
        this.setState({ currentChance: keys });
      },
    };
    const allotModalProps = {
      visible: true,
      fromSource: 1,
      id: currentChance,
      type: 'library',
      onOk: () => {
        this.setState({
          showAllotModal: false,
          currentChance: [],
        }, () => {
          this.props.dispatch({
            type: 'saleRetail/queryPrivateSeaList',
            payload: {
              page: 1,
              pageSize: 10,
              fromSource: 1,
              isSubordinate: 0,
              chanceBizType: 2,
              chanceType: 'is',
              applyType: 'library',
            },
          });
        })
      },
      onCancel: () => this.setState({ showAllotModal: false }),
    };
    const loading = this.props.loading;
    return (
      <Card
        className={styles.listCard}
        bordered={false}
        bodyStyle={{ padding: '40px 32px 40px 32px' }}
      >
        <Table
          title={ChanceCount}
          columns={columns}
          dataSource={data}
          pagination={paginationProps}
          rowSelection={rowSelection}
          loading={loading}
          rowKey={record => `${record.id}`}
        />
        {
          isChargeMan && this.state.showAllotModal &&
          <AllotModal {...allotModalProps} />
        }
      </Card>
    );
  }
}
