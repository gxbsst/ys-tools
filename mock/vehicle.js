const vehicles = [
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
      network_upload: '13KB/s',
      network_download: '2M/s',
      network_on: true
    },
    hardware: {
      mem: '1.2G',
      disk: '4.95GB',
      cpu: '47%'
    }
  },
  {
    id: 10002,
    name: 'e100.car2',
    num: '粤R100281b',
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
      network_upload: '123KB/s',
      network_download: '4M/s',
      network_on: true
    },
    hardware: {
      mem: '1.2G',
      disk: '8.95GB',
      cpu: '59%'
    }
  },
  {
    id: 10003,
    name: 'e100.car7',
    num: '粤R1002821c',
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
      network_upload: '1KB/s',
      network_download: '12M/s',
      network_on: true
    },
    hardware: {
      mem: '1.2G',
      disk: '28GB',
      cpu: '27%'
    }
  },
  {
    id: 10004,
    name: 'e100.car1',
    num: '粤R1002381d',
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
      disk: '15GB',
      cpu: '27%'
    }
  },
  {
    id: 10005,
    name: 'e100.car2',
    num: '粤R10022281e',
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
  },
];

export default {
  getVehicles(req, res) {
    res.json({
      code: 0,
      data: vehicles,
      pagination: {
        page: 1,
        pageCount: 1,
        pageSize: 20,
        totalCount: 2
      }
    });
  }
}
