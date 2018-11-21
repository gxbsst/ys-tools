import React, { PureComponent } from 'react';
import classNames from 'classnames';
import styles from './index.less';

export default class Shining extends PureComponent {
  static defaultProps = {
    duration: .5,
    times: 2,
  };

  state = {
    active: false,
  };

  componentDidMount() {
    const { onMounted } = this.props;
    _.isFunction(onMounted) && onMounted.bind(this)(this);
  }

  play = () => {
    const { active } = this.state;
    const { duration, times } = this.props;
    if (!active) {
      this.setState({ active: true });
      setTimeout(() => {
        this.setState({ active: false });
      }, duration * times * 1000);
    }
  };

  render() {
    const { className, delay, times, children } = this.props;
    const { active } = this.state;
    const style = { animation: active ? `shining ${delay}s ${times} ease-in` : 'none' };
    return (
      <div className={classNames(className, styles.shining, active ? styles.active : null)}>
        {children}
        <div className={styles.mask}/>
      </div>
    );
  }
}
