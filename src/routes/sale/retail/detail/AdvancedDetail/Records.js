import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Tabs } from 'antd';
import { VisitRecords } from './VisitRecords';
import { ContactRecords } from './ContactRecords';
import { ChanceRecords } from './ChanceRecords';

const { TabPane } = Tabs;
const allTabs = [
  {
    title: 'OS机会日志',
    key: '3',
    type: 'os',
    permission: [4005000, 4006000],
    component: <ChanceRecords type="OS" />,
  },
  {
    title: 'OS拜访记录',
    key: '4',
    type: 'os',
    permission: [4005000, 4006000],
    component: <VisitRecords />,
  },
  {
    title: 'IS机会日志',
    key: '1',
    type: 'is',
    permission: [4003000, 4004000, 4005000, 4006000],
    component: <ChanceRecords type="IS" />,
  },
  {
    title: 'IS联系记录',
    key: '2',
    type: 'is',
    permission: [4003000, 4004000, 4005000, 4006000],
    component: <ContactRecords />,
  },
];

@connect(({ user, saleRetail }) => ({
  user,
  currentDetail: saleRetail.currentDetail,
}))
export default class Records extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      tab: null,
    };
  }
  renderContent() {
    if (!this.state.tab) {
      const { permissions } = this.props.user;
      const { currentDetail: { chanceType } } = this.props;
      const arr = allTabs.filter(item =>
        item.permission.some(per => permissions.includes(per)) &&
        (chanceType === 'os' ? true : (chanceType === 'is' && chanceType === item.type))
      );
      if (arr.length === 0) {
        return null;
      } else {
        const Comp = arr[0].component;
        return Comp;
      }
    } else {
      const tab = allTabs.filter(item => item.key === this.state.tab)[0];
      const Comp = tab.component;
      return Comp;
    }
  }
  render() {
    const { permissions } = this.props.user;
    const { currentDetail: { chanceType } } = this.props;
    return (
      <Card bordered={false}>
        <Tabs
          onChange={key => this.setState({ tab: key })}
        >
          {
            allTabs
              .filter(item =>
                item.permission.some(per => permissions.includes(per)) &&
                (chanceType === 'os' ? true : (chanceType === 'is' && chanceType === item.type))
              )
              .map(tab => (<TabPane tab={tab.title} key={tab.key} />))
          }
        </Tabs>
        {this.renderContent()}
      </Card>
    );
  }
}
