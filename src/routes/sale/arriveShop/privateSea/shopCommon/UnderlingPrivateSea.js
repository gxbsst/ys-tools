import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Table, Divider } from 'antd';
import AllotModal from '../../AllotModal';
import styles from './style.less';

@connect(state => ({
  data: state.arriveShop,
  loading: state.loading.effects['arriveShop/queryPrivateSeaList'],
}))
export default class UnderlingPrivateSea extends PureComponent {
  state = {
    currentChance: [],
    showAllotModal: false,
  }
  componentDidMount() {
    this.props.dispatch({
      type: 'arriveShop/queryPrivateSeaList',
      payload: {
        page: 1,
        pageSize: 10,
        fromSource: 2,
        isSubordinate: 1,
        chanceBizType: 2,
        applyType: 'init',
      },
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
  allot = (id) => { // 分配人员
    this.setState({ showAllotModal: true, currentChance: id })
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
          type: 'arriveShop/queryPrivateSeaList',
          payload: {
            page,
            pageSize: size,
            fromSource: 2,
            isSubordinate: 1,
            chanceBizType: 2,
            applyType: 'init',
          },
        });
      },
    };
    const loading = this.props.loading;
    const showAllotModalProps = {
      id: currentChance,
      fromSource: 2,
      visible: this.state.showAllotModal,
      chanceType: 'init',
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
              isSubordinate: 1,
              chanceBizType: 2,
              applyType: 'init',
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
          rowKey={record => `${record.id}`}
        />
        { this.state.showAllotModal && <AllotModal {...showAllotModalProps} /> }
      </Card>
    );

  }
}
