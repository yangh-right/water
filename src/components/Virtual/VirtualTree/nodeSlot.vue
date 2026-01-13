<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2023-10-19 14:31:18
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2024-03-11 18:44:54
 * @Description:
-->
<template>
  <vue-easy-tree
    class="virtual-tree"
    :default-checked-keys="selectKey"
    v-on="$listeners"
    v-bind="$attrs"
    :default-expanded-keys="expandKeys"
    :filter-node-method="filterNode"
    :props="replaceFields"
    :node-key="nodeKey"
    :data="treeData"
    :height="height"
    @check="check"
    @node-expand="expand"
    @node-collapse="collapse"
    ref="treeSearch"
  > 
    <span class="custom-tree-node" slot-scope="scope">
      <slot name="node" v-bind="scope"> </slot>
    </span>
    <template slot="footer">
      <span></span>
    </template>
    <template slot="empty">
      <slot name="empty"> </slot>
    </template>
  </vue-easy-tree>
</template>

<script>
import VueEasyTree from '@wchbrad/vue-easy-tree';
// 样式文件，可以根据需要自定义样式或主题
import '@wchbrad/vue-easy-tree/src/assets/index.scss';

export default {
  name: 'VirtualTree',
  props: {
    value: {
      type: String | Number,
      default: undefined
    },
    treeData: {
      type: Array,
      default: () => []
    },
    height: {
      type: String,
      default: '100%'
    },
    expandKeys: {
      type: Array,
      default: ()=>[]
    },
    replaceFields: {
      type: Object,
      default: () => ({ label: 'name', children: 'children' })
    },
    nodeKey: {
      type: String,
      default: 'value'
    }
  },
  components: { VueEasyTree },
  data() {
    return {
      lineHeight: 26,
      allNodeIds: [],
      expandedKeys: [...this.expandKeys],
      selectKey: undefined
    };
  },
  computed: {
    clientNodes() {
      return this.allNodeIds.filter(item => !this.expandedKeys.includes(item))
    },
  },
  watch: {
    value: {
      handler(val) {
        this.selectKey = val;
        this.$refs?.treeSearch?.setCheckedKeys(val);
      },
      immediate: true
    },
    treeData: {
      handler(val) {
        this.allNodeIds = []
        this.getTreeNodes(val, this.allNodeIds)
      },
      immediate: true
    },
    expandedKeys: {
      handler(val) {
        this.$emit('update:expandKeys', [...val])
      },
    }
  },
  mounted () {
  
  },
  methods: {
    expand(node) { //展开
      let newExpandIds = []
      this.getTreeNodes(node.children, newExpandIds)
      this.expandedKeys = this.expandedKeys.filter(item => !newExpandIds.includes(item))
    },
    collapse(node) { //折叠
      let newCollapseIds = []
      this.getTreeNodes(node.children, newCollapseIds)
      this.expandedKeys = Array.from(new Set(this.expandedKeys.concat(newCollapseIds)))  
    },
    getTreeNodes(nodes, list) {
      nodes?.forEach(item => {
        list.push(item[this.nodeKey])
        if (item?.[this.replaceFields.children || 'children']?.length) {
          this.getTreeNodes(item[this.replaceFields.children || 'children'], list)
        }
      });
    },
    scrollById(id, offset = 234) {
      const parent = document.querySelector(`.vue-recycle-scroller`)
      const child = document.querySelector(`.vue-recycle-scroller__item-view`)
      this.lineHeight = child?.offsetHeight || this.lineHeight
      if (parent) {
        let nodeIndex = this.allNodeIds.findIndex(item => item === id)
        if (this.expandedKeys.length) {
          let path = this.findTreeNode(this.treeData, id).reverse()
          for (let index = 0; index < path.length; index++) {
            if (this.clientNodes.includes(path[index])) {
              nodeIndex = this.clientNodes.findIndex(item => item === path[index])
              break
            }
          }
        }
        let offsetTop = nodeIndex * this.lineHeight
        parent.scrollTo({
          top: offsetTop - offset >= 0 ? offsetTop - offset : 0,
          behavior: "smooth"
        })
      }
    },
    filterNode(value, data) {
      if (!value) return true;
      return data[this.replaceFields.label].indexOf(value) !== -1;
    },
    search(val) {
      this.$refs.treeSearch.filter(val || '');
    },
    
    check(val, node) {
      this.selectKey = node.checkedKeys;
      this.$emit('input', [...this.selectKey]);
      this.$emit('change', [...this.selectKey]);
      this.$emit('checked-change', node.checkedNodes);
    },
   findTreeNode(tree, value, path) {
  if (!path) {
    path = []
  }
  for (let i = 0; i < tree.length; i++) {
    let tempPath = [...path]
    tempPath.push(tree[i].id)
    if (tree[i].id === value) {
      return tempPath
    }
    if (tree[i]?.children?.length) {
      const reuslt = this.findTreeNode(tree[i].children, value, tempPath)
      if (reuslt) {
        return reuslt
      }
    }
  }
}
  }
};
</script>
<style lang="less" scoped>
.virtual-tree {
  background: transparent;
  /deep/ .el-tree-node__content:hover {
    background: unset;

  }
    /deep/ .el-tree-node__content {
    // background: unset;
    justify-content: flex-start !important;
  }
  /deep/.vue-recycle-scroller__item-wrapper {
    font-size: 12px;
    color: var(--supply-color-secondary);
    .el-checkbox__inner {
      width: 18px;
      border-radius: 4px;
      height: 18px;
      transition: unset;
      border-color: var(--supply-color-border-DEFAULT);

      background: var(--supply-color-bg-card-DEFAULT);
      &:after {
        transition: unset;
      }
    }

    .el-checkbox__input.is-indeterminate .el-checkbox__inner,
    .el-checkbox__input.is-checked .el-checkbox__inner {
      background-color: var(--supply-color-primary-DEFAULT);
      border-color: var(--supply-color-primary-DEFAULT);
    }

    .ctree-tree-node__title:hover {
      color: var(--supply-color-main);
      background-color: unset;
    }

    .el-checkbox__input.is-checked .el-checkbox__inner::after {
      width: 5px;
      height: 9px;
      top: 1px;
      border-width: 2px;
      left: 5px;
    }
    .el-checkbox__input.is-indeterminate .el-checkbox__inner::before {
      width: 20px;
      height: 4px;
      top: 6px;
      left: -2px;
    }
  }
}
</style>
