import mockjs from 'mockjs';
import {getRule, postRule} from './mock/rule';
import {getClewById, getClewLogs, getClews} from './mock/clews';
import {editResourceFlow, getArrivalFlow, getNewRetailFlow} from './mock/resourceFlow';
import {getProductDir, getProductList} from './mock/products';
import {getActivities, getFakeList, getNotice} from './mock/api';
import {
  getChanceContacts,
  getChanceDetail,
  getChanceItention,
  getChances,
  getChanceStores,
  getRelativeBusiness
} from './mock/sale'
import {getFakeChartData} from './mock/chart';
import {getProfileAdvancedData, getProfileBasicData} from './mock/profile';
import {getNotices} from './mock/notices';
import {delay} from 'roadhog-api-doc';
import {getVehicles} from './mock/vehicle';

// 是否禁用代理
const noProxy = process.env.NO_PROXY === 'true';

// 代码中会兼容本地 service mock 以及部署站点的静态数据
const proxy = {
  'GET /api/vehicles': getVehicles,
  'GET /sso/session/logout': {
    "code":0,
    "message":"操作成功",
    "serverTime":1542807783917
  },
  'GET /api/rank': {"code":0,"data":[{"achievement":15.00,"area":"A大部","createTime":"2018-11-15 16:28:46","createUser":"cong.cheng","id":91,"name":"王三","sign":"2018-11","sort":49,"type":1,"updateTime":"2018-11-15 16:28:46","updateUser":"cong.cheng"}],"pagination":{"page":1,"pageCount":1,"pageSize":50,"totalCount":1}},
  'GET /api/announcement': {"code":0,"data":[{"createTime":"2018-03-01 11:03:05","createUser":"mingran.zhang","id":10,"link":"http://www.hao123.com","title":"第吴个","type":2,"updateTime":"2018-03-01 15:45:41","updateUser":"mingran.zhang"},{"createTime":"2018-01-24 14:36:18","createUser":"mingran.zhang","id":8,"link":"http://www.baidu.com","title":"第吴个","type":1,"updateTime":"2018-02-26 14:54:44","updateUser":"mingran.zhang"},{"createTime":"2018-01-24 11:59:25","createUser":"mingran.zhang","id":7,"link":"www.baidu.com","title":"第二个","type":1,"updateTime":"2018-01-24 11:59:25","updateUser":"mingran.zhang"},{"createTime":"2018-01-24 11:12:06","createUser":"mingran.zhang","id":5,"link":"很多人都在讨论老张和小张谁厉害，其实有很多细节可以说明的，比如神雕最后，老张表现出来的超高的武学天赋，还有他一下就把玄冥一老给擒住，而且，他让7个资质平平的小孩在20多岁时就名满天下，武功个个都至少准一流吧，试问整个金庸小说里有谁能把自己所有的徒弟在20多岁的时候都练成武林准一流的高手？就这说明老张的武功确实厉害！另外，在小张为老张疗伤的时候，原著这样写到\n    说话之间，将一股极浑厚、极柔和的九阳神功，从手掌上向张三丰体内传了过去。张\n三丰于刹那之间，只觉掌心中传来这股力道雄强无比，虽然远不及自己内力的精纯醇正，，，\n其实，张三丰，无论在武侠还是历史，都是响当当的一代宗师，我们后人对他都有着崇敬之情，我相信金老也是这样，所以，第一当仁不让","title":"张三丰，无论在武侠还是历史，都是响当当的一代宗师","type":1,"updateTime":"2018-02-08 04:21:52","updateUser":"mingran.zhang"}],"pagination":{"page":1,"pageCount":1,"pageSize":6,"totalCount":4}},
  'GET /api/portal': {"code":0,"data":[{"createTime":"2017-02-28 12:20:20","createUser":"jzl","id":3,"name":"rank","status":1,"updateTime":"2018-06-21 17:57:52","updateUser":"dasa"},{"createTime":"2017-12-25 11:44:29","createUser":"jzl","id":2,"name":"announcement","status":1,"updateTime":"2018-03-02 14:12:16","updateUser":"jzl"},{"createTime":"2017-12-22 16:09:03","createUser":"jzl","id":1,"name":"mien","status":1,"updateTime":"2018-04-27 11:06:38","updateUser":"jzl"}],"pagination":{"page":1,"pageCount":1,"pageSize":10,"totalCount":3}},
  'GET /api/message': {"code":0,"data":[{"createTime":"2018-11-21 00:01:09","id":13683,"isDel":0,"title":"你有一条线索被加急后，72小时未跟进，请尽快联系该客户。","updateTime":"2018-11-21 00:01:09","url":"/#/clew/clews/16170967411300/detail","userName":"xianlu.gu"},{"createTime":"2018-11-21 00:01:07","id":13641,"isDel":0,"title":"你有一条机会被加急后，72小时未跟进，请尽快联系该客户。","updateTime":"2018-11-21 00:01:07","url":"/#/arriveShop/chanceDetail/1175354/basic","userName":"xianlu.gu"},{"createTime":"2018-11-21 00:01:07","id":13633,"isDel":0,"title":"你有一条机会被加急后，72小时未跟进，请尽快联系该客户。","updateTime":"2018-11-21 00:01:07","url":"/#/arriveShop/chanceDetail/1175335/basic","userName":"xianlu.gu"},{"createTime":"2018-11-21 00:01:06","id":13627,"isDel":0,"title":"你有一条客户被加急后，72小时未跟进，请尽快联系该客户。","updateTime":"2018-11-21 00:01:06","url":"/#/aftersale/details/1000501/baseInfo","userName":"xianlu.gu"},{"createTime":"2018-11-21 00:01:06","id":13625,"isDel":0,"title":"你有一条客户被加急后，72小时未跟进，请尽快联系该客户。","updateTime":"2018-11-21 00:01:06","url":"/#/aftersale/details/1000498/baseInfo","userName":"xianlu.gu"},{"createTime":"2018-11-21 00:01:06","id":13624,"isDel":0,"title":"你有一条客户被加急后，72小时未跟进，请尽快联系该客户。","updateTime":"2018-11-21 00:01:06","url":"/#/aftersale/details/1000495/baseInfo","userName":"xianlu.gu"}],"pagination":{"page":1,"pageCount":47,"pageSize":6,"totalCount":281}},
  'GET /api/callcenter': {"code":101,"message":"未找到员工叫呼中心的座席信息！"},
  'GET /api/mien': {"code":0,"data":[{"content":"","createTime":"2018-03-02 10:02:21","createUser":"xin.deng","id":34,"image":"https://image-c-dev.weimobwmc.com/qa-saas-crm/06e7fd414d174fc8b8276a54de7d8192.png","position":3,"sort":2,"updateTime":"2018-06-14 15:01:07","updateUser":"teng.liu"},{"content":"首页展示的风采图编辑更新展示在登陆页","createTime":"2018-03-30 14:40:21","createUser":"xin.deng","id":48,"image":"https://image-c-dev.weimobwmc.com/qa-saas-crm/3b742490230d4db989aa19762ac0692b.jpg","position":1,"sort":4,"updateTime":"2018-06-14 15:01:07","updateUser":"xin.deng"}],"pagination":{"page":1,"pageCount":1,"pageSize":10,"totalCount":2}},
  'GET /api/account': {
    'code': 0,
    'data': {
      'crmDepartments': [{'id': 380, 'name': '上海区域'}],
      'givenName': '顾先路',
      'mail': '147454512@qq.com',
      'username': 'xianlu.gu',
      'visualPermissions': ['5005000', '5005001', '5005002', '4006000', '4006001', '11002001', '11002000', '10003001', '10003000', '10003003', '10003002', '4006004', '4006005', '4006002', '4006006', '11002007', '11002006', '11002005', '11002004', '11002003', '11002002', '10008004', '10008003', '10008002', '10008001', '10008005', '5000000', '10008000', '9001001', '9001000', '10002004', '10002003', '10002005', '2003001', '11001003', '11001001', '11001002', '2003000', '4000000', '8003000', '8003002', '8003001', '8003004', '8003003', '8003005', '4005000', '12001005', '12001004', '12001006', '10002000', '12001001', '12001000', '10002002', '12001003', '10002001', '12001002', '4005002', '4005001', '4005003', '6000000', '1002002', '1002001', '2001002', '2001001', '2001000', '10007002', '10007001', '10007000', '5001002', '1002000', '4002000', '5001000', '4002001', '5001001', '4002002', '4002003', '4002004', '9000000', '4007001', '4007002', '4007000', '10001002', '10001003', '11001000', '8004002', '8004003', '8004000', '8004001', '4007003', '8004004', '10006007', '3001001', '3001000', '3001003', '3001002', '12000000', '3001005', '10001000', '3001004', '10001001', '3001006', '5006001', '5006002', '2002008', '2002009', '2002004', '2002005', '2002006', '2002007', '2002000', '2002001', '7000000', '2002002', '11000000', '2002003', '4001005', '10006001', '4001006', '10006002', '10006000', '10006005', '10006006', '10006003', '10006004', '4001000', '4001001', '4001002', '4001003', '4001004', '5006000', '6001000', '10005008', '2000000', '10005009', '10005006', '10005007', '10005011', '10005010', '10011003', '10011004', '10011001', '10000000', '10011002', '8000000', '4003000', '4003001', '4003002', '5008000', '6002000', '4008003', '4008002', '4008001', '4008000', '10011000', '7001000', '11004000', '7001001', '11004001', '11004002', '10005000', '10005001', '10005004', '10005005', '10005002', '10005003', '4008004', '5007000', '1001001', '1001000', '1001003', '1001002', '9003002', '9003003', '3000000', '5002001', '5002002', '5002000', '9003000', '9003001', '10004005', '10004006', '11003005', '11003004', '11003003', '10010004', '10010005', '10010002', '12002002', '12002001', '10010000', '8001000', '10010001', '8001001', '8001002', '8001003', '8001004', '8001005', '8001006', '8001007', '12002000', '7002002', '7002001', '7002000', '10004000', '10004003', '10004004', '10004001', '10004002', '4004012', '4004011', '5004002', '5004001', '5004000', '4010000', '1000000', '4004009', '9002000', '4004008', '10009002', '10009003', '10009004', '5003006', '10009005', '5003005', '4004000', '4004003', '10009000', '4004002', '5003002', '10009001', '4004005', '5003001', '4004004', '5003000', '4004007', '9002002', '9002001', '4009000', '4009002', '6003000', '4009001', '10003004', '11003002', '11003001', '11003000', '8002001', '8002000', '8002003', '8002002', '8002005', '8002004', '8002007', '8002006']
    },
    'message': '处理成功'
  },
  'POST /sso/session/login/ajax': {
    code: 0,
    data: {
      value: 'e2880047-652e-4e78-80f6-aa025472aed9',
      key: '_Q_W_I_S_ID_'
    },
    message: '操作成功',
    serverTime: 1542806256000
  }
  ,
  // 支持值为 Object 和 Array
  'GET /currentUser': {
    $desc: '获取当前用户接口',
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
  'POST /_api/clews': (req, res) => {
    res.send({code: 0, message: 'Ok'});
  },
  'POST /_api/directory': (req, res) => {
    res.send({code: 0, message: 'Ok'});
  },
  'PUT /_api/directory': (req, res) => {
    res.send({code: 0, message: 'Ok'});
  },
  'DELETE /_api/directory/:id': (req, res) => {
    res.send({code: 0, message: 'Ok'});
  },
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
    res.send({message: 'Ok'});
  },
  'GET /api/tags': mockjs.mock({
    'list|100': [{name: '@city', 'value|1-100': 150, 'type|0-2': 1}]
  }),
  'GET /api/fake_list': getFakeList,
  'GET /api/fake_chart_data': getFakeChartData,
  'GET /api/profile/basic': getProfileBasicData,
  'GET /api/profile/advanced': getProfileAdvancedData,
  'POST /api/login/account': (req, res) => {
    const {password, userName, type} = req.body;
    res.send({
      status: password === '888888' && userName === 'admin' ? 'ok' : 'error',
      type,
    });
  },
  'POST /api/register': (req, res) => {
    res.send({status: 'ok'});
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
