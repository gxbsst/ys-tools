import React, { PureComponent } from 'react';
import { Form, Icon, Input, Button, Spin, Carousel } from 'antd';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import qs from 'qs';
import { autodata } from '../../decorators';
import { request, redirectTo } from '../../utils';
import styles from './index.less';

const { Item: FormItem } = Form;

@autodata({
  namespace: 'mien',
  url: '/api/mien',
  query: { positionCon: 1 },
  mergeQueryFromLocation: false,
})
@Form.create()
export default class Login extends PureComponent {
  static contextTypes = {
    location: PropTypes.object,
  };

  state = {
    submitting: false,
  };

  onSubmit = (event) => {
    event && _.isFunction(event.preventDefault) && event.preventDefault();
    const { form, location: { search } } = this.props;
    form.validateFields(async (err, body) => {
      if (err) return;
      this.setState({ submitting: true });
      try {
        await request('/sso/session/login/ajax', { method: 'POST', body });
        const { redirect = '/' } = qs.parse(search.substr(1));
        redirectTo(decodeURIComponent(redirect));
      } catch (e) {
        this.setState({ submitting: false });
      }
    });
  };

  render() {
    const { submitting } = this.state;
    const { mien: { data: miens, loading: spinning }, form: { getFieldDecorator } } = this.props;
    const carousel = miens ? (
      <Carousel className={styles.carousel} initialSlide={_.random(0, miens.length - 1)} autoplay>
        {miens.map(({ id, image, content }) => (
          <div className={styles.mien} key={id}>
            <div className={styles.mienImage} style={{ backgroundImage: `url(${ image }?imageMogr2/crop/550x320/quality/65)` }}/>
            <div className={styles.mienDesc}>{content}</div>
          </div>
        ))}
      </Carousel>
    ) : null;
    const spinProps = {
      indicator: <Icon type="loading" spin/>,
      delay: 20,
      spinning,
    };
    return (
      <div className={classNames('flex-row flex-middle', styles.login)}>
        <div className={classNames('flex-item', styles.spin)}>
          <Spin {...spinProps}>{carousel}</Spin>
        </div>
        <Form className={styles.form} onSubmit={this.onSubmit}>
          <h1 className={styles.title}>系统用户登录</h1>
          <FormItem>
            {getFieldDecorator('username', {
              rules: [{ required: true, message: '登录帐号不能为空' }],
            })(<Input placeholder="请输入您的帐号" prefix={<Icon type="user" className={styles.icon}/>}/>)}
          </FormItem>
          <FormItem>
            {getFieldDecorator('password', {
              rules: [{ required: true, message: '登录密码不能为空' }],
            })(<Input type="password" placeholder="请输入登录密码" prefix={<Icon type="lock" className={styles.icon}/>}/>)}
          </FormItem>
          <Button type="primary" size="large" htmlType="submit" loading={submitting}>登 录</Button>
        </Form>
      </div>
    );
  }
}
