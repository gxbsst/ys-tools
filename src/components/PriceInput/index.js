import { Form, Input, Select, Button } from 'antd';
import React, { Component } from 'react';
import PriceNumber from './Number';
const FormItem = Form.Item;
const Option = Select.Option;

export default class PriceInput extends Component {
  constructor(props) {
    super(props);

    const value = this.props.value || {};
    this.state = {
      number: value.number || 0,
      currency: value.currency || 'rmb',
    };
  }
  componentWillReceiveProps(nextProps) {
    // Should be a controlled component.
    if ('value' in nextProps) {
      const value = nextProps.value;
      this.setState(value);
    }
  }
  handleNumberChange = (e) => {
    // const number = parseInt(e.target.value || 0, 10);
    // if (isNaN(number)) {
    //   return;
    // }
    const number = e.target.value;
    // console.info(number)
    if (!('value' in this.props)) {
      this.setState({ number });
    }
    this.triggerChange({ number });
  }
  handleCurrencyChange = (currency) => {
    if (!('value' in this.props)) {
      this.setState({ currency });
    }
    this.triggerChange({ currency });
  }
  triggerChange = (changedValue) => {
    // Should provide an event to pass value to Form.
    const onChange = this.props.onChange;
    if (onChange) {
      onChange(Object.assign({}, this.state, changedValue));
    }
  }
  render() {
    const { size, disabled } = this.props;
    const state = this.state;
    return (
      <span>
        <Input
          type="number"
          size={size}
          disabled={ disabled }
          value={state.number}
          onChange={this.handleNumberChange}
          style={{ width: '65%', marginRight: '3%' }}
        />
        <Select
          value={state.currency}
          size={size}
          disabled={ disabled }
          style={{ width: '32%' }}
          onChange={this.handleCurrencyChange}
        >
          <Option value="rmb">RMB</Option>
          {/*<Option value="dollar">Dollar</Option>*/}
        </Select>
      </span>
    );
  }
}
PriceInput.Number = PriceNumber;
