import React from 'react';
import { Link } from 'dva/router';
import Exception from '../../components/Exception';

export default () => (
  <Exception type="403" linkElement={Link} />
);
