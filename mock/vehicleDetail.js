const vehicle =
  {
    id: 10001,
    name: 'e100.car1',
    num: '粤R1002812a',
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

export default {
  getVehiclesDetail(req, res) {
    res.json({
      code: 0,
      data: vehicle
    });
  }
}
