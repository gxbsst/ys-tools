import React, { PureComponent } from 'react';
import { message } from 'antd';
import Clipboard from 'clipboard';

export default class Copy extends PureComponent {
  static defaultProps = {
    text: '',
    message: '已成功复制至粘贴板',
    error: '复制失败'
  };

  componentDidMount() {
    const { ref } = this;
    if (ref) {
      const { text, message: title, error } = this.props;
      const clipboard = new Clipboard(ref, { text: () => text });
      clipboard.on('success', () => message.success(title));
      clipboard.on('error', () => message.error(error));
    }
  }

  saveRef = (ref) => {
    this.ref = ref;
  };

  render() {
    const { children } = this.props;
    return <span ref={this.saveRef}>{children}</span>;
  }
}
