import React from 'react';
import ReactDOM from 'react-dom';
import VehicleItem from '../index'
import {render} from 'react-testing-library'

describe('VehicleItem', function () {
  const fakeVehicle = {
    name: 'e100.car1',
    num: '粤R100281',
    line: '香港机场摆渡环线',
    mem: '8GB',
    disk: '40G',
    type: 'e100',
    version: '2017-01-10',
    modules: [
      {name: 'Planner', status: '0', 'active_at': '19:23:00', action: 'launch'}
    ],
    cameras: [
      {name: '前一', value: 300},
      {name: '前视', value: 300},
      {name: '前右', value: 300}
    ],
    can: {

    },
    gps: {

    },
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
  };
  it('should contain 内存、磁盘、CPU、网络 ', function () {
    const {queryAllByText} = render(<VehicleItem car={fakeVehicle}/>);

    const mem = queryAllByText(/内存/);
    const harddisk = queryAllByText(/磁盘/);
    const cpu = queryAllByText(/CPU/);
    const network = queryAllByText(/网络/);

    expect(mem.length).toEqual(1);
    expect(harddisk.length).toEqual(1);
    expect(cpu.length).toEqual(1);
    expect(network.length).toEqual(1);
  });

  it('should contain fake model ', function () {
    const {container,queryAllByText} = render(<VehicleItem car={fakeVehicle}/>);
    const name = queryAllByText(/e100.car1/);
    const num = queryAllByText(/粤R100281/);
    const line = queryAllByText(/香港机场摆渡环线/);
    const mem = queryAllByText(/8GB/);
    const availableDisk = queryAllByText(/18.95GB/);
    const cpu = queryAllByText(/27%/);
    const networkUpload = queryAllByText(/12KB\/s/);
    expect(name.length).toEqual(1);
    expect(num.length).toEqual(1);
    expect(line.length).toEqual(1);
    expect(mem.length).toEqual(1);
    expect(availableDisk.length).toEqual(1);
    expect(cpu.length).toEqual(1);
    expect(networkUpload.length).toEqual(1);
  });

});
