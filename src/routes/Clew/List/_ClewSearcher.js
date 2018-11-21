import React, { PureComponent } from 'react';
import moment from 'moment';
import { Row, Col, Form, Select, Button, DatePicker } from 'antd';
import { FromSource, CustomerService } from '../../../components/Selectors';
import { Region, Industry } from '../../../components/Cascader';
import { clewTypeMap, renderOptions } from '../../../utils/paramsMap';

const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const { Option } = Select;
const formatRangeDate = (rangeDate = []) => rangeDate.map(item => moment(item).format('YYYY-MM-DD'))
const hasPermission = (has = [], should = []) => has.some(item => should.includes(item));

const preStatusMap = {
  1: '待分配', //售前客服
  2: '待清洗', //售前客服
  3: '已废弃', //售前客服
  '4,5,6,7,8': '已转出',
};
const saleStatusMap = {
  4: '待分配', //直销
  5: '待清洗', //直销
  7: '已转出', //直销转机会
  8: '已废弃', //直销废弃
}
const checkSatatusMap = {
  6: '待审核', //待审核
}

@Form.create()
export default class ClewSearcher extends PureComponent {
  handleSearch = (e) => {
    e.preventDefault();
    const { form, handleSearch } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const { date, fromSource, ...restValues } = fieldsValue;
      const [beginTime, endTime] = formatRangeDate(date);
      const [firstFromSource, secondFromSource] = fromSource || [];
      handleSearch({
        ...restValues,
        beginTime,
        endTime,
        firstFromSource,
        secondFromSource,
      });
    });
  }

  handleFormReset = () => {
    const { form, handleSearch } = this.props;
    form.resetFields();
    handleSearch();
  }

  renderForm() {
    const {form: { getFieldDecorator }, code, permissions} = this.props;
    const statusMap = (function yy() {
      if ([3001001, 4001001, 4001004, 4002001, 5005001, 5006001].includes(code)) {
        return [3001001].includes(code) ? preStatusMap :
          [4001001, 4001004].includes(code) ? {...saleStatusMap, ...checkSatatusMap} : saleStatusMap;
      }
    })()
    return (
      ![4001002, 4001006].includes(code) ? //待审核
      <Form onSubmit={this.handleSearch} layout="horizontal" style={{overflow: 'hidden'}}>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          {
            <Col lg={6} md={8} sm={24}>
              <FormItem label="日期">
                {getFieldDecorator('date')(
                  <RangePicker style={{ width: '100%' }} />
                )}
              </FormItem>
            </Col>
          }
          {
            [3001001].includes(code) &&
            <Col lg={6} md={8} sm={24}>
              <FormItem label="类型">
                {getFieldDecorator('clewType')(
                  <Select allowClear placeholder="请选择线索类型">
                    {renderOptions(clewTypeMap)}
                  </Select>
                )}
              </FormItem>
            </Col>
          }
          {
            <Col lg={6} md={8} sm={24}>
              <FormItem label="来源">
                {getFieldDecorator('fromSource')(
                  <FromSource placeholder="请选择线索来源" />
                )}
              </FormItem>
            </Col>}
          {
            hasPermission(permissions, [3001000, 4001000]) &&
            <Col lg={6} md={8} sm={24}>
              <FormItem label="地区">
                {getFieldDecorator('areaCode')(
                  <Region />
                )}
              </FormItem>
            </Col>
          }
          {
            <Col lg={6} md={8} sm={24}>
              <FormItem label="行业">
                {getFieldDecorator('industryId')(
                  <Industry placeholder="请选择行业" />
                )}
              </FormItem>
            </Col>
          }
          {
            [3001001, 4001001, 4001004, 4002001, 5005001, 5006001].includes(code) &&
            <Col lg={6} md={8} sm={24}>
              <FormItem label="状态">
                {getFieldDecorator('queryClewStatus')(
                  <Select allowClear placeholder="状态">
                    {Object.keys(statusMap).map(i => <Option key={i} value={i}>{statusMap[i]}</Option>)}
                  </Select>
                )}
              </FormItem>
            </Col>
          }
          {
            [3001001, 4001001, 4001004, 4002001, 5005001, 5006001].includes(code) &&
            <Col lg={6} md={8} sm={24}>
              <FormItem label="处理人">
                {getFieldDecorator('handlerNo')(
                  <CustomerService allowClear placeholder="处理人" />
                )}
              </FormItem>
            </Col>
          }
          <span style={{ float: 'right', marginBottom: 12 }}>
            <Button type="primary" htmlType="submit">查询</Button>
            <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>重置</Button>
          </span>
        </Row>
      </Form> : null
    );
  }

  render() {
    return (
      <div>
        {this.renderForm()}
      </div>
    )
  }
}
