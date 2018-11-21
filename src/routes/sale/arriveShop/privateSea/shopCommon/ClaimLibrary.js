import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Card, Table, Divider, Popconfirm, message, Button } from 'antd';
import AllotModal from '../../AllotModal';
import PushOrderModal from '../../PushOrderModal';

import styles from './style.less';

@connect(state => ({
  data: state.arriveShop,
  user: state.user,
  loading: state.loading.effects['arriveShop/queryPrivateSeaList'],
}))
export default class ClaimLibrary extends PureComponent {
  state = {
    showAllotModal: false,
    showPushOrderModal: false,
    currentChance: [],
  }
  componentDidMount() {
    this.props.dispatch({
      type: 'arriveShop/queryPrivateSeaList',
      payload: {
        page: 1,
        pageSize: 10,
        fromSource: 2,
        isSubordinate: 0,
        chanceBizType: 2,
        applyType: 'init',
      },
    });
    this.props.dispatch({
      type: 'arriveShop/queryPrivateSeaConfig',
      payload: {
        fromSource: 2,
        type: 'init',
      },
    });
  }
  toPushOrder = (id) => {
    this.props.dispatch({
      type: 'arriveShop/pushOrder',
      payload: { id },
    });
  }
  toDetail = (id) => {
    this.props.dispatch({
      type: 'arriveShop/checkCurrentChance',
      payload: {
        id,
      },
    });
  }
  applyChance = (id, type) => {
    this.props.dispatch({
      type: 'arriveShop/applyChance',
      payload: {
        type,
        chanceIds: id,
        fromSource: 2,
      },
    });
  }
  abandonConfirm = (id) => {
    this.props.dispatch({
      type: 'arriveShop/abandonChance',
      payload: {
        id,
      },
    }).then((val) => {
      this.props.dispatch({
        type: 'arriveShop/queryPrivateSeaList',
        payload: {
          page: 1,
          pageSize: 10,
          fromSource: 2,
          isSubordinate: 0,
          chanceBizType: 2,
          applyType: 'init',
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
  abandonCancel = () => {
    message.error('已取消');
  }
  customerTypeFilter = (text) => {
    if ( text == 0 ) {
      return '个人商户'
    }
    if ( text == 1 ) {
      return '公司'
    }
    if ( text == 0 ) {
      return '外资公司'
    }
  }
  renderAction(record) {
    const { permissions } = this.props.user;
    const isChargeMan = permissions.includes(5003003);
    const isSaleMan = permissions.includes(5003001);
    return (
      <span>
        <a onClick={() => this.toDetail(record.id)}>详情</a>
        <Divider type="vertical" />
        {
          isSaleMan &&
          <Fragment>
            <a onClick={() => this.toPushOrder(record.id)}>提单</a>
            <Divider type="vertical" />
          </Fragment>
        }
        {
          isChargeMan &&
          <Fragment>
            <a onClick={() => this.allot([record.id])}>分配</a>
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
    const isChargeMan = permissions.includes(5003003);
    const isSaleMan = permissions.includes(5003001);
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
        <p>私海机会数量：{totalCount}/{quantum}</p>
        {
          isChargeMan &&
          <Button type="primary" onClick={() => this.allot(this.state.currentChance)}>分配</Button>
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
          type: 'arriveShop/queryPrivateSeaList',
          payload: {
            page,
            pageSize: size,
            fromSource: 2,
            isSubordinate: 0,
            chanceBizType: 2,
            applyType: 'init',
          },
        });
      },
      onShowSizeChange: (page, size) => {
        this.props.dispatch({
          type: 'arriveShop/queryPrivateSeaList',
          payload: {
            page,
            pageSize: size,
            fromSource: 2,
            isSubordinate: 0,
            chanceBizType: 2,
            applyType: 'init',
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
      id: currentChance,
      fromSource: 2,
      onOk: () => {
        this.setState({
          showAllotModal: false
        }, () => {
          this.props.dispatch({
            type: 'arriveShop/queryPrivateSeaList',
            payload: {
              page: 1,
              pageSize: 10,
              fromSource: 2,
              isSubordinate: 0,
              chanceBizType: 2,
              applyType: 'init',
            },
          });
        })
      },
      onCancel: () => this.setState({ showAllotModal: false }),
    };
    const pushOrderModalProps = {
      visible: this.state.showPushOrderModal,
      onCancel: () => this.setState({ showPushOrderModal: false }),
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
        <PushOrderModal {...pushOrderModalProps} />
      </Card>
    );
  }
}
