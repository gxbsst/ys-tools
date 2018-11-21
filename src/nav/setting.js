import { dynamicWrapper } from './index';

export default app => (
  {
    name: '系统配置',
    icon: 'setting',
    path: 'setting',
    can: [12000000, 6000000],
    children: [
      {
        name: '产品管理',
        path: 'products',
        can: 12001000,
        component: dynamicWrapper(app, ['setting/products'], () => import('../routes/Setting/Products')),
      },
      {
        name: '资源流管理',
        path: 'resource-flow',
        can: 12002000,
        component: dynamicWrapper(app, ['setting/resourceFlow'], () => import('../routes/Setting/ResourceFlow')),
      },
      {
        name: '风采管理',
        path: 'mien',
        can: 6001000,
        component: dynamicWrapper(app, [], () => import('../routes/Setting/Mien')),
      },
      {
        name: '公告管理',
        path: 'announcement',
        can: 6002000,
        component: dynamicWrapper(app, [], () => import('../routes/Setting/Announcement')),
      },
      {
        name: '龙虎榜管理',
        path: 'rank',
        can: 6003000,
        component: dynamicWrapper(app, [], () => import('../routes/Setting/Rank')),
      },
    ],
  }
)
