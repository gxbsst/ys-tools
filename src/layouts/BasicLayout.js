import React from 'react';
import PropTypes from 'prop-types';
import qs from 'qs';
import { Layout, Spin } from 'antd';
import DocumentTitle from 'react-document-title';
import { connect } from 'dva';
import { Route, Redirect, Switch } from 'dva/router';
import { ContainerQuery } from 'react-container-query';
import classNames from 'classnames';
import GlobalHeader from '../components/GlobalHeader';
import SiderMenu from '../components/SiderMenu';
import CallCenterWidget from '../components/CallCenter/Widget';
import NotFound from '../routes/Exception/404';
import styles from './BasicLayout.less';
import globalStyles from '../index.less';

const { Content } = Layout;
const query = {
  'screen-xs': { maxWidth: 575 },
  'screen-sm': { minWidth: 576, maxWidth: 767 },
  'screen-md': { minWidth: 768, maxWidth: 991 },
  'screen-lg': { minWidth: 992, maxWidth: 1199 },
  'screen-xl': { minWidth: 1200, maxWidth: 1599 },
  'screen-xxl': { minWidth: 1600 },
};

@connect(({ user, global }) => ({
  currentUser: user.currentUser,
  permissions: user.permissions,
  collapsed: global.collapsed,
  fetchingNotices: global.fetchingNotices,
  notices: global.notices,
}))
export default class BasicLayout extends React.PureComponent {
  static childContextTypes = {
    location: PropTypes.object,
    query: PropTypes.object,
    breadcrumbNameMap: PropTypes.object,
    routeData: PropTypes.array,
  };

  getChildContext() {
    const { location, navData, getRouteData } = this.props;
    const routeData = getRouteData('BasicLayout');
    const firstMenuData = navData.reduce((arr, current) => arr.concat(current.children), []);
    const menuData = this.getMenuData(firstMenuData, '');
    const breadcrumbNameMap = {};
    const query = qs.parse(location.search.substr(1));
    routeData.concat(menuData).forEach((item) => {
      breadcrumbNameMap[item.path] = {
        name: item.name,
        component: item.component,
      };
    });

    return { location, query, breadcrumbNameMap, routeData };
  }

  getPageTitle() {
    const { location, getRouteData } = this.props;
    const { pathname } = location;
    let title = 'FAE诊断工具 - 驭势';
    getRouteData('BasicLayout').forEach((item) => {
      if (item.path === pathname) {
        title = `${item.title || item.name} - ${title}`;
      }
    });
    return title;
  }

  componentWillMount() {
    this.props.dispatch({
      type: 'user/getCurrentUser'
    });
  }

  componentDidMount() {
    window.addEventListener('resize', this.onResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
  }

  onResize = () => {
    const { innerWidth } = window;
    for (const key of Object.keys(query)) {
      const { minWidth, maxWidth } = query[key];
      if ((!minWidth || minWidth <= innerWidth) && (!maxWidth || maxWidth >= innerWidth)) {
        this.props.dispatch({
          type: 'global/onResize',
          payload: key,
        });
      }
    }
  };

  getMenuData = (data, parentPath) => {
    let arr = [];
    data.forEach((item) => {
      if (item.title || item.name) {
        arr.push({ path: `${parentPath}/${item.path}`, name: item.title || item.name });
      }
      if (item.children) {
        arr = arr.concat(this.getMenuData(item.children, `${parentPath}/${item.path}`));
      }
    });
    return arr;
  };

  render() {
    const { currentUser, collapsed, getRouteData, navData, location, dispatch } = this.props;
    const spin = <Spin size="large"/>;
    const layout = (
      <Layout className="full-height">
        <SiderMenu collapsed={collapsed} navData={navData} location={location} dispatch={dispatch}/>
        <Layout className={classNames('flex-column', styles.main)}>
          <GlobalHeader currentUser={currentUser} collapsed={collapsed} dispatch={dispatch}/>
          <div className="flex-item flex-row">
            <div className={classNames('flex-item flex-column', styles.body)}>
              <Content>
                <Switch>
                  {getRouteData('BasicLayout').map(item => (
                    <Route exact={item.exact} key={item.path} path={item.path} component={item.component}/>
                  ))}
                  <Redirect exact from="/" to="/workplace"/>
                  <Route component={NotFound}/>
                </Switch>
              </Content>
            </div>
            <CallCenterWidget/>
          </div>
        </Layout>
      </Layout>
    );
    return (
      <DocumentTitle title={this.getPageTitle()}>
        <ContainerQuery query={query}>
          {params => {
            const screen = classNames(params, 'full-height');
            this.onResize(screen);
            return <div className={screen}>{currentUser.username ? layout : spin}</div>;
          }}
        </ContainerQuery>
      </DocumentTitle>
    );
  }
}
