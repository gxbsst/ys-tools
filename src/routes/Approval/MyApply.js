import React, { PureComponent } from 'react';
import RouteTab from '../../components/RouteTab';
import can from '../../decorators/Can';

@can([7001000])
export default class MyApply extends PureComponent {
  render() {
    return <RouteTab {...this.props} />;
  }
}
