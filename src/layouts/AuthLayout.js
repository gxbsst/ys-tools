import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Link, Route } from 'dva/router';
import DocumentTitle from 'react-document-title';
import { APP_NAME } from '../config';
import styles from './AuthLayout.less';

export default class AuthLayout extends PureComponent {
  static childContextTypes = {
    location: PropTypes.object,
  };

  getChildContext() {
    const { location } = this.props;
    return { location };
  }

  getPageTitle() {
    const { location, getRouteData } = this.props;
    const { pathname: path } = location;
    const route = _.find(getRouteData('BasicLayout'), { path });
    if (route) {
      const { name, title = name } = route;
      return title;
    }
    return APP_NAME;
  }

  render() {
    const { getRouteData } = this.props;
    return (
      <DocumentTitle title={this.getPageTitle()}>
        <div className={classNames('flex-column flex-center flex-middle full-height', styles.main)}>
          <div className={styles.logo}/>
          {getRouteData('AuthLayout').map(({ exact, path, component }) => {
            const routeProps = {
              key: path,
              exact,
              path,
              component,
            };
            return <Route {...routeProps}/>;
          })}
          <div className={styles.footer}>Copyright &copy; 2017 上海微盟科技股份有限公司</div>
        </div>
      </DocumentTitle>
    );
  }
}
