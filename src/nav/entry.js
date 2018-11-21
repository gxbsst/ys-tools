import { dynamicWrapper } from './index';

export default app => ({
  name: '线索录入',
  path: 'entry',
  icon: 'plus',
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
})
