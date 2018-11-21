import React, { Component } from 'react';
import { connect } from 'dva';
import { Button, Popconfirm, message } from 'antd';
import PropTypes from 'prop-types';
import { routerRedux, Route, Switch } from 'dva/router';
import PageHeaderLayout from '../../../../layouts/PageHeaderLayout';
import PushOrderModal from '../PushOrderModal';
import RejectRequestModal from '../RejectRequestModal';
import CountDown from '../../../../components/CountDown/';
import style from './index.less';

@connect(({ arriveShop, user, loading }) => ({
  id: arriveShop.id,
  user,
  currentDetail: arriveShop.currentDetail,
  pushOrderLoading: loading.effects['arriveShop/queryPushOrderModalInfo'],
}))
export default class ChanceDetail extends Component {
  static contextTypes = {
    routeData: PropTypes.array,
  };
  constructor(props) {
    super(props);
    const id = this.props.match.params.id || '';
    this.props.dispatch({
      type: 'arriveShop/updateState',
      payload: {
        id,
      },
    });
    this.state = {
      showPushOrderModal: false,
      showRejectRequestModal: false,
    };
    this.handleClickPushOrder = this.handleClickPushOrder.bind(this);
  }
  componentDidMount() {
    this.props.dispatch({
      type: 'arriveShop/queryChanceDetail',
      payload: {
        id: this.props.match.params.id || '',
      },
    });
  }
  handleTabChange = (key) => {
    const { dispatch, match } = this.props;
    dispatch(routerRedux.push(`${match.url}/${key}`));
  }
  handleClickPushOrder() {
    this.props.dispatch({
      type: 'arriveShop/queryPushOrderModalInfo',
      payload: {
        id: this.props.id,
      }
    }).then((val) => {
      if (val) {
        this.setState({showPushOrderModal: true});
      }
    });
  }
  abandonConfirm = () => {
    const { id } = this.props;
    this.props.dispatch({
      type: 'arriveShop/abandonChance',
      payload: {
        id,
      },
    });
  }
  delayConfirm = () => {
    const { delay } = this.props;
    if (!delay) {
      const { id } = this.props;
      this.props.dispatch({
        type: 'arriveShop/applyDelay',
        payload: {
          id,
        },
      });
    }
  }
  renderTabList = () => {
    const content = [
      {
        key: 'basic',
        tab: '基础信息',
      },
      {
        key: 'advance',
        tab: '跟进信息',
      },
      {
        key: 'landing',
        tab: '提单信息',
      },
      {
        key: 'business',
        tab: '业务信息',
      },
    ];
    return content;
  }
  renderMainButtons() {
    const { currentDetail, user: { currentUser: { username } } } = this.props;
    const { surplusDays, opStatus, isVassal, status, bindAccount } = currentDetail;

    const content = (
      <div className={style.mainButtons}>
        {
          opStatus === 2 &&
          !isVassal &&
          bindAccount === username &&
          <Popconfirm title="是否放弃?" onConfirm={this.abandonConfirm} okText="确定" cancelText="取消">
            <Button className={style.action} type="ghost">放弃</Button>
          </Popconfirm>
        }
        {
          (opStatus === 2 || opStatus === 3 || opStatus === 4 || opStatus === 5) && surplusDays && status != 2 &&
          <Button className={style.action} type="ghost">
            剩余时间:
            <CountDown
              target={surplusDays}
              format={(time) => {
                const days = 24 * 60 * 60 * 1000;
                const hours = 60 * 60 * 1000;
                const minutes = 60 * 1000;
                const d = Math.floor(time / days);
                const h = Math.floor((time - (d * days)) / hours);
                const m = Math.floor((time - (d * days) - (h * hours)) / minutes);
                return (
                  <span>{d}天{h}小时{m}分钟</span>
                );
              }}
            />
          </Button>
        }
      </div>
    );
    return content;
  }
  render() {
    const { match, location, currentDetail, id } = this.props;
    const { routeData } = this.context;
    if (!id || !currentDetail) {
      return null;
    }
    const routes = routeData.filter(item => item.path === match.path)[0].children;
    const pushOrderModalProps = {
      visible: true,
      onCancel: () => this.setState({ showPushOrderModal: false }),
    };
    const showRejectRequestModalProps = {
      id,
      visible: this.state.showRejectRequestModal,
      onCancel: () => this.setState({ showRejectRequestModal: false }),
      onOK: () => this.setState({ showRejectRequestModal: false }),
    };
    return (
      <PageHeaderLayout
        tabList={this.renderTabList()}
        content={this.renderMainButtons()}
        onTabChange={this.handleTabChange}
        activeTabKey={location.pathname.replace(`${match.url}/`, '')}
      >
        <Switch>
          {
            routes.map(item =>
              (
                <Route
                  key={item.path}
                  path={`${match.path}/${item.path}`}
                  component={item.component}
                />
              )
            )
          }
        </Switch>
        {this.state.showPushOrderModal && <PushOrderModal {...pushOrderModalProps} />}
        <RejectRequestModal {...showRejectRequestModalProps} />
      </PageHeaderLayout>
    );
  }
}
