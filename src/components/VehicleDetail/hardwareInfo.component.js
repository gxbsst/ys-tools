import React, {PureComponent} from 'react';
import { Card, Button, Divider, Progress, Icon } from 'antd';
import { MiniArea } from 'ant-design-pro/lib/Charts';
import styles from 'module.component.less'
import hardwareInfo from './../VehicleItem/index.less';
import moment from 'moment/moment';

const bodyStyle = {padding: 0};

// TODO: 替换成真实数据
const visitData = [];
const beginDay = new Date().getTime();
for (let i = 0; i < 20; i += 1) {
  visitData.push({
    x: moment(new Date(beginDay + (1000 * 60 * 60 * 24 * i))).format('YYYY-MM-DD'),
    y: Math.floor(Math.random() * 100) + 10,
  });
}

export default class HardwareInfoComponent extends PureComponent {
  render() {
    const cardProps = {
      title: '系统负载',
      className: styles.card,
      bordered: false,
      bodyStyle,
    };

    const {dataSource} = this.props;
    const {hardware} = dataSource;
    return (
      <Card {...cardProps}>
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
              <td className="td4"><span className="blue">{hardware.mem}</span> / {dataSource.mem}</td>
            </tr>
            <tr>
              <td>磁盘</td>
              <td><Progress percent={70} /></td>
              <td>可用</td>
              <td><span className="blue">{hardware.disk} </span></td>
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
              <td><span className="blue">{hardware.cpu}</span></td>
            </tr>
            </tbody>
          </table>
        </div>
      </Card>
    );
  }
}
