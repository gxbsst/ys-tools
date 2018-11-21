import request from '../utils/request';

export async function getCurrentUser() {
  return request('/api/account');
}