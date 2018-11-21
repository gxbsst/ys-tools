import React, { PureComponent } from 'react';
import _ from 'lodash';

export default (merge = true) => WrappedComponent => class WithSetProps extends PureComponent {
  state = {};

  setProps = props => {
    const { state } = this;
    this.setState(merge ? _.merge({}, state, props) : { ...state, ...props });
  };

  forceUpdateProps = () => {
    this.forceUpdate();
  };

  render() {
    const { setProps, forceUpdateProps, props, state } = this;
    const methods = { setProps, forceUpdateProps };
    const mergeStateToProps = merge ? _.merge({}, props, state, methods) : { ...props, ...state, ...methods };
    return <WrappedComponent {...mergeStateToProps}/>;
  }
}
