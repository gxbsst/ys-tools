import qs from 'qs';
import moment from 'moment';
import _configs, { UPPER_NUMBER } from '../config';
import _enums, { filters, fromValues } from '../enums';

export { default as request } from './request';

export { filters, fromValues };

export const config = (key) => _.cloneDeep(_.get(_configs, key));

export const enums = (key) => _.cloneDeep(_.get(_enums, key));

export const getEnumEntities = (key) => _.isString(key) ? enums(key) : key;

export const getEnumProperty = (entities, value, propertyKey = 'label', fromKey = 'value') => _.get(_.find(getEnumEntities(entities), { [fromKey]: value }), propertyKey);

export const getLabel = getEnumProperty;

export const getEnumPropertyByIndex = (entities, key = 'value', index = 0) => _.get(getEnumEntities(entities), [index, key]);

export const getEnumKeys = (entities, key = 'value') => getEnumEntities(entities).map(entity => entity[key]);

export const tree = (items, parentId = 0, maps = { key: 'id', parentKey: 'parentId' }) => {
  const { key, parentKey } = maps;
  return (items || []).filter(item => (item[parentKey] === parentId)).map(node => {
    const children = tree(items, node[key], { key, parentKey });
    if (!_.isEmpty(children)) {
      return { ...node, children };
    }
    return { ...node, isLeaf: true };
  });
};

export const redirectTo = (path, query = {}) => {
  path = path.split('?');
  query = _.merge(qs.parse(path[1]), query);
  const queryString = qs.stringify(query);
  const pathname = path[0];
  window.location.href = toHashPath(pathname + (queryString ? `?${queryString}` : ''));
};

export const redirectToLogin = () => {
  const matchers = location.href.match(/\/\#(.*)/);
  const redirect = encodeURIComponent(matchers ? matchers[1] : '/');
  session(null);
  redirectTo('/auth/login', { redirect });
};

export const toSafePath = (path = '') => `/${path}`.replace(/\/+/g, '/');

export const toHashPath = (path = '') => `/#${toSafePath(path)}`;

export const resetKeys = (origin, target) => {
  if (origin) {
    origin = _.cloneDeep(origin);
    for (const key of Object.keys(target)) {
      origin[target[key]] = origin[key];
      delete origin[key];
    }
  }
  return origin;
};

export const unsetKey = (origin, path) => {
  const value = _.get(origin, path);
  _.unset(origin, path);
  return value;
};

export const unsetKeys = (origin, ...paths) => {
  paths.forEach(path => _.unset(origin, path));
};

export const toSafeJSON = (string) => {
  try {
    return JSON.parse(string);
  } catch (e) {
    return {};
  }
};

export const isEmpty = target => {
  return (undefined === target) || (null === target) || (_.isString(target) && !target) || (_.isNumber(target) && isNaN(target));
};

export const notEmpty = target => {
  return !isEmpty(target);
};

export const hash = (input) => {
  const table = config('I64BIT_TABLE');
  let hash = 5381;
  let i = input.length - 1;
  if (_.isString(input)) {
    for (; i > -1; i--) {
      hash += (hash << 5) + input.charCodeAt(i);
    }
  } else {
    for (; i > -1; i--) {
      hash += (hash << 5) + input[i];
    }
  }
  let value = hash & 0x7FFFFFFF;
  let resultValue = '';
  do {
    resultValue += table[value & 0x3F];
  } while (value >>= 6);
  return resultValue;
};

export const intercept = (string = '', maxLength = 0) => {
  const chars = [];
  let length = 0;
  let unicode;
  for (let v of string) {
    unicode = v.charCodeAt(0);
    length += unicode >= 0 && unicode <= 255 ? 1 : 2;
    if (length >= maxLength) {
      return chars.join('') + '...';
    } else {
      chars.push(v);
    }
  }
  return string;
};

export const findNodeDeep = (dataSource = [], currentKey, ...args) => {
  const cb = _.remove(args, _.isFunction)[0];
  const keyName = args[0] || 'id';
  const childrenName = args[1] || 'children';
  const nodes = _.remove(args, _.isArray)[0] || [];
  let index = 0;
  for (const node of dataSource) {
    nodes.push(node);
    if (node[keyName] === currentKey) {
      _.isFunction(cb) && cb(node, index, dataSource);
      return { node, nodes };
    }
    const children = node[childrenName];
    if (children) {
      const { node: n, nodes: ns } = findNodeDeep(children, currentKey, keyName, childrenName, [].concat(nodes), cb);
      if (n) return { node: n, nodes: ns };
    }
    nodes.pop();
    index++;
  }
  return { node: null, nodes: [] };
};

export const findChildrenDeep = (node, nodes = [], childrenName = 'children') => {
  const children = node[childrenName];
  if (children) {
    nodes.push.apply(nodes, children);
    _.forEach(children, child => findChildrenDeep(child, nodes, childrenName));
  }
  return nodes;
};

export const getNodesByPos = (nodes, pos, path = []) => {
  if (!nodes || !pos) return null;
  if (_.isString(pos)) {
    pos = _.drop(pos.split('-')).map(key => ~~key);
  }
  const node = nodes[pos.shift()];
  if (node) {
    const { children } = node;
    path = [...path, node];
    if (pos.length && children) {
      return getNodesByPos(children, pos, path);
    }
    return path;
  }
  return null;
};

export const toSafeNumber = (value, ...args) => {
  const argsByBoolean = _.remove(args, _.isBoolean);
  const argsByNumber = _.remove(args, _.isNumber);
  const isFloat = argsByBoolean[0];
  const isPositive = argsByBoolean[1];
  const max = _.isNumber(argsByNumber[0]) ? argsByNumber[0] : UPPER_NUMBER;
  const min = _.isNumber(argsByNumber[1]) ? argsByNumber[1] : -UPPER_NUMBER;
  if (!value) return value;
  if (_.isString(value)) {
    value = value.replace(/\.+/g, '.').replace(/\-+/g, '-');
    if ((isFloat && _.size(value.match(/\./g)) === 1 && /\.$/.test(value)) || (!isPositive && value === '-')) return value;
    value = (value.match(new RegExp(`${isPositive ? '' : '\\-?'}[\\d${isFloat ? '\\.' : ''}]+`, 'g')) || []).join('');
    if (!value) return value;
    value = parseFloat(value);
  }
  if (_.isNumber(min) && value < min) value = min;
  if (_.isNumber(max) && value > max) value = max;
  return value;
};

export const toSafeFloat = (value, max, min) => {
  return toSafeNumber(value, max, min, true);
};

export const toSafePositiveFloat = (value, max) => {
  return toSafeNumber(value, max, 0, true, true);
};

export const toSafeInteger = (value, max, min) => {
  return toSafeNumber(value, max, min);
};

export const toSafePositiveInteger = (value, max, min) => {
  return toSafeNumber(value, max, min, false, true);
};


export const getPagination = (pagination = {}, props = {}) => {
  const { page = 1, current = page, totalCount = 0, total = totalCount, pageSize = 10, ...restPagination } = pagination;
  return { current, total, pageSize, ...restPagination, ...props };
};

export const valueFormatter = (value, formatter, max) => {
  if (_.isNumber(formatter)) {
    max = formatter;
    formatter = null;
  }
  if (_.isFunction(formatter)) {
    value = formatter(value);
  }
  if (_.isRegExp(formatter)) {
    value = (value.match(formatter) || []).join('');
  }
  if (_.isNumber(max)) {
    value = value.substr(0, max);
  }
  return value;
};

export const dateFormat = (target, format = 'YYYY-MM-DD') => {
  if (!target) return target;
  return moment(target).format(format);
};

export const percent = (number, digits = 0) => {
  if (_.isNumber(number)) {
    return (number * 100).toFixed(digits) + '%';
  }
};

export const bytes = (value, digits = 2) => {
  if (_.isString(value) && !/^[0-9]+$/.test(value)) return value;
  const k = 1024;
  if (value < k) return value + ' B';
  if ((value = (value / k)) < k) return value.toFixed(digits) + ' KB';
  if ((value = (value / k)) < k) return value.toFixed(digits) + ' MB';
  if ((value = (value / k)) < k) return value.toFixed(digits) + ' GB';
  return (value / k).toFixed(digits) + 'TB';
};

export const currency = (number, unit = '&yen;', digits = 2) => {
  if (_.isNumber(number)) {
    if (_.isNumber(unit)) {
      digits = unit;
      unit = '&yen;';
    }
    number = number.toFixed(digits).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
    return unit ? `${unit} ${number}` : number;
  }
};

export const replace = (array = [], predicate, item) => {
  const index = _.findIndex(array, predicate);
  array.splice(index, 1, item);
  return array;
};

export const contain = (array = [], target) => {
  const size = array.length,
    first = array[0],
    last = array[size - 1];
  if (!size || typeof target !== 'number') {
    return false;
  } else if (target === first || target === last) {
    return true;
  } else if (target > first && target < last) {
    const index = ~~(size * .5),
      value = array[index];
    if (value === target) {
      return true;
    } else if (index) {
      return contain(target < value ? array.slice(0, index) : array.slice(index), target);
    }
  }
  return false;
};

export const storage = (key, value, memory = localStorage) => {
  if (_.isPlainObject(key)) {
    _.forEach(key, (value, key) => {
      storage(key, value);
    });
  } else if (_.isString(key) && _.isNull(value)) {
    memory.removeItem(key);
  } else if (_.isString(key) && _.isUndefined(value)) {
    value = memory.getItem(key) || null;
    try {
      value = JSON.parse(value);
    } catch (e) {
    }
    return value;
  } else if (_.isString(key)) {
    try {
      value = JSON.stringify(value);
    } catch (e) {
    }
    memory.setItem(key, value);
  } else if (_.isNull(key)) {
    memory.clear();
  }
};

export const session = (key, value) => {
  return storage(key, value, sessionStorage);
};

export const getScript = (src, query = {}) => {
  const script = document.createElement('script');
  const querystring = qs.stringify(query);
  if (querystring) {
    src += `?${querystring}`;
  }
  script.setAttribute('src', src);
  document.body.appendChild(script);
};

export const toSnake = (str, char = '_') => {
  return str.replace(/([A-Z])/g, function ($1) {
    return char + $1.toLowerCase();
  });
};

export const fixedZero = (val, size = 2) => {
  return `${_.times(size, _.constant('0')).join('')}${val}`.substr(-size);
};

export function getTimeDistance(type) {
  const now = new Date();
  const oneDay = 1000 * 60 * 60 * 24;

  if (type === 'today') {
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    return [moment(now), moment(now.getTime() + (oneDay - 1000))];
  }

  if (type === 'week') {
    let day = now.getDay();
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);

    if (day === 0) {
      day = 6;
    } else {
      day -= 1;
    }

    const beginTime = now.getTime() - (day * oneDay);

    return [moment(beginTime), moment(beginTime + ((7 * oneDay) - 1000))];
  }

  if (type === 'month') {
    const year = now.getFullYear();
    const month = now.getMonth();
    const nextDate = moment(now).add(1, 'months');
    const nextYear = nextDate.year();
    const nextMonth = nextDate.month();

    return [moment(`${year}-${fixedZero(month + 1)}-01 00:00:00`), moment(moment(`${nextYear}-${fixedZero(nextMonth + 1)}-01 00:00:00`).valueOf() - 1000)];
  }

  if (type === 'year') {
    const year = now.getFullYear();

    return [moment(`${year}-01-01 00:00:00`), moment(`${year}-12-31 23:59:59`)];
  }
}

export function getPlainNode(nodeList, parentPath = '') {
  const arr = [];
  nodeList.forEach((node) => {
    const item = node;
    item.path = `${parentPath}/${item.path || ''}`.replace(/\/+/g, '/');
    if (item.exact === undefined) {
      item.exact = true;
    }
    if (item.children && !item.component) {
      arr.push(...getPlainNode(item.children, item.path));
    } else {
      if (item.children && item.component) {
        item.exact = false;
      }
      arr.push(item);
    }
  });
  return arr;
}

export function digitUppercase(n) {
  const fraction = ['角', '分'];
  const digit = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
  const unit = [
    ['元', '万', '亿'],
    ['', '拾', '佰', '仟'],
  ];
  let num = Math.abs(n);
  let s = '';
  fraction.forEach((item, index) => {
    s += (digit[Math.floor(num * 10 * (10 ** index)) % 10] + item).replace(/零./, '');
  });
  s = s || '整';
  num = Math.floor(num);
  for (let i = 0; i < unit[0].length && num > 0; i += 1) {
    let p = '';
    for (let j = 0; j < unit[1].length && num > 0; j += 1) {
      p = digit[num % 10] + unit[1][j] + p;
      num = Math.floor(num / 10);
    }
    s = p.replace(/(零.)*零$/, '').replace(/^$/, '零') + unit[0][i] + s;
  }

  return s.replace(/(零.)*零元/, '元').replace(/(零.)+/g, '零').replace(/^整$/, '零元整');
}

export function treeTraverse(path = '', tree, isLeafNode, errorMessage, callback) {
  if (isLeafNode(path, tree)) {
    callback(path, tree);
  } else if (tree === undefined) {
    return;
  } else if (Array.isArray(tree)) {
    tree.forEach((subTree, index) => treeTraverse(
      `${path}[${index}]`,
      subTree,
      isLeafNode,
      errorMessage,
      callback
    ));
  } else { // It's object and not a leaf node
    if (typeof tree !== 'object') {
      console.error(errorMessage);
      return;
    }
    Object.keys(tree).forEach(subTreeKey => {
      const subTree = tree[subTreeKey];
      treeTraverse(
        `${path}${path ? '.' : ''}${subTreeKey}`,
        subTree,
        isLeafNode,
        errorMessage,
        callback
      );
    });
  }
}

export function getUrlParam(name) {
  const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)');
  let hash = window.location.hash;
  const index = hash.indexOf('?') + 1;
  hash = window.location.hash.substr(index).match(reg);
  if (hash !== null) return unescape(hash[2]);
  return null;
}

export function zero(value, back) {
  if (!value) return back;
}

export function flattenFields(maybeNestedFields, isLeafNode, errorMessage) {
  const fields = {};
  treeTraverse(undefined, maybeNestedFields, isLeafNode, errorMessage, (path, node) => {
    fields[path] = node;
  });
  return fields;
}

export function upperFirstCode(str) {
  return typeof str === 'string' ? (str.substring(0, 1).toUpperCase() + str.substring(1)) : null;
}
