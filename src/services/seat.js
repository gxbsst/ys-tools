import { stringify } from 'qs';
import request from '../utils/request';

export async function getSeatList() {
  return request('/api/seat');
}