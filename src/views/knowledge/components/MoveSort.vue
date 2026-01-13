<template>
  <w-modal
    v-if="visible"
    :visible="true"
    :title="$t('knowledge.workspace.moveClass')"
    :width="600"
    class="move-sort-box"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <vc-tree :data="treeData" :props="defaultProps" @node-click="handleNodeClick">
      <div slot-scope="{ node, data }" class="custom-tree-node">
        <span class="title" :title="`${data.name}${data.num ? data.name : ''}`">
          <span class="label">{{ data.name }}</span>
          <span v-if="data.num" class="num">({{ data.num ? data.name : '' }})</span>
        </span>
      </div>
    </vc-tree>
  </w-modal>
</template>

<script>
import { bookMove } from '@/api/knowLedge';
import { t } from '@/locale/useLocale';
export default {
  props: {
    moveSortVisible: {
      type: Boolean,
      default: false
    },
    id: {
      type: String,
      default: ''
    },
    sortData: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      pid: '',
      visible: false,
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      treeData: []
    };
  },

  watch: {
    moveSortVisible(val) {
      if (val) {
        this.visible = true;
        this.treeData = this.flattenTree(this.sortData);
      }
    }
  },

  methods: {
    handleOk() {
      this.addOrEdit();
    },

    flattenTree(tree) {
      let id = this.id;
      let _tree = [];
      if (tree && tree.length) {
        tree.forEach(v => {
          if (id !== v.id) {
            let node = {
              ...v,
              children: this.flattenTree(v.children)
            };
            _tree.push(node);
          }
        });
      }
      return _tree;
    },

    async addOrEdit() {
      let data = {
        pid: this.pid,
        id: this.id
      };

      let res = await bookMove(data);
      if (res.status === 'complete') {
        this.$message.success(t('knowledge.workspace.moveClassSuccess'));
        this.visible = false;
        this.$emit('closeMove');
        this.$emit('update');
      }
    },

    handleCancel() {
      this.visible = false;
      this.$emit('closeMove');
    },

    handleNodeClick(data) {
      this.pid = data.id;
    }
  }
};
</script>

<style lang="less" scoped>
.move-sort-box {
  .custom-tree-node {
    margin-right: 40px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;

    .num {
      margin-left: 5px;
    }
  }

  /deep/ .wpg-form-item {
    .wpg-form-item-label {
      width: 100px;
    }
  }

  /deep/ .is-current {
    .vc-tree-node__content {
      color: var(--supply-color-primary-DEFAULT);
      background: var(--supply-color-primary-hover);

      .vc-dropdown {
        color: var(--supply-color-primary-DEFAULT);
      }
    }

    .vc-tree-node__children {
      .vc-tree-node__content {
        color: #606266;
        background: #fff;

        .vc-dropdown {
          color: #606266;
        }
      }
    }
  }

  /deep/ .vc-tree-node {
    &__content {
      position: relative;
      height: 40px;
    }

    &__expand-icon {
      // margin-left: 40px;
    }
  }
}
</style>
