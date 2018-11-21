import { PureComponent } from 'react';
import { Input, Form, Row, Col, Spin } from 'antd';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import styles from './index.less';
import _ from 'lodash';
const { Item: FormItem } = Form;

export default class FormItemGroup extends PureComponent {
  static propTypes = {
    cols: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.arrayOf(PropTypes.number),
    ]),
    items: PropTypes.array.isRequired,
    form: PropTypes.object.isRequired,
    loading: PropTypes.bool,
  };

  getItems = (items, span) => {
    const { form: { getFieldDecorator }, cols, layout } = this.props;
    let formLayout;
    // 若为数字时表示labelCol.span, wrapperCol.span据此自动计算
    if (_.isNumber(layout)) {
      formLayout = { labelCol: { span: layout }, wrapperCol: { span: 24 - layout } };
    }
    return items.map((item, i) => {
      if (!item) return null;
      if (_.isArray(item)) {
        const chunks = _.isArray(cols) ? cols.length : cols;
        item = _.take(item.concat(_.times(chunks, _.constant(null))), chunks);
        let span = null;
        if (_.isNumber(cols)) {
          span = 24 / cols;
        } else if (_.isArray(cols)) {
          span = cols;
        }
        return <Row gutter={24} key={i}>{this.getItems(item, span)}</Row>;
      }
      const {
        name, label, className, span: colspan, component: ItemComponent = Input, placeholder = `${ItemComponent === Input ? '请输入' : '请选择'}${label}`,
        value: initialValue, options = {}, required, type, max, message = `${label}不能为空`, layout: itemLayout = formLayout, ...restProps
      } = item;
      const rules = [];
      const rule = _.pickBy({ required, type });
      if (!_.isEmpty(rule)) {
        rules.push({ ...rule, message });
      }
      if (_.isNumber(max)) {
        rules.push({ max, message: `最大长度不能超过${max}个字符` });
      }
      const itemProps = {
        ...(itemLayout || { className: 'flex-row' }),
        key: name,
        label,
      };
      const field = (
        <FormItem {...itemProps}>
          {getFieldDecorator(name, { initialValue, rules, ...options })(<ItemComponent className={classNames('blocked', className)} placeholder={placeholder} maxLength={max} {...restProps}/>)}
        </FormItem>
      );
      if (span || colspan) {
        return <Col span={colspan || (_.isArray(span) ? span[i] : span)} key={name}>{field}</Col>;
      }
      return field;
    });
  };

  render() {
    let { items, cols, loading = false, className } = this.props;
    if (cols) items = _.chunk(items, _.isArray(cols) ? cols.length : cols);
    return <Spin spinning={loading} delay={20} wrapperClassName={classNames(styles.formItemsGroup, className)}>{this.getItems(items)}</Spin>;
  }
}
