import dynamic from 'dva/dynamic';

// wrapper of dynamic
const dynamicWrapper = (app, models, component) =>
  dynamic({
    app,
    models: () => models.map(m => import(`../models/${m}.js`)),
    component
  });

export default dynamicWrapper
