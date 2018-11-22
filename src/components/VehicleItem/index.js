import React, {PureComponent} from 'react';
import { Card, Button, Divider, Progress, Icon } from 'antd';
import { MiniArea } from 'ant-design-pro/lib/Charts';

import styles from './index.less';
const bodyStyle = { padding: 10 };
import moment from 'moment';

const visitData = [];
const beginDay = new Date().getTime();
for (let i = 0; i < 20; i += 1) {
  visitData.push({
    x: moment(new Date(beginDay + (1000 * 60 * 60 * 24 * i))).format('YYYY-MM-DD'),
    y: Math.floor(Math.random() * 100) + 10,
  });
}

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
                <td className="td2"><div className="available_mem">
                  {/*TODO: 使用组件实现*/}
                  <span className="dot-h"></span>
                  <span className="dot-h"></span>
                  <span className="dot-h"></span>
                  <span className="dot-l"></span>
                  <span className="dot-l"></span>
                </div></td>
                <td className="td3">可用</td>
                <td className="td4"><span className="blue">{car.hardware.mem}</span> / {car.mem}</td>
              </tr>
              <tr>
                <td>磁盘</td>
                <td><Progress percent={70} /></td>
                <td>可用</td>
                <td><span className="blue">{car.hardware.disk} </span></td>
              </tr>
              <tr>
                <td>CPU</td>
                <td> <MiniArea
                  line
                  color="#cceafe"
                  height={20}
                  data={visitData}
                /></td>
                <td>加载</td>
                <td><span className="blue">{car.hardware.cpu}</span></td>
              </tr>
              </tbody>
            </table>
            <div className="network">
              网络： <Icon type="desktop" className="green" /> <Icon className="blue" type="arrow-up" />{car.network.network_upload} <Icon type="arrow-down" className="blue" />{car.network.network_download}
            </div>
          </div>
        </div>
      </Card>);
  }
}
