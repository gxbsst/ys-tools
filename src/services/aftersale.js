import {stringify} from 'qs';
import request from '../utils/request';

export async function GetCustomerList() {
  return request('/api/customer/customers');
}

// 跟进信息列表
export async function followInfoList(params) {
  return request(`/api/clewFollowLog/list?${stringify(params)}`);
}
