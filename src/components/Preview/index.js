import React, { PureComponent } from 'react';
import { Popover, Spin } from 'antd';
import WMC from '../../utils/wmc';
import styles from './index.less';

export default class Preview extends PureComponent {
  constructor(props) {
    super(props);
    this.wmc = new WMC();
    this.state = {
      visible: false,
      loading: false,
      isReady: false,
    };
  }

  onMouseEnter = (src) => () => {
    this.timeout = setTimeout(() => {
      const { isReady } = this.state;
      if (isReady) {
        this.setState({ visible: true });
      } else {
        const { Image } = window;
        const image = new Image();
        image.onload = () => {
          this.setState({ isReady: true, loading: false });
        };
        image.src = src;
        this.setState({ visible: true, loading: true });
      }
    }, 300);
  };

  onMouseLeave = () => {
    clearTimeout(this.timeout);
    this.setState({ visible: false, loading: false });
  };

  render() {
    const { src, ratio, width = 300, height = 260, crop, store, children, ...restProps } = this.props;
    const { visible, loading } = this.state;
    const imageStyle = { width, height: ratio ? width * ratio : height };
    const image = this.wmc.cdn(src, { ...imageStyle, crop: _.isBoolean(crop) ? crop : !!ratio }, store);
    const content = (
      <div className={styles.container} style={imageStyle}>
        <Spin spinning={loading} delay={20}>
          <img className={styles.preview} src={image}/>
        </Spin>
      </div>
    );
    const props = {
      placement: 'right',
      onMouseEnter: this.onMouseEnter(image),
      onMouseLeave: this.onMouseLeave,
      visible,
      content,
      ...restProps,
    };
    return <Popover {...props}>{children}</Popover>;
  }
}
