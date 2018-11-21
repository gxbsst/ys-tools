import React, { Component } from 'react';

export function fixedZero(val) {
  return val * 1 < 10 ? `0${val}` : val;
}
// 判断浏览器类型
export function myBrowser(){
  const userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
  const isOpera = userAgent.indexOf("Opera") > -1;
  if (isOpera) {
    return "Opera"
  }; //判断是否Opera浏览器
  if (userAgent.indexOf("Firefox") > -1) {
    return "FF";
  } //判断是否Firefox浏览器
  if (userAgent.indexOf("Chrome") > -1){
    return "Chrome";
  }
  if (userAgent.indexOf("Safari") > -1) {
    return "Safari";
  } //判断是否Safari浏览器
  if (userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1 && !isOpera) {
    return "IE";
  }; //判断是否IE浏览器
}
class CountDown extends Component {
  constructor(props) {
    super(props);

    const { lastTime } = this.initTime(props);

    this.state = {
      lastTime,
    };
  }

  componentDidMount() {
    this.tick();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.target !== nextProps.target) {
      clearTimeout(this.timer);
      const { lastTime } = this.initTime(nextProps);
      this.setState({
        lastTime,
      }, () => {
        this.tick();
      });
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  timer = 0;
  interval = 1000;
  initTime = (props) => {
    let lastTime = 0;
    let targetTime = 0;
    let maybeTimeString = props.target;
    try {
      if (Object.prototype.toString.call(maybeTimeString) === '[object Date]') {
        targetTime = maybeTimeString.getTime();
      } else {
        if (typeof maybeTimeString === 'string') {
          if (myBrowser() === 'Safari') {
            maybeTimeString = maybeTimeString.replace(/\-/g, '/');
          }
        }
        targetTime = new Date(maybeTimeString).getTime();
      }
    } catch (e) {
      throw new Error('invalid target prop', e);
    }

    lastTime = targetTime - new Date().getTime();
    if (lastTime <= 0 || !lastTime) { // 已过期
      lastTime = 0;
    }
    return {
      lastTime,
    };
  }
  // defaultFormat = time => (
  //  <span>{moment(time).format('hh:mm:ss')}</span>
  // );
  defaultFormat = (time) => {
    const hours = 60 * 60 * 1000;
    const minutes = 60 * 1000;

    const h = fixedZero(Math.floor(time / hours));
    const m = fixedZero(Math.floor((time - (h * hours)) / minutes));
    const s = fixedZero(Math.floor((time - (h * hours) - (m * minutes)) / 1000));
    return (
      <span>{h}:{m}:{s}</span>
    );
  }
  tick = () => {
    const { onEnd } = this.props;
    let { lastTime } = this.state;

    this.timer = setTimeout(() => {
      if (lastTime < this.interval) {
        clearTimeout(this.timer);
        this.setState({
          lastTime: 0,
        }, () => {
          if (onEnd) {
            onEnd();
          }
        });
      } else {
        lastTime -= this.interval;
        this.setState({
          lastTime,
        }, () => {
          this.tick();
        });
      }
    }, this.interval);
  }

  render() {
    const { format = this.defaultFormat, ...rest } = this.props;
    const { lastTime } = this.state;

    const result = format(lastTime);

    return (<span {...rest}>{result}</span>);
  }
}

export default CountDown;
