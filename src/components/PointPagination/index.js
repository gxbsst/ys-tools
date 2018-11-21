import React, { PureComponent } from 'react';
import { Pagination } from 'antd';
import classNames from "classnames";
import styles from './index.less';

export default class PointPagination extends PureComponent {
  getPaginationItem = current => (page, type) => (
    type === 'page' ? <span className={classNames(page === current ? 'active' : null)}/> : null
  );

  render() {
    const {props} = this;
    return <Pagination className={styles.pagination} size="small" showTitle={false} itemRender={this.getPaginationItem(props.page)} {...props}/>
  }
}