import { dynamicWrapper } from './index';

export default app => (
  {
    name: '调试工具',
    icon: 'tool',
    path: 'tool',
    can: 11000000,
    component: dynamicWrapper(app, ['mien', 'announcement', 'message', 'rank'], () =>
      import("../routes/Dashboard/Workplace")
    )
  }
)
