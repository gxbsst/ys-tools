import React, { PureComponent } from 'react';
import { DatePicker } from 'antd';
import classNames from 'classnames';
import styles from './index.less';

const { MonthPicker } = DatePicker;
const getCalendarContainer = trigger => trigger;

export default class QuarterPicker extends PureComponent {
  static defaultProps = {
    format: 'YYYY-Q',
  };

  render() {
    const { className, ...restProps } = this.props;
    const props = {
      ...restProps,
      className: classNames(styles.quarterPicker, className),
      getCalendarContainer,
    };
    return (
      <MonthPicker {...props}/>
    );
  }
}
