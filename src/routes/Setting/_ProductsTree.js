import React, {PureComponent} from 'react';
import { Tree } from 'antd';
import { transferSimpleTreeData } from '../../utils/dataTransfer';

const { TreeNode } = Tree;

export default class ProductsTree extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      expandedKeys: [],
      checkedKeys: props.value || [],
      expandAll: true,
      autoExpandParent: true,
    }
  }

  componentDidMount() {
    if (!this.state.expandAll) return;
    const { treeData, treeDataSimpleMode } = this.props;
    const data = treeDataSimpleMode ? transferSimpleTreeData(treeData, treeDataSimpleMode) : treeData;
    if (data && data.length > 0) {
      this.initExpandedkeysByLevel(data);
    }
  }
  componentWillReceiveProps(nextProps) {
    if (!this.state.expandAll) return;
    const { treeData, treeDataSimpleMode } = nextProps;
    const data = treeDataSimpleMode ? transferSimpleTreeData(treeData, treeDataSimpleMode) : treeData;
    if (data && data.length > 0) {
      this.initExpandedkeysByLevel(data);
    }
    this.setState({expandAll: false});
  }
  initExpandedkeysByLevel = (data) => {
    this.initExpandedkeys(data, this.props.expandLevel);
  }
  initExpandedkeys(treeData, level) { //展开所有  level: 展开层数
    if (level && level <= 1) return;
    treeData.forEach((item) => {
      if (item.children) {
        this.setState((prevState, props) => ({
          expandedKeys: Array.from(new Set([...prevState.expandedKeys, `${item.id}`])),
        }));
        this.initExpandedkeys(item.children, level && level - 1);
      }
    });
  }
  renderTreeNodes = (data, simpleFormat) => {
    data = simpleFormat ? transferSimpleTreeData(data, simpleFormat) : data;
    return data.map((item) => {
      if (item.children) {
        Object.defineProperty(item, 'children', { enumerable: false });
        return (
          <TreeNode {...item} title={item.name} dataRef={item}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode {...{...item, title: item.name}} />;
    });
  }
  onExpand = (expandedKeys) => {
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  }
  onCheck = (checkedKeys, info) => {
    console.log(1, checkedKeys)
    console.log(2, info)
    if (this.props.readOnly) return;
    if (info.node.props.children) return;
    const { length } = info.checkedNodes;
    if (length && info.checkedNodes[length - 1].props.parentId == 0) return;
    this.props.onChange(checkedKeys.checked);
    this.setState({
      checkedKeys,
    });
  }
  render() {
    const { treeData, treeDataSimpleMode, readOnly, ...receiveProps } = this.props;
    return (
      <Tree
        expandedKeys={this.state.expandedKeys}
        // checkedKeys={this.state.checkedKeys}
        checkedKeys={(this.props.value || []).map(i => `${i}`)}
        autoExpandParent={this.state.autoExpandParent}
        checkStrictly
        // checkStrictly={readOnly}
        onExpand={this.onExpand}
        onCheck={this.onCheck}
        {...receiveProps}
      >
        {this.renderTreeNodes(treeData, treeDataSimpleMode)}
      </Tree>
    );
  }
}
