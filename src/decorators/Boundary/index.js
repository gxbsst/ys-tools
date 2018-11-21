import React, { PureComponent, Fragment } from 'react';
import { notification } from 'antd';

export default WrappedComponent => class Boundary extends PureComponent {
  state = {
    hasError: false,
  };

  componentDidCatch(error, info) {
    this.setState({ hasError: true });
    const className = WrappedComponent.toString().match(/function\s*([^(]*)\(/)[1];
    const description = (
      <Fragment>
        <strong>&lt;{className}&gt; </strong>
        组件发生未知错误，请进行代码检查
      </Fragment>
    );
    notification.error({
      duration: null,
      message: '组件异常',
      description,
    });
  }

  render() {
    return this.state.hasError ? null : <WrappedComponent {...this.props}/>;
  }
}
