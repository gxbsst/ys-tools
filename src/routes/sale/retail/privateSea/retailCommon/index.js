import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Tabs } from 'antd';
import CustomerRetention from './CustomerRetention';
import ClaimLibrary from './ClaimLibrary';
import PendingApproval from './PendingApproval';
import UnderlingPrivateSea from './UnderlingPrivateSea';
import TurnedOutList from './TurnedOutList';

import styles from './style.less';

const { TabPane } = Tabs;
const allTabs = [
  {
    title: '申领库',
    key: '1',
    permission: [4004001, 4004005],
    component: ClaimLibrary,
  },
  {
    title: '客保',
    key: '2',
    permission: [4004002],
    component: CustomerRetention,
  },
  {
    title: '待审核',
    key: '3',
    permission: [4004003, 4004006],
    component: PendingApproval,
  },
  {
    title: '下属私海',
    key: '4',
    permission: [4004007],
    component: UnderlingPrivateSea,
  },
  {
    title: '已转出',
    key: '5',
    permission: [4004004],
    component: TurnedOutList,
  },
];
@connect(({ user }) => ({ user }))
export default class IsPrivateSea extends PureComponent {
  state = {
    tab: null,
  }
  renderContent() {
    if (!this.state.tab) {
      const { permissions } = this.props.user;
      const arr = allTabs.filter(item => item.permission.some(per => permissions.includes(per)));
      if (arr.length === 0) {
        return null;
      } else {
        const Comp = arr[0].component;
        return <Comp />;
      }
    } else {
      const tab = allTabs.filter(item => item.key === this.state.tab)[0];
      const Comp = tab.component;
      return <Comp />;
    }
  }
  render() {
    const { permissions } = this.props.user;

    return (
      <div className={styles.standardList}>
        <Tabs
          onChange={(key) => this.setState({ tab: key })}
        >
          {
            allTabs
              .filter(item => item.permission.some(per => permissions.includes(per)))
              .map(tab => (<TabPane tab={tab.title} key={tab.key} />))
          }
        </Tabs>
        {this.renderContent()}
      </div>
    );
  }
}
