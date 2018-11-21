import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import { Icon } from 'antd';

@connect(({ callCenter }) => ({ callCenter }))
export default class Call extends PureComponent {
  static defaultProps = {
    readyOnly: false,
  };

  static propTypes = {
    readyOnly: PropTypes.bool,
  };

  call = () => {
    const { callCenter: { call }, children, tel = children } = this.props;
    call(tel);
  };

  render() {
    const { callCenter: { isReady }, children, tel = children, dispatch, readyOnly, ...restProps } = this.props;
    if (isReady && tel) {
      const content = children ? <span className="icon-after-text">{children}</span> : null;
      return <a onClick={this.call} {...restProps}><Icon type="phone"/>{content}</a>;
    } else {
      if (readyOnly) return null;
    }
    return <span {...restProps}>{children}</span>;
  }
}
