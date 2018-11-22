import { dynamicWrapper } from './index';

export default app => (
  {
    name: '系统配置',
    icon: 'setting',
    path: 'personnel',
    can: [12000000, 6000000, 11000000],
    children: [
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
    ],
  }
)
