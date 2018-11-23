import React from 'react';
import RadarComponent from '../radar.component'
import {render} from 'react-testing-library'

describe('GPSComponent', () => {
  const dataSource = {};
  it('should contain data fake data', function () {
    const {queryAllByText} = render(<RadarComponent dataSource={dataSource} />);
    const moduleTitle = queryAllByText(/激光雷达/);


    expect(moduleTitle.length).toBe(1);

  });
});
