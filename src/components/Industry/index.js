import React, { PureComponent } from 'react';
import { Cascader } from 'antd';
import { session, request } from '../../utils';

const formatter = (children, level) => {
  return children.map(({ id: value, showName: label, parentId }) => ({ value, label, isLeaf: false }));
};

export default class Industry extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      industries: [
        { value: 0 }
      ],
      value: [],
    };
    this.getData = this.getData.bind(this);
  }

  async componentDidMount() {
    const { value: current } = this.props;
    let value = [];
    if (current) {
      value = await this.getValueDeep(current);
    }
    const cache = session('industries') || this.state.industries;
    const china = cache[0];
    const industries = await this.getChildrenDeep([china.value].concat(value), china, cache);
    session('industries', industries);
    this.setState({ value, industries });
  }

  getValueDeep = (code, value = [code]) => {
    return new Promise(async (resolve, reject) => {
      try {
        const { data: { parentId } } = await request(`/api/basic/industries/${code}`);
        if (parentId) {
          value.unshift(parentId);
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
          const { data: children } = await request(`/api/basic/industries`, { query: { parentId: code } });
          if (!children) {
            region.isLeaf = true;
          } else {
            region.children = formatter(children, level);
          }
        }
        if (value.length &&  _.find(region.children, { value: value[0] })) {
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
    const { state: { industries }, props: { level } } = this;
    const target = _.last(selected || industries);
    const { value: code } = target;
    target.loading = true;
    this.setState({ industries: [].concat(industries) });
    const { data: children } = await request(`/api/basic/industries`, { query: { parentId: code } });
    if (!children) {
      target.isLeaf = true;
    } else {
      target.children = formatter(children, level);
    }
    _.merge(target, { loading: false });
    this.setState({ industries: [].concat(industries) });
    session('industries', industries);
  }

  onChange = (value, selectedOptions) => {
    const { onChange } = this.props;
    const target = _.last(selectedOptions);
    const { label = '' } = target || {};
    this.setState({ value });
    onChange(label);
  }

  render() {
    const { onChange, ...restProps } = this.props;
    const { industries, value } = this.state;
    const props = {
      ...restProps,
      placeholder: '请选择行业',
      loadData: this.getData,
      onChange: this.onChange,
      options: industries[0].children,
      value
    };
    return <Cascader {...props}/>;
  }
}
