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
    <div class="info-tip">请选择8项展示模块</div>
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
// import { sysDictListByCode } from '@/api/manage';
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
    keys: {
      type: Array,
      default: () => []
    },
    moduleType: {
      type: String,
      default: '4'
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
        this.treeDataList = resultData.map(item => {
          let obj = {};
          obj['key'] = item.buttonCode;
          obj['title'] = item.name;
          obj['children'] = [];
          return obj;
        });
        this.dataSource = this.treeDataList;
        this.allModules = resultData;
      }
      this.loading = false;
    },
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
      const { eventKey, checked } = e.node;
      if (!checked && checkedKeys.length >= 8) {
        this.$message.warning('最多选择8项展示模块!');
        return;
      }
      itemSelect(eventKey, !isChecked(checkedKeys, eventKey));
    },

    handleOk() {
      if (this.targetKeys.length < 8) {
        this.$message.warning('请选择8项展示模块!');
        return;
      }
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
