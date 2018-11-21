import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Tabs } from 'antd';
import { VisitRecords } from './VisitRecords';
import { ChanceRecords } from './ChanceRecords';

const { TabPane } = Tabs;
@connect(({ user }) => ({ user }))
export default class Records extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      tab: 'visitRecords',
    };
  }
  renderContent=() => {
    let content = null;
    const key = this.state.tab;
    switch (key) {
      case 'visitRecords': content = <VisitRecords />;
        break;
      case 'chanceRecords': content = <ChanceRecords />;
        break;
      default: content = <VisitRecords />;
        break;
    }
    return content;
  }
  render() {
    return (
      <Card bordered={false}>
        <Tabs
          activeKey={this.state.tab}
          onChange={key => this.setState({ tab: key })}
        >
          <TabPane key="visitRecords" tab="拜访记录" />
          <TabPane key="chanceRecords" tab="机会日志" />
        </Tabs>
        {this.renderContent()}
      </Card>
    );
  }
}
