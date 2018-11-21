import React, { PureComponent } from 'react';
import { Select, message } from 'antd';
import { request } from '../../utils';

const { Option } = Select;

export default class CustomerService extends PureComponent {
  state = {
    options: [],
  };
  async getData() {
    const res = await this.fetch();
    if (!res.code) {
      this.setState({options: res.data || []});
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

  render() {
    return (
      <Select {...this.props} >
        {this.state.options.map(i => <Option key={i.id} value={i.username}>{i.name}</Option>)}
      </Select>
    )
  }
}
