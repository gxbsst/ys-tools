import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Table, Button } from 'antd';
import VisitModal from '../VisitModal';


@connect(({ saleRetail, user }) =>
  ({
    records: saleRetail.visitRecords,
    currentDetail: saleRetail.currentDetail,
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
      type: 'saleRetail/queryRecords',
      payload: {
        tab: 'visitRecords',
        type: 'OS',
      },
    });
  }
  render() {
    const { records, currentDetail: { bindAccount, opStatus }, user: { currentUser: { username } } } = this.props;
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
      current: records.pagination.page,
      showSizeChanger: true,
      pageSize: records.pagination.pageSize,
      total: records.pagination.totalCount,
      showTotal: () => `共${records.pagination.totalCount}条`,
      onChange: (page, size) => {
        this.props.dispatch({
          type: 'saleRetail/queryRecords',
          payload: {
            pageSize: size,
            page,
            tab: 'visitRecords',
            type: 'OS',
          },
        });
      },
      onShowSizeChange: (page, size) => {
        this.props.dispatch({
          type: 'saleRetail/queryRecords',
          payload: {
            pageSize: size,
            tab: 'visitRecords',
            type: 'OS',
          },
        });
      },
    };
    const relationModalProps = {
      visible: true,
      onOk: () => this.setState({showVisitModal: false},
        () => this.props.dispatch({
          type: 'saleRetail/queryRecords',
          payload: {
            tab: 'visitRecords',
            type: 'OS',
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
          dataSource={records.data}
          pagination={visitRecordsPagination}
          rowKey={record => `${record.id}`}
        />
      </div>
    );
  }
}
