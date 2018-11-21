import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Table, Divider, Popconfirm, message } from 'antd';
import PushOrderModal from '../../PushOrderModal';
import styles from './style.less';

@connect(state => ({
  data: state.saleRetail,
  loading: state.loading.effects['saleRetail/queryPrivateSeaList'],
}))
export default class ClaimLibrary extends PureComponent {
  state= {
    showPushOrderModal: false,
    currentChance: null,
  }
  componentDidMount() {
    this.props.dispatch({
      type: 'saleRetail/queryPrivateSeaList',
      payload: {
        page: 1,
        pageSize: 10,
        chanceBizType: 1,
        chanceType: 'is',
        fromSource: 1,
        isSubordinate: 0,
        applyType: 'init',
      },
    });
    this.props.dispatch({
      type: 'saleRetail/queryPrivateSeaConfig',
      payload: {
        fromSource: 1,
        type: 'protect',
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
  handleClickPushOrder(id) {
    this.props.dispatch({
      type: 'saleRetail/queryPushOrderModalInfo',
      payload: {
        id,
      }
    }).then((val) => {
      if (val) {
        this.setState({showPushOrderModal: true});
      }
    });
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
          chanceBizType: 1,
          chanceType: 'is',
          fromSource: 1,
          isSubordinate: 0,
          applyType: 'init',
        },
      });
    });
  }

  abandonCancel = () => {
    message.error('已取消');
  }
  render() {
    const { privateSeaData, privateSeaConfig } = this.props.data;
    const { currentChance } = this.state;
    const loading = this.props.loading;
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
        <span>客保机会数量：</span>{totalCount}/{quantum}
      </div>
    )

    const columns = [
      {
        title: '机会ID',
        dataIndex: 'id',
        key: 'id',
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
        render: (text, record) => (
          <span>
            <a onClick={() => this.toDetail(record.id)}>详情</a>
            <Divider type="vertical" />
            <a onClick={() => this.handleClickPushOrder(record.id)}>提单</a>
            <Divider type="vertical" />
            <Popconfirm title="是否放弃?" onConfirm={() => this.abandonConfirm(record.id)} onCancel={this.abandonCancel} okText="确定" cancelText="取消">
              <a>放弃</a>
            </Popconfirm>
          </span>
        ),
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
            chanceBizType: 1,
            chanceType: 'is',
            fromSource: 1,
            isSubordinate: 0,
            applyType: 'protect',
          },
        });
      },
      onShowSizeChange: (page, size) => {
        this.props.dispatch({
          type: 'saleRetail/queryPrivateSeaList',
          payload: {
            pageSize: size,
            chanceBizType: 1,
            chanceType: 'is',
            fromSource: 1,
            isSubordinate: 0,
            applyType: 'protect',
          },
        });
      },

    };
    const pushOrderModalProps = {
      visible: true,
      onOk: () => {
        this.setState({
          showPushOrderModal: false
        }, () => {
          this.props.dispatch({
            type: 'saleRetail/queryPrivateSeaList',
            payload: {
              page: 1,
              pageSize: 10,
              chanceBizType: 1,
              chanceType: 'is',
              fromSource: 1,
              isSubordinate: 0,
              applyType: 'init',
            },
          });
        })
      },
      onCancel: () => this.setState({ showPushOrderModal: false }),
    };
    return (
      <Card
        className={styles.listCard}
        bordered={false}
        bodyStyle={{ padding: '40px 32px 40px 32px' }}
      >
        <Table
          title={ChanceCount}
          dataSource={data}
          columns={columns}
          pagination={paginationProps}
          loading={loading}
        />
        { this.state.showPushOrderModal && <PushOrderModal {...pushOrderModalProps} /> }
      </Card>
    );

  }
}
