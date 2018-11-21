import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {Cascader, message} from 'antd';
import {session, request, tree} from '../../utils';

const formatter = (children, level) => {
  return children.map((item) => {
    const {id: value, name: label, children} = item;
    if (children && children.length !== 0) {
      return {
        ...item,
        value, label, isLeaf: false,
        children: formatter(children, level),
      };
    } else {
      const {children, ...others} = item;
      return {...others, value, label, isLeaf: false};
    }
  });
};
const formatterProducts = (children) => {
  return children.map((item) => {
    const { relationId: value, name: label } = item;
    return {
      ...item,
      value, label, isLeaf: true,
    }
  });
};
export default class Product extends PureComponent {
  static propTypes = {
    type: PropTypes.number.isRequired, // 产品类型 1:软件 2: 硬件 3:增值
    source: PropTypes.number.isRequired, // 产品来源 2: 机会 3: 客户
    sourceId: PropTypes.number.isRequired, //来源id
  }

  constructor(props) {
    super(props);
    this.state = {
      product: [
        {value: 0}
      ],
      current: props.value,
      value: [],
      type: props.type,
    };
    this.getData = this.getData.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.type !== this.state.type) {
      this.setState({
        type: nextProps.type,
        current: null,
        value: [],
        product: [{
          value: 0,
        }],
      }, () => this.getProductsDirectory());
    }
  }

  async getProductsDirectory() {
    const {current} = this.state;
    let value = [];
    if (current) {
      try {
        value = await this.getValueDeep(current);
      } catch  (e) {
        value = [];
      }
    }
    const cache = this.state.product;
    const rootCode = cache[0];
    const product = await this.getChildrenDeep([rootCode.value].concat(value.slice(0,-1)), rootCode, cache);
    session('product', product);
    this.setState({value, product});
  }

  componentDidMount() {
    this.getProductsDirectory();
  }

  getValueDeep = (pro, value = [pro]) => {
    return new Promise(async (resolve, reject) => {
      try {
        const {data: {directoryIds, id }, code} = await request(`/api/product/relation/${pro}`);
        resolve(code === 0 ? [...directoryIds, id ] : []);
      } catch (e) {
        console.warn('获取产品失败!');
        reject(e);
      }
    });
  };

  getChildrenDeep = (value, region, regions) => {
    const {level, type, sourceId = 0, source = 0 } = this.props;

    return new Promise(async (resolve, reject) => {
      try {
        const code = value.shift();
        if (!region.isLeaf && !region.children) {
          let children = [];
          let res = null;
          if (code === 0) { //顶级目录(产品线)
            res = await request(`/api/directory/${source}/${sourceId}`);
            children = tree(res.data || []);
          } else {
            res = await request(`/api/directory/${code}/product`, {query: {type, page: 1, pageSize: 1000}});
            children = res.data || [];
          }
          if (children && children.length === 0) {
            region.isLeaf = true;
          } else {
            if (value.length === 0 && code !== 0) { //最后一级目录,获取产品
              region.children = formatterProducts(children, level);
            } else {
              region.children = formatter(children, level);
            }
          }
        }
        if (value.length && _.find(region.children, {value: value[0]})) {
          resolve(await this.getChildrenDeep(value, _.find(region.children, {value: value[0]}), regions));
        } else {
          resolve(regions);
        }
      } catch (e) {
        reject(e);
      }
    });
  };

  async getData(selected) {
    const {state: {product, type}, props: {level}} = this;
    const target = _.last(selected || product);
    const {value: id} = target;
    target.loading = true;
    this.setState({product: [].concat(product)});
    const {data: children, code} = await request(`/api/directory/${id}/product`, {query: {type, page: 1, pageSize: 1000}});
    if (code === 0) {
      target.children = formatterProducts(children);
    }
    target.loading = false;
    this.setState({product: [].concat(product)});
    session('product', product);
  }

  onChange = (value, selectedOptions) => {
    if (selectedOptions.length > 0) {
      const product = _.last(selectedOptions);
      if (!product.relationId) {
        return message.warn('您选中的不是产品!');
      }
    }
    selectedOptions = selectedOptions.map((item, i) => ({
      ...item,
      mergeName: selectedOptions.slice(0, i + 1).map(({label}) => label).join(' / ')
    }));
    const {onChange} = this.props;
    this.setState({value}, () => {
      _.isFunction(onChange) && onChange(_.last(value), _.last(selectedOptions), value, selectedOptions);
    });
  }

  render() {
    const {onChange, type, ...restProps} = this.props;
    const {product, value} = this.state;
    const props = {
      ...restProps,
      placeholder: '请选择产品',
      loadData: this.getData,
      onChange: this.onChange,
      options: product[0].children,
      value
    };
    return <Cascader {...props}/>;
  }
}
