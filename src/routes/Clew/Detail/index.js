import React, { Component } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Button, message, Popconfirm, Menu, Dropdown, Icon } from 'antd';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import boundary from '../../../decorators/Boundary';
import can from '../../../decorators/Can';
import ClewAbandonModal from '../Modal/ClewAbandonModal';
import BaseInfo from './_BaseInfo';
import StepInfo from './_StepInfo';
import {clew as clewAuth} from '../../../utils/auth';

@connect(state => ({
  clew: state.clews.clew,
}))
@can()
@boundary
export default class ClewDetail extends Component {
  state = {
    tab: 'basic',
    abandonModalVisible: false,
    abandonSubmitting: false,
  }
  handleTabChange = (key) => {
    this.setState({
      tab: key,
    })
  }
  handleAbandonModalOk = (data) => {
    const {dispatch, match} = this.props;
    this.setState({
      abandonSubmitting: true,
    })
    dispatch({
      type: 'clews/abandon',
      payload: { ...data, ids: [match.params.id] },
    }).then((response) => {
      this.setState({
        abandonSubmitting: false,
      })
      if (!response.code) {
        message.success(response.message);
        this.setState({
          abandonModalVisible: false,
        })
        dispatch(routerRedux.push('/clew/clews'));
      } else {
        message.error(response.message);
      }
    })
  }
  rollout = (inputType) => {
    this.props.dispatch({
      type: 'clews/rollout',
      payload: {
        id: this.props.match.params.id,
        inputType,
      },
    })
  }
  gotoList = () => {
    const {dispatch} = this.props;
    dispatch(routerRedux.push('/clew/clews'));
  }
  arraign = () => {
    this.props.dispatch({
      type: 'clews/arraign',
      payload: { id: this.props.match.params.id },
    })
  }
  activate = () => {
    this.props.dispatch({
      type: 'clews/activate',
      payload: { id: this.props.match.params.id },
    })
  }
  handleAbandonModalCancel = () => {
    this.setState({
      abandonModalVisible: false,
    })
  }
  showAbandonModal = () => {
    this.setState({
      abandonModalVisible: true,
    })
  }
  componentDidMount() {
    // this.props.dispatch({
    //   type: 'clews/detail',
    //   payload: this.props.match.params.id,
    // });
  }

  render() {
    const { dispatch, match, clew, can } = this.props;
    const { clewInfo } = clew;
    const tabList = [{
      key: 'basic',
      tab: '基本信息',
    }, {
      key: 'step',
      tab: '跟进信息',
    }];

    const handleMenuClick = (e) => {
      this.rollout(~~e.key);
    }

    const menu = (
      <Menu onClick={handleMenuClick}>
        <Menu.Item key="1">到公海</Menu.Item>
        <Menu.Item key="2">到私海</Menu.Item>
      </Menu>
    );

    const action = (
      <div>
        <Button type="default" onClick={() => dispatch(routerRedux.push('/clew/clews'))}>列表</Button>
        {
          clewAuth.clean(can, clewInfo) &&
          <Button type="primary" onClick={() => dispatch(routerRedux.push(match.url.replace('detail', 'clean')))}>清洗</Button>
        }
        {
          clewAuth.rolloutPre(can, clewInfo) &&
          <Popconfirm title="确定转出此线索吗?" onConfirm={() => this.rollout()} okText="确定" cancelText="取消">
            <Button type="primary">转出</Button>
          </Popconfirm>
        }
        {
          clewAuth.rolloutSale(can, clewInfo) &&
          <Dropdown overlay={menu}>
            <Button type="primary">
              转出 <Icon type="down" />
            </Button>
          </Dropdown>
        }
        {
          clewAuth.arraign(can, clewInfo) &&
          <Popconfirm title="确定提审此线索吗?" onConfirm={this.arraign} okText="确定" cancelText="取消">
            <Button type="primary">提审</Button>
          </Popconfirm>
        }
        {
          clewAuth.activate(can, clewInfo) &&
          <Popconfirm title="确定激活此线索吗?" onConfirm={this.activate} okText="确定" cancelText="取消">
            <Button type="primary">激活</Button>
          </Popconfirm>
        }
        {
          clewAuth.abandon(can, clewInfo) &&
          <Button type="danger" onClick={this.showAbandonModal}>废弃</Button>
        }
      </div>
    );
    const modalProps = {
      visible: this.state.abandonModalVisible,
      onOk: this.handleAbandonModalOk,
      onCancel: this.handleAbandonModalCancel,
      destroyOnClose: true,
      confirmLoading: this.state.abandonSubmitting,
    }

    return (
      <PageHeaderLayout
        tabList={tabList}
        action={action}
        activeTabKey={this.state.tab}
        onTabChange={this.handleTabChange}
      >
        { this.state.tab == 'basic' ? <BaseInfo baseInfo={clew} /> : <StepInfo id={match.params.id} />}
        <ClewAbandonModal {... modalProps} />
      </PageHeaderLayout>
    );
  }
}
