import mockjs from 'mockjs';
import qs from 'qs';
import { getRule, postRule } from './mock/rule';
import { getClews, postClews, getClewById, getClewLogs } from './mock/clews';
import { getNewRetailFlow, getArrivalFlow, editResourceFlow } from './mock/resourceFlow';
import { getProductDir, getProductList } from './mock/products';
import { getActivities, getNotice, getFakeList } from './mock/api';
import { getChances, getChanceDetail, getRelativeBusiness, getChanceContacts, getChanceItention, getChanceStores} from './mock/sale'
import { getFakeChartData } from './mock/chart';
import { imgMap } from './mock/utils';
import { getProfileBasicData } from './mock/profile';
import { getProfileAdvancedData } from './mock/profile';
import { getNotices } from './mock/notices';
import { format, delay } from 'roadhog-api-doc';

// 是否禁用代理
const noProxy = process.env.NO_PROXY === 'true';

// 代码中会兼容本地 service mock 以及部署站点的静态数据
const proxy = {
  'GET /api/account': {

  },
  // 支持值为 Object 和 Array
  'GET /currentUser': {
    $desc: "获取当前用户接口",
    $params: {
      pageSize: {
        desc: '分页',
        exp: 2,
      },
    },
    $body: {
      name: 'Serati Ma',
      avatar: 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png',
      userid: '00000001',
      notifyCount: 12,
      type: 'OS',
      position: 'leader',
    },
  },
  // GET POST 可省略
  'GET /api/users': [{
    key: '1',
    name: 'John Brown',
    age: 32,
    address: 'New York No. 1 Lake Park',
  }, {
    key: '2',
    name: 'Jim Green',
    age: 42,
    address: 'London No. 1 Lake Park',
  }, {
    key: '3',
    name: 'Joe Black',
    age: 32,
    address: 'Sidney No. 1 Lake Park',
  }],
  'GET /api/project/notice': getNotice,
  'GET /api/activities': getActivities,
  // <-- @Human
  'POST /_api/clews': (req, res) => { res.send({ code: 0, message: 'Ok' }); },
  'POST /_api/directory': (req, res) => { res.send({ code: 0, message: 'Ok' }); },
  'PUT /_api/directory': (req, res) => { res.send({ code: 0, message: 'Ok' }); },
  'DELETE /_api/directory/:id': (req, res) => { res.send({ code: 0, message: 'Ok' }); },
  'GET /_api/directory': getProductDir,
  'GET /_api/directory/:id/product': getProductList,
  'GET /_api/resourceFlow/newRetail?type=1': getNewRetailFlow,
  'GET /_api/resourceFlow/arrival?type=2': getArrivalFlow,
  'PUT /_api/resourceFlow': editResourceFlow,
  'GET /_api/clews': getClews,
  'GET /_api/clews/:id': getClewById,
  'GET /_api/clews/:id/logs': getClewLogs,
  // 'POST /_api/clews': {
  //   $params: {
  //     pageSize: {
  //       desc: '分页',
  //       exp: 2,
  //     },
  //   },
  //   $body: postClews,
  // },
  // @Human -->
  'GET /api/rule': getRule,
  'POST /api/rule': {
    $params: {
      pageSize: {
        desc: '分页',
        exp: 2,
      },
    },
    $body: postRule,
  },
  'POST /api/forms': (req, res) => {
    res.send({ message: 'Ok' });
  },
  'GET /api/tags': mockjs.mock({
    'list|100': [{ name: '@city', 'value|1-100': 150, 'type|0-2': 1 }]
  }),
  'GET /api/fake_list': getFakeList,
  'GET /api/fake_chart_data': getFakeChartData,
  'GET /api/profile/basic': getProfileBasicData,
  'GET /api/profile/advanced': getProfileAdvancedData,
  'POST /api/login/account': (req, res) => {
    const { password, userName, type } = req.body;
    res.send({
      status: password === '888888' && userName === 'admin' ? 'ok' : 'error',
      type,
    });
  },
  'POST /api/register': (req, res) => {
    res.send({ status: 'ok' });
  },
  'GET /api/notices': getNotices,
  'GET /chances': getChances,
  'GET /chances/:id': getChanceDetail,
  'GET /customers/:id/link': getChanceContacts,
  'GET /chances/:id/stores': getChanceStores,
  'GET /chances/:id/intention': getChanceItention,
  'GET /business/my': getRelativeBusiness,
};

// export default noProxy ? {} : delay(proxy, 1000);
export default delay(proxy, 1000);
