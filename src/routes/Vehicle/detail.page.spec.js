import React from 'react';
import {render} from 'react-testing-library';
import VehicleDetailPage from './detail.page';

describe('VehicleDetailPage', function () {
  const fakeVehicles = {
    name: 'e100.car1',
    num: '粤R100281',
    line: '香港机场摆渡环线',
    mem: '8GB',
    disk: '40G',
    VType: 'e100',
    version: '2017-01-10',
    modules: [
      {name: 'Planner', status: '0', 'active_at': '19:23:00', action: 'launch'}
    ],
    cameras: [
      {name: '前一', value: 300},
      {name: '前视', value: 300},
      {name: '前右', value: 300}
    ],
    can: {},
    gps: {},
    network: {
      network_upload: '12KB/s',
      network_download: '1M/s',
      network_on: true
    },
    hardware: {
      mem: '1.2G',
      disk: '18.95GB',
      cpu: '27%'
    }
  }
  it('should contain data', function () {
    const {container, queryAllByText} = render(<VehicleDetailPage dataSource={fakeVehicles}/>);
    const name = queryAllByText(/e100.car1/);

    expect(name.length).toBe(2);
  });
});
