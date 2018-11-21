import React, { PureComponent } from 'react';
import { Row, Col } from 'antd';
import _ from 'lodash';
import autodata from '../../decorators/AutoData';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import Mien from './Mien';
import Announcement from './Announcement';
import Rank from './Rank';
import Message from './Message';

const modules = [
  { name: 'mien', component: Mien },
  { name: 'announcement', component: Announcement },
  { name: 'rank', component: Rank },
];

@autodata('/api/portal')
export default class Workplace extends PureComponent {
  render() {
    const { $data: { data } } = this.props;
    return (
      <PageHeaderLayout>
        <Row gutter={10}>
          {modules.map(({ name, component: ModuleComponent }) => _.some(data, { name, status: 1 }) ? (
            <Col xl={8} lg={12} md={24} key={name}>
              <ModuleComponent/>
            </Col>
          ) : null)}
          <Col xl={8} lg={12} md={24}><Message/></Col>
        </Row>
      </PageHeaderLayout>
    );
  }
}
