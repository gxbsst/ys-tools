import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Table, Button } from 'antd';
import VisitModal from '../VisitModal';


@connect(({ arriveShop, user }) =>
  ({
    visitRecords: arriveShop.visitRecords,
    currentDetail: arriveShop.currentDetail,
    user,
  })
)
export class VisitRecords extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      showVisitModal: false,
    };
  }
  componentWillMount() {
    this.props.dispatch({
      type: 'arriveShop/queryRecords',
      payload: {
        tab: 'visitRecords',
        type: 'init',
      },
    });
  }
  render() {
    const { visitRecords, currentDetail: { bindAccount, opStatus }, user: { currentUser: { username } }  } = this.props;
    const visitRecordsColumns = [{
      title: '拜访时间',
      dataIndex: 'visitTime',
      key: 'visitTime',
      width: 100,
    }, {
      title: '拜访地点',
      dataIndex: 'visitAddress',
      key: 'visitAddress',
      width: 100,
    }, {
      title: '拜访人',
      dataIndex: 'visitName',
      key: 'visitName',
      width: 100,
    }, {
      title: '处理人',
      dataIndex: 'opUserName',
      key: 'opUserName',
      width: 100,
    }, {
      title: '拜访结果',
      dataIndex: 'visitResult',
      key: 'visitResult',
      width: 100,
    }, {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 150,
    }];
    const visitRecordsPagination = {
      current: visitRecords.pagination.page,
      showSizeChanger: true,
      pageSize: visitRecords.pagination.pageSize,
      total: visitRecords.pagination.totalCount,
      showTotal: () => `共${visitRecords.pagination.totalCount}条`,
      onChange: (page, size) => {
        this.props.dispatch({
          type: 'arriveShop/queryRecords',
          payload: {
            pageSize: size,
            page,
            tab: 'visitRecords',
            type: 'init',
          },
        });
      },
      onShowSizeChange: (page, size) => {
        this.props.dispatch({
          type: 'arriveShop/queryRecords',
          payload: {
            pageSize: size,
            page :1,
            tab: 'visitRecords',
            type: 'init',
          },
        });
      },
    };
    const relationModalProps = {
      visible: true,
      onOk: () => this.setState({showVisitModal: false},
        () => this.props.dispatch({
          type: 'arriveShop/queryRecords',
          payload: {
            tab: 'visitRecords',
            type: 'init',
            pageSize: visitRecords.pagination.pageSize
          },
        })
      ),
      onCancel: () => this.setState({ showVisitModal: false }),
    };
    return (
      <div>
        {
          (bindAccount && bindAccount === username) &&
          opStatus !== 5 &&
          <Button onClick={() => this.setState({ showVisitModal: true })} style={{ marginBottom: '20px' }}>新增拜访记录</Button>
        }
        {this.state.showVisitModal && <VisitModal {...relationModalProps} />}
        <Table
          columns={visitRecordsColumns}
          dataSource={visitRecords.data}
          pagination={visitRecordsPagination}
          rowKey={record => `${record.id}`}
        />
      </div>
    );
  }
}
