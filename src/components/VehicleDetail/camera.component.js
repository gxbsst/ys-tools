import React, {PureComponent} from 'react';
import {Card, Icon} from 'antd';

import styles from './module.component.less'

const bodyStyle = {padding: 0};

export default class CameraComponent extends PureComponent {

  render() {
    const cardProps = {
      title: '摄像头',
      className: styles.camera,
      bordered: false,
      bodyStyle,
    };

    const {dataSource: {cameras}} = this.props;

    return (
      <Card {...cardProps}>
        <table>
          <tbody>
          <tr>
            {
              cameras ? (
                cameras.map((camera, index) => {
                  return (
                    <td key={camera.id} className={"td"+index}>
                      {camera.name}<br/>
                      <Icon className="green" type="camera"/>{camera.status}
                    </td>
                  )
                })

              ) : null
            }
          </tr>

          </tbody>
        </table>
      </Card>
    );
  }
}
