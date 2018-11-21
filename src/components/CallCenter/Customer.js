import React, { PureComponent, Fragment } from 'react';
import { Divider, Button } from 'antd';
import { Link } from 'react-router-dom';
import autodata from '../../decorators/AutoData';
import styles from './index.less';

@autodata('/api/sources/customers')
export default class CallCenterCustomer extends PureComponent {
  addClew = () => {
    const { query: { mobile } } = this.props;
    window.location.href = `/#/clew/entry/clewPool?clew=${encodeURIComponent(JSON.stringify({ clewFromSource: [1000, 1005], customerLinks: [{ mobile }] }))}`;
  };

  render() {
    const { $data: { data: customers } } = this.props;
    let content = null;
    if (customers) {
      if (customers.length) {
        content = (
          <div className={styles.customers}>
            {customers.map(({ id, clewId, shopName, handler }) => (
              <div className={styles.customer} key={id}>
                <div>{shopName}</div>
                <Link to={`/aftersale/details/${id}`}>查看</Link>
              </div>
            ))}
          </div>
        );
      } else {
        content = (
          <div className={styles.addClew}>
            <Button type="primary" onClick={this.addClew}>新增线索</Button>
          </div>
        );
      }
    }
    return (
      <Fragment>
        <Divider/>
        {content}
      </Fragment>
    );
  }
}
