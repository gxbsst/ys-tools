import React, { PureComponent } from 'react';
import { fixedZero } from '../../utils';
import moment from 'moment';

const instances = {};
let increase = 0;
let timer;

export default class Timer extends PureComponent {
  componentWillMount() {
    this.id = increase += 1;
    instances[this.id] = this;
    if (!timer) {
      timer = setInterval(() => _.forEach(instances, instance => instance.tick()), 1000);
    }
  }

  componentWillUnmount() {
    delete instances[this.id];
    if (_.isEmpty(instances)) {
      clearInterval(timer);
      timer = null;
    }
  }

  tick = () => {
    this.forceUpdate();
  };

  render() {
    const { from, ...restProps } = this.props;
    const diff = moment().diff(moment(from), 's');
    const minute = 60;
    const hour = minute * 60;
    const hh = fixedZero(~~(diff / hour));
    const mm = fixedZero((~~(diff / minute) % 60));
    const ss = fixedZero(diff % 60);
    return <span {...restProps}>{hh}:{mm}:{ss}</span>;
  }
}
