import React, { PureComponent } from 'react';
import { Icon, Tooltip } from 'antd';
import _ from 'lodash';
import classNames from 'classnames';
import styles from './index.less';

export default class Stars extends PureComponent {
  static defaultProps = {
    step: 1,
    count: 5,
    viewValue: null,
    writable: false
  };

  constructor(props) {
    super(props);
    const { value } = props;
    this.state = { value };
  }

  onClick = i => () => {
    const value = i + 1;
    const { onChange } = this.props;
    this.setState({ value });
    if (_.isFunction(onChange)) {
      onChange(value);
    }
  };

  onMouseEnter = i => () => {
    const viewValue = i + 1;
    this.setState({ viewValue });
  };

  onMouseLeave = () => {
    this.setState({ viewValue: null });
  };

  render() {
    const { value = 0, viewValue = 0 } = this.state;
    const { count, className, writable } = this.props;
    return (
      <span className={classNames(className, styles.stars, writable ? null : 'no-events')} onMouseLeave={this.onMouseLeave}>
        {_.times(count).map((item, i) => {
          let star = value - 1;
          if (_.isNumber(viewValue)) {
            star = viewValue - 1;
          }
          const itemProps = {
            type: 'star',
            className: classNames(styles.star, star >= i ? styles.active : null),
            onClick: this.onClick(i),
            onMouseEnter: this.onMouseEnter(i)
          };
          return <Tooltip title={i + 1} key={i}><Icon {...itemProps}/></Tooltip>;
        })}
      </span>
    );
  }
}
