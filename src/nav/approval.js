import { dynamicWrapper } from './index';

export default app => ({
  name: '审批管理',
  icon: 'copy',
  path: 'approval',
  can: [7000000],
  children: [
    {
      name: '我的申请',
      path: 'my-apply',
      can: [7001000],
      component: dynamicWrapper(app, [], () =>
        import('../routes/Approval/MyApply')
      ),
      children: [
        {
          title: '待审批',
          path: 'wait-approval?type=apply',
          tab: true,
          component: dynamicWrapper(app, [], () =>
            import('../routes/Approval/ApplyWaitApproval')
          )
        },
        {
          title: '历史申请',
          path: 'history-apply?type=apply',
          tab: true,
          component: dynamicWrapper(app, [], () =>
            import('../routes/Approval/HistoryApply')
          )
        },
        {
          title: '审批流详情页',
          path: 'detail/:id',
          component: dynamicWrapper(app, ['approval'], () =>
            import('../routes/Approval/ApprovalDetails')
          )
        }
      ]
    },
    {
      name: '我的审批',
      path: 'my-approval',
      can: [7002000],
      component: dynamicWrapper(app, [], () =>
        import('../routes/Approval/MyApproval')
      ),
      children: [
        {
          title: '待审批',
          path: 'wait-approval?type=examine',
          tab: true,
          component: dynamicWrapper(app, [], () =>
            import('../routes/Approval/ApprovalWaitApproval')
          )
        },
        {
          title: '历史审批',
          path: 'history-approval?type=examine',
          tab: true,
          component: dynamicWrapper(app, [], () =>
            import('../routes/Approval/HistoryApproval')
          )
        },
        {
          title: '审批流详情页',
          path: 'detail/:id',
          component: dynamicWrapper(app, ['approval'], () =>
            import('../routes/Approval/ApprovalDetails')
          )
        }
      ]
    }
  ]
});
