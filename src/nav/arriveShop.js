import { dynamicWrapper } from './index';

export default app => ({
  name: '到店销售管理',
  icon: 'shop',
  path: 'arriveShop',
  can: 5000000,
  children: [
    {
      name: '公海',
      path: 'HighSea',
      can: 5002000,
      component: dynamicWrapper(app, ['arriveShop'], () =>
        import('../routes/sale/arriveShop/highSea/')
      ),
      children: [
        {
          path: 'common',
          tab: true,
          title: '常规资源',
          component: dynamicWrapper(app, ['arriveShop'], () =>
            import('../routes/sale/arriveShop/highSea/shopCommon.js')
          ),
          hideInMenu: true,
        },
        {
          path: 'order',
          tab: true,
          title: '订单资源',
          component: dynamicWrapper(app, ['arriveShop'], () =>
            import('../routes/sale/arriveShop/highSea/shopOrder.js')
          ),
          hideInMenu: true,
        },
      ],
    },
    {
      name: '私海',
      path: 'shopPrivateSea',
      can: 5003000,
      component: dynamicWrapper(app, ['arriveShop'], () =>
        import('../routes/sale/arriveShop/privateSea/')
      ),
      children: [
        {
          path: 'common',
          tab: true,
          title: '常规资源',
          component: dynamicWrapper(app, ['arriveShop'], () =>
            import('../routes/sale/arriveShop/privateSea/shopCommon/')
          ),
          hideInMenu: true,
        },
        {
          path: 'order',
          tab: true,
          title: '订单资源',
          component: dynamicWrapper(app, ['arriveShop'], () =>
            import('../routes/sale/arriveShop/privateSea/shopOrder/')
          ),
          hideInMenu: true,
        },
      ],
    },
    {
      name: '我的客户',
      path: 'myClientShop',
      can: 5004000,
      component: dynamicWrapper(app, ["arriveShop"], () =>
        import("../routes/sale/arriveShop/MyClient")
      ),
    },
    {
      name: '机会详情',
      path: 'chanceDetail/:id',
      component: dynamicWrapper(app, ['arriveShop'], () =>
        import('../routes/sale/arriveShop/detail/')
      ),
      children: [
        {
          name: '基础信息',
          path: 'basic',
          component: dynamicWrapper(app, ['arriveShop'], () =>
            import('../routes/sale/arriveShop/detail/BasicDetail/')
          ),
          hideInMenu: true,
        },
        {
          name: '跟进信息',
          path: 'advance',
          component: dynamicWrapper(app, ['arriveShop'], () =>
            import('../routes/sale/arriveShop/detail/AdvancedDetail/')
          ),
          hideInMenu: true,
        },
        {
          name: '提单信息',
          path: 'landing',
          component: dynamicWrapper(app, ['arriveShop'], () =>
            import('../routes/sale/arriveShop/detail/PushOrderDetail')
          ),
          hideInMenu: true,
        },
        {
          name: '业务信息',
          path: 'business',
          component: dynamicWrapper(app, ['arriveShop'], () =>
            import('../routes/sale/arriveShop/detail/business_info/index')
          ),
          hideInMenu: true,
        },
      ],
      hideInMenu: true,
    },
    {
      name: '编辑机会基本信息',
      path: 'editInfo/:id',
      component: dynamicWrapper(app, ['arriveShop'], () =>
        import('../routes/sale/arriveShop/edit/')
      ),
      hideInMenu: true,
    },
    {
      name: '提单信息',
      path: 'pushOrderDetail/:id',
      component: dynamicWrapper(app, ['arriveShop'], () =>
        import('../routes/sale/arriveShop/pushOrder/detail/')
      ),
      hideInMenu: true,
    },
    {
      name: '编辑提单信息',
      path: 'pushOrderEdit/:id',
      component: dynamicWrapper(app, ['arriveShop'], () =>
        import('../routes/sale/arriveShop/pushOrder/edit/')
      ),
      hideInMenu: true,
    },
    {
      name: '提单',
      path: 'pushOrder/:id',
      component: dynamicWrapper(app, ['arriveShop'], () =>
        import('../routes/sale/arriveShop/pushOrder/')
      ),
      hideInMenu: true
    },
    {
      title: '业务详情',
      path: 'business/:id',
      component: dynamicWrapper(app, ['arriveShop'], () =>
        import('../routes/sale/arriveShop/detail/business_info/business')
      ),
      hideInMenu: true,
    },
  ]
})
