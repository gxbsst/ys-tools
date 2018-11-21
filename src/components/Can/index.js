import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import can from '../../decorators/Can';

@can()
export default class Can extends PureComponent {
  static propTypes = {
    is: PropTypes.any.isRequired,
    user: PropTypes.string,
    includes: PropTypes.bool,
  };

  render() {
    const { children, can, is, user, includes } = this.props;
    return can([is], user, includes) ? children : null;
  }
}
