import { stringify } from 'qs';
import request from '../utils/request';

export async function getRankList() {
  return request('/api/rank');
}