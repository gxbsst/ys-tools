import React, { PureComponent } from 'react';
import { Divider } from 'antd';
import { connect } from 'dva';
import Records from './Records';
import { Clews } from './Clews';
import { FollowUp } from './FollowUp';

@connect(({ user }) => ({ user }))
export default class AdvancedDetail extends PureComponent {
  render() {
    return (
      <div>
        <FollowUp />
        <Divider />
        <Records />
        <Divider />
        <Clews />
      </div>
    );
  }
}
