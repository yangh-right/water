<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2023-10-19 14:31:18
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2024-02-26 15:10:08
 * @Description:
-->
<template>
  <vue-easy-tree
    class="virtual-tree"
    :default-checked-keys="selectKey"
    v-on="$listeners"
    v-bind="$attrs"
    :scopedSlots="$scopedSlots"
    :filter-node-method="filterNode"
    :props="replaceFields"
    :node-key="nodeKey"
    :height="height"
    @check="check"
    ref="treeSearch"
  > 
    <!-- <template v-for="slotName in Object.keys($slots)" #[slotName]="scope">
      <slot :name="slotName" v-bind="scope"></slot>
    </template> -->

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
    height: {
      type: String,
      default: '100%'
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
      selectKey: undefined
    };
  },
  watch: {
    value: {
      handler(val) {
        this.selectKey = val;
        this.$refs?.treeSearch?.setCheckedKeys(val);
      },
      immediate: true
    }
  },
  methods: {
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
