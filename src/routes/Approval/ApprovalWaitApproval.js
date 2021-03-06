import React, { PureComponent } from 'react';
import { Table, DatePicker, Card } from 'antd';
import moment from 'moment/moment';
import { Link } from 'dva/router';
import autodata from '../../decorators/AutoData';
import can from '../../decorators/Can';
import { Select } from '../../components/Helpers';
import { enums } from '../../utils';
import { getApproveStatus } from '../../utils/helpers';

const { RangePicker } = DatePicker;

@autodata('/api/processes', [
  {
    name: 'applyTimeStart, applyTimeEnd',
    label: '申请时间',
    colspan: 2,
    valueType: moment,
    component: RangePicker,
    props: { format: 'YYYY-MM-DD', placeholder: ['开始日期', '结束日期'] }
  },
  {
    name: 'processId',
    label: '类型',
    valueType: Number,
    component: Select,
    props: {
      allowClear: true,
      options: enums('PROCESS_TYPE'),
      placeholder: '请选择审批类型'
    }
  }
])
@can()
export default class ApprovalWaitApproval extends PureComponent {
  render() {
    const approve = 7002002; //审批操作
    const { can } = this.props;
    const waitApprovalColumns = [
      {
        title: '审批流id',
        dataIndex: 'id',
        key: 'id',
        width: 100
      },
      {
        title: '审批类型',
        dataIndex: 'processName',
        key: 'processName'
      },
      {
        title: '申请人',
        dataIndex: 'applyRealName',
        key: 'applyRealName',
        width: 100
      },
      {
        title: '申请时间',
        dataIndex: 'createTime',
        key: 'createTime'
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        render: getApproveStatus
      },
      {
        title: '当前处理人',
        dataIndex: 'examineName',
        key: 'examineName',
        width: 100
      },
      {
        title: '操作',
        key: 'action',
        render: (text, record) =>
          can(approve) && (
            <Link to={`/approval/my-approval/detail/${record.id}`}>审批</Link>
          )
      }
    ];
    const { $data: { searcher, data, pagination, loading } } = this.props;

    return (
      <Card bordered={false}>
        {searcher}
        <Table
          columns={waitApprovalColumns}
          dataSource={data}
          rowKey="id"
          pagination={{
            ...pagination,
            showTotal: () => `共${pagination.total}条`
          }}
          loading={loading}
        />
      </Card>
    );
  }
}
