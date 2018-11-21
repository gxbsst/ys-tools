import { dynamicWrapper } from './index';

export default app => ({
  name: '人事管理',
  icon: 'usergroup-add',
  path: 'personnel',
  can: 11000000,
  children: [
    {
      name: '人员信息管理',
      path: 'staffs',
      can: 11001000,
      component: dynamicWrapper(app, [], () => import('../routes/Personnel/Staff/index'))
    },
    {
      name: '组织架构管理',
      path: 'organization',
      can: 11002000,
      component: dynamicWrapper(app, [], () => import('../routes/Personnel/Organization/index')),
    },
    {
      name: '角色权限管理',
      path: 'roles',
      can: 11003000,
      children: [
        {
          path: '/',
          title: '角色权限管理',
          component: dynamicWrapper(app, [], () => import('../routes/Personnel/Role/index')),
        },
        {
          path: 'new',
          title: '新建角色',
          component: dynamicWrapper(app, [], () => import('../routes/Personnel/Role/Edit')),
        },
        {
          path: ':id',
          title: '编辑角色',
          component: dynamicWrapper(app, [], () => import('../routes/Personnel/Role/Edit')),
        },
      ]
    },
    {
      name: '坐席管理',
      path: 'callcenter',
      can: 11004000,
      component: dynamicWrapper(app, [], () =>
        import('../routes/CallCenter/Seat')
      ),
    },
  ],
})
