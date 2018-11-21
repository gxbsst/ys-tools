import React, { PureComponent, Fragment } from 'react';
import {
  Spin, Radio, Row, Col, Divider, Icon, Checkbox,
  Tooltip as AntTooltip, Popconfirm as AntPopconfirm, Select as AntSelect
} from 'antd';
import { Link } from 'dva/router';
import classNames from 'classnames';
import { currency, intercept, toHashPath } from '../../utils';
import styles from './index.less';
import PropTypes from 'prop-types';

const { Option } = AntSelect;

export const A = props => {
  const { children, dispatch, ...restProps } = props;
  return <a {...restProps}>{children}</a>;
};

export const Span = props => {
  const { children, dispatch, ...restProps } = props;
  return <span {...restProps}>{children}</span>;
};

export const Email = props => {
  const { children, to = children, dispatch, ...restProps } = props;
  if (to) {
    if (/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(to)) {
      const content = children ? <span className="icon-after-text">{children}</span> : null;
      return <a href={`mailto:${to}`} {...restProps}><Icon type="mail"/>{content}</a>;
    }
    return to;
  }
  return <span {...restProps}>{children}</span>;
};

export const Currency = props => {
  const { value, dispatch, ...restProps } = props;
  return <span {...restProps} dangerouslySetInnerHTML={{ __html: currency(value) }}/>;
};

export const Ellipsis = props => {
  const { children, className, width, maxWidth, maxLength, dispatch, ...restProps } = props;
  const style = { width, maxWidth };
  const mergeProps = {
    className: classNames(styles.ellipsis, className),
    ...restProps,
  };
  let text = children;
  if (!width && !maxWidth && maxLength) {
    text = intercept(text, maxLength);
  } else if (!_.isEmpty(style)) {
    mergeProps.style = style;
  }
  return <span {...mergeProps}>{text}</span>;
};

export const LevelCrumb = props => {
  const { items, className, dispatch, ...restProps } = props;
  const mergeProps = {
    className: classNames(styles.levelCrumb, className),
    ...restProps,
  };
  return (
    <span {...mergeProps}>
      {items.map((item, key) => {
        if (_.isString(item)) {
          item = { text: item };
        }
        const { text, component: Component = Span, className, ...restProps } = item;
        const mergeProps = {
          className: classNames(styles.levelCrumbItem, className),
          ...restProps,
          key
        };
        return <Component {...mergeProps}>{text}</Component>;
      })}
    </span>
  );
};

export const Tooltip = props => {
  const { title, icon = 'info-circle-o', type = 'info', className, ...restProps } = props;
  if (title) {
    return (
      <AntTooltip title={title}>
        <Icon className={classNames(styles.helper, styles[type], className)} type={icon} {...restProps}/>
      </AntTooltip>
    );
  }
  return null;
};

export const ColumnGroup = props => {
  const { items, spacing = 50, col, loading = false, className, itemClassName } = props;
  let columns;
  if (col) {
    columns = (
      <Row className={classNames('column-group column-group-row', className)} gutter={24}>
        {items.map(({ value, label, col: itemCol }, i) => (
          <Col className={classNames('column-group-item', itemClassName)} span={itemCol || col} key={i}>
            <label className="column-group-label">{label}</label>
            <span className="column-group-value">{value}</span>
          </Col>
        ))}
      </Row>
    );
  } else {
    columns = (
      <div className={classNames('column-group', className)}>
        {items.map((item, i) => {
          const itemProps = {
            key: i,
            className: classNames('column-group-item', itemClassName)
          };
          if (i) itemProps.style = { marginLeft: spacing };
          return (
            <span {...itemProps}>
              <label className="column-group-label">{item.label}</label>
              <span className="column-group-value">{item.value}</span>
            </span>
          );
        })}
      </div>
    );
  }
  return <Spin spinning={loading} delay={20}>{columns}</Spin>;
};

export class CheckboxGroup extends PureComponent {
  static defaultProps = {
    withCheckAll: false,
    checkAllText: '全选',
    defaultValue: [],
  };

  static propTypes = {
    withCheckAll: PropTypes.bool,
    checkAllText: PropTypes.string,
    defaultValue: PropTypes.array,
    options: PropTypes.array.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = { value: props.defaultValue };
  }

  onCheckAllChange = (e) => {
    const { checked: checkAll } = e.target;
    const { options, onChange } = this.props;
    const value = checkAll ? options.map(item => item.value) : [];
    onChange && onChange(value);
    this.setState({ value });
  };

  onChange = (value) => {
    const { onChange } = this.props;
    _.isFunction(onChange) && onChange.bind(this)(value);
    this.setState({ value });
  };

  render() {
    const { value } = this.state;
    const { options, withCheckAll, checkAllText, className } = this.props;
    const count = options.length;
    const checkedCount = value.length;
    const indeterminate = checkedCount && (checkedCount < count);
    let checkAll = null;
    if (withCheckAll) {
      checkAll = (
        <Fragment>
          <Checkbox indeterminate={indeterminate} onChange={this.onCheckAllChange} checked={checkedCount === count}>{checkAllText}</Checkbox>
          <Divider type="vertical"/>
        </Fragment>
      );
    }
    return (
      <div className={classNames('checkbox-group', className)}>
        {checkAll}
        <Checkbox.Group value={value} onChange={this.onChange}>
          {options.map(item => <Checkbox value={item.value} key={item.value}>{item.label}</Checkbox>)}
        </Checkbox.Group>
      </div>
    );
  }
}

export class Select extends PureComponent {
  static defaultProps = {
    valuePropName: 'value',
    labelPropName: 'label',
  };

  static propTypes = {
    options: PropTypes.array,
    valuePropName: PropTypes.string,
    labelPropName: PropTypes.string,
    labelRender: PropTypes.func,
  };

  render() {
    const { options: items = [], valuePropName, labelPropName, labelRender, children, ...restProps } = this.props;
    let options = children;
    if (!options) {
      options = items.map(option => {
        const value = option[valuePropName];
        const label = _.isFunction(labelRender) ? labelRender(option) : option[labelPropName];
        return <Option value={value} key={value}>{label}</Option>;
      });
    }
    return <AntSelect {...restProps}>{options}</AntSelect>;
  }
}

export const Stars = props => {
  const { count, className, ...restProps } = props;
  const mergeProps = {
    type: 'star',
    className: classNames('star', className),
    ...restProps,
  };
  return _.times(count).map((_, i) => <Icon key={i} {...mergeProps}/>);
};

export class RadioGroup extends PureComponent {
  render() {
    const { items = [], type = 'radio', ...restProps } = this.props;
    const Component = type === 'radio' ? Radio : Radio.Button;
    return (
      <Radio.Group {...restProps}>
        {items.map(({ value, label }, i) => <Component value={value} key={i}>{label}</Component>)}
      </Radio.Group>
    );
  }
}

export class Action extends PureComponent {
  static defaultProps = {
    items: [],
    hashPath: true
  };

  static propTypes = {
    items: PropTypes.array.isRequired,
    hashPath: PropTypes.bool,
  };

  render() {
    return this.props.items.filter(item => {
      const { is } = item;
      return !_.isUndefined(item) && item && (_.isUndefined(is) || is);
    }).map((item, key) => {
      const { title, text, onClick, component: Component = A, is, to, href = to, disabled, className, ...restProps } = item;
      const divider = key ? <Divider type="vertical"/> : null;
      let mergeProps = { ...restProps, className };
      if (disabled) {
        if (Component === A) {
          mergeProps = { ...mergeProps, className: classNames(className, 'disabled') };
        } else {
          mergeProps = { ...mergeProps, disabled };
        }
      }
      if (href && Component === A) {
        mergeProps = { ...mergeProps, href: toHashPath(href) };
      } else if (Component === Link) {
        mergeProps = { ...mergeProps, to };
      }
      let action = null;
      switch (item.type) {
        case 'confirm':
          action = (
            <AntPopconfirm title={title || '您确定要删除这条数据吗？'} onConfirm={onClick}>
              <Component {...mergeProps}>{text || '删除'}</Component>
            </AntPopconfirm>
          );
          break;
        default:
          action = <Component onClick={onClick} {...mergeProps}>{text || '编辑'}</Component>;
          break;
      }
      return <Fragment key={key}>{divider}{action}</Fragment>;
    });
  }
}
