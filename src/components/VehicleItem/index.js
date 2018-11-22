import React, {PureComponent} from 'react';

export default class VehicleItem extends PureComponent {
  render() {
    const {car} = this.props;
    return (<div className="vehicle_item">
      <div className="basic">
        <h2>{car.name}</h2>
        <p>{car.num}</p>
        <p>{car.line}</p>
      </div>
      <div className="avaiable">
        <table>
          <tbody>
          <tr>
            <td>内存</td>
            <td>....</td>
            <td>可用</td>
            <td>{car.hardware.mem} / {car.mem}</td>
          </tr>
          <tr>
            <td>磁盘</td>
            <td>....</td>
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

    </div>);
  }
}
