import React, { PureComponent } from 'react';
import { Link } from 'dva/router';
import { Row, Col, Card, Icon } from 'antd';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import can from '../../../decorators/Can';
import BatchImporter from './_BatchImporter';
import { enterMap } from '../../../utils/paramsMap';
import styles from './style.less';

@can(2002000)
export default class ClewEntry extends PureComponent {
  render() {
    const { can } = this.props;

    const batchImportRetail = 2002001; //新零售线索导入
    const batchImportArrival = 2002002; //到店线索导入

    const enterPermissions = [...new Set(enterMap.reduce((prev, next) => (
      {permissions: [...((prev && prev.permissions) || []), ...next.permissions]}
    )).permissions)];

    return (
      <PageHeaderLayout className={styles.entryErea}>
        {
          can(batchImportRetail, batchImportArrival) &&
          <Card title="批量导入至线索库" bordered={false} className={styles.followCard}>
            <div className={styles.uploadErea}>
              <Row gutter={48} className={styles.dragRow}>
                {
                  can(batchImportRetail) &&
                  <Col span={9}>
                    <BatchImporter title="新零售线索录入" fromType="1" />
                  </Col>
                }
                {
                  can(batchImportArrival) &&
                  <Col span={9}>
                    <BatchImporter title="到店线索录入" fromType="2" />
                  </Col>
                }
              </Row>
            </div>
          </Card>
        }
        {
          can(...enterPermissions) &&
          <Card title="单条录入" bordered={false} className={styles.followCard}>
            <div className={styles.uploadErea} >
              <div className={styles.enterBox}>
                {
                  enterMap.map((item) => (
                    can(item.permissions) &&
                    <div key={item.url} style={{width: '160px'}}>
                      <Link className="" to={`/clew/entry/${item.url}`}>
                        <Icon type="plus" />
                        <div>{item.type}</div>
                      </Link>
                    </div>
                  ))
                }
              </div>
            </div>
          </Card>
        }
      </PageHeaderLayout>
    )
  }
}
