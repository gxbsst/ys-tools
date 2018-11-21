
export const tree = (data, parentId = 0) => data.filter(v => (v.parentId === parentId))
  .map(v => {
    const children = tree(data, v.id);
    if (children.length > 0) {
      return {
        ...v,
        children,
      }
    } else {
      return v;
    }
  });

export function transferSimpleTreeData(treeData, treeDataSimpleMode) {
  if (treeDataSimpleMode) {
    const simpleFormat = {
      id: 'id',
      pId: 'pId',
      rootPId: null
    };
    if (Object.prototype.toString.call(treeDataSimpleMode) === '[object Object]') {
      Object.assign(simpleFormat, treeDataSimpleMode);
    }
    return processSimpleTreeData(treeData, simpleFormat);
  }
}
export const hasPermission = (has = [], should = []) => has.some(item => should.includes(item));
function processSimpleTreeData(treeData = [], format) {
  function unflatten2(arr) {
    const array = [...arr];
    let _ref;
    const parent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : (_ref = {}, _ref[format.id] = format.rootPId, _ref);
    const children = [];
    for (let i = 0; i < array.length; i++) {
      array[i] = Object.assign({}, array[i]);
      if (array[i][format.pId] === parent[format.id]) {
        array[i].key = array[i][format.id];
        // format.title && array[i].title = array[i][format.title];
        children.push(array[i]);
        array.splice(i--, 1);
      }
    }
    if (children.length) {
      parent.children = children;
      children.forEach(child => {
        return unflatten2(array, child);
      });
    }
    if (parent[format.id] === format.rootPId) {
      return children;
    }
  }
  return unflatten2(treeData);
}

export const formatFromSource = arr =>
  arr.map(item => ({value: item.id, label: item.fromName, key: item.id, children: !item.childList ? undefined : formatFromSource(item.childList)}))

export const formatIndustry = arr =>
  arr.map(item => ({value: item.id, label: item.industryName, key: item.id, isLeaf: !!item.parentId}))

function tt(arr) {
	return arr.map(item => ({label: item.title, key: item.key, children: !item.children ? undefined : tt(item.children)}))
}

const treeData = [{
  label: '产品管理',
  key: '0-0',
  value: '0-0',
  children: [{
    label: '新零售产品线',
    key: '0-0-0',
    value: '0-0-0',
    children: [
      { label: '微电商解决方案', key: '0-0-0-0', value: '0-0-0-0' },
      { label: '微站解决方案', key: '0-0-0-1', value: '0-0-0-1' },
      { label: '会务解决方案', key: '0-0-0-2', value: '0-0-0-2' },
      { label: '微盟老业务', key: '0-0-0-3', children: [
        { label: '微汽车方案', key: '0-0-0-0-0', value: '0-0-0-0-0' },
        { label: '微酒店方案', key: '0-0-0-0-1', value: '0-0-0-0-1' },
        { label: '微医疗方案', key: '0-0-0-0-2', value: '0-0-0-0-2' },
      ]},
    ],
  }, {
    label: '到店产品线',
    key: '0-0-1',
    children: [
      { label: '智慧外卖解决方案', key: '0-0-1-0', value: '0-0-1-0' },
      { label: '智慧餐厅解决方案', key: '0-0-1-1', value: '0-0-1-1' },
      { label: '客来店解决方案', key: '0-0-1-2', value: '0-0-1-2' },
    ],
  }],
}];

const simpleTreeData = [
  { id:1,   parentId:0, name:"产品管理"},
  { id:2,   parentId:1, name:"新零售产品线"},
  { id:3,   parentId:1, name:"到店产品线"},
  { id:4,   parentId:2, name:"微电商解决方案"},
  { id:5,   parentId:2, name:"微站解决方案"},
  { id:6,   parentId:2, name:"会务解决方案"},
  { id:7,   parentId:2, name:"微盟老业务"},
  { id:8,   parentId:3, name:"智慧外卖解决方案"},
  { id:9,   parentId:3, name:"智慧餐厅解决方案"},
  { id:10,  parentId:3, name:"客来店解决方案"},
  { id:11,  parentId:7, name:"微汽车方案"},
  { id:12,  parentId:7, name:"微酒店方案"},
  { id:13,  parentId:7, name:"微医疗方案"},
];
