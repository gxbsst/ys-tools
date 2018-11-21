import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Input } from 'antd';
import _ from 'lodash';
import { RouteTab } from '../../components';
import { Select } from '../../components/Helpers';
import styles from './index.less';
import can from '../../decorators/Can';
import { redirectTo, enums, getEnumProperty, getEnumPropertyByIndex, getEnumKeys } from '../../utils';

const { Group: InputGroup, Search: InputSearch } = Input;

const defaultType = getEnumPropertyByIndex('CUSTOMER_SEARCH_FIELD');
const searchTypes = enums('CUSTOMER_SEARCH_FIELD');

@can()
export default class Search extends PureComponent {
  static contextTypes = {
    query: PropTypes.object,
    location: PropTypes.object,
  };

  state = {
    type: defaultType,
  };

  componentWillMount() {
    const { query } = this.context;
    let state = { type: defaultType };
    for (const value of Object.keys(query)) {
      const current = _.find(searchTypes, { value });
      if (current) {
        const { value: type } = current;
        state = { type };
      }
    }
    this.setState(state);
  }

  onSearch = (keyword) => {
    const { type } = this.state;
    const { location: { pathname }, query } = this.context;
    redirectTo(pathname, _.pickBy({ ..._.omit(query, getEnumKeys(searchTypes).concat('page')), [type]: keyword }, e => e));
  };

  onSelect = type => {
    this.setState({ type });
  };

  render() {
    const { onSelect, onSearch } = this;
    const { can } = this.props;
    const { type } = this.state;
    const { query } = this.context;
    const defaultValue = query[type];
    const searchProps = {
      className: styles.input,
      placeholder: `请输入您要查询的${getEnumProperty(searchTypes, type)}`,
      enterButton: true,
      defaultValue,
      onSearch,
    };
    const action = (
      <InputGroup compact>
        <Select options={searchTypes} defaultValue={type} onSelect={onSelect}/>
        <InputSearch {...searchProps}/>
      </InputGroup>
    );
    return <RouteTab {...this.props} action={action}/>;
  }
}
