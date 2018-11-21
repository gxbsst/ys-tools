import { dynamicWrapper } from './index';

export default app => ({
  name: "财务管理",
  icon: "bank",
  path: "finance",
  can: [8000000],
  children: [
    {
      name: "回款管理",
      path: "repayment",
      can: [8001000],
      component: dynamicWrapper(app, ["repay"], () =>
        import("../routes/Finance/RepaymentsManage")
      )
    },
    {
      name: "发票管理",
      path: "invoice",
      can: [8002000],
      component: dynamicWrapper(app, ["invoice", "user"], () =>
        import("../routes/Finance/InvoiceManage")
      )
    },
    {
      name: "业务开通",
      path: "business-open",
      can: [8003000],
      component: dynamicWrapper(app, ["busiopen"], () =>
        import("../routes/Finance/BusinessOpen")
      )
    }
  ]
})