import React from 'react';
import NetworkComponent from '../network.component'
import {render} from 'react-testing-library'

describe('NetworkComponent', () => {
  const dataSource = {
    network: {
      speed: '1000 M',
      network_upload: '12KB/s',
      network_download: '1M/s',
      network_on: true,
      networkFlow: '40GB',
      networkFlowAvailable: '19GB'
    },
  };

  it('should contain titles', () => {
    const {container, queryAllByText} = render(<NetworkComponent dataSource={dataSource}/>);
    const moduleTitle = queryAllByText(/网络连接/);
    const speedTitle = queryAllByText(/LINK 速度/);
    const flowTitle = queryAllByText(/流量/);
    const availableTitle = queryAllByText(/剩余/);
    const uploadTitle = queryAllByText(/上传速率/);
    const downloadTitle = queryAllByText(/下载速率/);

    expect(moduleTitle.length).toBe(1);
    expect(speedTitle.length).toBe(1);
    expect(flowTitle.length).toBe(1);
    expect(availableTitle.length).toBe(1);
    expect(uploadTitle.length).toBe(1);
    expect(downloadTitle.length).toBe(1);
  });

  it('should contain data', () => {
    const {container, queryAllByText} = render(<NetworkComponent dataSource={dataSource}/>);
    const speed = queryAllByText(/1000 M/);
    const networkUpload = queryAllByText(/12KB\/s/);
    const networkDownload = queryAllByText(/1M\/s/);
    const networkFlow = queryAllByText(/40GB/);
    const networkFlowAvailable = queryAllByText(/19GB/);

    expect(speed.length).toBe(1);
    expect(networkUpload.length).toBe(1);
    expect(networkDownload.length).toBe(1);
    expect(networkFlow.length).toBe(1);
    expect(networkFlowAvailable.length).toBe(1);

  });
});
