import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Table, Button } from 'antd';
import RelationRecordsModal from '../../RelationRecordsModal';

@connect(({ saleRetail, user }) =>
  ({
    records: saleRetail.contactRecords,
    currentDetail: saleRetail.currentDetail,
    user,
  })
)
export class ContactRecords extends PureComponent {
  state = {
    showRelationModal: false,
  }
  componentWillMount() {
    this.props.dispatch({
      type: 'saleRetail/queryRecords',
      payload: {
        tab: 'contactRecords',
        type: 'IS',
      },
    });
  }
  render() {
    const { records, currentDetail: { bindAccount, opStatus, chanceType }, user: { currentUser: { username } } } = this.props;
    const recordsColumns = [
      {
        title: '创建时间',
        dataIndex: 'createTime',
        key: 'createTime',
        width: 100,
      }, {
        title: '联系人',
        dataIndex: 'linkName',
        key: 'linkName',
        width: 100,
      }, {
        title: '处理人',
        dataIndex: 'opUserName',
        key: 'opUserName',
        width: 100,
      }, {
        title: '联系方式',
        dataIndex: 'linkMethod',
        key: 'linkMethod',
        width: 100,
      }, {
        title: '联系类型',
        dataIndex: 'linkType',
        key: 'linkType',
        width: 100,
      }, {
        title: '联系结果',
        dataIndex: 'linkResult',
        key: 'linkResult',
        width: 100,
      }, {
        title: '备注',
        dataIndex: 'remark',
        key: 'remark',
        width: 150,
      }
    ];
    const recordsPagination = {
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
            tab: 'contactRecords',
            type: 'IS',
          },
        });
      },
      onShowSizeChange: (page, size) => {
        this.props.dispatch({
          type: 'saleRetail/queryRecords',
          payload: {
            pageSize: size,
            tab: 'contactRecords',
          },
        });
      },

    };
    const relationModalProps = {
      visible: true,
      onOk: () => this.setState({showRelationModal: false},
        () => this.props.dispatch({
          type: 'saleRetail/queryRecords',
          payload: {
            tab: 'contactRecords',
            type: 'IS',
          },
        })
      ),
      onCancel: () => this.setState({ showRelationModal: false }),
    };

    return (
      <div>
        {
          (bindAccount && bindAccount === username) &&
          opStatus !== 5 &&
          chanceType === 'is' &&
          <Button style={{ marginBottom: '20px' }} type="default" onClick={() => this.setState({ showRelationModal: true })}>+联系记录</Button>
        }
        <Table
          columns={recordsColumns}
          dataSource={records.data}
          pagination={recordsPagination}
          rowKey={record => `${record.id}`}
        />
        {this.state.showRelationModal && <RelationRecordsModal {...relationModalProps} />}
      </div>
    );
  }
}
