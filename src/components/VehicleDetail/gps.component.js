import React, {PureComponent} from 'react';
import {Card, Tag} from 'antd';
import styles from './module.component.less'

const bodyStyle = {padding: 0};

export default class CanComponent extends PureComponent {
  render() {
    const cardProps = {
      title: 'GPS',
      className: styles.gps,
      bordered: false,
      bodyStyle,
    };

    const {dataSource: { signal, text}} = this.props;

    return (
      <Card {...cardProps}>
        <Tag color="green">{signal}</Tag>
        <span>{text}</span>
      </Card>
    );
  }
}
