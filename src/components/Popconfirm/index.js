import React, { PureComponent, Fragment } from 'react';
import { Button, Popover, Icon } from 'antd';
import classNames from 'classnames';
import styles from './index.less';

export default class Popconfirm extends PureComponent {
  static defaultProps = {
    icon: 'exclamation-circle',
    iconColor: '#faad14',
    cancelText: '取消',
    okText: '确定',
    trigger: 'click',
    strictly: false,
  };

  state = {
    visible: false,
  };

  onCancel = () => {
    const { onCancel } = this.props;
    _.isFunction(onCancel) && onCancel.bind(this)();
    this.setState({ visible: false });
  };

  onConfirm = () => {
    const { onConfirm } = this.props;
    _.isFunction(onConfirm) && onConfirm.bind(this)();
    this.setState({ visible: false });
  };

  onVisibleChange = (visible) => {
    const { strictly } = this.props;
    if (!strictly || (strictly && visible)) {
      this.setState({ visible });
    }
  };

  render() {
    const { visible } = this.state;
    const {
      cancelText, okText, title, footer, icon, iconColor: color, content, trigger, strictly, onCancel, onConfirm,
      className, bodyClassName, titleClassName, footerClassName, children, ...restProps
    } = this.props;
    const popHeader = title ? <div className={classNames(styles.popconfirmTitle, titleClassName)}>{title}</div> : null;
    let popFooter;
    if (_.isFunction(footer)) {
      popFooter = footer.bind(this)();
    } else if (_.isBoolean(footer) && footer || _.isUndefined(footer)) {
      popFooter = (
        <Fragment>
          {cancelText ? <Button size="small" onClick={this.onCancel}>{cancelText}</Button> : null}
          <Button size="small" type="primary" onClick={this.onConfirm}>{okText}</Button>
        </Fragment>
      );
    } else if (footer) {
      popFooter = footer;
    }
    if (popFooter) {
      popFooter = <div className={classNames(styles.popconfirmFooter, footerClassName)}>{popFooter}</div>;
    }
    const body = (
      <div className={classNames(styles.popconfirm, className)} {...restProps}>
        {popHeader}
        <div className={classNames(styles.popconfirmBody, bodyClassName)}>
          {icon ? <Icon type={icon} style={{ color }}/> : null}
          {content}
        </div>
        {popFooter}
      </div>
    );
    return <Popover content={body} trigger={trigger} visible={visible} onVisibleChange={this.onVisibleChange}>{children}</Popover>;
  }
}
