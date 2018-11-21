import dva from 'dva';
import createLoading from 'dva-loading';
import moment from 'moment';
import 'moment/locale/zh-cn';
import { message, notification } from 'antd';
import './utils';
import './rollbar';
import './index.less';

moment.locale('zh-cn');

message.config({
  top: 5,
  duration: 6,
});

notification.config({
  placement: 'topRight',
  top: 55,
  duration: 6,
});

const app = dva({
  ...createLoading({
    effects: true,
  }),
  onError: (err) => {
    console.warn(err.message);
  },
  // history: browserHistory(),
});

// 2. Plugins
// app.use({});

// 3. Register global model
app.model(require('./models/global'));

// 4. Router
app.router(require('./router'));

// 5. Start
app.start('#root');
