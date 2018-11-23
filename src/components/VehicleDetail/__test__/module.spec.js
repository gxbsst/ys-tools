import React from 'react';
import ModuleComponent from '../module.component'
import {render} from 'react-testing-library'

describe('ModuleComponent', () => {
  const fakeModules = [
    {id: 1, name: 'Planner', status: 'nomal', activeAt: '19:29:30', actions: 'launch' },
    {id: 2, name: 'Planner', status: '0521', activeAt: '19:29:30', actions: 'launch' },
    {id: 3, name: 'Speed', status: 'nomal', activeAt: '19:29:30', actions: 'launch' },
    {id: 4, name: 'Classics', status: 'nomal', activeAt: '19:29:30', actions: 'launch' },
    {id: 5, name: 'Compass', status: 'nomal', activeAt: '19:29:30', actions: 'launch' },
    {id: 6, name: 'Vasam', status: 'close', activeAt: '19:29:30', actions: 'launch' },
  ]

  it('should contain data fake data', function () {
    const {container,queryAllByText} = render(<ModuleComponent dataSource={fakeModules} />)
    const moduleTitle = queryAllByText(/模块/);
    const name = queryAllByText(/Planner/);
    const status = queryAllByText(/nomal/);
    const activeAt = queryAllByText(/19:29:30/);
    const actions = queryAllByText(/launch/);

    expect(moduleTitle.length).toBe(1);
    expect(name.length).toBe(2);
    expect(status.length).toBe(4);
    expect(activeAt.length).toBe(6);
    expect(actions.length).toBe(6);
  });
});
