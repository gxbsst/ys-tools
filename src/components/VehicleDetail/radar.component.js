import React, {PureComponent} from 'react';
import {Card} from 'antd';
import styles from 'module.component.less'

const bodyStyle = {padding: 0};

export default class RadarComponent extends PureComponent {
  render() {
    const cardProps = {
      title: '激光雷达',
      className: styles.card,
      bordered: false,
      bodyStyle,
    };

    return (
      <Card {...cardProps}>
        images...
      </Card>
    );
  }
}
