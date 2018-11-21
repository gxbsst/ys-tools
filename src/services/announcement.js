import { stringify } from 'qs';
import request from '../utils/request';

export async function getAnnouncementList() {
  return request('/api/announcement');
}