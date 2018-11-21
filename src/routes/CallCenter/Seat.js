import React, { PureComponent } from 'react';
import { Table, Card, Button, Switch } from 'antd';
import { autodata, can } from '../../decorators';
import { Dialog, FormItemGroup } from '../../components';
import { Action } from '../../components/Helpers';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import { request, toSafePositiveInteger } from '../../utils';
import styles from './index.less';

const cnoNormalize = (value) => toSafePositiveInteger(value);

@can()
@autodata('/api/callcenter/list', [
  { name: 'seatCno', label: '坐席编号', options: { normalize: cnoNormalize }, props: { maxLength: 6 } },
  { name: 'seatName', label: '坐席名称', props: { maxLength: 20 } },
  { name: 'userName', label: '员工帐号', props: { maxLength: 20 } },
  { name: 'seatPhone', label: '绑定电话', props: { maxLength: 20 } },
])
export default class Seat extends PureComponent {
  state = {};

  sync = async () => {
    this.setState({ syncing: true });
    try {
      await request('/api/callcenter/seatSync');
      this.setState({ syncing: false });
      this.props.$data.reload();
    } catch (e) {
      this.setState({ syncing: false });
    }
  };

  edit = record => () => {
    Dialog.open({
      title: '编辑坐席',
      formProps: {
        action: '/api/callcenter/seatEdit',
        method: 'PUT',
        valuesFilter: values => _.merge(record, values, { seatRole: values.seatRole ? 1 : 0 }),
        onSubmitted: () => {
          this.props.$data.reload();
        }
      },
      render({ props: { form } }) {
        const { userName, seatRole } = record;
        const items = [
          { name: 'userName', label: '员工帐号', value: userName, max: 30, required: true },
          { name: 'seatRole', label: '班长坐席', value: !!seatRole, component: Switch, options: { valuePropName: 'checked' }, props: { checkedChildren: '是', unCheckedChildren: '否' } },
        ];
        return <FormItemGroup className={styles.seatForm} items={items} form={form} cols={2} layout={null}/>;
      }
    });
  };

  unbind = (userName) => async () => {
    await request('/api/callcenter/seatDelete', {
      method: 'PUT',
      body: { userName }
    });
    this.props.$data.reload();
  };

  getAction = (value, { seatCno, seatId, seatName, seatRole, userName }) => {
    const items = [
      { onClick: this.edit({ seatCno, seatId, seatName, seatRole, userName }) },
      { is: !!userName, text: '解绑', onClick: this.unbind(userName) },
    ];
    return <Action items={items}/>;
  };

  columns = [
    { title: '坐席ID', dataIndex: 'seatId', width: '10%' },
    { title: '坐席编号', dataIndex: 'seatCno', width: '10%' },
    { title: '坐席名称', dataIndex: 'seatName', width: '15%' },
    { title: '员工姓名', dataIndex: 'userName', width: '15%' },
    { title: '绑定电话', dataIndex: 'seatPhone' },
    { title: '班长坐席', dataIndex: 'seatRole', width: 80, render: value => value ? '是' : '否' },
    { title: '操作', key: 'action', width: 150, render: this.getAction },
  ];

  render() {
    const { columns, sync, state: { syncing }, props } = this;
    const { $data: { searcher, data: dataSource, pagination, loading, starting }, can } = props;
    const action = <Button type="primary" loading={syncing} onClick={sync}>更新坐席</Button>;
    const tableProps = {
      size: 'middle',
      rowKey: 'id',
      columns,
      dataSource,
      pagination,
      loading,
    };

    return (
      <PageHeaderLayout action={action}>
        <Card className="flex-item" bordered={false} loading={starting}>
          {searcher}
          <Table {...tableProps}/>
        </Card>
      </PageHeaderLayout>
    );
  }
}
