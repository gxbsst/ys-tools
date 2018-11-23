import { dynamicWrapper } from './index';

export default app => (
  {
    name: '日志管理',
    icon: 'bell',
    path: 'logs',
    can: 11000000,
    children: [
      {
        name: '错误日志',
        path: 'errors',
        can: 11001000,
        component: dynamicWrapper(app, ['mien', 'announcement', 'message', 'rank'], () =>
          import("../routes/Dashboard/Workplace")
        )
      },{
        name: '警告日志',
        path: 'warning',
        can: 11001000,
        component: dynamicWrapper(app, ['mien', 'announcement', 'message', 'rank'], () =>
          import("../routes/Dashboard/Workplace")
        )
      },{
        name: '问题上传',
        path: 'upload',
        can: 11001000,
        component: dynamicWrapper(app, ['mien', 'announcement', 'message', 'rank'], () =>
          import("../routes/Dashboard/Workplace")
        )
      }
    ],
  }
)
