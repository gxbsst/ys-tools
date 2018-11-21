import React, { PureComponent } from 'react';
import { Card, Button, Input } from 'antd';
import _ from 'lodash';
import qs from 'qs';
import moment from 'moment';
import { autodata } from '../../decorators';
import { Sortable, QuarterPicker, YearPicker, MonthPicker } from '../../components';
import { Select, Action } from '../../components/Helpers';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import { request, replace, valueFormatter } from '../../utils';
import styles from './Rank.less';

const rankFields = ['id', 'name', 'area', 'achievement'];
const rankTypes = [
  { value: 1, label: '月份' },
  { value: 2, label: '季度' },
  { value: 3, label: '年份' },
];
const disabledDate = current => current && current > moment().startOf('day');

@autodata({
  namespace: 'portal',
  url: '/api/portal',
  mergeQueryFromLocation: false,
  mergeQueryFromSearcher: false,
})
@autodata({
    url: '/api/rank',
    query: { pageSize: 50 },
  },
  {
    autoSubmit: true,
    fields: [
      {
        label: '榜单时段',
        colspan: 2,
        wrapperClassName: styles.datePicker,
        render() {
          const { location, form: { getFieldDecorator, getFieldsValue } } = this.props;
          const { type } = getFieldsValue();
          const query = qs.parse(location.search.substr(1));
          const format = { 1: 'YYYY-MM', 2: 'YYYY-Q', 3: 'YYYY' }[~~(query.type || type)];
          const pickerProps = {
            onChange: this.onSearch,
            disabledDate
          };
          let picker = <span/>;
          switch (type) {
            case 1:
              picker = <MonthPicker {...pickerProps}/>;
              break;
            case 2:
              picker = <QuarterPicker {...pickerProps}/>;
              break;
            case 3:
              picker = <YearPicker {...pickerProps}/>;
              break;
          }
          return (
            <Input.Group compact>
              {getFieldDecorator('type', { initialValue: query.type ? ~~query.type : 1 })(<Select options={rankTypes} onChange={this.onSearch}/>)}
              {getFieldDecorator('sign', { initialValue: moment(query.sign || moment().add(-1, 'months'), format) })(picker)}
            </Input.Group>
          );
        }
      }
    ]
  })
export default class Rank extends PureComponent {
  constructor(props) {
    super(props);
    this.columns = [
      { title: '姓名', dataIndex: 'name', width: 180, render: this.getField('name', '请输入人员姓名', { maxLength: 10 }) },
      { title: '区域', dataIndex: 'area', render: this.getField('area', '请输入所在区域', { maxLength: 40 }) },
      { title: '业绩', dataIndex: 'achievement', width: 200, render: this.getField('achievement', '请输入人员业绩', { maxLength: 8, formatter: /\d+/g }) },
      { title: '操作', key: 'action', width: 120, render: this.getAction },
    ];
  }

  onFieldChange = (inputName, { id }, { formatter }) => value => {
    const { $data: { setData, data = [] } } = this.props;
    const record = _.find(data, { id });
    record[inputName] = valueFormatter(_.get(value, 'target.value', value), formatter);
    const { name, area, achievement } = record;
    record.disabled = !name || !area || !achievement;
    setData({ data: [].concat(data) });
  };

  getField = (name, placeholder, props) => (value, record) => {
    const { editable } = record;
    if (editable) {
      const inputProps = {
        ...props,
        className: styles.input,
        onPressEnter: this.save(record),
        onChange: this.onFieldChange(name, record, props),
        value,
        placeholder,
      };
      return <Input {...inputProps}/>;
    }
    return value;
  };

  getAction = (value, record) => {
    const { $data: { loading } } = this.props;
    const { editable, disabled, isNew } = record;
    if (editable && loading) {
      return null;
    }
    let actions = [
      { onClick: this.edit(record) },
      { type: 'confirm', onClick: this.delete(record) },
    ];
    if (editable) {
      actions = [
        { text: isNew ? '添加' : '保存', onClick: this.save(record), disabled },
        { text: '取消', onClick: this.cancel(record) },
      ];
    }
    return <Action items={actions}/>;
  };

  setStatus = ({ id, status }) => async () => {
    await request(`/api/portal/${id}`, { method: 'PUT', body: { status: status ? 0 : 1 } });
    this.props.portal.reload();
  };

  create = () => {
    const { $data: { setData, data = [] } } = this.props;
    data.push({
      ..._.zipObject(rankFields),
      id: +new Date(),
      editable: true,
      isNew: true
    });
    setData({ data: [].concat(data) });
  };

  edit = record => () => {
    const { $data: { setData, data: records = [] } } = this.props;
    const { id, name, area, achievement } = record;
    setData({ data: [].concat(replace(records, { id }, { ...record, stash: { id, name, area, achievement }, editable: true })) });
  };

  cancel = record => () => {
    const { $data: { setData, data = [] } } = this.props;
    const { id, stash, isNew } = record;
    if (isNew) {
      setData({ data: _.reject(data, { id }) });
    } else {
      setData({ data: [].concat(replace(data, { id }, { ...stash })) });
    }
  };

  save = (record) => async () => {
    const { $data: { setData, data = [], getValues } } = this.props;
    const { name, area, achievement } = record;
    if (name || area || achievement) {
      setData({ loading: true });
      const { id, isNew } = record;
      record = { ...getValues(), ..._.pick(record, rankFields) };
      try {
        let response;
        if (isNew) {
          record = _.omit(record, ['id']);
          response = await request('/api/rank', { method: 'POST', body: record });
        } else {
          response = await request(`/api/rank/${id}`, { method: 'PUT', body: record });
        }
        setData({ data: replace(data, { id }, response.data), loading: false });
      } catch (e) {
        setData({ loading: false });
      }
    }
  };

  delete = ({ id }) => async () => {
    await request(`/api/rank/${id}`, { method: 'DELETE' });
    this.props.$data.reload();
  };

  onSorted = async (records) => {
    const { $data: { setData } } = this.props;
    setData({ data: records });
    await request('/api/rank/sort', {
      method: 'PUT',
      body: records.map(({ id }, sort) => ({ id, sort }))
    });
  };

  render() {
    const { columns, onSorted } = this;
    const { $data: { searcher, data: dataSource = [], loading }, portal: { data: portals, loading: syncing } } = this.props;
    const portal = _.find(portals, { name: 'rank' });
    const action = portal ? <Button type={portal.status ? 'danger' : 'primary'} onClick={this.setStatus(portal)} loading={syncing} ghost>{portal.status ? '停用' : '启用'}</Button> : null;
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
          {searcher}
          <Sortable {...sortableProps}/>
          <Button style={{ width: '100%', marginTop: 16, marginBottom: 8 }} type="dashed" onClick={this.create} icon="plus" disabled={dataSource.length >= 20}>新增人员</Button>
        </Card>
      </PageHeaderLayout>
    );
  }
}
