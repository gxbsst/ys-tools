import React, { PureComponent, Fragment } from 'react';
import { Card, Button, Form, Input } from 'antd';
import { autodata } from '../../decorators';
import { WMCUploadImage, Image, Sortable, Dialog } from '../../components';
import { Tooltip, Select, Action } from '../../components/Helpers';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import { request, enums, getLabel } from '../../utils';

const positions = enums('MIEN_POSITION');

@autodata({
  namespace: 'portal',
  url: '/api/portal',
})
@autodata('/api/mien')
export default class Mien extends PureComponent {
  static max = 10;

  constructor(props) {
    super(props);
    this.columns = [
      { title: '风采图片', dataIndex: 'image', width: 136, render: this.getImage },
      { title: '说明', dataIndex: 'content' },
      { title: '展示位置', dataIndex: 'position', width: 150, render: this.getPosition },
      { title: '操作', key: 'action', width: 120, render: this.getAction },
    ];
  }

  getImage = (value) => {
    return <Image src={value} width={80} height={48} preview/>;
  };

  getPosition = (value) => getLabel(positions, value);

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

  getForm = (record = {}) => ({ props: { form: { getFieldDecorator } } }) => {
    const itemProps = { labelCol: { span: 4 }, wrapperCol: { span: 20 } };
    const { image, content = '', position = 3 } = record;
    return (
      <Fragment>
        <Form.Item {...itemProps} label="风采图片">
          {getFieldDecorator('image', {
            initialValue: image,
            valuePropName: 'file',
            trigger: 'onSuccess',
            getValueFromEvent: media => media.url,
            rules: [{ required: true, message: '风采图片不能为空' }],
          })(<WMCUploadImage name="image" text="上传风采图片" src={record.image} width={200} height={120} preview/>)}
        </Form.Item>
        <Form.Item {...itemProps} label="风采说明">
          {getFieldDecorator('content', {
            initialValue: content,
          })(<Input.TextArea maxLength={40} placeholder="请输入风采说明" rows={5} autosize={false}/>)}
        </Form.Item>
        <Form.Item {...itemProps} label="展示位置">
          {getFieldDecorator('position', {
            initialValue: position,
          })(<Select options={positions}/>)}
        </Form.Item>
      </Fragment>
    );
  };

  onSubmitted = () => {
    this.props.$data.reload();
  };

  create = () => {
    const { getForm, onSubmitted } = this;
    Dialog.open({
      title: '添加风采',
      formProps: {
        action: '/api/mien',
        method: 'POST',
        onSubmitted
      },
      render: getForm()
    });
  };

  edit = record => () => {
    const { getForm, onSubmitted } = this;
    Dialog.open({
      title: '编辑风采',
      formProps: {
        action: `/api/mien/${record.id}`,
        method: 'PUT',
        onSubmitted
      },
      render: getForm(record)
    });
  };

  delete = ({ id }) => async () => {
    await request(`/api/mien/${id}`, { method: 'DELETE' });
    this.props.$data.reload();
  };

  onSorted = async records => {
    const { $data: { setData } } = this.props;
    setData({ data: records });
    await request('/api/mien/sort', {
      method: 'PUT',
      body: records.map(({ id }, sort) => ({ id, sort }))
    });
  };

  render() {
    const { columns, onSorted } = this;
    const { $data: { data: dataSource = [], loading }, portal: { data: portals, loading: syncing } } = this.props;
    const portal = _.find(portals, { name: 'mien' });
    const disabled = dataSource.length >= Mien.max;
    const action = (
      <Fragment>
        <Tooltip title={disabled ? `最多只能展示${Mien.max}条风采` : null} type="error"/>
        <Button type="primary" onClick={this.create} disabled={disabled}>添加风采</Button>
        {portal ? <Button type={portal.status ? 'danger' : 'primary'} onClick={this.setStatus(portal)} loading={syncing} ghost>{portal.status ? '停用' : '启用'}</Button> : null}
      </Fragment>
    );
    const sortableProps = {
      sortKey: 'sort',
      columns,
      dataSource,
      loading,
      onSorted,
    };

    return (
      <PageHeaderLayout action={action}>
        <Card bordered={false}>
          <Sortable {...sortableProps}/>
        </Card>
      </PageHeaderLayout>
    );
  }
}
