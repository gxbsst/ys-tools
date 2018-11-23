import React, {PureComponent} from 'react';
import {Card, Tag} from 'antd';

import styles from 'module.component.less'

const bodyStyle = {padding: 0};

export default class GPSComponent extends PureComponent {


  render() {
    const cardProps = {
      title: 'GPS',
      className: styles.card,
      bordered: false,
      bodyStyle,
    };

    const {dataSource: { signal, text}} = this.props;

    return (
      <Card {...cardProps}>
        testing
      </Card>
    );
  }
}
