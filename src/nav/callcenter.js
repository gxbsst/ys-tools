import { dynamicWrapper } from './index';

export default app => ({
  title: '呼叫中心',
  path: 'call-center',
  component: dynamicWrapper(app, [], () => import('../routes/CallCenter')),
  children: [
    {
      title: '队列信息',
      path: 'queue',
      tab: true,
      component: dynamicWrapper(app, [], () => import('../routes/CallCenter/Queue'))
    },
    {
      title: '等待队列',
      path: 'calling',
      tab: true,
      component: dynamicWrapper(app, [], () => import('../routes/CallCenter/Calling'))
    },
  ]
})
