import { stringify } from 'qs';
import request from '../utils/request';

export async function getMessageList() {
  return request('/api/message');
}