import React from 'react';
import GPSComponent from '../gps.component'
import {render} from 'react-testing-library'

describe('GPSComponent', () => {
  const dataSource = {signal: 4, text: '信号良好'};
  it('should contain data fake data', function () {
    const {queryAllByText, container, getByText} = render(<GPSComponent dataSource={dataSource} />);
    const moduleTitle = queryAllByText(/GPS/);
    const text = queryAllByText(/信号良好/);
    const signal = queryAllByText(/4/);

    expect(moduleTitle.length).toBe(1);
    expect(text.length).toBe(1);
    expect(signal.length).toBe(1);
  });
});
