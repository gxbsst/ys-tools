import React, { PureComponent } from 'react';
import { Input, Card, Table, Tag } from 'antd';
import moment from 'moment';
import classNames from 'classnames';
import { autodata } from '../../decorators';
import { QuarterPicker, YearPicker, MonthPicker } from '../../components';
import { Select } from '../../components/Helpers';
import styles from './Workplace.less';

const disabledDate = current => current && current > moment().startOf('day');
const bodyStyle = { padding: 0 };
const rankTypes = [
  { value: 1, label: '月份' },
  { value: 2, label: '季度' },
  { value: 3, label: '年份' },
];

@autodata({
  url: '/api/rank',
  query: { pageSize: 50 },
  autoCreateForm: true,
  mergeQueryFromLocation: false,
})
export default class Rank extends PureComponent {
  columns = [
    {
      title: '排名', dataIndex: 'sort', width: 60, key: 'sort', render(value, record, index) {
        const sort = index + 1;
        if (sort < 4) {
          return <Tag color={['red', 'volcano', 'orange'][index]}>{sort}</Tag>;
        }
        return <strong className={styles.number}>{sort}</strong>;
      }
    },
    { title: '姓名', dataIndex: 'name', width: '25%', key: 'name' },
    { title: '区域', dataIndex: 'area', key: 'area' },
    { title: '业绩', dataIndex: 'achievement', width: '25%', key: 'achievement' },
  ];

  render() {
    const { columns } = this;
    const { $data: { form: { getFieldDecorator, getFieldsValue }, onSearch, data: dataSource, starting, loading } } = this.props;
    const { type } = getFieldsValue();
    const pickerProps = {
      allowClear: false,
      className: styles.picker,
      onChange: onSearch,
      disabledDate,
    };
    let picker = null;
    switch (type) {
      case 2:
        picker = <QuarterPicker {...pickerProps}/>;
        break;
      case 3:
        picker = <YearPicker {...pickerProps}/>;
        break;
      default:
        picker = <MonthPicker {...pickerProps}/>;
        break;
    }
    const rankExtra = (
      <Input.Group className={styles.inputGroup} compact>
        {getFieldDecorator('type', { initialValue: 1 })(<Select options={rankTypes} onChange={onSearch}/>)}
        {getFieldDecorator('sign', { initialValue: moment().add(-1, 'months') })(picker)}
      </Input.Group>
    );
    const cardProps = {
      title: '龙虎榜',
      className: styles.card,
      bordered: false,
      extra: rankExtra,
      loading: starting,
      bodyStyle,
    };
    const tableProps = {
      rowKey: 'id',
      className: classNames('table-fixed', styles.rank),
      bordered: false,
      pagination: false,
      size: 'small',
      scroll: { y: 224 },
      columns,
      loading,
      dataSource,
    };
    return (
      <Card {...cardProps}>
        <Table {...tableProps}/>
      </Card>
    );
  }
}
