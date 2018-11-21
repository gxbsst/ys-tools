/* eslint-disable max-len,no-param-reassign */
import React, { PureComponent } from 'react';
import { Button, Divider, Popconfirm, Table } from 'antd';
import styles from './style.less';
import { ContactsTable } from './ContactsForm';
import ChainStoreModal from './ChainStoreModal';

const contactsColumns = [
  {
    title: '类型',
    dataIndex: 'linkType',
    render: val => ({1: '主决策人', 2: '其他'})[val],
  }, {
    title: '性别',
    dataIndex: 'sex',
    render: val => ({1: '男', 2: '女'})[val],
  }, {
    title: '职务',
    dataIndex: 'position',
  }, {
    title: '姓名',
    dataIndex: 'linkName',
  }, {
    title: '部门',
    dataIndex: 'department',
  }, {
    title: 'qq',
    dataIndex: 'qq',
  }, {
    title: '手机',
    dataIndex: 'mobile',
  }, {
    title: '电话',
    dataIndex: 'phone',
  }, {
    title: '微信',
    dataIndex: 'wechat',
  }, {
    title: '邮箱',
    dataIndex: 'email',
  }, {
    title: '状态',
    dataIndex: 'status',
    render: val => !val ? '有效' : '无效',
  },
];

const emptyContactItem = {
  status: '',
  storeName: '',
  area: '',
  address: '',
  remarks: '',
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
    this.saveRow = this::this.saveRow;
  }

  componentWillReceiveProps(nextProps) {
    if ('value' in nextProps && nextProps.value) {
      this.setState({
        data: nextProps.value.map((item, i) => ({ ...item, key: i })),
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
    const columns = [{
      title: '门店名',
      dataIndex: 'storeName',
      key: 'storeName',
    }, {
      title: '经营状态',
      dataIndex: 'status',
    }, {
      title: '地区',
      dataIndex: 'area',
      key: 'area',
    }, {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
    }, {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
    }, {
      title: '操作',
      key: 'action',
      render: (text, record) => {
        return (
          <span>
            <a onClick={() => this.showModal('edit', record)}>编辑</a>
            <Divider type="vertical" />
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
          expandedRowRender={record =>
            (<Table
              columns={contactsColumns}
              dataSource={record.contacts || []}
              size="small"
              pagination={false}
              title={() => '联系人信息'}
              rowKey="id"
            />)
            // <ContactsTable dataSource={record.contacts} pagination={false} size="small" title={() => '联系人信息'} />
          }
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
          添加门店
        </Button>
        { this.state.showModal && <ChainStoreModal item={this.state.currentSelect} onOK={this.saveRow} {...modalProps} /> }
      </div>
    );
  }
}
