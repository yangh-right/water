<template>
  <w-modal
    :visible="visible"
    title="请选择要展示的模块"
    :width="600"
    :confirm-loading="confirmLoading"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <w-spin :spinning="loading" class="user-load"></w-spin>
    <w-transfer
      class="tree-transfer"
      :data-source="dataSource"
      :titles="['所有模块', '当前展示模块']"
      :target-keys="targetKeys"
      :render="item => item.title"
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
          :draggable="true"
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
import { queryCockpitListAll } from '@/api/cockpit.js';

function isChecked(selectedKeys, eventKey) {
  return selectedKeys.includes(eventKey);
}

function handleTreeData(data, targetKeys = []) {
  data.forEach(item => {
    if (item.children) {
      handleTreeData(item.children, targetKeys);
    }
  });
  return data;
}
export default {
  name: 'modulesDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    moduleType: {
      type: String,
      default: '1'
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
      allModules: [],
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
    this.getSysDictListByCode();
  },
  methods: {
    async getSysDictListByCode() {
      this.loading = true;
      this.dataSource = [];
      this.allModules = [];
      const { resultData, status } = await queryCockpitListAll(this.moduleType);
      if (status === 'complete') {
        let data = resultData || [];
        this.treeDataList = data.map(item => {
          let obj = {};
          obj['key'] = item.buttonCode;
          obj['title'] = item.name;
          obj['children'] = [];
          return obj;
        });
        this.dataSource = this.treeDataList;
        this.allModules = data;
      }
      this.loading = false;
    },
    onChange(targetKeys) {
      this.targetKeys = targetKeys;
      const titleMap = new Map(this.dataSource.map(item => [item.key, item.title]));
      this.targetLabel = targetKeys.map(key => titleMap.get(key));
    },
    onChecked(_, e, checkedKeys, itemSelect) {
      const { eventKey } = e.node;
      itemSelect(eventKey, !isChecked(checkedKeys, eventKey));
    },

    handleOk() {
      this.allModules.forEach(item => {
        if (this.targetKeys.indexOf(item.buttonCode) > -1) {
          item['isShow'] = '1';
        } else {
          item['isShow'] = '0';
        }
      });
      this.$emit('rangeOK', this.targetKeys, this.allModules);
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
.info-tip {
  font-family: PingFangSC-Regular, sans-serif;
  font-weight: 400;
  font-size: 14px;
  color: #323233;
  margin: 0 0 20px 0;
}
/deep/ .wpg-form-item {
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
