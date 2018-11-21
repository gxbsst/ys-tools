import { dynamicWrapper } from './index';

export default app => ({
  name: '客户查询',
  icon: 'solution',
  path: 'search',
  can: 2001000,
  component: dynamicWrapper(app, [], () => import('../routes/Search')),
  children: [
    {
      title: '线索',
      path: 'clew',
      tab: true,
      component: dynamicWrapper(app, [], () => import('../routes/Search/Clew')),
    },
    {
      title: '机会',
      path: 'chance',
      tab: true,
      component: dynamicWrapper(app, [], () => import('../routes/Search/Chance')),
    },
    {
      title: '客户',
      path: 'customer',
      tab: true,
      component: dynamicWrapper(app, [], () => import('../routes/Search/Customer')),
    },
  ]
})
