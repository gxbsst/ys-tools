import React, {PureComponent} from 'react';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import {Card, Col, Row} from 'antd';
import VehicleItem from '../../components/VehicleItem';
import autodata from '../../decorators/AutoData';
import {can} from '../../decorators';

@autodata({
  url: '/api/vehicles'
})
export default class Vehicle extends PureComponent {
  state = {
    cars: []
  }

  render() {
    const { $data: { data, pagination, loading, starting } } = this.props;

    return (
      <PageHeaderLayout>

        <Card className="flex-item" bordered={false} loading={starting}>
        <Row gutter={10}>
          {data ?  (data.map((car) => (
            <Col  xl={6} lg={8}  md={10} key={car.num}>
            <VehicleItem car={car}/>
            </Col>
            ))) : null}
        </Row>
        </Card>
      </PageHeaderLayout>
    )
  }
}
