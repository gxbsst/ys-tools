import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Table, Card, Divider, Button } from 'antd';
import AdvanceInfoModal from '../AdvanceInfoModal';

const emptyItem = {
  followTime: '',
  followType: '',
  linkSubject: '',
  linkContent: '',
  linkCustomer: '',
  linkCustomerId: '',
  followName: '',
}
@connect(({ arriveShop, user }) =>
  ({
    records: arriveShop.followRecords,
    currentDetail: arriveShop.currentDetail,
    user,
  })
)
export class FollowUp extends PureComponent {
  state = {
    showAdvanceInfoModal: false,
    item: null,
  }
  componentWillMount() {
    this.props.dispatch({
      type: 'arriveShop/queryRecords',
      payload: {
        tab: 'followRecords',
        type: 'init',
      },
    });
  }
  render() {
    const { records, currentDetail: { bindAccount, opStatus }, user: { currentUser: { username } } } = this.props;
    const recordsColumns = [
      {
        title: '跟进时间',
        dataIndex: 'followTime',
        key: 'followTime',
        width: 100,
      }, {
        title: '联系类型',
        dataIndex: 'followType',
        key: 'followType',
        width: 100,
      }, {
        title: '联系主题',
        dataIndex: 'linkSubject',
        key: 'linkSubject',
        width: 100,
      }, {
        title: '联系内容',
        dataIndex: 'linkContent',
        key: 'linkContent',
        width: 100,
      }, {
        title: '联系人',
        dataIndex: 'linkCustomer',
        key: 'linkCustomer',
        width: 150,
      }, {
        title: '跟进人',
        dataIndex: 'followName',
        key: 'followName',
        width: 150,
      }, {
        title: '操作',
        key: 'action',
        render: (text, record) => (
          <span>
          <a onClick={() => {
            this.setState({
              showAdvanceInfoModal: true,
              item: record,
            })
          }}>编辑</a>
          <Divider type="vertical"/>
          <a onClick={() => {
          }}>听录音</a>
        </span>
        ),
        width: 150,
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
            tab: 'followRecords',
            type: 'init',
          },
        });
      },
      onShowSizeChange: (page, size) => {
        this.props.dispatch({
          type: 'arriveShop/queryRecords',
          payload: {
            pageSize: size,
            page: 1,
            tab: 'followRecords',
            type: 'init',
          },
        });
      },
    };
    const AdvanceInfoModalProps = {
      item: this.state.item,
      visible: true,
      onOk: () => this.setState({showAdvanceInfoModal: false},
        () => this.props.dispatch({
          type: 'arriveShop/queryRecords',
          payload: {
            tab: 'followRecords',
            type: 'OS',
            pageSize: records.pagination.pageSize
          },
        })
      ),
      onCancel: () => this.setState({ showAdvanceInfoModal: false }),
    };
    return (
      <Card title="跟进日志">
        {
          (bindAccount && bindAccount === username) &&
          opStatus !== 5 &&
          <Button onClick={() => this.setState({ showAdvanceInfoModal: true, item: emptyItem })} style={{ marginBottom: '20px' }}>新增跟进信息</Button>
        }
        <Table
          columns={recordsColumns}
          dataSource={records.data}
          pagination={recordsPagination}
          rowKey={record => `${record.id}`}
        />
        { this.state.showAdvanceInfoModal && <AdvanceInfoModal {...AdvanceInfoModalProps} />}
  </Card>
    );
  }
}
