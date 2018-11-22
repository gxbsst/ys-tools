import dynamic from 'dva/dynamic';
import workplace from './workplace';
// import clew from './clew';
// import retail from './retail';
// import shop from './arriveShop';
// import approval from './approval';
// import finance from './finance';
// import business from './business';
// import afterSales from './after-sales';
// import personnel from './personnel';
import setting from './setting';
// import search from './search';
// import callcenter from './callcenter';
import auth from './auth';
import vehicleManager from './vehicle-manager';

export const dynamicWrapper = (app, models, component) => dynamic({
  app,
  models: () => models.map(m => import(`../models/${m}.js`)),
  component
});

export const getNavData = app => [
  {
    component: dynamicWrapper(app, ['user'], () => import('../layouts/AuthLayout')),
    layout: 'AuthLayout',
    name: '用户登录',
    children: [
      auth(app),
    ]
  },
  {
    component: dynamicWrapper(app, ['user', 'callCenter'], () => import('../layouts/BasicLayout')),
    layout: 'BasicLayout',
    name: '首页',
    children: [

      workplace(app),
      vehicleManager(app),
      // search(app),
      // callcenter(app),
      // clew(app),
      // retail(app),
      // shop(app),
      // approval(app),
      // finance(app),
      // business(app),
      // afterSales(app),
      // personnel(app),
      setting(app),
      {
        title: '自定义Demo',
        path: 'demo',
        icon: 'coffee',
        component: dynamicWrapper(app, [], () => import('../routes/Demos/Seat')),
      }
    ]
  },
];
