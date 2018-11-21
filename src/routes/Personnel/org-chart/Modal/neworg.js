import React, {PureComponent} from "react";
import {Modal, Button, Form, Input} from 'antd';


const FormItem = Form.Item;
@Form.create()
export default class Addorg extends PureComponent {
  constructor(props) {
    super(...props)
  }

  width = {width: '100%'};

  render() {
    const {visible, onCancel, onCreate, form, selectedTissue} = this.props;
    const {getFieldDecorator} = form;
    const ori = selectedTissue ? selectedTissue : '未选定组织';
    const formItemLayout = {
      labelCol: {
        span: 4
      },
      wrapperCol: {
        span: 20
      }
    };
    return (
      <span>
        <Modal
          visible={visible}
          title="新建组织"
          okText="确定"
          onCancel={onCancel}
          onOk={onCreate}
        >
          <Form layout='inline'>
            <div>
              <FormItem {...formItemLayout} label="所选组织" style={this.width}>
                {getFieldDecorator('parentId', {})(
                  <span>{ori}</span>
                )}
              </FormItem>
            </div>
            <div>
              <FormItem {...formItemLayout} label="组织名称" style={this.width}>
              {getFieldDecorator('name', {
                rules: [
                  {
                    required: true,
                    message: '请输入组织名'
                  },
                  {
                    validator: (r, v, c) => {
                      if (v.length > 15) {
                        c('组织名输入过长');
                      }
                      if (v.length < 2) {
                        c('组织名输入过短');
                      }
                      c();
                    },
                  }],
              })(
                <Input/>
              )}
            </FormItem>
            </div>
          </Form>
        </Modal>
      </span>
    );
  }
}

