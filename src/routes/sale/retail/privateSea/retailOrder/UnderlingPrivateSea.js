import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Table, Divider, message } from 'antd';
import AllotModal from '../../AllotModal';
import styles from './style.less';

@connect(state => ({
  data: state.saleRetail,
  loading: state.loading.effects['saleRetail/queryPrivateSeaList'],
}))
export default class UnderlingPrivateSea extends PureComponent {
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
        isSubordinate: 1,
        chanceBizType: 1,
        chanceType: 'is',
      },
    });
  }
  allot = (id) => { // 分配人员
    this.setState({ showAllotModal: true, currentChance: id })
  }
  toDetail = (id) => {
    this.props.dispatch({
      type: 'saleRetail/checkCurrentChance',
      payload: {
        id,
      },
    });
  }
  renderAction(record) {
    return (
      <span>
          <a onClick={() => this.toDetail(record.id)}>详情</a>
          <Divider type="vertical" />
        {
          record.status != 2 &&
          <a onClick={() => this.allot(record.id)}>转分配</a>
        }
      </span>
    )
  }
  render() {
    const { privateSeaData } = this.props.data;
    const { currentChance } = this.state;
    if (!privateSeaData) {
      return null;
    }
    const { data, pagination } = privateSeaData;
    const columns = [{
      title: '机会id',
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
      title: '状态',
      dataIndex: 'statusName',
      key: 'statusName',
    }, {
      title: '处理人',
      dataIndex: 'opUserName',
      key: 'opUserName',
    }, {
      title: '操作',
      key: 'action',
      render: (text, record) => this.renderAction(record),
    }];

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
            isSubordinate: 1,
            chanceBizType: 1,
            chanceType: 'is',
          },
        });
      },
      onShowSizeChange: (page, size) => {
        this.props.dispatch({
          type: 'saleRetail/queryPrivateSeaList',
          payload: {
            page,
            pageSize: size,
            fromSource: 1,
            isSubordinate: 1,
            chanceBizType: 1,
            chanceType: 'is',
          },
        });
      },

    };
    const loading = this.props.loading;
    const showAllotModalProps = {
      id: currentChance,
      fromSource: 1,
      type: 'init',
      visible: true,
      chanceType: 'is',
      onOk: () => {
        this.setState({
          showAllotModal: false
        }, () => {
          this.props.dispatch({
            type: 'saleRetail/queryPrivateSeaList',
            payload: {
              page: 1,
              pageSize: 10,
              fromSource: 1,
              isSubordinate: 1,
              chanceBizType: 1,
              chanceType: 'is',
            },
          });
        })
      },
      onCancel: () => this.setState({ showAllotModal: false }),
    };
    return (
      <Card
        className={styles.listCard}
        bordered={false}
        bodyStyle={{ padding: '40px 32px 40px 32px' }}
      >
        <Table
          dataSource={data}
          columns={columns}
          pagination={paginationProps}
          loading={loading}
        />
        { this.state.showAllotModal && <AllotModal {...showAllotModalProps} /> }
      </Card>
    );

  }
}
