import React, { PureComponent } from 'react';
import { Tabs, Card, Divider } from 'antd';
import AdvancedLogs from './AdvancedLogs';
import OSVisitRecords from './OSVisitRecords';
import OSChanceLogs from './OSChanceLogs';
import ISContactRecords from './ISContactRecords';
import ISChanceLogs from './ISChanceLogs';
import OSClueLogs from './OSClueLogs';

const { TabPane } = Tabs;

export default class OSRejectAdvanced extends PureComponent {
  render() {
    return (
      <div>
        <Card title="跟进日志">
          <AdvancedLogs params={{ id: this.props.id }} />
        </Card>
        <Divider />
        <Card bordered={false}>
          <Tabs defaultActiveKey="visitRecords">
            <TabPane key="visitRecords" tab="OS拜访记录">
              <OSVisitRecords params={{ id: this.props.id }} />
            </TabPane>
            <TabPane key="chanceRecords-OS" tab="OS机会日志">
              <OSChanceLogs params={{ id: this.props.id }} />
            </TabPane>
            <TabPane key="contactRecords" tab="IS联系记录">
              <ISContactRecords params={{ id: this.props.id }} />
            </TabPane>
            <TabPane key="chanceRecords-IS" tab="IS机会日志">
              <ISChanceLogs params={{ id: this.props.id }} />
            </TabPane>
          </Tabs>
        </Card>
        <Divider />
        <Card title="线索日志">
          <OSClueLogs params={{ id: this.props.id }} />
        </Card>
      </div>
    );
  }
}
