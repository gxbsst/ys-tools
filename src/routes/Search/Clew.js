import React, { PureComponent } from 'react';
import { Table, Card, Tag } from 'antd';
import { Link } from 'react-router-dom';
import autodata from '../../decorators/AutoData';
import can from '../../decorators/Can';
import { Action, Ellipsis } from '../../components/Helpers';
import { request } from '../../utils';
import { clewStatusMap } from '../../utils/paramsMap';
import { getClewStatus, getSource } from '../../utils/helpers';

@autodata('/api/sources/clews')
@can()
export default class SearchCustomer extends PureComponent {
  setUrgent = clewId => async () => {
    await request(`/api/clews/${clewId}/urgent`, { method: 'PUT' });
    this.props.$data.reload();
  };

  getPrimary = (value, { urgentStatus }) => {
    return (
      <Ellipsis maxWidth={180}>
        {urgentStatus ? <Tag className="mark" color="red">急</Tag> : null}
        {value}
      </Ellipsis>
    );
  };

  getAction = (value, { clewId }) => {
    const items = [
      { component: Link, text: '查看', to: `/clew/clews/${clewId}/detail` },
      { type: 'confirm', text: '加急', title: '您确定要进行加急操作吗？', onClick: this.setUrgent(clewId) },
    ];
    return <Action items={items}/>;
  };
  getStatus = ({clewStatus, fromSource}) => 
    (clewStatus > 3
      ? ([4, 5, 6, 7, 8].includes(clewStatus) && ['', '新零售', '到店'][fromSource]) || ''
      : ([1, 2, 3].includes(clewStatus) && '售前') || '') 
      + (clewStatusMap.get(clewStatus) || '')
  render() {
    const { $data: { data: dataSource, pagination, loading }, can } = this.props;
    const columns = [
      { title: '线索ID', dataIndex: 'clewId', width: 120, render: this.getPrimary },
      { title: '客户名称', dataIndex: 'customerName' },
      { title: '地区', dataIndex: 'area', width: 180 },
      { title: '行业', dataIndex: 'industry', width: 180 },
      { title: '线索来源', key: 'source', width: 180, render: getSource },
      { title: '创建时间', dataIndex: 'createTime', width: 120, render: value => value.split(' ')[0] },
      { title: '状态', dataIndex: 'clewStatus', width: 120, render: (value, record) => this.getStatus(record) },
      { title: '处理人', dataIndex: 'handlerName', width: 100 },
      { title: '操作', key: 'action', width: 110, fixed: 'right', render: this.getAction }
    ];
    const tableProps = {
      rowKey: 'id',
      scroll: { x: 1320 },
      columns,
      dataSource,
      pagination,
      loading,
    };
    return <Card bordered={false}><Table {...tableProps}/></Card>;
  }
}
