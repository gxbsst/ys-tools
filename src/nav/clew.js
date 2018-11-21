import { dynamicWrapper } from './index';

export default app => ({
  name: '线索管理',
  icon: 'fork',
  path: 'clew',
  can: [2002000, 3001000, 4001000, 4002000, 5005000, 5006000],
  children: [
    {
      name: '线索库',
      path: 'clews',
      can: [3001000, 4001000, 4002000, 5005000, 5006000],
      children: [
        {
          path: '/',
          component: dynamicWrapper(app, ['clew/clews'], () => import('../routes/Clew/List')),
        },
        {
          path: ':id',
          children: [
            {
              title: '线索清洗',
              path: 'clean',
              component: dynamicWrapper(app, ['clew/clews'], () => import('../routes/Clew/ClewClean')),
            },
            {
              title: '线索详情',
              path: 'detail',
              component: dynamicWrapper(app, ['clew/clews'], () => import('../routes/Clew/Detail')),
            },
          ],
        },
      ],
    },
    {
      name: '线索录入',
      path: 'entry',
      can: 2002000,
      children: [
        {
          path: '/',
          component: dynamicWrapper(app, [], () => import('../routes/Clew/Entry')),
        },
        {
          title: '单条录入',
          path: ':id',
          component: dynamicWrapper(app, ['clew/clews'], () => import('../routes/Clew/ClewForm')),
        },
      ],
    },
  ],
})
