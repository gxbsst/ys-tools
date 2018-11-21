import React, { PureComponent } from 'react';
import { AutoComplete as AntAutoComplete, Input, Icon } from 'antd';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { request } from '../../utils';

const { Option } = AntAutoComplete;

export default class AutoComplete extends PureComponent {
  static defaultProps = {
    valuePropName: 'value',
    keywordPropName: 'value',
    labelPropName: 'label',
    allowClear: true,
  };

  static propTypes = {
    valuePropName: PropTypes.string,
    keywordPropName: PropTypes.string,
    labelPropName: PropTypes.string,
    allowClear: PropTypes.bool,
    labelRender: PropTypes.func,
    onValueUpdate: PropTypes.func,
    dataSource: PropTypes.any.isRequired
  };

  constructor(props) {
    super(props);
    let dataSource = [];
    if (_.isArray(props.dataSource)) {
      dataSource = props.dataSource;
    }
    this.state = { dataSource, cached: dataSource };
  }

  componentWillReceiveProps({ value: newValue }) {
    const { cached = [] } = this.state;
    const { value, getData, valuePropName } = this.props;
    if (newValue && newValue !== value) {
      const record = _.find(cached, { [valuePropName]: newValue });
      if (record) {
        this.setState({ value: record.label });
      } else {
        if (_.isFunction(getData)) {
          getData.bind(this)(newValue);
        } else {
          this.getData(valuePropName, newValue);
        }
      }
    }
  }

  onSelectCancelBubble = () => {
    this.cancelBubble = true;
    setTimeout(() => this.cancelBubble = false);
  };

  getData = async (name, value) => {
    let { dataSource, cached = [] } = this.state;
    const { dataSource: url, value: originalValue, valuePropName, keywordPropName } = this.props;
    switch (name) {
      case valuePropName:
        dataSource = _.filter(cached, (record) => record[valuePropName] === value);
        break;
      case keywordPropName:
        dataSource = _.filter(cached, ({ label }) => label === value);
        break;
    }
    if (_.isEmpty(dataSource)) {
      this.setState({ loading: true });
      const { data: records = [] } = await request(url, { query: { [name]: value } });
      dataSource = records.map(record => ({ ...record, label: this.getLabel(record) }));
      cached = _.uniqBy(dataSource.concat(cached), valuePropName);
    }
    const record = _.find(dataSource, { [valuePropName]: originalValue });
    const state = { dataSource, cached, loading: false };
    if (record) state.value = record.label;
    this.setState(state);
  };

  onSearch = (keyword) => {
    clearTimeout(this.timeout);
    const { dataSource: dataSourceByState } = this.state;
    const { valuePropName, keywordPropName, dataSource: dataSourceByProps, onChange, onSelect } = this.props;
    const dataSource = _.isArray(dataSourceByProps) ? dataSourceByProps : dataSourceByState;
    const record = _.find(dataSource, { label: keyword });
    const args = [];
    if (record) {
      args.push(record[valuePropName], record);
    } else if (!_.isArray(dataSourceByProps)) {
      this.timeout = setTimeout(async () => {
        this.getData(keywordPropName, keyword);
      }, 300);
    }
    _.isFunction(onChange) && onChange.apply(this, args);
    _.isFunction(onSelect) && onSelect.bind(this)(record);
  };

  onChange = (viewValue) => {
    if (!this.cancelBubble) {
      const { valuePropName, value, onChange } = this.props;
      this.setState({ value: viewValue });
      if (_.isFunction(onChange)) {
        const { cached } = this.state;
        const record = _.find(cached, { label: viewValue });
        const args = [];
        let nextValue;
        if (record) {
          nextValue = record[valuePropName];
          args.push(nextValue, record);
        }
        nextValue !== value && onChange.apply(this, args);
      }
    }
  };

  onSelect = (key, e) => {
    this.onSelectCancelBubble();
    const { dataSource } = this.state;
    const { onSelect, onChange, valuePropName } = this.props;
    const record = dataSource[e.props.index];
    this.setState({ value: record.label });
    _.isFunction(onChange) && onChange.bind(this)(record[valuePropName], record);
    _.isFunction(onSelect) && onSelect.bind(this)(record);
  };

  getLabel = (record, defaultValue) => {
    if (record) {
      const { labelRender, labelPropName } = this.props;
      return _.isFunction(labelRender) ? labelRender.bind(this)(record) : record[labelPropName];
    }
    return defaultValue;
  };

  render() {
    const { onSearch, onSelect, onChange } = this;
    const { dataSource: options, value: viewValue, loading } = this.state;
    const { value: originalValue, valuePropName, ...restProps } = this.props;
    const dataSource = _.take(options, 10).map((record) => <Option key={record[valuePropName]}>{record.label}</Option>);
    const record = _.find(options, { [valuePropName]: originalValue });
    const value = record ? record.label : viewValue;
    const icon = loading ? <Icon type="loading" className="button-color no-events"/> : null;
    const mergeProps = {
      ...restProps,
      dataSource,
      value,
      onSearch,
      onSelect,
      onChange,
    };
    return <AntAutoComplete {...mergeProps}><Input suffix={icon}/></AntAutoComplete>;
  }
}

export class StaffFinder extends PureComponent {
  static defaultProps = {
    dataSource: '/api/personnel/employee/think',
    valuePropName: 'id',
    keywordPropName: 'name',
    placeholder: '输入姓名查找员工...',
    labelRender: ({ name, username }) => `${name} (${username})`,
  };

  async getData(newValue) {
    let { dataSource, cached = [] } = this.state;
    const { valuePropName } = this.props;
    this.setState({ loading: true });
    const { data = {} } = await request(`/api/personnel/employee/${newValue}`);
    const { id, name, username } = data;
    const label = this.getLabel(data);
    const record = { id, name, username, label };
    dataSource = [record].concat(dataSource);
    cached = _.uniqBy(dataSource.concat(cached), valuePropName);
    this.setState({ dataSource, cached, value: label, loading: false });
  }

  render() {
    return <AutoComplete {...this.props} getData={this.getData}/>;
  }
}
