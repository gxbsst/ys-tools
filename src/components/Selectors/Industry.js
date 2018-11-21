import React, { PureComponent } from 'react';
import { Cascader, message } from 'antd';
import { request } from '../../utils';
import { formatIndustry } from '../../utils/dataTransfer';

export default class Industry extends PureComponent {
  state = {
    data: [],
    options: [],
    value: [],
  };
  componentWillReceiveProps(nextProps) {
    if ('value' in nextProps) {
      const { value } = nextProps;
      const { data } = this.state;
      if (value && value.length && data.length > 0) {
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
        options: formatIndustry(res.data || []),
        value: value ? Array.isArray(value) && value.length > 1 ? value : [res.data.find(i => i.id == value).parentId, value] : [],
      });
      if (value) {
        this.props.onChange(this.state.value);
      }
    } else {
      message.error(res.message);
    }
  }
  fetch = () => {
    return request('/api/basic/0/industry');
  }
  componentDidMount() {
    this.getData();
  }

  loadData = (selectedOptions) => {    
    const targetOption = selectedOptions[selectedOptions.length - 1];
    targetOption.loading = true;
    request(`/api/basic/${targetOption.key}/industry`).then((res) => {
      if (!res.code) {
        targetOption.children = formatIndustry(res.data);
        this.setState({
          options: [...this.state.options],
        });
      } else {
        message.error(res.message);
      }
    }).catch(e => {
      message.error(e.message);
    }).finally(() => {
      targetOption.loading = false;
    })
  }

  render() {
    const { value, ...restProps } = this.props;
    const { data, ...restState } = this.state;
    return (
      <Cascader
        loadData={this.loadData}
        {...restProps}
        {...restState}
      />
    )
  }
}
