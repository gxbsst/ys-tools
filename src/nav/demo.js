import { dynamicWrapper } from './index';

const getNavDemo = app => ({
  title: 'Demos',
  icon: 'profile',
  path: 'demo',
  children: [
    {
      name: 'Forms',
      path: 'form',
      children: [
        {
          name: '水平登录栏', path: 'horizontalLogin',
          component: dynamicWrapper(app, ['form'], () => import('../routes/Demos/horizontalLogin')),
        },
        {
          name: '普通登录框', path: 'normalLogin',
          component: dynamicWrapper(app, [], () => import('../routes/Demos/normalLogin')),
        },
        {
          name: '注册新用户', path: 'register', component: dynamicWrapper(app, [], () => import('../routes/Demos/register')),
        },
        {
          name: '注册新用户DA',
          path: 'registerDA',
          component: dynamicWrapper(app, [], () => import('../routes/Demos/registerDA')),
        },
        {
          name: '高级搜索',
          path: 'advancedSearch',
          component: dynamicWrapper(app, [], () => import('../routes/Demos/advancedFormSearch'))
        },
        {
          name: '高级搜索DA',
          path: 'advancedSearchDA',
          component: dynamicWrapper(app, [], () => import('../routes/Demos/advancedFormSearchDA'))
        },
        {
          name: '表单数据',
          path: 'formData',
          component: dynamicWrapper(app, [], () => import('../routes/Demos/Forms/formData'))
        },
      ],
    },
    {
      name: 'Data Entry',
      path: 'entry',
      children: [
        {
          name: 'Select',
          path: 'selects',
          component: dynamicWrapper(app, [], () => import('../routes/Demos/dataEntry/selects')),
        },
        {
          name: 'Cascader',
          path: 'cascaders',
          component: dynamicWrapper(app, [], () => import('../routes/Demos/dataEntry/cascaders')),
        },
      ]
    },
    {
      name: 'Tree',
      path: 'tree',
      children: [
        {
          name: 'base use',
          path: 'base',
          component: dynamicWrapper(app, [], () => import('../routes/Demos/Tree/BaseTree')),
        },
        {
          name: 'ControlledTree',
          path: 'control',
          component: dynamicWrapper(app, [], () => import('../routes/Demos/Tree/ControlledTree')),
        },
        {
          name: 'GragTree',
          path: 'drag',
          component: dynamicWrapper(app, [], () => import('../routes/Demos/Tree/DragTree')),
        },
        {
          name: 'BaseTable',
          path: 'base',
          component: dynamicWrapper(app, [], () => import('../routes/Demos/Tree/DragTree')),
        },
      ]
    },
    {
      name: 'Table',
      path: 'table',
      children: [
        {
          name: 'BaseTable',
          path: 'base',
          component: dynamicWrapper(app, [], () => import('../routes/Demos/Table/Base')),
        },
        {
          name: 'JsxApi', path: 'jsx', component: dynamicWrapper(app, [], () => import('../routes/Demos/Table/JsxApi')),
        },
      ]
    },
  ],
});

export default getNavDemo
