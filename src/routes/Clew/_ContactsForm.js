import React, { PureComponent } from 'react';
import { Table, Button, Input, Popconfirm, Divider, Row, Col, Modal, Form, Select, Switch, Icon } from 'antd';
import regExp from '../../utils/regexp';
import {
  contactFieldLabels,
  genderMap,
  linkTypeMap,
  renderOptions,
} from '../../utils/paramsMap'

const { Option } = Select;

const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const newContact = {
  linkType: '',
  linkName: '',
  sex: '',
  mobile: '',
  phone: '',
  position: '',
  department: '',
  qq: '',
  wechat: '',
  email: '',
}

@Form.create()
export default class ContactsForm extends PureComponent {
  constructor(props) {
    super(props);
    let data = [];
    if (props.value && Array.isArray(props.value)) {
      data = props.value.map((item, i) => ({ ...item, key: i }));
    }
    this.state = {
      data,
      modalVisible: false,
      currentContact: {},
    };
  }

  index = 0;

  componentWillReceiveProps(nextProps) {
    if ('value' in nextProps) {
      this.setState({
        data: nextProps.value.map((item, i) => ({ ...item, key: i })),
      });
    }
  }

  editContact = (action, record) => {
    if (action === 'add') {
      this.setState({
        modalVisible: true,
        currentContact: {
          isNew: true,
          key: `NEW_TEMP_ID_${this.index}`,
        }
      })
      this.index++
    } else {
      this.setState({
        currentContact: record,
        modalVisible: true,
      })
    }
  }
  onChange = (checked, record) => {
    record.status = ~~!checked;
    const newContacts = [...this.state.data];
    const targetIndex = newContacts.findIndex(item => item.key === record.key);
    newContacts[targetIndex] = { ...record };
    this.props.onChange(newContacts);
  }
  saveContact = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const newContacts = [...this.state.data];
        const contact = {
          ...this.state.currentContact,
          ...values,
        }
        if (contact.isNew) {
          delete contact.isNew;
          newContacts.push(contact);
        } else {
          const targetIndex = newContacts.findIndex(item => item.key === contact.key);
          newContacts[targetIndex] = { ...contact };
        }
        this.props.onChange(newContacts);
        this.setState({
          data: newContacts,
          modalVisible: false,
        })
      }
    });
  }
  hideModal = () => {
    this.setState({
      modalVisible: false,
    })
  }

  remove(key) {
    const newData = this.state.data.filter(item => item.key !== key);
    this.setState({ data: newData });
    this.props.onChange(newData);
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    const { currentContact } = this.state;
    const columns = [{
      title: '类型',
      dataIndex: 'linkType',
      render: val => linkTypeMap.get(val),
    }, {
      title: '性别',
      dataIndex: 'sex',
      render: val => genderMap.get(val),
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
      title: '操作',
      key: 'action',
      render: (text, record) => {
        if (record.editable) {
          if (record.isNew) {
            return (
              <span>
                <a>保存</a>
                <Divider type="vertical" />
                <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(record.key)}>
                  <a>删除</a>
                </Popconfirm>
              </span>
            );
          }
          return (
            <span>
              <a>保存</a>
              <Divider type="vertical" />
              <a onClick={e => this.cancel(e, record.key)}>取消</a>
            </span>
          );
        }
        return (
          <span>
            <a onClick={() => this.editContact('edit', record)}>编辑</a>
            <Divider type="vertical" />
            <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(record.key)}>
              <a>删除</a>
            </Popconfirm>
            <Divider type="vertical" />
            <Switch
              size="small"
              checkedChildren={<Icon type="check" />}
              unCheckedChildren={<Icon type="cross" />}
              defaultChecked={record.status != 1}
              onChange={(checked) => this.onChange(checked, record)}
            />
          </span>
        );
      },
    }];

    const hasContact = !!(this.state.data && this.state.data.length);
    return (
      <div>
        {hasContact && <Table
          columns={columns}
          dataSource={this.state.data}
          pagination={false}
          locale={{emptyText: '暂无联系人'}}
        />}
        <Button
          style={{ width: '100%', marginTop: 16, marginBottom: 8 }}
          type="dashed"
          onClick={() => this.editContact('add')}
          icon="plus"
        >
          添加联系人
        </Button>
        <Modal
          title="编辑联系人"
          visible={this.state.modalVisible}
          onOk={this.saveContact}
          onCancel={this.hideModal}
          okText="确认"
          cancelText="取消"
          destroyOnClose
        >
          <Form layout="horizontal">
            <Row gutter={16}>
              <Col md={10} sm={24}>
                <Form.Item {...formItemLayout} label={contactFieldLabels.linkType}>
                  {getFieldDecorator('linkType', {
                    initialValue: currentContact.linkType || undefined,
                  })(
                    <Select placeholder="联系人类型">
                      {renderOptions(linkTypeMap)}
                    </Select>
                  )}
                </Form.Item>
              </Col>

              <Col md={{ span: 10, offset: 2 }} sm={24}>
                <Form.Item {...formItemLayout} label={contactFieldLabels.position}>
                  {getFieldDecorator('position', {
                    initialValue: currentContact.position,
                  })(
                    <Input />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col md={{ span: 10 }} sm={24}>
                <Form.Item {...formItemLayout} label={contactFieldLabels.linkName}>
                  {getFieldDecorator('linkName', {
                    initialValue: currentContact.linkName,
                  })(
                    <Input />
                  )}
                </Form.Item>
              </Col>
              <Col md={{ span: 10, offset: 2 }} sm={24}>
                <Form.Item {...formItemLayout} label={contactFieldLabels.department}>
                  {getFieldDecorator('department', {
                    initialValue: currentContact.department,
                  })(
                    <Input />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col md={{ span: 10 }} sm={24}>
                <Form.Item {...formItemLayout} label={contactFieldLabels.sex}>
                  {getFieldDecorator('sex', {
                    initialValue: currentContact.sex || undefined,
                  })(
                    <Select placeholder="性别">
                      {renderOptions(genderMap)}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col md={{ span: 10, offset: 2 }} sm={24}>
                <Form.Item {...formItemLayout} label={contactFieldLabels.qq}>
                  {getFieldDecorator('qq', {
                    initialValue: currentContact.qq,
                    rules: [{ message: '正确格式的QQ号码', pattern: regExp.REG_QQ}],
                  })(
                    <Input />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col md={{ span: 10 }} sm={24}>
                <Form.Item {...formItemLayout} label={contactFieldLabels.mobile}>
                  {getFieldDecorator('mobile', {
                    initialValue: currentContact.mobile,
                    rules: [{ required: true, message: '正确格式的手机号', pattern: regExp.REG_MOBILE}],
                  })(
                    <Input />
                  )}
                </Form.Item>
              </Col>
              <Col md={{ span: 10, offset: 2 }} sm={24}>
                <Form.Item {...formItemLayout} label={contactFieldLabels.wechat}>
                  {getFieldDecorator('wechat', {
                    initialValue: currentContact.wechat,
                  })(
                    <Input />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col md={{ span: 10 }} sm={24}>
                <Form.Item {...formItemLayout} label={contactFieldLabels.phone}>
                  {getFieldDecorator('phone', {
                    initialValue: currentContact.phone,
                  })(
                    <Input />
                  )}
                </Form.Item>
              </Col>
              <Col md={{ span: 10, offset: 2 }} sm={24}>
                <Form.Item {...formItemLayout} label={contactFieldLabels.email}>
                  {getFieldDecorator('email', {
                    initialValue: currentContact.email,
                    rules: [{ message: '邮箱格式不正确', pattern: regExp.REG_EMAIL}],
                  })(
                    <Input />
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
      </div>
    );
  }
}
