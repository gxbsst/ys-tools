import React, { PureComponent } from 'react';
import { Cascader, message } from 'antd';
import { request } from '../../utils';
import { tree } from '../../utils/dataTransfer';

export default class ProductSeries extends PureComponent {
  state = {
    data: [],
    options: [],
    value: [],
  };
  componentWillReceiveProps(nextProps) {
    if ('value' in nextProps) {
      const {value} = nextProps;
      const { data } = this.state;
      if (value && data.length > 0) {
        this.setState({
          value: value ? Array.isArray(value) && value.length > 1 ? value : [data.find(i => i.id == value).parentId, value] : [],
        });
      }
    }
  }
  async getData() {
    const res = await this.fetch();
    const { value } = this.props;
    if (!res.code) {
      await this.setState({
        data: res.data,
        options: tree((res.data || []).map(i => ({ ...i, key: i.id, value: i.id, label: i.name}))),
        value: value ? Array.isArray(value) && value.length > 1 ? value : [res.data.find(i => i.id == value).parentId, value] : [],
      });
      // if (value) {
      //   this.props.onChange(value);
      // }
    } else {
      message.error(res.message);
    }
  }
  fetch = () => {
    return request('/api/product/series');
  }
  componentDidMount() {
    this.getData();
  }
  onChange = (value, options) => {
    this.setState({ value });
    this.props.onChange(
      value && (value.length ? value[value.length - 1] : undefined),
      options[1],
      value,
      options,
    );
  };
  render() {
    const { value, ...restProps } = this.props;
    const { data, ...restState } = this.state;
    return <Cascader {...restProps} {...restState} onChange={this.onChange} />
  }
}
