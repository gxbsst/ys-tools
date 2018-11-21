import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Divider } from 'antd';
import CreateBusinessModal from './CreateBusinessModal';

@connect(state => ({
  currentDetail: state.arriveShop.currentDetail,
  id:state.arriveShop.id,
}))

export default class BusinessDetail extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      showCreateBusinessModal: false,
    };
  }

  render() {
    const { id, currentDetail } = this.props;
    const showCreateBusinessModalProps = {
      id,
      currentDetail,
      visible: true,
      onCancel: () => this.setState({ showCreateBusinessModal: false }),
    };
    return (
      <div style={{ background: '#fff' }}>
        <Button
          type="primary"
          style={{ margin: '20px 0 20px 20px' }}
          onClick={() => this.setState({ showCreateBusinessModal: true })}
        >
          新开业务
        </Button>
        {this.state.showCreateBusinessModal && <CreateBusinessModal {...showCreateBusinessModalProps} />}
      </div>
    );
  }
}
