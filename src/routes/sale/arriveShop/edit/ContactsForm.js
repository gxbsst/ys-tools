/* eslint-disable no-param-reassign */
import React, { PureComponent } from 'react';
import _ from 'lodash';
import { Button, Divider, Popconfirm, Table, Tooltip, message } from 'antd';
import styles from './style.less';
import ContactModal from './ContactModal';

const emptyContactItem = {
  linkType: '',
  linkName: '',
  sex: '',
  position: '',
  department: '',
  qq: '',
  phone: '',
  mobile: '',
  email: '',
  wechat: '',
};

export default class Contacts extends PureComponent {
  constructor(props) {
    super(props);
    let data = [];
    if (props.value && Array.isArray(props.value)) {
      data = props.value.map((item, i) => ({ ...item, key: i }));
    }
    this.state = {
      data,
      showModal: false,
      currentSelect: null,
    };
    this.index = 0;
  }

  componentWillReceiveProps(nextProps) {
    if ('value' in nextProps) {
      const data = nextProps.value.map((item, i) => ({ ...item, key: i }));
      this.setState({
        data,
      });
    }
  }

  getRowByKey(key) {
    return this.state.data.filter(item => item.key === key)[0];
  }

  remove(key) {
    const newData = this.state.data.filter(item => item.key !== key);
    this.setState({ data: newData });
    this.props.onChange(newData);
  }

  saveRow(data) {
    const newData = [...this.state.data];
    if (_.find(newData.filter(item => item.key !== data.key), { phone: data.phone })) { // 已存在电话
      return message.error('同一条机会中应不可添加两条电话重复联系人!');
    }
    if (data.isNew) { //新增
      delete data.isNew;
      newData.push(data);
    } else { // 编辑
      const targetIndex = newData.findIndex(item => item.key === data.key);
      newData[targetIndex] = { ...data };
    }
    this.setState({ data: newData, showModal: false });
    this.props.onChange(newData);
  }

  showModal(type, data) {
    switch (type) {
      case 'new':
        this.setState({ showModal: true, currentSelect: { ...emptyContactItem, isNew: true, key: `NEW_TEMP_ID_${this.index}` } });
        this.index += 1;
        return;
      case 'edit':
        this.setState({ showModal: true, currentSelect: { ...data } });
        return;
      default:
        this.setState({ showModal: true, currentSelect: { ...emptyContactItem, isNew: true, key: `NEW_TEMP_ID_${this.index}` } });
        this.index += 1;
    }
  }

  render() {
    const columns = [
      {
        title: '类型',
        dataIndex: 'linkType',
        key: 'linkType',
        render: (text) => text == 1 ? '主决策人' : '其他',
      }, {
        title: '姓名',
        dataIndex: 'linkName',
        key: 'linkName',
        render: (text, record) => {
          if (record.sex || record.position || record.department) {
            return (
              <Tooltip title={(
                <div>
                  {record.sex && <p>性别: {record.sex === 1 ? '男' : '女'}</p>}
                  {record.position && <p>职位: {record.position}</p>}
                  {record.department && <p>部门: {record.department}</p>}
                </div>
              )}>
                <span>{text}</span>
              </Tooltip>
            );
          } else {
            return <span>{text}</span>;
          }
        },
      }, {
        title: 'qq',
        dataIndex: 'qq',
        key: 'qq',
      }, {
        title: '电话1',
        dataIndex: 'mobile',
        key: 'mobile',
        render: (text, record) => {
          if (record.phone) {
            return (
              <Tooltip title={`电话2: ${record.phone}`}>
                <span>{text}</span>
              </Tooltip>
            );
          } else {
            return <span>{text}</span>;
          }
        },
      }, {
        title: '微信',
        dataIndex: 'wechat',
        key: 'wechat',
      }, {
        title: '邮箱',
        dataIndex: 'email',
        key: 'email',
      }, {
        title: '操作',
        key: 'action',
        render: (text, record) => {
          return (
            <span>
            <a onClick={() => this.showModal('edit', record)}>编辑</a>
            <Divider type="vertical"/>
            <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(record.key)}>
              <a>删除</a>
            </Popconfirm>
          </span>
          );
        },
      }
    ];
    const modalProps = {
      visible: true,
      title: this.state.currentSelect && this.state.currentSelect.isNew ? '新增联系人' : '编辑联系人',
      onCancel: () => this.setState({ showModal: false }),
    }
    return (
      <div>
        <Table
          columns={columns}
          dataSource={this.state.data}
          pagination={false}
          rowKey={record => `${record.key}`}
          {...this.props.extraTableProps}
        />
        <Button
          style={{width: '100%', marginTop: 16, marginBottom: 8}}
          type="dashed"
          onClick={() => this.showModal('new')}
          icon="plus"
        >
          新增成员
        </Button>
        { this.state.showModal && <ContactModal item={this.state.currentSelect} onOK={this.saveRow.bind(this)} {...modalProps} /> }
      </div>
    );
  }
}
export class ContactsTable extends PureComponent {
  render() {
    const columns = [
      {
        title: '类型',
        dataIndex: 'linkType',
        key: 'linkType',
        render: (text) => text == 1 ? '主决策人' : '其他',
      }, {
        title: '姓名',
        dataIndex: 'linkName',
        key: 'linkName',
        render: (text, record) => {
          if (record.sex || record.position || record.department) {
            return (
              <Tooltip title={(
                <div>
                  {record.sex && <p>性别: {record.sex === 1 ? '男' : '女'}</p>}
                  {record.position && <p>职位: {record.position}</p>}
                  {record.department && <p>部门: {record.department}</p>}
                </div>
              )}>
                <span>{text}</span>
              </Tooltip>
            );
          } else {
            return <span>{text}</span>;
          }
        },
      }, {
        title: 'qq',
        dataIndex: 'qq',
        key: 'qq',
      }, {
        title: '电话1',
        dataIndex: 'mobile',
        key: 'mobile',
        render: (text, record) => {
          if (record.phone) {
            return (
              <Tooltip title={`电话2: ${record.phone}`}>
                <span>{text}</span>
              </Tooltip>
            );
          } else {
            return <span>{text}</span>;
          }
        },
      }, {
        title: '微信',
        dataIndex: 'wechat',
        key: 'wechat',
      }, {
        title: '邮箱',
        dataIndex: 'email',
        key: 'email',
      },
    ];
    return <Table {...this.props} columns={columns} />;
  }
}
