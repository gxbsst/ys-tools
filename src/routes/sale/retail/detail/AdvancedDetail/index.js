import React, { PureComponent, Fragment } from 'react';
import { Divider } from 'antd';
import { connect } from 'dva';
import Records from './Records';
import { Clews } from './Clews';
import { FollowUp } from './FollowUp';
import {getPermissionTags} from "../../tableColumns";

@connect(({ saleRetail }) => (
  {
    currentDetail: saleRetail.currentDetail,
  }
))
export default class AdvancedDetail extends PureComponent {
  render() {
    const { currentDetail } = this.props;
    const { chanceType } = currentDetail;

    return (
      <Fragment>
        {/*{*/}
          {/*chanceType === 'os' &&*/}
          {/*<Fragment>*/}
            {/*<FollowUp />*/}
            {/*<Divider />*/}
          {/*</Fragment>*/}
        {/*}*/}
        <Records />
        <Divider />
        <Clews />
      </Fragment>
    );
  }
}
