import React, { PureComponent } from 'react';
import { Modal, Form, Select, message } from 'antd';
import { StaffFinder } from '../../../components';
import { CustomerService } from '../../../components/Selectors';
import { request } from '../../../utils';

const { Option } = Select;

@Form.create()
export default class ClewAssignModal extends PureComponent {
  state = {
    customers: [],
    username: '',
    name: '',
  }

  async getData() {
    const res = await this.fetch();
    if (!res.code) {
      this.setState({customers: res.data || []});
    } else {
      message.error(res.message);
    }
  }
  fetch = () => {
    return request('/api/personnel/employee/subordinate');
  }
  async componentDidMount() {
    await this.getData();
  }
  onChange = (id, {username, name} = {}) => { this.setState({ username, name }) }
  render() {
    const {
      form: {
        getFieldDecorator, validateFields,
      }, onOk, ...receiveProps } = this.props;

    const handleOk = () => {
      validateFields((err, values) => {
        if (!err) {
          // const {key: handlerNo, label: handlerName} = values.member;
          // onOk({handlerNo, handlerName});
          const {username, name} = this.state;
          onOk({handlerNo: username, handlerName: name});
        }
      });
    };


    const selfProps = {
      ...receiveProps,
      onOk: handleOk,
    }
    return (
      <Modal
        {...selfProps}
        title="选择分配人员"
        width="350px"
      >
        <Form layout="horizontal">
          <Form.Item>
            {getFieldDecorator('member', {
              rules: [{ required: true, message: '请选择分配人员' }],
            })(
              // <CustomerService labelInValue placeholder="搜索人员" />
              <StaffFinder onChange={this.onChange} />
              // <Select
              //   labelInValue
              //   showSearch
              //   style={{ width: 200 }}
              //   placeholder="搜索人员"
              //   optionFilterProp="children"
              //   onChange={this.handleChange}
              //   filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
              // >
              //   {this.state.customers.map(item => <Option key={item.id} value={item.id}>{item.linkName}</Option>)}
              // </Select>
            )}
          </Form.Item>
        </Form>
      </Modal>
    )
  }
}
