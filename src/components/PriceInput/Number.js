import { Form, Input, Select, Button } from 'antd';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
const FormItem = Form.Item;

export default class InputNumber extends Component {
  static propTypes = {
    inputType: PropTypes.string,
  }
  constructor(props) {
    super(props);
    this.state = {
      number: props.value || 0,
      inputType: props.inputType || 'int',
    };
  }
  componentWillReceiveProps(nextProps) {
    // Should be a controlled component.
    if ('value' in nextProps) {
      const value = nextProps.value;
      this.setState({
        number: value,
      });
    }
  }
  getParser(type) {
    switch (type) {
      case 'int': return parseInt;
      case 'double': return (val) => val;
      default: return parseInt;
    }
  }
  handleNumberChange = (e) => {
    let number = null;
    const { inputType } = this.state;
    if (!e.target.value) {
      number = 0;
    } else  {
      number = this.getParser(this.state.inputType)(e.target.value);
    }
    if (inputType === 'int' && isNaN(number)) {
      return;
    }
    this.setState({ number }, () => this.triggerChange(number));
  }
  triggerChange = (changedValue) => {
    // Should provide an event to pass value to Form.
    const onChange = this.props.onChange;
    // console.info(Number(changedValue))
    if (onChange) {
      onChange(changedValue);
    }
  }
  render() {
    const { size, disabled, inputType, ...others } = this.props;
    const state = this.state;
    return (
      <span>
        <Input
          {...others}
          type={state.inputType === 'int' ? 'text' : 'number'}
          size={size}
          disabled={ disabled }
          value={state.number}
          onChange={this.handleNumberChange}
        />
      </span>
    );
  }
}
