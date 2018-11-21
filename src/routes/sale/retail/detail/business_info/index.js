import React, {PureComponent} from "react";
import {Link} from "dva/router";
import Appreciation from './appreciation/index';
import HardWare from './hardware/index';
import SoftWare from './software/index';
import {connect} from 'dva';
import {
  Button,
  Card,
  Tabs,
} from 'antd';

const TabPane = Tabs.TabPane;

@connect(state => ({
  currentDetail: state.saleRetail.currentDetail,
  id:state.saleRetail.id,
}))
export default class BusinessInfo extends PureComponent {
  constructor(props) {
    super(props)
  }

  render() {
    const { currentDetail: {customerName}, id} = this.props;
    return (
      <Card>
        <Tabs defaultActiveKey="1">
          <TabPane tab="软件业务" key="1">
            <SoftWare customername={customerName} chanceId={id}/>
          </TabPane>
          <TabPane tab="硬件业务" key="2">
            <HardWare customername={customerName} chanceId={id}/>
          </TabPane>
          <TabPane tab="增值业务" key="3">
            <Appreciation customername={customerName} chanceId={id}/>
          </TabPane>
        </Tabs>
      </Card>
    )
  }
}
