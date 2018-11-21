import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { Card, Table, Divider } from 'antd';
import { pendingApprovalColumns } from '../../tableColumns';
import RejectRequestModal from '../../RejectRequestModal';

import styles from './style.less';
@connect(state => ({
  data: state.arriveShop,
  user: state.user,
  loading: state.loading.effects['arriveShop/queryWacitAudit'],
}))
export default class PendingApproval extends PureComponent {
  state = {
    showRejectRequestModal: false,
    currentChance: '',
  }
  componentDidMount() {
    this.props.dispatch({
      type: 'arriveShop/queryWacitAudit',
      payload: {
        page: 1,
        pageSize: 10,
        fromSource: 2,
        chanceBizType: 1,
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
  approve = (id) => {
    this.props.dispatch({
      type: 'arriveShop/approval',
      payload: {
        id,
        result: 0,
      },
    }).then(val => {
      this.props.dispatch({
        type: 'arriveShop/queryWacitAudit',
        payload: {
          page: 1,
          pageSize: 10,
          fromSource: 2,
          chanceBizType: 1,
        },
      });
    });
  }
  abadon = (id) => {
    this.props.dispatch({
      type: 'arriveShop/approval',
      payload: {
        id,
        result: 1,
      },
    }).then(val => {
      this.props.dispatch({
        type: 'arriveShop/queryWacitAudit',
        payload: {
          page: 1,
          pageSize: 10,
          fromSource: 2,
          chanceBizType: 1,
        },
      });
    });
  }
  renderAction(record) {
    const { permissions } = this.props.user;
    return (
      <span>
        {
          permissions.includes(7002000) &&
          <Link to={`/approval/my-apply/detail/${record.id}?redirect=/arriveShop/shopPrivateSea`}>查看</Link>
        }
        <Divider type="vertical" />
        <a onClick={() => this.toDetail(record.chanceId)}>机会详情</a>
        <Divider type="vertical" />
        {
          record.hasApproval &&
          <Fragment>
            <a onClick={() => this.approve(record.id)}>通过</a>
            <Divider type="vertical" />
            <a onClick={() => this.abadon(record.id)}>驳回</a>
          </Fragment>
        }
      </span>
    );
  }

  render() {
    const { waitAuditData } = this.props.data;
    const { currentChance } = this.state;
    if (!waitAuditData) {
      return null;
    }
    const { data, pagination } = waitAuditData;
    const columns = [
      ...pendingApprovalColumns,
     {
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
          type: 'arriveShop/queryWacitAudit',
          payload: {
            page,
            pageSize: size,
            fromSource: 2,
            chanceBizType: 1,
          },
        });
      },
      onShowSizeChange: (page, size) => {
        this.props.dispatch({
          type: 'arriveShop/queryWacitAudit',
          payload: {
            page,
            pageSize: size,
            fromSource: 2,
            chanceBizType: 1,
          },
        });
      },
    };
    const loading = this.props.loading;
    const showRejectRequestModalProps = {
      id: currentChance,
      visible: this.state.showRejectRequestModal,
      onCancel: () => this.setState({ showRejectRequestModal: false }),
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
        <RejectRequestModal {...showRejectRequestModalProps} />
      </Card>
    );

  }
}
