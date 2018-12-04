import React, {PureComponent} from 'react';
import {Card, Tag} from 'antd';

import styles from './module.component.less'
import moment from 'moment/moment';
import {MiniArea} from 'ant-design-pro/lib/Charts/index';

const bodyStyle = {padding: 0};

const visitData = [];
const beginDay = new Date().getTime();
for (let i = 0; i < 30; i += 1) {
  visitData.push({
    x: moment(new Date(beginDay + (1000 * 60 * 60 * 24 * i))).format('YYYY-MM-DD'),
    y: Math.floor(Math.random() * 100) + 100,
  });
}


export default class GPSComponent extends PureComponent {


  render() {
    const cardProps = {
      title: 'CAN网络',
      className: styles.can,
      bordered: false,
      bodyStyle,
    };

    const {dataSource: { signal, text}} = this.props;

    return (
      <Card {...cardProps}>
        <MiniArea
          line
          color="#cceafe"
          height={60}
          data={visitData}
        />
      </Card>
    );
  }
}
