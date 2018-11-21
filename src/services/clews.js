// import { stringify } from 'qs';
import req from '../utils/request';

// 切换mock接口
// const request = (url, ...args) => req(`/_${url.slice(1)}`, ...args);
const request = req;

/**
 * query clew list
 * @param  {Object} params expect searcher, pagination
 * @return {Array}
 */
export async function queryClews(params) {
  // return request(`/api/clews?${stringify(params)}`);
  return request(`/api/clews${params.column ? '/search' : ''}`, {
    method: 'GET',
    query: params,
  });
}

/**
 * query clew detail by id
 * @param  {Number} id the unique key of a clew
 * @return {Object}
 */
export async function queryClewInfoById(id) {
  return request(`/api/clews/${id}`);
}
export async function queryContactsById(id) {
  return request(`/api/clews/${id}/link`);
}
export async function queryStoresById(id) {
  return request(`/api/clews/${id}/store`);
}

/**
 * query clew logs by id
 * @param  {Number} id the unique key
 * @return {Array}
 */
export async function queryClewLogs({id, ...params}) {
  return request(`/api/clews/${id}/logs`, {
    query: params,
  });
}

/**
 * add clew action
 * @param {Object} params clew info
 */
export async function addClew(params) {
  return request('/api/clews', {
    method: 'POST',
    body: params,
  }, false);
}

/**
 * clean clew action
 * @param {Object} params clew info
 */
export async function cleanClew(params) {
  return request('/api/clews', {
    method: 'PUT',
    body: params,
  }, false);
}

/**
 * abandon clew action
 * @param {Object} params clew info
 */
export async function abandonClew(params) {
  return request('/api/clews/discard', {
    method: 'PUT',
    body: params,
  });
}

/**
 * activate clew action
 * @param {Object} params clew info
 */
export async function activateClew({id}) {
  return request(`/api/clews/${id}/activate`, {
    method: 'PUT',
  });
}

/**
 * arraign clew action
 * @param {Object} params clew info
 */
export async function arraignClew({id}) {
  return request(`/api/clews/${id}/arraignment`, {
    method: 'PUT',
  });
}

/**
 * assign clew action
 * @param {Object} params clew info
 */
export async function assignClew(params) {
  return request('/api/clews/allot', {
    method: 'PUT',
    body: params,
  });
}

/**
 * check clew action
 * @param {Object} params clew info
 */
export async function checkClew({id, ...params}) {
  return request(`/api/processes/${id}`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * check clew action
 * @param {Object} params clew info
 */
export async function batchCheckClew(params) {
  return request('/api/processes/batchExamine', {
    method: 'PUT',
    body: params,
  });
}

/**
 * apply clew action
 * @param {Object} params clew info
 */
export async function applyClew(params) {
  return request('/api/clews/apply', {
    method: 'PUT',
    body: params,
  });
}

/**
 * urgent clew action
 * @param {Object} params clew info
 */
export async function urgentClew({id}) {
  return request(`/api/clews/${id}/urgent`, {
    method: 'PUT',
  });
}

/**
 * rollout clew action
 * @param {Object} params clew info
 */
export async function rolloutClew({id, ...params}) {
  return request(`/api/clews/${id}/roll`, {
    method: 'PUT',
    body: params,
  });
}

export async function removeClews(params) {
  return request('/_api/clews', {
    method: 'POST',
    body: {
      ...params,
      method: 'delete',
    },
  });
}
