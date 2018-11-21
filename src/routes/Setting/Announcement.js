import React, { PureComponent } from 'react';
import { Card, Table, Button, Form, Radio, Input, Tag } from 'antd';
import _ from 'lodash';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import autodata from '../../decorators/AutoData';
import { Action } from '../../components/Helpers';
import Dialog from '../../components/Dialog';
import { request } from '../../utils';

const itemProps = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 }
};

@autodata({
  namespace: 'portal',
  url: '/api/portal',
})
@autodata('/api/announcement')
export default class Announcement extends PureComponent {
  constructor(props) {
    super(props);
    this.columns = [
      { title: '公告标题', dataIndex: 'title', width: '25%', render: this.getTitle },
      { title: '公告内容', dataIndex: 'link', render: this.getContent },
      { title: '发布时间', dataIndex: 'createTime', width: 150 },
      { title: '操作', key: 'action', width: 120, render: this.getAction },
    ];
  }

  getTitle = (value, record) => {
    let tag = null;
    switch (record.type) {
      case 1:
        tag = <Tag className="no-events" color="orange">文本</Tag>;
        break;
      case 2:
        tag = <Tag className="no-events" color="blue">链接</Tag>;
        break;
    }
    return <span>{tag} {value}</span>;
  };

  getContent = (value, record) => {
    switch (record.type) {
      case 2:
        return <a href={value} target="_blank">{value}</a>;
      default:
        return value;
    }
  };

  setType = ({ resetFields }) => () => {
    resetFields(['link']);
  };

  getAction = (value, record) => {
    return <Action items={[
      { onClick: this.edit(record) },
      { type: 'confirm', onClick: this.delete(record) },
    ]}/>;
  };

  setStatus = ({ id, status }) => async () => {
    await request(`/api/portal/${id}`, { method: 'PUT', body: { status: status ? 0 : 1 } });
    this.props.portal.reload();
  };

  getContentField = (type, record, { getFieldDecorator }) => {
    switch (type) {
      case 1:
        return (
          <Form.Item {...itemProps} label="公告内容">
            {getFieldDecorator('link', {
              initialValue: record.link,
              rules: [{ required: true, message: '公告内容不能为空' }],
            })(<Input.TextArea placeholder="请输入公告内容" rows={5} autosize={false}/>)}
          </Form.Item>
        );
      case 2:
        return (
          <Form.Item {...itemProps} label="公告链接">
            {getFieldDecorator('link', {
              initialValue: record.link,
              rules: [
                { required: true, message: '公告链接不能为空' },
                { type: 'url', message: '公告链接格式不正确' }
              ],
            })(<Input placeholder="请输入公告链接"/>)}
          </Form.Item>
        );
    }
  };

  getForm = (record = {}) => ({ props: { form } }) => {
    const { getFieldDecorator, getFieldValue } = form;
    const type = getFieldValue('type');
    return (
      <div>
        <Form.Item {...itemProps} label="公告标题">
          {getFieldDecorator('title', {
            initialValue: record.title,
            rules: [{ required: true, message: '公告标题不能为空' }],
          })(<Input placeholder="请输入公告标题"/>)}
        </Form.Item>
        <Form.Item {...itemProps} label="公告类型">
          {getFieldDecorator('type', {
            initialValue: record.type || 1,
          })(
            <Radio.Group onChange={this.setType(form)}>
              <Radio.Button value={1}>文本</Radio.Button>
              <Radio.Button value={2}>链接</Radio.Button>
            </Radio.Group>
          )}
        </Form.Item>
        {this.getContentField(type, record, form)}
      </div>
    );
  };

  onSubmitted = () => {
    this.props.$data.reload();
  };

  create = () => {
    const { getForm, onSubmitted } = this;
    Dialog.open({
      title: '发布公告',
      formProps: {
        action: '/api/announcement',
        method: 'POST',
        onSubmitted
      },
      render: getForm()
    });
  };

  edit = record => () => {
    const { getForm, onSubmitted } = this;
    Dialog.open({
      title: '编辑公告',
      formProps: {
        action: `/api/announcement/${record.id}`,
        method: 'PUT',
        onSubmitted
      },
      render: getForm(record)
    });
  };

  delete = ({ id }) => async () => {
    await request(`/api/announcement/${id}`, { method: 'DELETE' });
    this.props.$data.reload();
  };

  render() {
    const { columns } = this;
    const { $data: { data: dataSource = [], pagination, loading }, portal: { data: portals, loading: syncing } } = this.props;
    const portal = _.find(portals, { name: 'announcement' });
    const action = (
      <div>
        <Button type="primary" onClick={this.create}>发布公告</Button>
        {portal ? <Button type={portal.status ? 'danger' : 'primary'} onClick={this.setStatus(portal)} loading={syncing} ghost>{portal.status ? '停用' : '启用'}</Button> : null}
      </div>
    );
    const tableProps = {
      className: 'table-fixed',
      size: 'middle',
      rowKey: 'id',
      columns,
      dataSource,
      pagination,
      loading,
    };

    return (
      <PageHeaderLayout action={action}>
        <Card bordered={false}>
          <Table {...tableProps}/>
        </Card>
      </PageHeaderLayout>
    );
  }
}
