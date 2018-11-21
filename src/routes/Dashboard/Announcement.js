import React, { PureComponent } from 'react';
import { List, Card, Spin, Button } from 'antd';
import Pagination from '../../components/PointPagination';
import autodata from '../../decorators/AutoData';
import Dialog from '../../components/Dialog';
import styles from './Workplace.less';

@autodata({
  url: '/api/announcement',
  query: {
    isHomePage: 1,
    pageSize: 6
  },
  mergeQueryFromLocation: false
})
export default class Announcement extends PureComponent {
  show = ({ title, type, link: content }) => () => {
    switch (type) {
      case 1:
        return Dialog.open({
          title,
          content,
          footerRender() {
            return (
              <div style={{ textAlign: 'center' }}>
                <Button type="primary" onClick={this.destroy}>我知道了</Button>
              </div>
            );
          }
        });
      case 2:
        return window.open(content);
    }
  };

  render() {
    const { $data: { data, pagination, starting, loading } } = this.props;
    const cardProps = {
      title: '公告',
      className: styles.card,
      bordered: false,
      loading: starting,
      extra: <Pagination {...pagination}/>
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
