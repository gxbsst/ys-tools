import { stringify } from 'qs';
import request from '../utils/request';

export async function getMienList() {
  return request('/api/mien');
}