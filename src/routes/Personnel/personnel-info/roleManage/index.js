import React, {PureComponent} from "react";
import {Modal, Button, Tag, Popover, Select, Form, message} from 'antd';
import styles from '../index.less'
import request from '../../../../utils/request';

const Option = Select.Option;
@Form.create()
export default class RoleManage extends PureComponent {
  handleOk = () => {
    const {props: {form: {validateFields}, username, onCancel, form}} = this;
    validateFields(async (errors, fieldsValue) => {
      if (errors) {
        return;
      }
      const {message: msg, code} = await request(`/api/role/employee/${username}/fix`, {
        method: 'POST',
        body: fieldsValue.roleId.map(id => ~~id),
      })
      if (code === 0) {
        message.success(msg)
      } else {
        message.error(msg)
      }
      form.resetFields();
      onCancel()
    });
  }
  handleCancel = () => {
    const {props: {form, onCancel}} = this;
    form.resetFields();
    onCancel()
  }
  render() {
    let {visible, title, onCancel, employeeRole, roleList, form: {getFieldDecorator}} = this.props;
    let children = roleList.map(item => (<Option key={item.id}>{item.name}</Option>));
    const role = employeeRole.filter(item => (!item.isMaster));
    const isMaster = employeeRole.filter(item => (item.isMaster));
    const defaut = role.map(item => (item.id + ''));
    return (
      <Modal
        visible={visible}
        title={title}
        onCancel={this.handleCancel}
        onOk={this.handleOk}
        width={500}
      >
        {
          isMaster.length ? (<div className={styles.tag}>
            <span className={styles.title}>isMaster:</span>
            {isMaster.map(item => (<Tag key={item.id}>{item.name}</Tag>))}
          </div>) : ''
        }
        <Form layout="inline">
          <Form.Item>
            {getFieldDecorator('roleId', {
              initialValue: defaut,
            })(
              <Select
                mode="tags"
                style={{width: 400, marginLeft: 25}}
                onChange={(...args) => console.log(args)}
                placeholder="请查找角色"
              >
                {children}
              </Select>
            )}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}
