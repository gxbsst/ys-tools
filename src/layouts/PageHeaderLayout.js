import React from 'react';
import { Link } from 'dva/router';
import classNames from 'classnames';
import PageHeader from '../components/PageHeader';
import styles from './PageHeaderLayout.less';

export default ({ children, wrapperClassName, headerClassName, className, top, ...restProps }) => (
  <div className={classNames('flex-column', wrapperClassName)}>
    {top}
    <PageHeader className={classNames(headerClassName)} {...restProps} linkElement={Link}/>
    {children ? <div className={classNames('flex-item', styles.content, className)}>{children}</div> : null}
  </div>
);
