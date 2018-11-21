import React, { PureComponent } from 'react';
import { Cascader, message } from 'antd';
import { request } from '../../utils';
import { formatFromSource } from '../../utils/dataTransfer';

export default class FromSource extends PureComponent {
  state = {
    options: [],
  };
  async getData() {
    const res = await this.fetch();
    if (!res.code) {
      this.setState({options: formatFromSource(res.data)});
    } else {
      message.error(res.message);
    }
  }
  fetch = () => {
    return request('/api/basic/fromSources');
  }
  async componentDidMount() {
    await this.getData();
  }

  render() {
    return <Cascader {...this.props} options={this.state.options} />
  }
}
