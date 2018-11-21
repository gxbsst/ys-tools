import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import qs from 'qs';
import moment from 'moment';
import _ from 'lodash';
import { Form, Input, Button, Icon, Row, Col } from 'antd';
import { request, notEmpty, getPagination, redirectTo } from '../../utils';
import styles from './index.less';

const { create: FormCreate } = Form;

export default (options, searchOptions = {}, context) => {
  if (_.isString(options)) {
    options = { url: options };
  }
  options = _.merge({
    namespace: '$data',
    cache: false,
    autoCreateForm: false,
    mergeQueryFromSearcher: true,
    mergeQueryFromLocation: true,
  }, options);
  if (_.isArray(searchOptions)) {
    searchOptions = {
      fields: searchOptions
    };
  }
  const { fields: searchFields = [], autoSubmit = false, searchHandleText = '查询' } = searchOptions;

  return WrappedComponent => {
    class AutoData extends PureComponent {
      static contextTypes = {
        store: PropTypes.object,
        router: PropTypes.object,
        params: PropTypes.object,
        query: PropTypes.object,
        location: PropTypes.object,
        routeData: PropTypes.array,
      };

      state = {
        simple: true,
        pagination: {
          current: 1,
          pageSize: 10,
          total: 0,
        },
        search: {},
        loading: false,
        starting: true,
        isReady: false,
      };

      componentDidMount() {
        this.mounted = true;
        this.setState({ search: this.getValues() });
        if (options.mergeQueryFromLocation) {
          const { router: { history } } = this.context;
          this.unsubscribe = history.listen(() => this.getData());
        } else {
          this.getData();
        }
      }

      componentWillUnmount() {
        this.mounted = false;
        if (this.unsubscribe) this.unsubscribe();
      }

      getData = (force) => {
        clearTimeout(this.timeout);
        this.timeout = setTimeout(async () => {
          const { search: searchQuery } = this.state;
          const { autoCreateForm, namespace, dataFilter, shouldSend = true, mergeQueryFromSearcher, mergeQueryFromLocation, url, ...restOptions } = options;
          if (this.mounted && (_.isFunction(shouldSend) ? shouldSend.bind(this)(this.props) : shouldSend)) {
            this.setState({ loading: true });
            const cx = context || this.context;
            const search = _.get(cx, 'location.search', '');
            const routeParams = _.get(cx, 'router.route.match.params', {});
            const { query, body, params = {} } = this.props;
            const requestOptions = {
              url: url.trim().replace(/\/+/, '/').replace(/:([a-z0-9_\-%]+)/ig, (...args) => (params[args[1]] || routeParams[args[1]] || '')),
              force: _.isBoolean(force) ? force : false,
              query,
              body,
              ...restOptions,
            };
            if (mergeQueryFromSearcher) {
              _.merge(requestOptions, { query: _.pickBy(searchQuery, notEmpty) });
            }
            if (mergeQueryFromLocation && search.substr(1)) {
              _.merge(requestOptions, { query: qs.parse(search.substr(1)) });
            }
            try {
              const { code, message, data = [], pagination } = await request(requestOptions);
              this.setState({
                code,
                message,
                pagination,
                data: _.isFunction(dataFilter) ? dataFilter(data) : data,
                loading: false,
                starting: false,
                isReady: true,
              });
            } catch (e) {
              this.setState({ loading: false, starting: false, isReady: true });
            }
          }
        }, 10);
      };

      getValues = () => {
        const { form } = this.props;
        const result = {};
        if (form) {
          const { getFieldsValue, getFieldInstance } = form;
          _.forEach(getFieldsValue() || {}, (values, key) => {
            let keys = [key];
            if (key.indexOf(',') >= 0) {
              keys = key.split(',');
            } else {
              values = [values];
            }
            _.forEach(keys, (name, i) => {
              let value = values[i];
              if (moment.isMoment(value)) {
                value = value.format(_.get(getFieldInstance(key), 'props.format', 'YYYY-MM-DD HH:mm:ss'));
              }
              result[name.trim()] = value;
            });
          });
        }
        return result;
      };

      onSearch = (event) => {
        event && _.isFunction(event.preventDefault) && event.preventDefault();
        this.setState({ search: this.getValues() });
        setTimeout(() => {
          if (!options.mergeQueryFromLocation) {
            this.getData();
          } else {
            const values = this.getValues();
            const { onSearch } = options;
            const { query, location: { pathname } } = this.context;
            const newQuery = _.pickBy({ ...query, ...values }, notEmpty);
            delete newQuery.page;
            redirectTo(pathname, newQuery);
            _.isFunction(onSearch) && onSearch.bind(this)(values, query);
          }
        }, _.isNumber(autoSubmit) ? autoSubmit : 10);
      };

      onPageChange = page => {
        if (options.mergeQueryFromLocation) {
          const { query, location: { pathname } } = this.context;
          redirectTo(pathname, { ...query, page });
        } else {
          options = _.merge(options, { query: { page } });
          this.reload();
        }
      };

      reload = () => {
        this.getData(true);
      };

      toggleForm = () => {
        this.setState({
          simple: !this.state.simple
        });
      };

      getFieldsGrid = () => {
        const cols = searchOptions.cols || {
          'screen-lg': 2,
          'screen-xl': 3,
          'screen-xxl': 5,
        }[this.props.screen] || 2;
        let size = 0;
        let sum = 0;
        for (let n of searchFields.map(item => item.colspan || 1)) {
          if (sum + n > cols) {
            return size;
          } else {
            sum += n;
            size++;
          }
        }
        return size;
      };

      getValuesByQuery = () => {
        if (!options.mergeQueryFromLocation) return {};
        const { query } = this.context;
        const values = {};
        searchFields.filter(field => field.name).forEach(({ name, valueType }) => {
          if (name.indexOf(',') > 0) {
            values[name] = [];
            name.split(',').forEach((n, i) => {
              n = n.trim();
              if (query[n]) values[name][i] = (valueType || String)(query[n]);
            });
          } else {
            if (query[name]) values[name] = (valueType || String)(query[name]);
          }
        });
        return values;
      };

      getSearcher = () => {
        if (!searchFields.length) return null;
        const { onFieldChange: onChange } = this;
        const { simple } = this.state;
        const { form: { getFieldDecorator } } = this.props;
        const values = this.getValuesByQuery();
        const size = this.getFieldsGrid();
        return (
          <div className={styles.searcher}>
            <Form onSubmit={this.onSearch} layout="inline">
              <Row gutter={24}>
                {
                  (simple ? searchFields.slice(0, size) : searchFields).map((field, i) => {
                    const { name, label, wrapperClassName, props = {}, colspan, render, component: Component = Input, defaultValue, options = {} } = field;
                    const { placeholder = `请输入${label}`, ...restProps } = props;
                    const mergeProps = { ...restProps, placeholder, onChange };
                    const cols = colspan || 1;
                    const colProps = {
                      xxl: 4 * cols,
                      xl: 6 * cols,
                      lg: 8 * cols,
                      md: 12 * cols,
                      className: wrapperClassName,
                      key: name || i,
                    };
                    const initialValue = values[name] || (_.isFunction(defaultValue) ? defaultValue.bind(this)() : defaultValue);
                    const input = _.isFunction(render) ? render.bind(this)(field) : <Component {...mergeProps}/>;
                    if (name) {
                      return (
                        <Col {...colProps}>
                          <Form.Item label={label}>
                            {getFieldDecorator(name, { initialValue, ...options })(input)}
                          </Form.Item>
                        </Col>
                      );
                    }
                    return (
                      <Col {...colProps}>
                        <div className="ant-row ant-form-item">
                          {label ? <div className="ant-form-item-label"><label>{label}</label></div> : null}
                          <div className="ant-form-item-control-wrapper">
                            <div className="ant-form-item-control">{input}</div>
                          </div>
                        </div>
                      </Col>
                    );
                  })
                }
                <Col xxl={4} xl={6} lg={8} md={12}>
                  {!autoSubmit ? <Button className={styles.submit} type="primary" htmlType="submit">{searchHandleText}</Button> : null}
                  {searchFields.length > size ? <a onClick={this.toggleForm}>{simple ? <span>展开 <Icon type="down"/></span> : <span>收起 <Icon type="up"/></span>}</a> : null}
                </Col>
              </Row>
            </Form>
          </div>
        );
      };

      onFieldChange = () => {
        autoSubmit && this.onSearch();
      };

      setData = (nextState, cb = _.noop) => {
        this.setState({ ...this.state, ...nextState }, cb);
      };

      render() {
        const { context, reload, onPageChange: onChange, setData } = this;
        let { pagination, ...restState } = this.state;
        pagination = getPagination(pagination, { onChange });
        let mapStateToProps = {
          ...restState,
          context,
          pagination,
          setData,
          reload,
        };
        const { getValues, onSearch, props: { form, ...restProps } } = this;
        if (form) {
          mapStateToProps = { ...mapStateToProps, form, onSearch, getValues };
        }
        if (searchFields.length) {
          mapStateToProps = { ...mapStateToProps, searcher: this.getSearcher() };
        }
        const mergeProps = {
          ...restProps,
          [options.namespace]: mapStateToProps
        };
        return <WrappedComponent {...mergeProps}/>;
      }
    }

    const { dva, autoCreateForm, formOptions = {} } = options;
    let HigherOrderComponent = AutoData;
    if (autoCreateForm || searchFields.length) {
      HigherOrderComponent = FormCreate(formOptions)(AutoData);
    }
    if (dva !== false && !searchOptions.cols) {
      HigherOrderComponent = connect(({ global: { screen } }) => ({ screen }))(HigherOrderComponent);
    }
    return HigherOrderComponent;
  };
}
