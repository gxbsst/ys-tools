import React, { PureComponent } from 'react';
import { Cascader } from 'antd';
import PropTypes from 'prop-types';
import { session, request } from '../../utils';

const formatter = (children, level) => {
  return children.map(({ id: value, industryName: label, parentId }) => ({ value, label, isLeaf: !!parentId }));
};

export default class Industry extends PureComponent {
  static defaultProps = {
    level: 2
  };

  static propTypes = {
    level: PropTypes.number
  };

  constructor(props) {
    super(props);
    this.state = {
      regions: [
        { value: '0' }
      ],
      value: [],
    };
    this.getData = this.getData.bind(this);
  }

  componentDidMount() {
    const { value: current } = this.props;
    this.setValue(current);
  }

  componentWillReceiveProps({ value: newValue }) {
    const { value } = this.props;
    if (value !== newValue) {
      this.setValue(newValue);
    }
  }

  setValue = async (current) => {
    let value = [];
    if (current) {
      value = await this.getValueDeep(current);
    }
    const cache = session('industrys') || this.state.regions;
    const china = cache[0];
    const regions = await this.getChildrenDeep([china.value].concat(value), china, cache);
    session('industrys', regions);
    this.setState({ value, regions });
  };

  getValueDeep = (code, value = [code]) => {
    return new Promise(async (resolve, reject) => {
      try {
        const { data: { parentId } } = await request(`/api/basic/industries/${code}`);
        value.unshift(parentId);
        if (parentId) {
          resolve(await this.getValueDeep(parentId, value));
        } else {
          resolve(value);
        }
      } catch (e) {
        reject(e);
      }
    });
  };

  getChildrenDeep = (value, region, regions) => {
    const { level } = this.props;
    return new Promise(async (resolve, reject) => {
      try {
        const code = value.shift();
        if (!region.isLeaf && !region.children) {
          const { data: children } = await request('/api/basic/industries/', { query: { parentId: code } });
          region.children = formatter(children, level);
        }
        if (value.length) {
          resolve(await this.getChildrenDeep(value, _.find(region.children, { value: value[0] }), regions));
        } else {
          resolve(regions);
        }
      } catch (e) {
        reject(e);
      }
    });
  };

  async getData(selected) {
    const { state: { regions }, props: { level } } = this;
    const target = _.last(selected || regions);
    const { value: code } = target;
    target.loading = true;
    this.setState({ regions: [].concat(regions) });
    const { data: children } = await request('/api/basic/industries/', { query: { parentId: code } });
    _.merge(target, { children: formatter(children, level), loading: false });
    this.setState({ regions: [].concat(regions) });
    session('industrys', regions);
  }

  onChange = (value, selectedOptions) => {
    selectedOptions = selectedOptions.map(({ value: id, label: industryName }) => ({ id, industryName }));
    const { onChange } = this.props;
    this.setState({ value });
    onChange(_.last(value), _.last(selectedOptions), value, selectedOptions);
  };

  render() {
    const { onChange, ...restProps } = this.props;
    const { regions, value } = this.state;
    const props = {
      placeholder: '请选择行业',
      loadData: this.getData,
      ...restProps,
      onChange: this.onChange,
      options: regions[0].children,
      value
    };
    return <Cascader {...props}/>;
  }
}
