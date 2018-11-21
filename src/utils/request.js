import fetch from 'dva/fetch';
import qs from 'qs';
import _ from 'lodash';
import { notification, message } from 'antd';
import { hash, session, storage, redirectToLogin } from './index';

export default (...args) => {
  const remind = _.find(args, _.isBoolean) === false ? 0 : 1;
  const messages = _.find(args, _.isArray);
  let options = _.merge({
    method: 'GET',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json; charset=utf-8',
    }
  }, _.find(args, _.isPlainObject));
  let url = _.get(options, 'url', _.find(args, _.isString));
  if (!url) return console.warn('<request> 方法请求路径不能为空.');

  options.method = options.method.toUpperCase();
  const { method, body, params, query, cache, force, ...restOptions } = options;
  options = { ...restOptions, method };

  if (body && (method === 'POST' || method === 'PUT')) {
    options = { ...options, body: JSON.stringify(body) };
  }
  if (params) {
    url = url.replace(/\/+/, '/').replace(/:([a-z0-9_\-%]+)/ig, (...args) => (params[args[1]] || ''));
  }
  if (query) {
    const chunk = url.split('?');
    const queryString = qs.stringify(_.merge(qs.parse(chunk[1]), query));
    url = `${chunk[0]}${queryString ? '?' + queryString : ''}`;
  }
  let cacheStorage = null;
  let cacheKey = null;
  if (cache && method === 'GET') {
    cacheKey = hash(url);
    cacheStorage = cache === 'storage' ? storage : session;
  }

  return new Promise(async (resolve, reject) => {
    try {
      if (cacheKey) {
        const cache = cacheStorage(cacheKey);
        if (!force && cache) return resolve(cache);
      }
      const response = await fetch(url, options);
      if (response.status >= 200 && response.status < 300) {
        let responseJSON = null;
        try {
          responseJSON = await response.json();
        } catch (e) {
          cacheKey && cacheStorage(cacheKey, responseJSON);
          return resolve(responseJSON);
        }
        const { code, errMsg, msg, message: text = errMsg || msg } = responseJSON;
        switch (code) {
          case 0:
            cacheKey && cacheStorage(cacheKey, responseJSON);
            return resolve(responseJSON);
          case -1:
            remind && message.error('发生未知错误');
            return reject(responseJSON);
          case 401:
            // case 403:
            return redirectToLogin();
        }
        const customize = _.find(messages, { code });
        if (remind) {
          if (customize) {
            const { message: text, type = 'error' } = customize;
            message[type](text);
          } else {
            message.error(text);
          }
        }
        return reject(responseJSON);
      }
      notification.error({
        message: `请求错误 ${response.status}：${url}`,
        description: response.statusText,
      });
      reject(response);
    } catch (error) {
      console.log(error);
      if (error.code) {
        notification.error({
          message: error.name,
          description: error.message,
        });
      }
      reject(error);
    }
  });
}
