import React from 'react';
import { Router, Route, Switch } from 'dva/router';
import { LocaleProvider, Spin } from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import dynamic from 'dva/dynamic';
import _ from 'lodash';
import { getNavData } from './nav';
import { getPlainNode } from './utils';

import styles from './index.less';

dynamic.setDefaultLoadingComponent(() => <Spin size="large" className={styles.globalSpin}/>);

const getRouteData = (navData, layout) => {
  const route = _.find(navData, { layout });
  if (route && route.children) {
    return getPlainNode(_.cloneDeep(route).children);
  }
  return null;
};

const getLayout = (navData, layout) => {
  const route = _.find(navData, { layout });
  if (route && route.children) {
    const { component, layout, name, path } = route;
    return { component, layout, name, path };
  }
  return null;
};

export default ({ history, app }) => {
  const navData = getNavData(app);
  const { component: AuthLayout } = getLayout(navData, 'AuthLayout');
  const { component: BasicLayout } = getLayout(navData, 'BasicLayout');
  const passProps = {
    app,
    navData,
    getRouteData: (path) => getRouteData(navData, path),
  };

  return (
    <LocaleProvider locale={zhCN}>
      <Router history={history}>
        <Switch>
          <Route path="/auth" render={props => <AuthLayout {...props} {...passProps} />}/>
          <Route path="/" render={props => <BasicLayout {...props} {...passProps} />}/>
        </Switch>
      </Router>
    </LocaleProvider>
  );
};
