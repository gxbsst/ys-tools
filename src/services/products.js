// import { stringify } from 'qs';
import request from '../utils/request';

export async function queryProductDir() {
  return request('/api/directory');
}

export async function queryProductSeries() {
  return request('/api/product/series');
}

export async function addProductDir(params) {
  return request('/api/directory', {
    method: 'POST',
    body: params,
  });
}

export async function migrateProductDir(params) {
  return request('/api/directory', {
    method: 'PUT',
    body: params,
  });
}

export async function queryProductList({id, ...params}) {
  // return request(`/api/directory/${id}/product?${stringify(params)}`);
  return request(`/api/directory/${id}/product`, {
    method: 'GET',
    query: params,
  });
}

export async function getProductInfoById(id) {
  return request(`/api/product/${id}/`);
}

export async function getProductById(id) {
  return request(`/api/directory/${id}/`);
}

export async function addProduct(params) {
  return request('/api/product', {
    method: 'POST',
    body: params,
  });
}

export async function updateProduct({id, ...params}) {
  return request(`/api/product/${id}`, {
    method: 'PUT',
    body: params,
  });
}

export async function deleteProductDir(id) {
  return request(`/api/directory/${id}`, {
    method: 'DELETE'
  });
}
