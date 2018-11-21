import { dynamicWrapper } from './index';

export default app => ({
  name: '业务管理',
  icon: 'folder',
  path: 'business',
  can: 9000000,
  children: [
    {
      name: '客户管理',
      path: 'customers',
      can: 9001000,
      component: dynamicWrapper(app, ['business'], () => import('../routes/Business/Customer/index')),
    },
    {
      name: '业务判单',
      path: 'judge',
      can: 9002000,
      component: dynamicWrapper(app, ['business'], () => import('../routes/Business/Judge/index')),
      children: [
        {
          title: '新增判单',
          path: 'orders',
          tab: true,
          component: dynamicWrapper(app, ['business'], () => import('../routes/Business/Judge/Order')),
        },
        {
          title: '历史判单',
          path: 'histories',
          tab: true,
          component: dynamicWrapper(app, ['business'], () => import('../routes/Business/Judge/History')),
        }
      ]
    },
    {
      name: '合同管理',
      path: 'contracts',
      can: 9003000,
      children: [
        {
          path: '/',
          title: '合同管理',
          component: dynamicWrapper(app, ['business'], () => import('../routes/Business/Contract/index'))
        },
        {
          path: ':id',
          title: '合同详情',
          component: dynamicWrapper(app, ['business'], () => import('../routes/Business/Contract/Detail'))
        },
      ]
    },
    {
      name: '认款申请',
      path: 'claims',
      can: 9004000,
      children: [
        {
          title: '认款申请',
          path: '/',
          component: dynamicWrapper(app, ['business'], () => import('../routes/Business/Claim/index'))
        }, {
          title: '关联回款',
          path: ':id/associate',
          component: dynamicWrapper(app, ['business'], () => import('../routes/Business/Claim/Associate'))
        }, {
          title: '认款详情',
          path: ':id',
          component: dynamicWrapper(app, ['business'], () => import('../routes/Business/Claim/Detail'))
        }
      ]
    }
  ]
})
