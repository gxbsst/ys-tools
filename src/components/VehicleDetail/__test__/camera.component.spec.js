import React from 'react';
import CameraComponent from '../camera.component'
import {render} from 'react-testing-library'

describe('CameraComponent', () => {
  const dataSource = {
    camera: [
      {id: 1, name: '前一', value: 300, status: 'off'},
      {id: 2, name: '前视', value: 300, status: 'on'},
      {id: 3, name: '前右', value: 300, status: 'on'},
    ]
  };
  it('should contain data fake data', function () {
    const {queryAllByText, container, getByText} = render(<CameraComponent dataSource={dataSource} />);
    const moduleTitle = queryAllByText(/摄像头/);
    const name1 = queryAllByText(/前一/);
    const name2 = queryAllByText(/前视/);
    const name3 = queryAllByText(/前右/);

    expect(moduleTitle.length).toBe(1);
    expect(name1.length).toBe(1);
    expect(name2.length).toBe(1);
    expect(name3.length).toBe(1);

  });
});
