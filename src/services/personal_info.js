import request from '../utils/request';

export async function GetStaff({name = ''}) {
  return request(`/api/personnel/employee?name=${name}`);
}

export async function getStaffList() {
  return request(`/api/personnel/employee`);
}
export async function addPersonal(params, id) {
  return request(`/api/personnel/employee/?id=${id}`, {
    method: 'PUT',
    body: {
      ...params,
    },
  });
}

export async function getBranch() {
  return request('/api/personnel/department');
}

export async function getBranchStaff({id = 1}) {
  return request(`/api/personnel/department/${id}/employee`);
}

export async function addTissue(params) {
  return request(`/api/personnel/department`, {
    method: 'POST',
    body: {
      ...params,
    },
  });
}

export async function delTissue(id) {
  return request(`/api/personnel/department/${id}`, {
    method: 'delete',
  });
}

// 添加员工

export async function addStaff({dId, eId, params}) {
  return request(`/api/personnel/department/${dId}/employee/${eId}`, {
    method: 'POST',
    body: {
      ...params,
    },
  });
}

// 新建员工
export async function newStaff(params) {
  return request(`/api/personnel/employee`, {
    method: 'POST',
    body: {
      ...params,
    },
  });
}

// 角色权限管理
// 删除角色
export async function delRole(id) {
  return request(`/api/role/${id}`, {
    method: "delete"
  });
}

// 获取权限资源树
export async function getRoleTree(id) {
  return request(`/api/permissions`);
}

// 添加角色

export async function addRole(params) {
  return request(`/api/role`, {
    method: 'POST',
    body: {
      ...params,
    },
  });
}

export async function editRole(params) {
  return request(`/api/role`, {
    method: 'PUT',
    body: {
      ...params,
    },
  });
}
