import _ from 'lodash';
import { request, storage, toSnake } from './index';

export default class WMC {
  static defaults = {
    autoOrient: true,
    strip: true,
    crop: true,
    proportion: true,
    quality: 75,
    interlace: 1
  };

  config = {};

  constructor(accessKey) {
    if (_.isNumber(accessKey)) {
      this.accessKey = accessKey;
      const { config } = this;
      const cacheKey = 'wmc_config';
      const cache = storage(cacheKey);
      if (cache) {
        _.merge(config, cache);
      } else {
        request('/wmc/config', { headers: { accessKey } })
          .then(({ data }) => {
            _.merge(config, data);
            storage(cacheKey, data);
          });
      }
    }
  }

  oss = (url, opts, ratio = 1.5) => {
    opts = _.merge({}, WMC.defaults, opts);
    const params = ['x-oss-process=image'];
    const map = {};
    _.forEach(opts, (v, k) => {
      k = toSnake(k, '-');
      let args = map[k] || {};
      if (k === 'crop') {
        k = 'resize';
        args = map[k] || {};
        args.m = v ? 'fill' : (args.m || 'lfit');
      } else if (k === 'width') {
        k = 'resize';
        args = map[k] || {};
        args.w = ~~(v * ratio);
      } else if (k === 'height') {
        k = 'resize';
        args = map[k] || {};
        args.h = ~~(v * ratio);
      } else if (k === 'proportion') {
        k = 'resize';
        args = map[k] || {};
        args.m = v ? 'lfit' : (args.m || 'fixed');
      } else if (k === 'quality') {
        args.q = v;
      } else if (/^(auto-orient|interlace|rotate)$/i.test(k)) {
        if (_.isNumber(v)) {
          args = v;
        } else if (_.isBoolean(v)) {
          args = v ? 1 : 0;
        }
      } else if (/^(format)$/i.test(k)) {
        if (/^(jpg|bmp|gif|png|webp)$/i.test(v = v.toLowerCase())) args = v;
      } else {
        k = null;
      }
      k && (map[k] = args);
    });
    if (map.resize && (map.resize.m === 'fill' && (!map.resize.w || !map.resize.h))) {
      map.resize.m = 'lfit';
    }
    _.forEach(map, (value, key) => {
      const args = [key];
      if (_.isPlainObject(value)) {
        _.forEach(value, (v, k) => {
          args.push(`${k}_${v}`);
        });
      } else {
        args.push(value);
      }
      params.push(args.join(','));
    });
    return url + '?' + params.join('/');
  };

  cos = (url, opts, ratio = 1.5) => {
    opts = _.merge({}, WMC.defaults, opts);
    const size = ['', 'x', ''];
    let params = ['imageMogr2', 'thumbnail', ''];
    _.forEach(opts, (v, k) => {
      k = toSnake(k, '-');
      if (k === 'crop') {
        v && (params[1] = 'crop');
      } else if (k === 'width') {
        size[0] = v ? ~~(v * ratio) : '';
      } else if (k === 'height') {
        size[2] = v ? ~~(v * ratio) : '';
      } else if (k === 'proportion') {
        !v && (params[2] += '!');
      } else if (/^(auto-orient|strip)$/i.test(k)) {
        v && params.push(k);
      } else if (/^(quality|interlace|cgif|rotate)$/i.test(k)) {
        _.isNumber(v) && (params = params.concat([k, v]));
      } else if (/^(format)$/i.test(k)) {
        /^(jpg|bmp|gif|png|webp|yjpeg)$/i.test(v = v.toLowerCase()) && (params = params.concat([k, v]));
      }
    });
    params[2] = size.join('') + params[2];
    return url + '?' + params.join('/');
  };

  cdn = (url, opts, ratio = 1.5, store) => {
    if (_.isString(ratio)) {
      store = ratio;
      ratio = 1.5;
    }
    const { config: { storeType = 'cos' } } = this;
    store = store || storeType;
    return this[store].call(this, url, opts, ratio);
  };
}
