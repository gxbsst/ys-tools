import React, {PureComponent} from 'react';
import {autodata, can} from '../../../decorators';
import RouteTab from '../../../components/RouteTab';

@autodata({
  namespace: 'baseInfo',
  url: '/api/customer/:id',
})
@autodata({
  namespace: 'service',
  url: '/api/customer/customersSelf/:id',
})
export default class CustomerDetail extends PureComponent {
  render() {
    return <RouteTab {...this.props}/>;
  }
}
