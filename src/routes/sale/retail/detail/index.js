import React, { Component } from 'react';
import { connect } from 'dva';
import { Button, Popconfirm, message } from 'antd';
import PropTypes from "prop-types";
import { routerRedux, Route, Switch } from 'dva/router';
import PageHeaderLayout from '../../../../layouts/PageHeaderLayout';
import PushOrderModal from '../PushOrderModal';
import { getPermissionTags } from '../tableColumns';
import RejectRequestModal from '../RejectRequestModal';
import CountDown from '../../../../components/CountDown/';
import style from './index.less';

@connect(({ saleRetail, user, loading }) => ({
  id: saleRetail.id,
  user,
  currentDetail: saleRetail.currentDetail,
  pushOrderLoading: loading.effects['saleRetail/queryPushOrderModalInfo'],
}))
export default class ChanceDetail extends Component {
  static contextTypes = {
    routeData: PropTypes.array,
  };
  constructor(props) {
    super(props);
    const id = this.props.match.params.id || '';
    this.props.dispatch({
      type: 'saleRetail/updateState',
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
      type: 'saleRetail/queryChanceDetail',
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
      type: 'saleRetail/queryPushOrderModalInfo',
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
      type: 'saleRetail/abandonChance',
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
        type: 'saleRetail/applyDelay',
        payload: {
          id,
        },
      }).then((val) => {
        if (val) {
          message.success('延期成功');
          this.setState({ delayBtnDisabled: true });
        }
      });
    }
  }
  changeApply = () => {
    const { id } = this.props;
    this.props.dispatch({
      type: 'saleRetail/applyChance',
      payload: {
        chanceIds: [~~id],
        type: 'protect'
      },
    }).then((val) => {
      if (val) {
        message.success('转客保成功');
      }
    });
  }
  renderTabList() {
    const { currentDetail } = this.props;
    const { chanceType } = currentDetail;
    const content = [
      {
        key: 'basic',
        tab: '基础信息',
      },
      {
        key: 'advance',
        tab: '跟进信息',
      },
    ];
    if (chanceType === 'os') {
      content.push(...[
        {
          key: 'landing',
          tab: '提单信息',
        },
        {
          key: 'business',
          tab: '业务信息',
        },
      ]);
    }
    return content;
  }
  renderMainButtons() {
    const { user: { permissions, currentUser: { username } }, currentDetail } = this.props;
    const { isIS, isOS } = getPermissionTags(permissions);
    const { surplusDays, opStatus, isVassal, chanceBizType, chanceType, status, bindAccount } = currentDetail;
    const content = (
      <div className={style.mainButtons}>
        {
          bindAccount === username &&
          chanceType === 'is' &&
          chanceBizType === 2 &&
          permissions.includes(4004002) && opStatus === 3 &&
          !isVassal &&
          <Button className={style.action} type="primary" onClick={this.changeApply}>转客保</Button>
        }
        {
          bindAccount === username &&
          chanceType === 'is' &&
          isIS &&
          (chanceBizType === 2 ? (opStatus === 3 || opStatus === 4) : opStatus === 2 ) &&
          !isVassal &&
          <Button className={style.action} type="primary" onClick={this.handleClickPushOrder} loading={this.props.pushOrderLoading}>提单</Button>
        }
        {/*{*/}
          {/*isOS &&*/}
          {/*<Popconfirm title="是否延期?" onConfirm={this.delayConfirm} onCancel={this.delayCancel} okText="确定" cancelText="取消">*/}
            {/*<Button disabled={this.props.currentDetail.hasDelayed} className={style.action} type="ghost">申请延期</Button>*/}
          {/*</Popconfirm>*/}
        {/*}*/}
        {
          bindAccount === username &&
          chanceType === 'os' &&
          opStatus === 2 &&
          !isVassal &&
          <Button className={style.action} type="ghost" onClick={() => this.setState({ showRejectRequestModal: true })}>申请驳回</Button>
        }
        {
          (
            bindAccount === username &&
            !isVassal &&
            chanceType === 'is' ?
            (opStatus === 3 || opStatus === 4 || opStatus === 2) :
            (chanceType === 'os' ? opStatus === 2 : false)
          ) &&
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
      onOk: () => this.setState({ showPushOrderModal: false }, () => {
        this.props.dispatch({
          type: 'saleRetail/queryChanceDetail',
          payload: {
            id: this.props.match.params.id || '',
          },
        });
      }),
    };
    const showRejectRequestModalProps = {
      id,
      visible: this.state.showRejectRequestModal,
      onCancel: () => this.setState({ showRejectRequestModal: false }),
      onOk: () => this.setState({ showRejectRequestModal: false }),
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
