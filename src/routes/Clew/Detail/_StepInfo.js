import React, { Component } from 'react';
import { connect } from 'dva';
import { Button, Card, Table } from 'antd';
import AudioModal from './__AudioModal';

const recordsColumns = [{
  title: '日志类型',
  dataIndex: 'opTypeName',
  width: 100,
}, {
  title: '时间',
  dataIndex: 'opTime',
  width: 100,
}, {
  title: '处理人',
  dataIndex: 'opUserName',
  width: 100,
}, {
  title: '处理结果',
  dataIndex: 'opResult',
  width: 100,
}, {
  title: '备注',
  dataIndex: 'remark',
  width: 150,
}];

@connect(state => ({
  logs: state.clews.logs,
}))
export default class StepInfo extends Component {
  state = {
    visible: false,
  }
  componentDidMount() {
    this.fetchClewLogs()
  }
  fetchClewLogs = (pagination = {}) => {
    const { dispatch, id } = this.props;
    dispatch({
      type: 'clews/logs',
      payload: { ...pagination, id },
    });
  }
  onChange = (pagination) => {
    const { current: page, pageSize } = pagination
    this.fetchClewLogs({ page, pageSize })
  }
  showModal = () => {
    this.setState({ visible: true });
  }
  onCancel = () => {
    this.setState({ visible: false });
  }
  render() {
    const { logs: { data, pagination: { page: current, totalCount: total, pageSize } } } = this.props;
    const { visible } = this.state;
    const radioColumns = ([{
      dataIndex: 'audio',
      render: () => (
        <Button onClick={this.showModal}>听录音</Button>
      ),
      width: 150,
    }], []);
    return (
      <div>
        <Card title="跟进信息" style={{ marginBottom: 24 }} bordered={false}>
          <Table
            columns={[...recordsColumns, ...radioColumns]}
            dataSource={data}
            rowKey="id"
            onChange={this.onChange}
            pagination={{ current, total, pageSize }}
          />
        </Card>
        <AudioModal visible={visible} onCancel={this.onCancel} />
      </div>
    );
  }
}
