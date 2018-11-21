import React, {PureComponent} from "react";
import {connect} from 'dva'
import {Link} from "dva/router";
import Appreciation from './appreciation/index'
import HardWare from './hardware/index'
import SoftWare from './software/index'
import can from "../../../../decorators/Can";
import {
  Button,
  Card,
  Tabs,
} from 'antd';

const TabPane = Tabs.TabPane;
@connect(state => (
    state
  )
)
export default class BusinessInfo extends PureComponent {
  constructor(props) {
    super(props)
  }

  render() {
    const {baseInfo: {data: baseInfo = {}}, service: {data: service = []}} = this.props;
    const {customerName, id} = baseInfo;
    return (
      <Card>
        <Tabs defaultActiveKey="1">
          <TabPane tab="软件业务" key="1">
            <SoftWare customername={customerName} customerId={id} service={service}/>
          </TabPane>
          <TabPane tab="硬件业务" key="2">
            <HardWare customername={customerName} customerId={id} service={service}/>
          </TabPane>
          <TabPane tab="增值业务" key="3">
            <Appreciation customername={customerName} customerId={id} service={service}/>
          </TabPane>
        </Tabs>
      </Card>
    )
  }
}
