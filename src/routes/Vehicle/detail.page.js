import React, {PureComponent} from 'react';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import {Col, Row} from 'antd';
import autodata from '../../decorators/AutoData';
import ModuleComponent from '../../components/VehicleDetail/module.component';
import CanComponent from '../../components/VehicleDetail/can.component';
import GPSComponent from '../../components/VehicleDetail/gps.component';
import RadarComponent from '../../components/VehicleDetail/radar.component';
import HardwareInfoComponent from '../../components/VehicleDetail/hardwareInfo.component';
import CameraComponent from '../../components/VehicleDetail/camera.component';
import NetworkComponent from '../../components/VehicleDetail/network.component';

@autodata({
  url: '/api/vehicles/:id'
})
export default class VehicleDetailPage extends PureComponent {
  state = {
    data: []
  }

  render() {
    const {$data: {data}} = this.props;

    return (
      <PageHeaderLayout>
        {
          data ? (
            <Row gutter={10}>
              <Col xl={12} lg={14} md={16} >
                <Row gutter={10}>
                  <Col>
                    <ModuleComponent dataSource={data.modules} />
                  </Col>
                </Row>
                <Row gutter={10}>
                  <Col xl={12} lg={8} md={10} >
                    <CanComponent dataSource={data.can}/>
                  </Col>
                  <Col xl={12} lg={8} md={10} >
                    <GPSComponent dataSource={data.gps}/>
                  </Col>
                </Row>
              </Col>

              <Col xl={12} lg={14} md={16} >
                <Row gutter={10}>
                  <Col xl={12} lg={8} md={10} >
                    <RadarComponent dataSource={data}/>
                  </Col>
                  <Col xl={12} lg={8} md={10} >
                    <CameraComponent dataSource={data}/>
                  </Col>
                </Row>
                <Row gutter={10}>
                  <Col xl={12} lg={8} md={10} >
                    <HardwareInfoComponent dataSource={data}/>
                  </Col>
                  <Col xl={12} lg={8} md={10} >
                    <NetworkComponent dataSource={data}/>
                  </Col>
                </Row>
              </Col>

            </Row>
          ) : null
        }

      </PageHeaderLayout>
    )
  }
}
