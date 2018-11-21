import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Input, Form } from 'antd';
import RouteTab from '../../components/RouteTab';
import Dialog from '../../components/Dialog';
import styles from './index.less';

@connect(({ callCenter }) => ({ callCenter }))
export default class CallCenter extends PureComponent {
  componentWillMount() {
    const { callCenter: { cno, bindTel, bind } } = this.props;
    if (cno && !bindTel) {
      bind();
    }
  }

  componentWillReceiveProps({ callCenter: { cno, bindTel, bind } }) {
    const { callCenter: { cno: oldCno, bindTel: oldBindTel } } = this.props;
    if ((cno !== oldCno || bindTel !== oldBindTel) && cno && !bindTel) {
      bind();
    }
  }

  render() {
    const { callCenter: { cno, bindTel, bind } } = this.props;
    let action = null;
    if (cno) {
      if (bindTel) {
        action = (
          <div className={styles.current}>
            <span><strong>座席编号：</strong>{cno}</span>
            <span><strong>绑定电话：</strong>{bindTel}</span>
            <a onClick={bind}>修改</a>
          </div>
        );
      } else {
        action = <a onClick={bind}>绑定电话</a>;
      }
    }
    return <RouteTab {...this.props} action={action}/>;
  }
};
