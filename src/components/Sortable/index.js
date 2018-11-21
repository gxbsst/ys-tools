import React, { PureComponent } from 'react';
import { Table } from 'antd';
import { DragDropContext, DragSource, DropTarget } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import update from 'immutability-helper';
import _ from 'lodash';
import styles from './index.less';

const dragDirection = (dragIndex, hoverIndex, initialClientOffset, clientOffset, sourceClientOffset) => {
  const hoverMiddleY = (initialClientOffset.y - sourceClientOffset.y) / 2;
  const hoverClientY = clientOffset.y - sourceClientOffset.y;
  if (dragIndex < hoverIndex && hoverClientY > hoverMiddleY) return 'downward';
  if (dragIndex > hoverIndex && hoverClientY < hoverMiddleY) return 'upward';
};

const rowSource = {
  beginDrag({ index }) {
    return { index };
  },
};

const rowTarget = {
  drop(props, monitor) {
    const item = monitor.getItem();
    const dragIndex = item.index;
    const hoverIndex = props.index;
    if (dragIndex === hoverIndex) return;
    props.moveRow(dragIndex, hoverIndex);
    item.index = hoverIndex;
  },
};

const BodyRow = DropTarget('row', rowTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  sourceClientOffset: monitor.getSourceClientOffset(),
}))(DragSource('row', rowSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  connectDragPreview: connect.dragPreview(),
  dragRow: monitor.getItem(),
  clientOffset: monitor.getClientOffset(),
  initialClientOffset: monitor.getInitialClientOffset(),
}))((props) => {
  const { isOver, connectDragSource, connectDragPreview, connectDropTarget, moveRow, dragRow, clientOffset, sourceClientOffset, initialClientOffset, children, ...restProps } = props;
  if (isOver && initialClientOffset) {
    const direction = dragDirection(dragRow.index, restProps.index, initialClientOffset, clientOffset, sourceClientOffset);
    if (direction === 'downward') restProps.className += ' drop-over-downward';
    if (direction === 'upward') restProps.className += ' drop-over-upward';
  }
  if (!_.some(children, { props: { column: { draggable: true } } })) {
    return connectDragSource(connectDropTarget(<tr {...restProps}>{children}</tr>));
  }

  return connectDragPreview(connectDropTarget(
    <tr {...restProps}>
      {children.map(child => {
        const { key, props: { column, record } } = child;
        const value = record[key];
        const cell = (
          <td className={column.className} key={key}>
            {column.render ? column.render(value, record) : value}
          </td>
        );
        return column.draggable ? connectDragSource(cell) : cell;
      })}
    </tr>
  ));
}));

@DragDropContext(HTML5Backend)
export default class Sortable extends PureComponent {
  components = {
    body: {
      row: BodyRow
    }
  };

  moveRow = (dragIndex, hoverIndex) => {
    const { dataSource: prevData, onSorted } = this.props;
    const dataSource = update(prevData, { $splice: [[dragIndex, 1], [hoverIndex, 0, prevData[dragIndex]]] });
    onSorted(dataSource);
  };

  render() {
    const { components, moveRow } = this;
    const { columns: tableFields, draggable, sortKey, ...restProps } = this.props;
    let columns = tableFields;
    if (_.isUndefined(draggable) || (_.isBoolean(draggable) && draggable) || _.isPlainObject(draggable)) {
      columns = [_.merge({
        title: '排序',
        dataIndex: sortKey || 'sort',
        width: 50,
        draggable: true,
        className: styles.draggable,
        render: () => <span/>
      }, draggable)].concat(columns);
    }
    const props = {
      rowKey: 'id',
      size: 'middle',
      pagination: false,
      ...restProps,
      columns,
      components,
      onRow: (record, index) => ({ index, moveRow })
    };
    return <Table {...props}/>;
  }
}
