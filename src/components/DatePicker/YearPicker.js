import React, { PureComponent } from 'react';
import { DatePicker } from 'antd';

export default class YearPicker extends PureComponent {
  static defaultProps = {
    format: 'YYYY',
  };

  render() {
    const { ...restProps } = this.props;
    const props = {
      mode: 'year',
      ...restProps,
      onPanelChange(value) {
        this.onSelect(value);
      },
    };
    return (
      <DatePicker {...props}/>
    );
  }
}
