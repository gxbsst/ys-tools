import React, { PureComponent } from 'react';
import { Carousel, Card } from 'antd';
import autodata from '../../decorators/AutoData';
import styles from './Workplace.less';

const bodyStyle = { padding: 0 };

@autodata({
  url: '/api/mien',
  query: { positionCon: 2 },
  mergeQueryFromLocation: false
})
export default class Mien extends PureComponent {
  state = {
    width: null
  };

  getWidth = element => {
    if (element) {
      this.setState({
        width: element.offsetWidth
      });
    }
  };

  render() {
    const { width } = this.state;
    const { $data: { data, starting } } = this.props;
    return (
      <Card className={styles.card} title="风采" bordered={false} loading={starting} bodyStyle={bodyStyle}>
        <div ref={this.getWidth}>
          {
            width ? (
              <Carousel autoplay>
                {data.map(entity => (
                  <div className={styles.carouselItem} key={entity.id}>
                    <div className={styles.image} style={{ backgroundImage: `url(${ entity.image }?imageMogr2/crop/${ ~~(width * 1.5) }x390/quality/65)` }}/>
                    <div className={styles.desc}>{entity.content}</div>
                  </div>
                ))}
              </Carousel>
            ) : null
          }
        </div>
      </Card>
    );
  }
}
