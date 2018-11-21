import request from '../utils/request';

export async function approve({ id, ...params }) {
  return request(`/api/processes/${id}`, {
    method: 'PUT',
    body: params
  });
}

export async function getApprovalDetails(param) {
  return request(`/api/processes/${param}`);
}

export async function getApprovalType() {
  return request('/api/processes/type');
}
