import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Select } from '../Helpers';
import { enums } from '../../utils';

@connect(({ user: { productLines } }) => ({ productLines }))
export default class ProductLine extends PureComponent {
  static defaultProps = {
    placeholder: '请选择产品线',
  };

  constructor(props) {
    super(props);
    const { form: { setFieldsValue }, id, productLines } = props;
    const options = _.filter(enums('PRODUCT_LINE'), ({ value }) => _.includes(productLines, value));
    setFieldsValue({ [id]: _.get(_.first(options), 'value') });
    this.state = { options };
  }

  render() {
    const { options } = this.state;
    return <Select {...this.props} options={options}/>;
  }
}
