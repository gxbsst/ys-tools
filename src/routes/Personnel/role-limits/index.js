import React, {PureComponent} from "react";
import {Button, Row, Col, Card, Tabs, Tooltip, Tree, Modal, Table, Icon, Divider, Pagination} from 'antd';
import autodata from '../../../decorators/AutoData'
import request from '../../../utils/request';
import {connect} from 'dva';
import {hashHistory, routerRedux} from 'dva/router'
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import {Link} from 'react-router-dom'
import common from '../common/index.less'
import styles from './index.less'

@connect(state => (
    state
  )
)
@autodata('/api/role')

export default class PersonnelInfo extends PureComponent {
  handleDel = record => async () => {
    await request(`/api/role/${record.id}`, {method: 'DELETE'});
    this.props.$data.reload();
  };
  linkTo = (record) => {
    const {dispatch} = this.props;
    dispatch(routerRedux.push({
      pathname: `/personnel/roleManage/${record.id}`,
      query: {
        mes: record.name,
      },
    }));
  }

  render() {
    const {$data: {searcher, data, pagination, loading, reload}, can} = this.props;
    const columns = [{
      title: '角色ID',
      dataIndex: 'id',
    }, {
      title: '角色名称',
      dataIndex: 'name',
    }, {
      title: '角色备注',
      dataIndex: 'remark',
    }, {
      title: '角色人数',
      dataIndex: 'count',
    }, {
      title: '操作',
      key: 'action',
      render: (text, record) => (
        <div className={common.operate}>
          <Link className={common.item} to={`/personnel/role-edit/${record.id}`}>编辑</Link>
          {/*<span className={common.item} onClick={this.linkTo.bind(this, record)}>角色管理</span>*/}
          <span className={common.item} onClick={this.handleDel(record)}>删除</span>
        </div>
      ),
    },
    ];
    return (
      <PageHeaderLayout>
        <Card>
          <Link to="/personnel/role-edit/new">
            <Button
              type="primary"
              style={{marginBottom: 20}}>
              新建角色
            </Button>
          </Link>
          <Table columns={columns} dataSource={data} pagination={pagination} loading={loading} rowKey="id"/>
        </Card>
      </PageHeaderLayout>
    )
  }
}
