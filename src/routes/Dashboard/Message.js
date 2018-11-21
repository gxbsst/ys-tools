import React, { PureComponent } from 'react';
import { List, Card, Spin } from 'antd';
import { routerRedux } from 'dva/router';
import Pagination from '../../components/PointPagination';
import autodata from '../../decorators/AutoData';
import styles from './Workplace.less';

@autodata({
  url: '/api/message',
  query: { pageSize: 6 },
  mergeQueryFromLocation: false
})
export default class Message extends PureComponent {
  show = ({ url }) => () => {
    // window.open(url);
    url && this.props.dispatch(routerRedux.push(url.replace(/^\/#\//, '/')));
  };

  render() {
    const { $data: { data, pagination, starting, loading } } = this.props;
    const cardProps = {
      title: '我的消息',
      className: styles.card,
      bordered: false,
      extra: <Pagination {...pagination}/>,
      loading: starting,
    };
    return (
      <Card {...cardProps}>
        <Spin spinning={!starting && loading} delay={100}>
          <List bordered={false} dataSource={data} renderItem={item => (
            <List.Item className={styles.listItem} onClick={this.show(item)}>{item.title}</List.Item>
          )}/>
        </Spin>
      </Card>
    );
  }
}
