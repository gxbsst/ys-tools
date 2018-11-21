import request from '../utils/request';

export async function queryResourceFlow(type) {
  return request(`/api/resourceflow/${type}`);
}

export async function editResourceFlow(params) {
  return request('/api/resourceflow', {
    method: 'PUT',
    body: params,
  });
}
