import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import { LocaleProvider, Form, Modal, Input } from 'antd';
import classNames from 'classnames';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import { autodata, withRef, withSetProps } from '../../decorators';
import { request } from '../../utils';
import styles from './index.less';

const { create: FromCreate, Item: FormItem } = Form;

const getAutoDataSettings = (settings, namespace = '$data') => {
  const defaults = {
    dva: false,
    autoCreateForm: false,
    mergeQueryFromSearcher: false,
    mergeQueryFromLocation: false,
  };
  if (_.isString(settings)) {
    settings = { [namespace]: { namespace, url: settings, ...defaults } };
  } else if (_.isPlainObject(settings)) {
    _.forEach(settings, (setting, namespace) => {
      if (_.isString(setting)) {
        setting = { url: setting };
      }
      settings[namespace] = { namespace, ...setting, ...defaults };
    });
  }
  return settings;
};

export default class Dialog extends PureComponent {
  state = {};

  render() {
    const { onOk, onCancel, transition, render, content, component: BodyComponent, title, titleRender, footerRender, formProps, props, ...restProps } = this.props;
    let modalProps = {
      wrapClassName: styles.center,
      visible: true,
      onOk: onOk.bind(this),
      onCancel: onCancel.bind(this),
      title,
      ...props,
      ...restProps,
    };
    if (_.isBoolean(transition) && !transition) {
      modalProps = { ...modalProps, transitionName: '', maskTransitionName: '' };
    }
    if (_.isFunction(titleRender)) {
      modalProps = { ...modalProps, title: titleRender.apply(this) || title };
    }
    if (_.isFunction(footerRender)) {
      modalProps = { ...modalProps, footer: footerRender.apply(this) };
    }
    let body = content;
    if (!body && BodyComponent) {
      body = <BodyComponent {...restProps}/>;
    }
    if (!body && render) {
      body = render.bind(this)(this);
    }
    if (formProps) {
      body = <Form {..._.omit(formProps, ['action', 'method', 'valuesFilter', 'onSubmitted', 'onError'])}>{body}</Form>;
    }
    return <Modal {...modalProps}>{body}</Modal>;
  }
}

Dialog.open = (options) => {
  const { action, method = 'POST', onSubmitted, ...restOptions } = options;
  options = _.merge({
    title: '弹窗',
    delay: 0,
    setPropsMerged: true,
    autoClose: true,
    maskClosable: false,
    transition: false,
    formProps: {
      action,
      method,
      onSubmitted,
      onSubmit(e) {
        e && e.preventDefault();
        const { form, autoClose, formProps: { action, method, valuesFilter, onSubmitted, onError }, setProps } = this.props;
        if (action) {
          form.validateFields((err, body) => {
            if (err) return;
            setProps({ confirmLoading: true });
            if (_.isFunction(valuesFilter)) {
              body = valuesFilter.bind(this)(body);
            }
            const args = { method };
            if (method === 'GET') {
              Object.assign(args, { query: body });
            } else {
              Object.assign(args, { body });
            }
            request(action, args).then(data => {
              _.isFunction(onSubmitted) && onSubmitted.bind(this)(data, args);
              autoClose && this.destroy();
            }).catch(onError.bind(this));
          });
        }
      },
      onError() {
        this.props.setProps({ confirmLoading: false });
      },
    },
    onOk() {
      this.props.formProps.onSubmit.bind(this)();
    },
    onCancel() {
      this.destroy();
    },
    render: _.noop,
  }, restOptions);

  setTimeout(() => {
    const container = document.createElement('div');
    const { autodata: autodataSetting, formProps: { options: opts = {} }, formOptions = opts, setPropsMerged } = options;
    const { render, ...methods } = _.pickBy(options, _.isFunction);
    const saveRef = instance => {
      if (instance) {
        _.merge(instance, {
          destroy() {
            const { onDestroy } = instance;
            _.isFunction(onDestroy) && onDestroy();
            ReactDOM.unmountComponentAtNode(container);
            document.body.removeChild(container);
          },
        });
        _.forEach(methods, (method, key) => {
          instance[key] = method.bind(instance);
        });
        const { state } = options;
        state && instance.setState(state);
        instance.props.forceUpdateProps();
      }
    };

    let WrappedComponent = Dialog;
    WrappedComponent = withRef(WrappedComponent);
    WrappedComponent = withSetProps(setPropsMerged)(WrappedComponent);
    WrappedComponent = FromCreate(formOptions)(WrappedComponent);
    if (autodataSetting) {
      _.forEach(getAutoDataSettings(autodataSetting), (settings) => {
        WrappedComponent = autodata(settings)(WrappedComponent);
      });
    }

    document.body.appendChild(container);
    ReactDOM.render((
      <LocaleProvider locale={zhCN}>
        <WrappedComponent {...options} getInstance={saveRef}/>
      </LocaleProvider>
    ), container);
  }, options.delay);
};

Dialog.prompt = (options) => {
  const {
    label, title = `请输入${label}`, wrappedClassName, className,
    action, method = 'POST', name = 'name',
    required = true, type, message = `${label}不能为空`,
    component: Component = Input, defaultValue: initialValue, placeholder = title,
    valuesFilter, titleRender, onSubmitted, ...restOptions
  } = options;
  options = _.merge({
    title,
    width: 450,
    formProps: {
      action,
      method,
      valuesFilter,
      onSubmitted,
    },
    titleRender,
    render() {
      const { form: { getFieldDecorator } } = this.props;
      const rules = [];
      const rule = _.pickBy({ required, type });
      if (!_.isEmpty(rule)) {
        rules.push({ ...rule, message });
      }
      const mergeOptionsToProps = {
        className: classNames('blocked', className),
        size: 'large',
        placeholder,
        ...restOptions,
      };
      return (
        <FormItem className={wrappedClassName}>
          {getFieldDecorator(name, { initialValue, rules })(<Component {...mergeOptionsToProps}/>)}
        </FormItem>
      );
    }
  }, restOptions);
  Dialog.open(options);
};
