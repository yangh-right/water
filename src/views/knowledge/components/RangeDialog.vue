<template>
  <w-modal
    :visible="visible"
    :title="$t('knowledge.workspace.knowRange')"
    :width="600"
    :confirm-loading="confirmLoading"
    @ok="handleOk"
    @cancel="handleCancel"
  > 
    <w-spin :spinning="loading" class="user-load"></w-spin>
    <w-transfer
      class="tree-transfer"
      :data-source="dataSource"
      :target-keys="targetKeys"
      :render="item => item.title"
      :show-select-all="false"
      @change="onChange"
    >
      <template
        slot="children"
        slot-scope="{ props: { direction, selectedKeys }, on: { itemSelect } }"
      > 
        <w-tree
          v-if="direction === 'left'"
          block-node
          checkable
          :checked-keys="[...selectedKeys, ...targetKeys]"
          :tree-data="treeData"
          @check="
            (_, props) => {
              onChecked(_, props, [...selectedKeys, ...targetKeys], itemSelect);
            }
          "
        />
      </template>
    </w-transfer>
  </w-modal>
</template>

<script>
import { searchRoleTree as apiSearchUserTree } from '@/api/knowLedge';
import { t } from '@/locale/useLocale';

function isChecked(selectedKeys, eventKey) {
  return selectedKeys.includes(eventKey);
}

function handleTreeData(data, targetKeys = []) {
  data.forEach(item => {
    // item['disabled'] = targetKeys.includes(item.key);
    if (item.children) {
      handleTreeData(item.children, targetKeys);
    }
  });
  return data;
}
export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    keys: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      loading: false,
      treeDataList: [],
      replaceFields: { children: 'children', title: 'name', key: 'id', value: 'id' },
      confirmLoading: false,
      targetKeys: [],
      targetLabel: [],
      dataSource: []
    };
  },
  computed: {
    treeData() {
      return handleTreeData(this.treeDataList, this.targetKeys);
    }
  },

  watch: {
    visible(val) {
      if (val) {
        this.targetKeys = this.keys;
      }
    }
  },

  created() {
    this.getUserTree();
  },

  methods: {
    onChange(targetKeys) {
      this.targetKeys = targetKeys;
      this.targetLabel = this.targetKeys.map(item => {
        let label = '';
        for (let index = 0; index < this.dataSource.length; index++) {
          const element = this.dataSource[index];
          if (item === element.key) {
            label = element.title;
            break;
          }
        }
        return label;
      });
    },
    onChecked(_, e, checkedKeys, itemSelect) {
      const { eventKey } = e.node;
      itemSelect(eventKey, !isChecked(checkedKeys, eventKey));
    },

    handleOk() {
      this.$emit('rangeOK', this.targetKeys, this.targetLabel);
    },

    async getUserTree() {
      this.loading = true
      let res = await apiSearchUserTree({
        pageFlag: false,
      });
      this.loading = false
      let { resultData, status } = res;
      let treeDataList = this.flattenTree(resultData);
      this.treeDataList = treeDataList;

      // 穿梭框初始化
      const transferDataSource = [];
      function flatten(list = []) {
        list.forEach(item => {
          transferDataSource.push(item);
          flatten(item.children);
        });
      }
      flatten(JSON.parse(JSON.stringify(this.treeDataList)));
      this.dataSource = transferDataSource;
    },

    // 初始化树的每一个节点内容
    flattenTree(tree) {
      let _tree = [];
      if (tree && tree.length) {
        tree.forEach(v => {
          if (!v.checkable) {
            let node = {
              key: v.roleId,
              title: v.roleName,
              children: this.flattenTree(v.children)
            };
            _tree.push(node);
          }
        });
      }
      return _tree;
    },

    handleCancel() {
      this.$emit('rangeCancel');
    }
  }
};
</script>

<style lang="less" scoped>
  .user-load {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 20;
  }
/deep/ .wpg-form-item {
  // margin-bottom: 20px;

  .wpg-form-item-label {
    width: 100px;
  }
}

.tree-transfer {
  /deep/ .wpg-transfer-list {
    width: 50%;
    height: 350px;
  }
}
</style>
