import React from 'react';
import HardwareInfoomponent from '../hardwareInfo.component'
import {render} from 'react-testing-library'
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



describe('GPSComponent', () => {

  it('should contain data fake data', function () {
    const {queryAllByText} = render(<HardwareInfoomponent dataSource={fakeVehicle} />);
    const moduleTitle = queryAllByText(/系统负载/);
    const mem = queryAllByText(/内存/);
    const harddisk = queryAllByText(/磁盘/);
    const cpu = queryAllByText(/CPU/);

    expect(moduleTitle.length).toBe(1);
    expect(mem.length).toEqual(1);
    expect(harddisk.length).toEqual(1);
    expect(cpu.length).toEqual(1);
  });
});
