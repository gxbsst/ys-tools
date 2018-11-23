import React from 'react';
import CanComponent from '../can.component'
import {render} from 'react-testing-library'

describe('ModuleComponent', () => {

  it('should contain data fake data', function () {
    const {container,queryAllByText} = render(<CanComponent />)
    const moduleTitle = queryAllByText(/CAN网络/);

    expect(moduleTitle.length).toBe(1);
  });
});
