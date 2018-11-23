import React, {PureComponent} from 'react';
import {Card, Icon} from 'antd';

import styles from 'module.component.less'

const bodyStyle = {padding: 0};

export default class NetworkComponent extends PureComponent {

  render() {
    const cardProps = {
      title: '网络连接',
      className: styles.card,
      bordered: false,
      bodyStyle,
    };

    const {dataSource: { network }} = this.props;

    return (
      <Card {...cardProps}>
        <dl>
          <dt>LINK 速度</dt>
          <dd>{network.speed}</dd>
          <dt>流量: {network.networkFlow} 剩余: {network.networkFlowAvailable}</dt>
          <dd>...</dd>
          <dt><Icon className="blue" type="arrow-up" /> 上传速率  <Icon type="arrow-down" className="blue" /> 下载速率</dt>
          <dd><span className="upload">{network.network_upload}</span> <span className="download">{network.network_download}</span></dd>
        </dl>
      </Card>
    );
  }
}
