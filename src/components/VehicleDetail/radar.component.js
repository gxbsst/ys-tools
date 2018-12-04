import React, {PureComponent} from 'react';
import {Card} from 'antd';
import styles from './module.component.less'
import radarThumb from '../../assets/radar_thumb.png'

const bodyStyle = {padding: 0};

export default class RadarComponent extends PureComponent {

  render() {
    const cardProps = {
      title: '激光雷达',
      className: styles.radar,
      bordered: false,
      bodyStyle,
      cover: <img alt="radar" src={radarThumb}/>
    }

    return (
      <Card {...cardProps}>
      </Card>
    );
  }
}
