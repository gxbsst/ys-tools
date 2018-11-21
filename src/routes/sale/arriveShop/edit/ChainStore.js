/* eslint-disable max-len,no-param-reassign */
import React, { PureComponent } from 'react';
import { Button, Divider, Popconfirm, Table } from 'antd';
import styles from './style.less';
import { ContactsTable } from './ContactsForm';
import ChainStoreModal from './ChainStoreModal';
import { chainStoreColumns } from '../tableColumns';

const emptyContactItem = {
  status: '',
  storeName: '',
  areaCode: '',
  address: '',
  remark: '',
  contacts: [],
};

export default class ChainStore extends PureComponent {
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
    if (data.isNew) {
      delete data.isNew;
      newData.push(data);
    } else {
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
      ...chainStoreColumns,
      {
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
      }];
    const modalProps = {
      visible: true,
      title: this.state.currentSelect && this.state.currentSelect.isNew ? '新增门店' : '编辑门店',
      onCancel: () => this.setState({ showModal: false }),
      width: 700,
    };
    return (
      <div>
        <Table
          columns={columns}
          dataSource={this.state.data}
          pagination={false}
          rowKey={record => `${record.key}`}
          expandedRowRender={record => (
            <ContactsTable
              dataSource={record.contacts}
              pagination={false}
              size="small"
              rowKey={_ => `${_.id}`}
              title={() => '联系人信息'}
            />)}
          rowClassName={(record) => {
            return record.editable ? styles.editable : '';
          }}
        />
        <Button
          style={{ width: '100%', marginTop: 16, marginBottom: 8 }}
          type="dashed"
          onClick={() => this.showModal('new')}
          icon="plus"
        >
          新增门店
        </Button>
        { this.state.showModal && <ChainStoreModal item={this.state.currentSelect} onOK={this.saveRow.bind(this)} {...modalProps} /> }
      </div>
    );
  }
}
