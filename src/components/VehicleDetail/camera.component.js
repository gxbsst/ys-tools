import React, {PureComponent} from 'react';
import {Card, Icon} from 'antd';

import styles from 'module.component.less'

const bodyStyle = {padding: 0};

export default class CameraComponent extends PureComponent {

  render() {
    const cardProps = {
      title: '摄像头',
      className: styles.card,
      bordered: false,
      bodyStyle,
    };

    const {dataSource: {camera}} = this.props;

    console.log(camera);

    return (
      <Card {...cardProps}>
        <table>
          <tbody>
          <tr>
            {
              camera ? (
                camera.map((c) => {
                  return (
                    <td key={c.id}>
                      {c.name}<br/>
                      <Icon type="camera"/>{c.status}
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
