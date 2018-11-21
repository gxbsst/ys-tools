import React, { PureComponent } from 'react';
import { Button, Divider, Popconfirm, Table, Tooltip, Switch, Icon } from 'antd';
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
    this.saveRow = this::this.saveRow;
  }

  componentWillReceiveProps(nextProps) {
    if ('value' in nextProps) {
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
  onChange = (checked, key) => {
    const newData = [...this.state.data];
    const targetIndex = newData.findIndex(item => item.key === key);
    newData[targetIndex] = { ...newData[targetIndex], status: ~~!checked };
    this.setState({ data: newData, showModal: false });
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
      {
        title: '类型',
        dataIndex: 'linkType',
        render: val => ({1: '主决策人', 2: '其他'})[val],
      }, {
        title: '姓名',
        dataIndex: 'linkName',
        render: (text, record) => {
          if (record.sex || record.position || record.part) {
            return (
              <Tooltip title={(
                <div>
                  {record.sex && <p>性别: {record.sex}</p>}
                  {record.position && <p>职位: {record.position}</p>}
                  {record.part && <p>部门: {record.part}</p>}
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
      }, {
        title: '手机',
        dataIndex: 'mobile',
        render: (text, record) => {
          if (record.mobile) {
            return (
              <Tooltip title={`电话: ${record.phone}`}>
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
      }, {
        title: '邮箱',
        dataIndex: 'email',
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
            <Divider type="vertical"/>
            <Switch
              size="small"
              checkedChildren={<Icon type="check" />}
              unCheckedChildren={<Icon type="cross" />}
              defaultChecked={record.status != 1}
              onChange={(checked) => this.onChange(checked, record.key)}
            />
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
        { this.state.showModal && <ContactModal item={this.state.currentSelect} onOK={this.saveRow} {...modalProps} /> }
      </div>
    );
  }
}

export class ContactsTable extends PureComponent {
  render() {
    const { dataSource } = this.props;

    const props = { ...this.props, dataSource: dataSource.map((item, i) => ({ ...item, key: i }))};
    const columns = [
      {
        title: '类型',
        dataIndex: 'linkType',
        key: 'linkType',
      }, {
        title: '姓名',
        dataIndex: 'linkName',
        key: 'linkName',
        render: (text, record) => {
          if (record.sex || record.position || record.part) {
            return (
              <Tooltip title={(
                <div>
                  {record.sex && <p>性别: {record.sex}</p>}
                  {record.position && <p>职位: {record.position}</p>}
                  {record.part && <p>部门: {record.part}</p>}
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
        dataIndex: 'phone',
        key: 'phone',
        render: (text, record) => {
          if (record.phone2) {
            return (
              <Tooltip title={`电话2: ${record.mobile}`}>
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
    return <Table {...props} columns={columns} />;
  }
}
