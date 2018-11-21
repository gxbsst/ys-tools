import { dynamicWrapper } from './index';

export default app => ({
  name: '新零售销售管理',
  icon: 'area-chart',
  path: 'saleRetail',
  can: 4000000,
  children: [
    {
      name: '公海',
      path: 'retailHighSea',
      can: [4003000, 4005000],
      component: dynamicWrapper(app, ['saleRetail'], () =>
        import('../routes/sale/retail/highSea/')
      ),
      children: [
        {
          path: 'common',
          tab: true,
          can: 4003000,
          title: 'IS-常规资源',
          component: dynamicWrapper(app, ['saleRetail'], () =>
            import('../routes/sale/retail/highSea/retailCommon.js')
          ),
          hideInMenu: true,
        },
        {
          path: 'order',
          tab: true,
          can: 4003000,
          title: 'IS-订单资源',
          component: dynamicWrapper(app, ['saleRetail'], () =>
            import('../routes/sale/retail/highSea/retailOrder.js')
          ),
          hideInMenu: true,
        },
        {
          path: 'OS',
          tab: true,
          title: 'OS',
          can: 4005000,
          component: dynamicWrapper(app, ['saleRetail'], () =>
            import('../routes/sale/retail/highSea/retailOS.js')
          ),
          hideInMenu: true,
        },

      ],
    },
    {
      name: '私海',
      path: 'retailPrivateSea',
      can: [4004000, 4006000],
      component: dynamicWrapper(app, ['saleRetail'], () =>
        import('../routes/sale/retail/privateSea/')
      ),
      children: [
        {
          path: 'common',
          tab: true,
          can: 4004000,
          title: 'IS-常规资源',
          component: dynamicWrapper(app, ['saleRetail'], () =>
            import('../routes/sale/retail/privateSea/retailCommon/')
          ),
          hideInMenu: true,
        },
        {
          path: 'order',
          tab: true,
          can: 4004000,
          title: 'IS-订单资源',
          component: dynamicWrapper(app, ['saleRetail'], () =>
            import('../routes/sale/retail/privateSea/retailOrder/')
          ),
          hideInMenu: true,
        },
        {
          path: 'OS',
          tab: true,
          can: 4006000,
          title: 'OS',
          component: dynamicWrapper(app, ['saleRetail'], () =>
            import('../routes/sale/retail/privateSea/retailOS/')
          ),
          hideInMenu: true,
        },

      ],
    },
    {
      name: '我的客户',
      path: 'myClientRetail',
      can: 4007000,
      component: dynamicWrapper(app, ['saleRetail'], () =>
        import('../routes/sale/retail/MyClient')
      ),
    },
    {
      name: '机会详情',
      path: 'chanceDetail/:id',
      component: dynamicWrapper(app, ['saleRetail'], () =>
        import('../routes/sale/retail/detail/')
      ),
      children: [
        {
          name: '基础信息',
          path: 'basic',
          component: dynamicWrapper(app, ['saleRetail'], () =>
            import('../routes/sale/retail/detail/BasicDetail/')
          ),
          hideInMenu: true,
        },
        {
          name: '跟进信息',
          path: 'advance',
          component: dynamicWrapper(app, ['saleRetail'], () =>
            import('../routes/sale/retail/detail/AdvancedDetail/')
          ),
          hideInMenu: true,
        },
        {
          name: '提单信息',
          path: 'landing',
          component: dynamicWrapper(app, ['saleRetail'], () =>
            import('../routes/sale/retail/detail/PushOrderDetail')
          ),
          hideInMenu: true,
        },
        {
          name: '业务信息',
          path: 'business',
          component: dynamicWrapper(app, ['saleRetail'], () =>
            import('../routes/sale/retail/detail/business_info/')
          ),
          hideInMenu: true,
        },
      ],
      hideInMenu: true,
    },
    {
      name: '编辑机会基本信息',
      path: 'editInfo/:id',
      component: dynamicWrapper(app, ['saleRetail'], () =>
        import('../routes/sale/retail/edit/')
      ),
      hideInMenu: true,
    },
    {
      name: '提单信息',
      path: 'pushOrderDetail/:id',
      component: dynamicWrapper(app, ['saleRetail'], () =>
        import('../routes/sale/retail/pushOrder/detail/')
      ),
      hideInMenu: true,
    },
    {
      name: '编辑提单信息',
      path: 'pushOrderEdit/:id',
      component: dynamicWrapper(app, ['saleRetail'], () =>
        import('../routes/sale/retail/pushOrder/edit/')
      ),
      hideInMenu: true,
    },
    {
      name: '提单',
      path: 'pushOrder/:id',
      component: dynamicWrapper(app, ['saleRetail'], () =>
        import('../routes/sale/retail/pushOrder/')
      ),
      hideInMenu: true,
    },
    {
      title: '业务详情',
      path: 'business/:id',
      component: dynamicWrapper(app, ['saleRetail'], () =>
        import('../routes/sale/retail/detail/business_info/business')
      ),
      hideInMenu: true,
    },
  ]
})
