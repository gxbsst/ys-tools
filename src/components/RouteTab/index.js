import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import qs from 'qs';
import { can } from '../../decorators';
import { Route, Switch } from 'dva/router';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import { redirectTo } from '../../utils';

@can()
export default class RouteTab extends PureComponent {
  static contextTypes = {
    query: PropTypes.object,
    router: PropTypes.object,
    routeData: PropTypes.array,
  };

  constructor(props) {
    super(props);
    this.state = {
      tabs: null,
      headerProps: props.headerProps
    };
  }

  componentWillMount() {
    const { match, can } = this.props;
    const { routeData, router: { history } } = this.context;
    this.routes = _.cloneDeep(_.find(routeData, { path: match.path })).children.map((item, i) => ({
      ...item,
      url: `${match.url}/${item.path.split('?')[0]}`
    }));
    this.setState({
      tabs: this.routes.filter(({ tab, can: permissions }) => tab && (!permissions || can(permissions))).map(item => ({ key: item.path, tab: item.title || item.name }))
    });
    this.unsubscribe = history.listen(this.onRouterChange);
  }

  componentWillUnmount() {
    if (this.unsubscribe) this.unsubscribe();
  }

  onRouterChange = (location) => {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      const { match, headerProps = null } = this.props;
      const { tabs } = this.state;
      this.setState({ headerProps });
      if (location.pathname === match.url && (tabs && tabs[0])) {
        const query = qs.parse(location.search.substr(1));
        redirectTo(`${match.url}/${tabs[0].key}`, _.omit(query, ['page']));
      }
    }, 10);
  };

  handleTabChange = (key) => {
    const { router: { route: { location } } } = this.context;
    const { match } = this.props;
    const query = qs.parse(location.search.substr(1));
    redirectTo(`${match.url}/${key}`, _.omit(query, ['page']));
  };

  setTabTitle = i => tab => {
    const { tabs } = this.state;
    const item = tabs[i];
    if (item.tab !== tab) {
      _.merge(item, { tab });
      this.setState({ tabs: [].concat(tabs) });
    }
  };

  setHeaderProps = headerProps => {
    if (!_.isEqual(this.state.headerProps, headerProps)) {
      this.setState({ headerProps });
    }
  };

  getActiveTabKey = () => {
    const { router: { route: { location } } } = this.context;
    const route = _.find(this.routes, { url: location.pathname });
    return route ? route.path : null;
  };

  routeRender = ({ component: TabItem }, index) => (route) => {
    const { wrapperClassName, className, action, itemClassName, ...restProps } = this.props;
    const props = {
      className: itemClassName,
      setTabTitle: this.setTabTitle(index),
      setHeaderProps: this.setHeaderProps,
      ...restProps,
      ...route,
    };
    return <TabItem {...props}/>;
  };

  render() {
    const { tabs, headerProps } = this.state;
    const { wrapperClassName, className, action, top } = this.props;
    const activeTabKey = this.getActiveTabKey();
    const mapStateToHeaderProps = {
      ...headerProps,
      tabList: _.some(tabs, { key: activeTabKey }) ? tabs : null,
      onTabChange: this.handleTabChange,
      wrapperClassName,
      className,
      activeTabKey,
      action,
      top,
    };
    return (
      <PageHeaderLayout {...mapStateToHeaderProps}>
        <Switch>
          {this.routes.map((item, i) => (
            <Route key={item.path} path={item.url} render={this.routeRender(item, i)}/>
          ))}
        </Switch>
      </PageHeaderLayout>
    );
  }
}
