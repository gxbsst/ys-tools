import React, { PureComponent, isValidElement } from 'react';
import { connect } from 'dva';
import _ from 'lodash';
import Exception from '../../components/Exception';
import { contain } from '../../utils';

@connect(({ user: { currentUser: { username }, permissions } }) => ({ username, permissions }))
export default (...args) => {
  const includes = _.find(args, _.isBoolean);
  const exception = _.some(args, _.isNull) ? null : (_.find(args, isValidElement) || <Exception type="403"/>);
  return WrappedComponent => class Can extends PureComponent {
    can = (...args) => {
      args = _.flattenDeep(args);
      const needs = _.filter(args, _.isNumber);
      const users = _.filter(args, _.isString);
      const { username, permissions } = this.props;
      if (_.isEmpty(users) || _.includes(users, username)) {
        if (_.isEmpty(needs)) return true;
        for (let item of needs.map(item => ~~item)) {
          if (contain(permissions, item)) return true;
        }
      }
      return false;
    };

    render() {
      const { can } = this;
      const { permissions, ...restProps } = this.props;
      const mergeProps = {
        ...restProps,
        can,
      };
      includes && Object.assign(mergeProps, { permissions });
      return can(...args) ? <WrappedComponent {...mergeProps}/> : exception;
    }
  };
}
