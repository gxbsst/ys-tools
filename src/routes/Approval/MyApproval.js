import React, { PureComponent } from 'react';
import RouteTab from '../../components/RouteTab';
import can from '../../decorators/Can';

@can([7002000])
export default class MyApproval extends PureComponent {
  render() {
    return <RouteTab {...this.props} />;
  }
}
