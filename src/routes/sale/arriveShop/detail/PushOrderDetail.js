import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Table, Card, Button } from 'antd';
import DropOption from '../../../../components/DropOption/';

@connect(({ arriveShop, loading, user }) =>
  ({
    records: arriveShop.pushOrderRecords,
    id: arriveShop.id,
    currentDetail: arriveShop.currentDetail,
    user,
    loading: loading.effects['arriveShop/queryRecords'],
  })
)
export default class PushOrderDetail extends PureComponent {
  componentWillMount() {
    this.props.dispatch({
      type: 'arriveShop/queryRecords',
      payload: {
        tab: 'pushOrderRecords',
      },
    });
  }
  handleMenuClick(record, type) {
    const { id } = record;
    switch (type) {
      case 'push':
        this.props.dispatch({
          type: 'arriveShop/pushCurrentPushOrder',
          payload: { id },
        });
        break;
      case 'detail':
        this.props.dispatch({
          type: 'arriveShop/checkCurrentPushOrder',
          payload: { id },
        });
        break;
      case 'edit':
        this.props.dispatch({
          type: 'arriveShop/editCurrentPushOrder',
          payload: { id },
        });
        break;
      case 'remove':
        this.props.dispatch({
          type: 'arriveShop/removeCurrentPushOrder',
          payload: { id },
        });
        break;
    }
  }
  renderAction(record) {
    let actions = [];
    // if (record.receiptStatus === 'wait' || record.receiptStatus === 'reject') {
    //   actions.push({ key: 'push', name: '提审' }, { key: 'edit', name: '编辑' });
    // }
    // if (record.receiptStatus === 'wait') {
    //   actions.push({ key: 'remove', name: '删除' });
    // }
    // actions.push({ key: 'detail', name: '查看' });
    actions.push({ key: 'push', name: '提审' });
    return actions;
  }
  render() {
    const { records, loading, id, currentDetail: { bindAccount, opStatus }, user: { currentUser: { username } } } = this.props;
    const recordsColumns = [
      {
        title: '提单时间',
        dataIndex: 'receiptsTime',
        key: 'receiptsTime',
      }, {
        title: '提单人',
        dataIndex: 'salesName',
        key: 'salesName',
      }, {
        title: '提单金额 (¥)',
        dataIndex: 'receiptsPrice',
        key: 'receiptsPrice',
      }, {
        title: '软件金额 (¥)',
        dataIndex: 'softPrice',
        key: 'softPrice',
      }, {
        title: '服务金额 (¥)',
        dataIndex: 'servicePrice',
        key: 'servicePrice',
      }, {
        title: '合同编号',
        dataIndex: 'contractNo',
        key: 'contractNo',
      }, {
        title: '提单状态',
        dataIndex: 'receiptStatusName',
        key: 'receiptStatusName',
      }, {
        title: '审核意见',
        dataIndex: 'auditContent',
        key: 'auditContent',
      }, {
        title: '操作',
        key: 'action',
        render: (text, record) => (
          <Button onClick={this.handleMenuClick.bind(this, record, 'detail')} type="primary">查看</Button>
        ),
      }];
    const recordsPagination = {
      current: records.pagination.page,
      showSizeChanger: true,
      pageSize: records.pagination.pageSize,
      total: records.pagination.totalCount,
      showTotal: () => `共${records.pagination.totalCount}条`,
      onChange: (page, size) => {
        this.props.dispatch({
          type: 'arriveShop/queryRecords',
          payload: {
            pageSize: size,
            page,
            tab: 'pushOrderRecords',
          },
        });
      },
      onShowSizeChange: (page, size) => {
        this.props.dispatch({
          type: 'arriveShop/queryRecords',
          payload: {
            pageSize: size,
            page,
            tab: 'pushOrderRecords',
          },
        });
      },
    };
    return (
      <Card title="提单信息">
        {
          (bindAccount && bindAccount === username) &&
          opStatus !== 5 &&
          <Button
            style={{ marginBottom: '20px' }}
            onClick={() => this.props.dispatch({
              type: 'arriveShop/pushOrder',
              payload: {
                id,
              }
            })}
          >
            提单
          </Button>
        }
        <Table
          loading={loading}
          columns={recordsColumns}
          dataSource={records.data}
          pagination={recordsPagination}
          rowKey={record => record.id + ''}
        />
      </Card>
    );
  }
}
