import React, {PureComponent} from 'react';
import { Card, Button, Divider, Progress } from 'antd';
import { MiniArea } from 'ant-design-pro/lib/Charts';

import styles from './index.less';
const bodyStyle = { padding: 10 };

export default class VehicleItem extends PureComponent {

  state = {
    width: null,
  };

  getWidth = element => {
    if (element) {
      this.setState({
        width: element.offsetWidth
      });
    }
  };

  render() {
    const {width} = this.state;
    const {car} = this.props;

    return (
      <Card className={styles.card}  bordered={false} bodyStyle={bodyStyle}>
        <div className="vehicle_item">
          <div className="basic">
            <Button type="primary">{car.name}</Button>
            <p>{car.num}</p>
            <p>{car.line}</p>
          </div>
          <Divider  />

          <div className="available">
            <table>
              <tbody>
              <tr>
                <td className="td1">内存</td>
                <td className="td2">....</td>
                <td className="td3">可用</td>
                <td className="td4">{car.hardware.mem} / {car.mem}</td>
              </tr>
              <tr>
                <td>磁盘</td>
                <td><Progress percent={70} /></td>
                <td>可用</td>
                <td>{car.hardware.disk} </td>
              </tr>
              <tr>
                <td>CPU</td>
                <td>....</td>
                <td>可用</td>
                <td>{car.hardware.cpu}</td>
              </tr>
              </tbody>
            </table>
            <div className="network">
              网络： {car.network.network_upload} {car.network.network_download}
            </div>
          </div>
        </div>
      </Card>);
  }
}
