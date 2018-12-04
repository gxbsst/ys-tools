import { dynamicWrapper } from './index';

export default app => (
  {
    name: '车辆管理',
    icon: 'car',
    path: 'vehicle_manager',
    can: [12000000, 6000000],
    children: [
      {
        name: '车辆信息',
        path: 'vehicle',
        can: 12001000,

        children: [
          {
            path: '/',
            component: dynamicWrapper(app, [], () => import('../routes/Vehicle/index')),
          },
          {
            path: ':id',
            children: [
              {
                title: '详情',
                path: 'detail',
                component: dynamicWrapper(app, [], () => import('../routes/Vehicle/detail.page')),
              },
            ],
          },
        ]
      },
    ],
  }
)
