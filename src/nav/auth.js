import { dynamicWrapper } from './index';

export default app => ({
  title: '系统授权',
  path: 'auth',
  children: [
    {
      title: '系统用户登录',
      path: 'login',
      component: dynamicWrapper(app, ['user'], () => import('../routes/Auth/Login')),
    }
  ],
})
