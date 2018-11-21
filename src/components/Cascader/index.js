import React, { PureComponent } from 'react';
import { Cascader as AntCascader, Tag } from 'antd';
import PropTypes from 'prop-types';
import { session, request, findNodeDeep } from '../../utils';

const convert = (valuePropName, labelPropName, extraProps, leafPropName) => (data) => {
  const node = { value: data[valuePropName], label: data[labelPropName], isLeaf: leafPropName && !data[leafPropName] };
  if (extraProps) {
    if (_.isPlainObject(extraProps)) {
      _.forEach(extraProps, (originalKey, key) => node[key] = _.isFunction(originalKey) ? originalKey(data) : data[originalKey]);
    } else if (_.isArray(extraProps)) {
      _.forEach(extraProps, (key) => node[key] = data[key]);
    } else if (_.isString(extraProps)) {
      node[extraProps] = data[extraProps];
    }
  }
  return node;
};

const revert = (valuePropName, labelPropName, extraProps) => (data) => {
  const { value, label } = data;
  const node = { [valuePropName]: value, [labelPropName]: label };
  if (extraProps) {
    if (_.isPlainObject(extraProps)) {
      _.forEach(extraProps, (originalKey, key) => node[_.isFunction(originalKey) ? key : originalKey] = data[key]);
    } else if (_.isArray(extraProps)) {
      _.forEach(extraProps, (key) => node[key] = data[key]);
    } else if (_.isString(extraProps)) {
      node[extraProps] = data[extraProps];
    }
  }
  return node;
};

export default class Cascader extends PureComponent {
  static defaultProps = {
    root: 0,
    cache: false,
    valuePropName: 'value',
    labelPropName: 'label',
    parentName: 'parentId',
    mergerName: 'mergerName',
    paramName: 'parentId',
    leafPropName: null,
    extraProps: null,
    maxLevel: null,
    leafSource: null,
    dataSource: null,
    onChange: null,
    normalize: null,
  };

  static propTypes = {
    leafSource: PropTypes.string,
    dataSource: PropTypes.string,
    maxLevel: PropTypes.number,
  };

  constructor(props) {
    super(props);
    const { options, value } = props;
    let state = { options, value: [] };
    if (_.isArray(value)) {
      state = { ...state, value };
    }
    this.state = state;
  }

  componentWillMount() {
    const { value } = this.props;
    if (!_.isArray(value)) {
      this.setValue(value);
    }
  }

  componentWillReceiveProps({ value: nextValue }) {
    const { value } = this.state;
    if (_.isArray(nextValue)) {
      !_.isEqual(value, nextValue) && this.setState(nextValue);
    } else {
      _.last(value) !== nextValue && this.setValue(nextValue);
    }
  }

  setValue = async (current) => {
    const { cache, options: propOptions } = this.props;
    const value = await this.getValueDeep(current, [current], propOptions || session(cache));
    const options = await this.getChildrenDeep(value, (cache ? session(cache) : null) || this.state.options);
    cache && session(cache, options);
    this.setState({ value, options });
  };

  getValueDeep = (current, value, options) => {
    return new Promise(async (resolve, reject) => {
      if (!current) return resolve([]);
      const { root, valuePropName, parentName, leafSource } = this.props;
      if (_.isArray(options)) {
        const { node, nodes } = findNodeDeep(options, current, 'value');
        if (node) return resolve(nodes.map(({ value }) => value));
      }
      if (leafSource) {
        const { data: node } = await request(leafSource, { params: { [valuePropName]: current } });
        const parentId = node[parentName];
        if (parentId === root) {
          return resolve(value);
        } else {
          value.unshift(parentId);
          return resolve(await this.getValueDeep(parentId, value));
        }
      }
      reject();
    });
  };

  getChildrenDeep = (value, options, currentNode) => {
    value = [].concat(value);
    const { root, paramName, dataSource } = this.props;
    return new Promise(async (resolve, reject) => {
      try {
        const nextValue = value.shift();
        if (currentNode) {
          const { value: parentId, isLeaf } = currentNode;
          if (isLeaf) {
            resolve(options);
          } else {
            if (dataSource) {
              currentNode.children = currentNode.children || this.getRemoteData(await request(dataSource, { query: { [paramName]: parentId } }));
            }
            resolve(await this.getChildrenDeep(value, options, _.find(currentNode.children, { value: nextValue })));
          }
        } else {
          if (dataSource) {
            options = options || this.getRemoteData(await request(dataSource, { query: { [paramName]: root } }));
          }
          if (nextValue) {
            resolve(await this.getChildrenDeep(value, options, _.find(options, { value: nextValue })));
          } else {
            resolve(options);
          }
        }
      } catch (e) {
        reject(e);
      }
    });
  };

  getRemoteData = ({ data: children }) => {
    const { valuePropName, labelPropName, leafPropName, extraProps } = this.props;
    return children.map(convert(valuePropName, labelPropName, extraProps, leafPropName));
  };

  getData = async (selectedOptions) => {
    const { options } = this.state;
    const { paramName, dataSource, maxLevel, cache } = this.props;
    const option = _.last(selectedOptions);
    option.loading = true;
    this.setState({ options: [].concat(options) });
    if (dataSource) {
      option.children = this.getRemoteData(await request(dataSource, { query: { [paramName]: option.value } }));
    }
    if (_.isNumber(maxLevel) && selectedOptions.length >= maxLevel - 1) {
      option.children = option.children.map(item => ({ ...item, isLeaf: true }));
    }
    delete option.loading;
    this.setState({ options: [].concat(options) });
    cache && session(cache, options);
  };

  onChange = (value, selectedOptions) => {
    const { valuePropName, labelPropName, mergerName, normalize } = this.props;
    selectedOptions = selectedOptions.map(({ value, label }, i) => ({ [valuePropName]: value, [labelPropName]: label, [mergerName]: selectedOptions.slice(0, i + 1).map(({ label }) => label).join(' / ') }));
    this.setState({ value }, () => {
      const { onChange } = this.props;
      if (_.isFunction(onChange)) {
        const args = [_.last(value), _.last(selectedOptions), value, selectedOptions];
        if (_.isFunction(normalize)) {
          onChange.bind(this)(normalize.apply(this, args));
        } else {
          onChange.apply(this, args);
        }
      }
    });
  };

  render() {
    const { options, value } = this.state;
    const { placeholder = '请选择', ...restProps } = _.omit(this.props, Object.keys(Cascader.defaultProps));
    const cascaderProps = {
      ...restProps,
      loadData: this.getData,
      onChange: this.onChange,
      options,
      placeholder,
      value,
    };
    return <AntCascader {...cascaderProps}/>;
  }
}

export class Industry extends PureComponent {
  static defaultProps = {
    leafSource: '/api/basic/industries/:id',
    dataSource: '/api/basic/industries',
    valuePropName: 'id',
    labelPropName: 'industryName',
    leafPropName: 'childCount',
    mergerName: 'showName',
    cache: 'industries',
    root: 0,
  };

  render() {
    return <Cascader {...this.props}/>;
  }
}

export class Region extends PureComponent {
  static defaultProps = {
    leafSource: '/api/basic/:areaCode/area',
    dataSource: '/api/basic/areas',
    valuePropName: 'areaCode',
    labelPropName: 'shortName',
    leafPropName: 'childCount',
    parentName: 'parentCode',
    paramName: 'code',
    extraProps: { merger: ({ mergerName }) => _.drop(mergerName.split(',')).join(' / ') },
    cache: 'regions',
    root: '100000',
    maxLevel: 2,
  };

  render() {
    return <Cascader {...this.props}/>;
  }
}

Region.View = class Item extends PureComponent {
  static defaultProps = {
    ...Region.defaultProps,
    viewPropName: 'merger',
    component: Tag,
  };
  static propTypes = {
    code: PropTypes.any,
    region: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = { region: props.region };
  }

  componentWillMount() {
    const { code } = this.props;
    const { region } = this.state;
    if (!region && code) {
      this.getData();
    }
  }

  getData = async () => {
    const { code, leafSource, viewPropName, parentName, valuePropName, labelPropName, leafPropName, extraProps, cache } = this.props;
    let regions;
    let region;
    if (cache) {
      regions = session(cache);
      const { node } = findNodeDeep(regions, code, 'value');
      region = node;
      if (region) {
        const reverted = revert(valuePropName, labelPropName, extraProps)(region);
        if (reverted[viewPropName]) {
          return this.setState({ region: reverted });
        }
      }
    }
    const { data } = await request(leafSource, { params: { [valuePropName]: code } });
    const converted = convert(valuePropName, labelPropName, extraProps, leafPropName)(data);
    this.setState({ region: converted });
    if (cache) {
      if (region) {
        _.forEach(region, key => _.unset(region, key));
        _.merge(region, converted);
        session(cache, regions);
      } else {
        const { node: parent } = findNodeDeep(regions, data[parentName], 'value');
        if (parent) {
          const { children = [] } = parent;
          region = _.find(children, { value: code });
          if (region) {
            _.forEach(region, key => _.unset(region, key));
            _.merge(region, converted);
          } else {
            children.push(converted);
            parent.children = children;
          }
          session(cache, regions);
        }
      }
    }
  };

  render() {
    const { region } = this.state;
    const { viewPropName, component: Component, ...restProps } = this.props;
    if (!region) return null;
    return <Component {..._.omit(restProps, Object.keys(Item.defaultProps))}>{region[viewPropName]}</Component>;
  }
};
