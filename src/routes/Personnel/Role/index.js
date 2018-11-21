import React, { PureComponent } from 'react';
import { Table, Card, Button } from 'antd';
import { autodata } from '../../../decorators';
import { Action } from '../../../components/Helpers';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import { request, redirectTo } from '../../../utils';

const go = (id = 'new') => () => redirectTo(`/personnel/roles/${id}`);

@autodata('/api/role')
export default class Role extends PureComponent {
  delete = (id) => async () => {
    await request(`/api/role/${id}`, { method: 'DELETE' });
    this.props.$data.reload();
  };

  getAction = (id) => {
    const items = [
      { to: `/personnel/roles/${id}` },
      { type: 'confirm', onClick: this.delete(id) },
    ];
    return <Action items={items}/>;
  };

  columns = [
    { title: '角色名称', dataIndex: 'name', width: 200 },
    { title: '绑定人数', dataIndex: 'count', width: 100 },
    { title: '角色说明', dataIndex: 'remark' },
    { title: '操作', dataIndex: 'id', key: 'action', width: 120, render: this.getAction },
  ];

  render() {
    const { columns } = this;
    const { $data: { data: dataSource = [], pagination, loading, starting } } = this.props;
    const action = <Button type="primary" onClick={go()}>新建角色</Button>;
    const tableProps = {
      rowKey: 'id',
      scroll: { x: 900 },
      columns,
      dataSource,
      pagination,
      loading,
    };
    return (
      <PageHeaderLayout action={action}>
        <Card className="flex-item" bordered={false} loading={starting}>
          <Table {...tableProps}/>
        </Card>
      </PageHeaderLayout>
    );
  }
}
