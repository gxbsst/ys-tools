import React, {PureComponent} from "react";
import DescriptionList from "../../../components/DescriptionList";
import {Card, Table, Button} from "antd";
import autodata from "../../../decorators/AutoData";
import FooterToolbar from '../../../components/FooterToolbar/index';
import moment from "moment";
import {enums} from "../../../utils";
import {
  getBusinessStatus,
  getBackpayStatus,
  getPayCondition,
  getChargeUnit,
  getProductType,
  getServiceDuration
} from "../../../utils/helpers";

const {Description} = DescriptionList;
const businessColumns = [
  {
    title: "产品类型",
    dataIndex: "productType",
    key: "productType",
    render: getProductType
  },
  {
    title: "业务类型",
    dataIndex: "itemType",
    key: "itemType",
    render: getBusinessStatus
  },
  {
    title: "产品名称",
    dataIndex: "productName",
    key: "productName"
  },
  {
    title: "产品金额",
    dataIndex: "productAmount",
    key: "productAmount",
    render: (text, record) => {
      return record.productAmount - record.discountProductAmount;
    }
  },
  {
    title: "服务费金额",
    dataIndex: "serviceAmount",
    key: "serviceAmount",
    render: (text, record) => {
      return record.serviceAmount - record.discountServiceAmount;
    }
  },
  {
    title: "业务量/赠送量",
    key: "serviceGiftYears",
    render: getServiceDuration
  },
  {
    title: "创建人",
    dataIndex: "createUser",
    key: "createUser"
  }
];

@autodata("/api/processes/bill/:id")
export default class GiveListDetail extends PureComponent {
  render() {
    let {$data: {data}} = this.props;
    if (!data) return null;
    data = JSON.parse(data);
    const {
      orderItemList,
      isContract,
      contractType,
      contractInfo,
      attachmentDtoList,
      payModeDtoList,
      chanceCustomerName,
      saleName
    } = data;
    const payColumns = [
      {
        title: "付款条件",
        dataIndex: "payCondition",
        key: "payCondition",
        render: getPayCondition
      },
      {
        title: "付款金额",
        dataIndex: "amount",
        key: "amount"
      },
      {
        title: "付款占比",
        dataIndex: "payScale",
        key: "payScale",
        render: (text, record) => {
          return `${(text * 100).toFixed(2)}%`;
        }
      },
      {
        title: "付款日期",
        dataIndex: "payTime",
        key: "payTime",
        render: (text, record) => {
          return moment(text).format("YYYY-MM-DD");
        }
      },
      {
        title: "付款备注",
        dataIndex: "remark",
        key: "remark"
      }
    ];
    return (
      <div>
        <Card>
          <DescriptionList size="large" col={2}>
            <Description term="客户名称">{chanceCustomerName}</Description>
            <Description term="提单人">{saleName}</Description>
          </DescriptionList>
        </Card>
        <Card>
          <DescriptionList size="large" col={1}>
            <Description term="业务关联">
              <Table
                columns={businessColumns}
                dataSource={orderItemList}
                pagination={false}
                size="small"
                rowKey="id"
              />
            </Description>
          </DescriptionList>
        </Card>
        <Card>
          <DescriptionList size="large" col={2} style={{marginBottom: "16px"}}>
            <Description term="提单合同">
              {isContract ? "提合同" : "暂不提合同"}
            </Description>
          </DescriptionList>
          {!!isContract && (
            <DescriptionList size="large" col={2}>
              <Description term="合同类型">
                {!contractType ? "非标准合同" : "标准合同"}
              </Description>
              <Description term="合同编号">
                {contractInfo.contractCode}
              </Description>
              <Description term="合同金额">
                {contractInfo.amount + ""}
              </Description>
              <Description term="合同开始日期">
                {contractInfo.contractBegin}
              </Description>
              <Description term="合同结束日期">
                {contractInfo.contractEnd}
              </Description>
              <Description term="合同签订日期">
                {contractInfo.contractDate}
              </Description>
              <Description term="买方签字">
                {contractInfo.buyerSignature}
              </Description>
              <Description term="卖方签字">
                {contractInfo.sellerSignature}
              </Description>
              <Description term="合同备注">{contractInfo.comment}</Description>
            </DescriptionList>
          )}
        </Card>
        {!!isContract && (
          <Card>
            <DescriptionList size="large" col={1}>
              <Description term="附件">
                {attachmentDtoList.map((oneFile, index) => {
                  return (
                    <Button
                      style={{marginRight: "16px"}}
                      icon="download"
                      download
                      href={oneFile.fileUrl}
                      key={index}
                    >
                      {`${oneFile.fileName}  ${oneFile.fileSize}`}
                    </Button>
                  );
                })}
              </Description>
            </DescriptionList>
          </Card>
        )}
        {!!isContract && (
          <Card>
            <DescriptionList size="large" col={1}>
              <Description term="付款方式">
                <Table
                  columns={payColumns}
                  dataSource={payModeDtoList}
                  pagination={false}
                  size="small"
                  rowKey={(record, index) => index}
                />
              </Description>
            </DescriptionList>
          </Card>
        )}
        <FooterToolbar>
          <Button onClick={() => window.history.back()}>
            返回
          </Button>
        </FooterToolbar>
      </div>
    );
  }
}
