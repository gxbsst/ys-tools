import { dynamicWrapper } from './index';

export default app => ({
  name: "我的工作台",
  icon: "dashboard",
  path: "workplace",
  component: dynamicWrapper(app, ['mien', 'announcement', 'message', 'rank'], () =>
    import("../routes/Dashboard/Workplace")
  )
})