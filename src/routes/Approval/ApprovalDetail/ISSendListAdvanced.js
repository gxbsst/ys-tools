import React, { PureComponent } from 'react';
import { Tabs, Card } from 'antd';
import ISContactRecords from './ISContactRecords';
import ISChanceLogs from './ISChanceLogs';
import ISClueLogs from './ISClueLogs';

const { TabPane } = Tabs;

export default class ISSendListAdvanced extends PureComponent {
  render() {
    return (
      <Card bordered={false}>
        <Tabs defaultActiveKey="contactRecords">
          <TabPane key="contactRecords" tab="is联系记录">
            <ISContactRecords params={{ id: this.props.id }} />
          </TabPane>
          <TabPane key="chanceRecords" tab="is机会日志">
            <ISChanceLogs params={{ id: this.props.id }} />
          </TabPane>
          <TabPane key="linkRecords" tab="线索日志">
            <ISClueLogs params={{ id: this.props.id }} />
          </TabPane>
        </Tabs>
      </Card>
    );
  }
}
