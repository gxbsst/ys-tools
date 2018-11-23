import React, {PureComponent} from 'react';
import {Card} from 'antd';

import styles from 'module.component.less'

const bodyStyle = {padding: 0};

export default class CanComponent extends PureComponent {


  render() {
    const cardProps = {
      title: 'CAN网络',
      className: styles.card,
      bordered: false,
      bodyStyle,
    };

    return (
      <Card {...cardProps}>
        testing
      </Card>
    );
  }
}
