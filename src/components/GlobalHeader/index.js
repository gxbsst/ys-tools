import React, { PureComponent, Fragment } from 'react';
import { Layout, Menu, Icon, Spin, Dropdown, Divider } from 'antd';
import { connect } from 'dva';
import { CallCenter, Copy } from '../../components';
import Debounce from 'lodash-decorators/debounce';
import { request, session, redirectToLogin } from '../../utils';
import styles from './index.less';

const { Header } = Layout;

@connect(({ callCenter, user: { permissions } }) => ({ callCenter, permissions }))
export default class GlobalHeader extends PureComponent {
  componentDidMount() {
    this.props.dispatch({
      type: 'user/fetchCurrent',
    });
  }

  componentWillUnmount() {
    this.triggerResizeEvent.cancel();
  }

  handleMenuClick = async ({ key }) => {
    if (key === 'logout') {
      const { callCenter: { isReady, logout } } = this.props;
      isReady && logout();
      await request('/sso/session/logout');
      redirectToLogin();
    }
  };

  toggle = () => {
    const { collapsed } = this.props;
    this.props.dispatch({
      type: 'global/changeLayoutCollapsed',
      payload: !collapsed,
    });
    this.triggerResizeEvent();
  };

  @Debounce(600)
  triggerResizeEvent() {
    const event = document.createEvent('HTMLEvents');
    event.initEvent('resize', true, false);
    window.dispatchEvent(event);
  }

  render() {
    const { currentUser = {}, collapsed, permissions } = this.props;
    const { givenName: name, username } = currentUser;
    const menu = (
      <Menu className={styles.menu} selectedKeys={[]} onClick={this.handleMenuClick}>
        <Menu.Item key="logout"><Icon type="logout"/>退出登录</Menu.Item>
      </Menu>
    );
    let copyPermissions = null;
    if (!/hsmob.com$/.test(window.location.hostname)) {
      const clipboard = `当前帐号：${name} ( ${username} )，权限列表：[${permissions}]`;
      copyPermissions = (
        <Fragment>
          <Copy text={clipboard} message="权限列表已成功复制到粘贴板"><a>复制权限列表</a></Copy>
          <Divider type="vertical"/>
        </Fragment>
      );
    }

    return (
      <Header className={styles.header}>
        <Icon className={styles.trigger} type={collapsed ? 'menu-unfold' : 'menu-fold'}
              onClick={this.toggle}/>
        <div className={styles.right}>
          {/*{copyPermissions}*/}
          {/*<CallCenter/>*/}
          {name ? (
            <Dropdown overlay={menu}>
              <span className={styles.account}>
                {name}
                <Icon type="down"/>
              </span>
            </Dropdown>
          ) : <Spin size="small" style={{ marginLeft: 8 }}/>}
        </div>
      </Header>
    );
  }
}
