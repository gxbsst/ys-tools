import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Card, Table, Divider, Button } from 'antd';
import { routerRedux } from 'dva/router';
import DescriptionList from '../../../../../components/DescriptionList/index';
import { ContactsTable } from '../../edit/ContactsForm';
import styles from '../index.less';
import { chainStoreColumns, contactsColumns } from '../../tableColumns';
import { getFromSource } from '../../../../../utils/helpers';

const { Description } = DescriptionList;

@connect(({ arriveShop, user }) =>
  ({
    currentDetail: arriveShop.currentDetail,
    id: arriveShop.id,
    user,
  })
)
export default class BasicDetail extends Component {
  render() {
    const { currentDetail } = this.props;
    if (!currentDetail) {
      return null;
    }
    const {
      customerTypeName,
      customerType,
      manageStatus,
      registerTime,
      customerName,
      manageArea,
      registerAddress,
      shopName,
      manageProduct,
      legalPerson,
      accountMainBody,
      qualificationType,
      industry,
      certificateNumber,
      area,
      detailAddress,
      companyDetail,
      clewId,
      firstFromSourceName,
      secondFromSourceName,
      clewTypeName,
      fromSource,
      createTime,
      contacts,
      stores,
      opStatus,
      isVassal,
      bindAccount,
    } = currentDetail;
    const { currentUser: { username } } = this.props.user;
    return (
      <Card bordered={false}>
        {
          opStatus === 2 &&
          !isVassal &&
          (bindAccount && bindAccount === username) &&
          <Button type="primary" onClick={() => this.props.dispatch(routerRedux.push(`/arriveShop/editInfo/${this.props.id}`))}>编辑信息</Button>
        }
        <Divider style={{marginBottom: 32}}/>
        <DescriptionList size="large" title="基本信息" style={{marginBottom: 32}}>
          <Description term="线索id">{clewId}</Description>
          <Description term="线索类型">{clewTypeName}</Description>
          <Description term="客户类型">{customerTypeName}</Description>
          <Description term="客户名称">{customerName}</Description>
          <Description term="商户名称">{shopName}</Description>
          <Description term="一级来源">{firstFromSourceName}</Description>
          <Description term="二级来源">{secondFromSourceName}</Description>
          <Description term="来源标签">{getFromSource(fromSource)}</Description>
          <Description term="创建时间">{createTime}</Description>
          <Description term="账户主体">{accountMainBody}</Description>
          <Description term="行业">{industry}</Description>
          <Description term="地区">{area}</Description>
          <Description term="地址">{detailAddress}</Description>
          <Description term="经营状态">{manageStatus}</Description>
          <Description term="经营范围">{manageArea}</Description>
          <Description term="主营产品">{manageProduct}</Description>
          <Description term="注册时间">{registerTime}</Description>
          <Description term="注册地址">{registerAddress}</Description>
          <Description term="法人">{legalPerson}</Description>
          <Description term="资质类型">{qualificationType}</Description>
          <Description term="证件号码">{certificateNumber}</Description>
          <Description term="公司详情">{companyDetail}</Description>
        </DescriptionList>
        <Divider style={{marginBottom: 32}}/>
        <div className={styles.title}>联系人信息</div>
        <Table
          columns={contactsColumns}
          dataSource={contacts || []}
          pagination={false}
          rowKey={record => `${record.id}`}
        />
        {
          customerType === 4 &&
          <Fragment>
            <div className={styles.title}>连锁门店信息</div>
            <Table
              columns={chainStoreColumns}
              dataSource={stores || []}
              pagination={false}
              rowKey={record => `${record.id}`}
              expandedRowRender={record => (
                <ContactsTable
                  dataSource={record.contacts}
                  pagination={false}
                  size="small"
                  title={() => '联系人信息'}
                  rowKey={_ => `${_.id}`}
                />)}
            />
          </Fragment>
        }
      </Card>
    );
  }
}
