import React, { PureComponent } from 'react';
import _ from 'lodash';
import WMC from '../../utils/wmc';
import Preview from '../Preview';
import PropTypes from 'prop-types';

export default class Image extends PureComponent {
  constructor(props) {
    super(props);
    this.wmc = new WMC();
  }

  render() {
    const { src, width, height, preview, ...restProps } = this.props;
    const image = <img src={this.wmc.cdn(src, { width, height })} {...restProps}/>;
    if (preview) {
      const props = { src, ratio: height / width };
      if (_.isBoolean(preview)) {
        _.merge(props, { width: 300 });
      } else if (_.isNumber(preview)) {
        _.merge(props, { width: preview });
      } else if (_.isPlainObject(preview)) {
        _.merge(props, preview);
      }
      return <Preview {...props}>{image}</Preview>;
    }
    return image;
  }
}
