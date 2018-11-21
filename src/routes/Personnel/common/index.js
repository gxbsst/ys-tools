export function redraw(arr) {
  console.info('待处理数据',arr);
  let result = {};
  arr.forEach(function (ele, index) {
    let childrenIds = [];
    arr.forEach(function(el,i) {
      if (el.parentId == ele.id) {
        childrenIds.push(el.id);
      }
    });
    result[ele.id] = { parentId: ele.parentId, name: ele.name, childrenIds: childrenIds };
  });
  return result
}
