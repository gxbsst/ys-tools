import React, { PureComponent } from 'react';
import { Upload, Icon, message } from 'antd';
import PropTypes from 'prop-types';
import _ from 'lodash';
import classNames from 'classnames';
import Preview from '../Preview';
import withSetProps from '../../decorators/WithSetProps';
import WMC from '../../utils/wmc';
import styles from './index.less';

export default class WMCUpload extends PureComponent {
  static defaultProps = {
    accessKey: 2304325,
  };

  static propTypes = {
    accessKey: PropTypes.number.isRequired,
  };

  constructor(props) {
    super(props);
    const { accessKey } = props;
    this.wmc = new WMC(accessKey);
  }

  render() {
    const { accessKey } = this.wmc;
    const { content, render, ...restProps } = this.props;
    const props = {
      action: '/wmc/upload',
      listType: 'picture-card',
      withCredentials: false,
      showUploadList: false,
      headers: { accessKey },
      ...restProps,
    };
    return (
      <Upload {...props}>
        {_.isFunction(render) ? render(props) : content}
      </Upload>
    );
  }
}

@withSetProps()
class Image extends PureComponent {
  static defaultProps = {
    accessKey: 2304325,
  };

  static propTypes = {
    accessKey: PropTypes.number.isRequired,
  };

  constructor(props) {
    super(props);
    const { accessKey } = props;
    this.wmc = new WMC(accessKey);
  }

  onSuccess = ({ code, msg, data }) => {
    const { setProps, onSuccess, onError } = this.props;
    if (code) {
      _.isFunction(onError) && onError.call(this, { code, msg });
      return message.error(msg);
    }
    setProps({ src: data.url, uploading: false });
    _.isFunction(onSuccess) && onSuccess.call(this, data);
  };

  onError = (...args) => {
    const { setProps, onError } = this.props;
    setProps({ uploading: false });
    _.isFunction(onError) && onError.apply(this, args);
  };

  onStart = (...args) => {
    const { setProps, onStart } = this.props;
    setProps({ uploading: true });
    _.isFunction(onStart) && onStart.apply(this, args);
  };

  render() {
    const { src, width = 120, height = 80, uploading, text, preview, content, ...restProps } = this.props;
    const defaultContent = (
      <div className="wmc-upload-image-mask flex-row flex-middle">
        <div className="flex-item">
          <Icon type={uploading ? 'loading' : 'to-top'}/>
          {text ? <div className="ant-upload-text">{text}</div> : null}
        </div>
      </div>
    );
    const previewContent = <Preview src={src} ratio={height / width}>{content}</Preview>;
    const uploaderProps = {
      accept: 'image/*',
      className: classNames('wmc-upload-image', uploading ? styles.uploading : null, !src ? styles.visible : null),
      style: { width, height },
      content: preview ? content || defaultContent : previewContent,
      ...restProps,
    };
    src && _.set(uploaderProps, 'style.backgroundImage', `url(${this.wmc.cdn(src, { width, height })})`);
    return <WMCUpload {...uploaderProps} onStart={this.onStart} onSuccess={this.onSuccess} onError={this.onError}/>;
  }
}

WMCUpload.Image = Image;
