import {dynamicWrapper} from './index';

export default app => ({
  name: '售后服务',
  icon: 'customer-service',
  path: 'aftersale',
  can: 10000000,
  children: [
    {
      name: '售后客户',
      path: 'afterServe',
      can: 10001000,
      component: dynamicWrapper(app, ['aftersale'], () => import('../routes/aftersale/afterServe/index'))
    },
    {
      name: '我的客户',
      path: 'mycuStomer',
      can: 10009000,
      component: dynamicWrapper(app, ['aftersale'], () => import('../routes/aftersale/myCustomer/index'))
    },
    {
      title: '客户详情',
      path: 'details/:id',
      component: dynamicWrapper(app, ['aftersale'], () => import('../routes/aftersale/details/index')),
      children: [
        {
          title: '基本信息',
          path: 'baseInfo',
          tab: true,
          can: [10002000, 4007000, 5004000],
          component: dynamicWrapper(app, ['aftersale'], () => import('../routes/aftersale/details/baseInfo/index')),
        },
        {
          title: '跟进信息',
          path: 'follow',
          tab: true,
          can: [10003000, 4007000, 5004000],
          component: dynamicWrapper(app, ['aftersale'], () => import('../routes/aftersale/details/follow_Info/index')),
        },
        {
          title: '提单信息',
          path: 'bill',
          tab: true,
          can: [10004000, 4007000, 5004000],
          component: dynamicWrapper(app, ['aftersale'], () => import('../routes/aftersale/details/bill_info/index')),
        },
        {
          title: '业务信息',
          path: 'business',
          tab: true,
          can: [10005000, 4007000, 5004000],
          component: dynamicWrapper(app, ['aftersale'], () => import('../routes/aftersale/details/business_info/index')),
        },
        {
          title: '回款信息',
          path: 'returned',
          tab: true,
          can: [10006000, 4007000, 5004000],
          component: dynamicWrapper(app, ['aftersale'], () => import('../routes/aftersale/details/returned/index')),
        },
        {
          title: '合同信息',
          path: 'contract',
          tab: true,
          can: [10007000, 4007000, 5004000],
          component: dynamicWrapper(app, ['aftersale'], () => import('../routes/aftersale/details/contract_info/index')),
        },
        {
          title: '发票信息',
          path: 'invoice',
          tab: true,
          can: [10008000, 4007000, 5004000],
          component: dynamicWrapper(app, ['aftersale'], () => import('../routes/aftersale/details/invoice_info/index')),
        },
      ]
    },
    {
      title: '回款详情',
      path: 'returned/:id',
      component: dynamicWrapper(app, ['aftersale'], () => import('../routes/aftersale/details/checkreturned'))
    },
    {
      title: '业务详情',
      path: 'business/:id',
      component: dynamicWrapper(app, ['aftersale'], () => import('../routes/aftersale/details/business_info/business'))
    },
    {
      title: '合同详情',
      path: 'contract/:id/:contractNo',
      component: dynamicWrapper(app, ['aftersale'], () => import('../routes/aftersale/details/checkcontract'))
    },
    {
      title: '提单详情',
      path: 'bill/detail/:id',
      tab: true,
      component: dynamicWrapper(app, ['aftersale'], () =>
        import('../routes/aftersale/details/checkBill')
      )
    },
    {
      title: '提单',
      path: 'bill/:customerId',
      component: dynamicWrapper(app, ['aftersale'], () => import('../routes/aftersale/details/bill'))
    },
    {
      name: '回访续费',
      path: 'returnVisit',
      can: 10010000,
      component: dynamicWrapper(app, ['aftersale', 'callCenter'], () => import('../routes/aftersale/returnVisit/index'))
    },
    {
      name: '增值服务客户',
      path: 'addValue',
      can: 10011000,
      component: dynamicWrapper(app, ['aftersale'], () => import('../routes/aftersale/addValue/index'))
    }
  ]
})
