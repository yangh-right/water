<!--
 * @Description: 分区
 * @Author: limz
 * @Date: 2021-07-14 17:09:39
 * @LastEditTime: 2024-09-27 15:30:13
 * @LastEditors: wangyr
-->
<template>
  <div class="param-panel">
    <w-input-search class="supply-mb-2" placeholder="请输入方案名称" @search="onChange" />
    <div v-if="treeData.length > 0" class="tree-wrap">
      <w-tree
        ref="tree"
        :checkedKeys="checkedKeys"
        :tree-data="treeData"
        :expandedKeys.sync="expandedKeys"
        :selected-keys="[solutionId]"
        :replaceFields="{ title: 'name', key: 'id' }"
        @expand="onExpand"
        @check="onCheck"
        @select="onItemSelected"
        :checkable="checkable"
        v-bind="$attrs"
        defaultExpandAll
      >
        <template slot="title" slot-scope="record">
          <span class="custom-tree-node">
            <w-input
              class="node__input"
              v-if="currentRename === record.id"
              ref="renameInput"
              :default-value="record.name"
              size="small"
              @blur="blurRename($event, record)"
            />
            <span v-else class="title" :title="`${record.name}`">
              {{ record.name }}
            </span>
            <span
              :class="[
                'node__operation',
                'supply-align-middle',
                currentRename === record.id ? 'supply-leading-7' : ''
              ]"
            >
              <span v-if="!(record.children && record.children.length) && !checkable">
                <w-icon class="node__btn" @click="handlerRename(record)" type="edit" />
                <w-icon
                  class="node__btn supply-ml-2.5"
                  @click="handlerDel(record)"
                  type="ic_delete"
                />
              </span>
            </span>
          </span>
        </template>
      </w-tree>
    </div>
    <w-empty v-else class="empty"></w-empty>
    <!-- 方案编辑 -->
    <drag-modal
      class="modal-wrap"
      @close="confirmClose"
      :destroyOnClose="true"
      ref="alarmConfirm"
      :width="500"
      :height="420"
      :mask="true"
      :isShowFullBtn="false"
      title="方案保存"
    >
      <div class="form-body">
        <w-form-model ref="form" :model="form" :rules="rules">
          <w-form-model-item v-bind="formItem" label="方案名称:" prop="solutionName">
            <w-input v-model="form.solutionName" placeholder="请输入方案名称"></w-input>
          </w-form-model-item>
          <w-form-model-item v-bind="formItem" label="适用季节:" prop="applicationSeason">
            <w-select v-model="form.applicationSeason" placeholder="请选择">
              <w-select-option
                v-for="item in applicationSeasonList"
                :key="item.value"
                :value="item.value"
                >{{ item.label }}</w-select-option
              >
            </w-select>
          </w-form-model-item>
          <w-form-model-item v-bind="formItem" label="适用温度:" prop="applicationTemperature">
            <w-select v-model="form.applicationTemperature" placeholder="请选择">
              <w-select-option
                v-for="item in applicationTemperatureList"
                :key="item.value"
                :value="item.value"
                >{{ item.label }}</w-select-option
              >
            </w-select>
          </w-form-model-item>
          <w-form-model-item v-bind="formItem" label="碳氮比:" prop="carbonNitrogenRatio">
            <w-select v-model="form.carbonNitrogenRatio" placeholder="请选择">
              <w-select-option
                v-for="item in carbonNitrogenRatioList"
                :key="item.value"
                :value="item.value"
                >{{ item.label }}</w-select-option
              >
            </w-select>
          </w-form-model-item>
        </w-form-model>
      </div>
      <div
        style="position: absolute;right: 20px; bottom:23px"
        class="form-footer supply-text-right"
      >
        <w-button type="primary" class="supply-mr-4" ghost @click="confirmClose">取消</w-button>
        <w-button type="primary" class="supply-mr-3" @click="handleConfirm">确定</w-button>
      </div>
    </drag-modal>
  </div>
</template>
<script>
import { v4 as uuidV4 } from 'uuid';
import { cloneDeep } from 'lodash';
import {
  getSolutionTree,
  getSolutionList,
  deleteSolution,
  renameSolutionName
} from '@/api/runTime';
import { findItemFromTree } from '@/utils/js/tool/tools';
import DragModal from '@/components/DragModal';

export default {
  name: 'SchemeTree',
  components: { DragModal },
  props: {
    solutionId: {
      type: String,
      default: ''
    },
    solutionType: {
      type: String,
      default: ''
    },
    waterPlantId: {
      type: String,
      default: ''
    },
    checkable: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      schemeIds: [],
      checkedKeys: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      solutionNameMap: {},
      expandedKeys: [],
      searchValue: '',
      currentRename: '',
      currentNew: null,
      solutionList: [],
      treeData: [],
      formItem: {
        labelCol: { span: 6 },
        wrapperCol: { span: 18 }
      },
      form: {
        solutionName: '',
        applicationSeason: undefined,
        applicationTemperature: undefined,
        carbonNitrogenRatio: undefined
      },
      applicationSeasonList: [
        { label: '春', value: '1' },
        { label: '夏', value: '2' },
        { label: '秋', value: '3' },
        { label: '冬', value: '4' }
      ],
      applicationTemperatureList: [
        { label: '<15°C', value: '1' },
        { label: '<25°C', value: '2' },
        { label: '<35°C', value: '3' }
      ],
      carbonNitrogenRatioList: [
        { label: '3-4', value: '1' },
        { label: '4-5', value: '2' },
        { label: '5-6', value: '3' }
      ],
      rules: {
        solutionName: [{ required: true, message: '请输入方案名称' }],
        applicationSeason: [{ required: true, message: '请选择适用季节' }],
        applicationTemperature: [{ required: true, message: '请选择适用温度' }],
        carbonNitrogenRatio: [{ required: true, message: '碳氮比' }]
      }
    };
  },
  computed: {},
  watch: {
    treeData: {
      handler(val) {
        let expandedKeys = [];
        this.getAllIdFromTree(val, expandedKeys);
        this.expandedKeys = expandedKeys;
      },
      immediate: true
    },
    waterPlantId(val) {
      this.getTreeData();
    }
  },
  activated() {
    this.getTreeData();
  },
  methods: {
    onCheck(checkedKeys) {
      let schemeKeys = this.handleCheckedKeys(checkedKeys);
      if (schemeKeys.length > 4) {
        this.$message.warn('最多能选四个方案进行对比');
        return;
      }
      this.checkedKeys = checkedKeys;
      this.$emit('checkChange', schemeKeys);
    },
    handleCheckedKeys(list) {
      return list.filter(item => this.schemeIds.includes(item));
    },

    setDefaultCheckedKeys() {
      if (!this.checkedKeys.length && this.solutionId) {
        this.checkedKeys = [this.solutionId];
      }
      this.$emit('checkChange', this.handleCheckedKeys(this.checkedKeys));
    },
    async getTreeData() {
      if (!this.waterPlantId) return;
      let params = {
        waterPlantId: this.waterPlantId || '',
        solutionName: this.searchValue,
        solutionType: this.solutionType
      };
      const res = await getSolutionList(params);
      const { resultData, status } = res;
      if (status === 'complete') {
        let treeData = [];
        this.schemeIds = [];
        this.solutionList = resultData;
        this.handleTreeData(resultData, treeData);
        this.$emit('schemeNameChange', this.solutionNameMap);
        if (!(this.solutionId && findItemFromTree(treeData, this.solutionId, 'id'))) {
          this.$emit('change', this.getDefaultId(treeData));
          this.$nextTick(() => {
            this.setDefaultCheckedKeys();
          });
        }
        this.treeData = treeData;
      }
    },
    getDefaultId(list) {
      if (!list || list.length === 0) {
        return '';
      }

      for (let i = 0; i < list.length; i++) {
        const result = this.getResultFromItem(list[i]);
        if (result) {
          return result;
        }
      }
      return '';
    },
    getResultFromItem(item) {
      if (item.children && item.children.length) {
        const childResult = this.getDefaultId(item.children);
        return childResult;
      }
      return item.id || '';
    },
    handleTreeData(list, treeData) {
      list.forEach(item => {
        let cloneItem = {
          id: item.id,
          name: item.solutionName,
          disabled: item.children?.length ? true : false,
          children: []
        };
        this.solutionNameMap[item.id] = item.solutionName;
        treeData.push(cloneItem);
        if (item.children?.length) {
          this.handleTreeData(item.children, cloneItem.children);
        } else {
          this.schemeIds.push(item.id);
        }
      });
    },
    onExpand(keys) {
      // this.expandedKeys = keys;
    },
    getAllIdFromTree(list, keyList) {
      list.forEach(item => {
        keyList.push(item.id);
        if (item.children?.length) {
          this.getAllIdFromTree(item.children, keyList);
        }
      });
    },
    onItemSelected(keys, e, node) {
      let data = e.selectedNodes?.[0]?.data.props || {};
      if (!data.children?.length && keys[0]) {
        this.$emit('change', keys[0]);
      }
    },
    onChange(e) {
      this.searchValue = e;
      this.getTreeData();
    },
    handleNodeClick(data) {},

    handlerDel(data) {
      let id = data.id;
      this.$confirm({
        title: '您确定删除该方案吗？',
        content: '',
        onOk: async () => {
          const res = await deleteSolution(id);
          const { resultData, status } = res;
          if (status === 'complete') {
            this.$message.success('删除成功！');
          }
          this.getTreeData();
        }
      });
    },
    confirmClose() {
      this.form = {
        solutionName: '',
        applicationSeason: undefined,
        applicationTemperature: undefined,
        carbonNitrogenRatio: undefined
      };
      this.$refs.alarmConfirm.visible = false;
    },
    handleConfirm() {
      this.$refs.form.validate(async valid => {
        if (valid) {
          let params = {
            solutionId: this.form.id,
            solutionName: this.form.solutionName,
            applicationSeason: this.form.applicationSeason,
            applicationTemperature: this.form.applicationTemperature,
            carbonNitrogenRatio: this.form.carbonNitrogenRatio
          };
          let { status, resultData } = await renameSolutionName(params);
          if (status === 'complete') {
            this.$message.success('方案修改成功！');
            this.confirmClose();
            this.getTreeData();
            this.currentRename = '';
          }
        }
      });
    },
    handlerRename(data) {
      let solution = this.solutionList.find(item => item.id === data.id);
      this.form = {
        ...solution
      };
      this.$refs.alarmConfirm.visible = true;
    },
    async blurRename(e, data) {
      let name = e.target._value;
      // let { status, resultData } = await renameSolutionName(data.id, name);
      // if (status === 'complete') {
      //   this.$message.success('方案名称修改成功！');
      //   this.getTreeData();
      //   this.currentRename = '';
      // }
    }
  }
};
</script>

<style scoped lang="less">
.modal-wrap {
  /deep/ .wpg-modal {
    min-height: 250px;
    .wpg-modal-content .wpg-modal-body {
      padding: 6px 32px 16px 0px;
    }
  }
}
/deep/ .wpg-tree-treenode-selected {
  background-color: var(--supply-color-primary-DEFAULT);
}

/deep/ .wpg-tree-node-selected {
  color: #fff !important;
}
/deep/ .wpg-tree li {
  padding: 6px 0;
}
/deep/ .wpg-tree li .wpg-tree-node-content-wrapper {
  width: calc(100% - 25px);
}
/deep/ .wpg-tree-child-tree > li:first-child {
  padding: 6px 0px 6px 0;
}
.custom-tree-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  .title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
  }
  .node__input {
    width: calc(100% - 55px);
  }
  .node__btn {
    cursor: pointer;
    &:hover {
      color: var(--supply-color-primary-DEFAULT);
    }
  }
}

.param-panel {
  display: flex;
  flex-direction: column;
  width: 288px;
  overflow-x: hidden;
  height: 100%;
  position: relative;
  .tree-wrap {
    overflow-y: auto;
    overflow-x: hidden;
    height: calc(100% - 48px);
  }
  .empty {
    height: calc(100% - 48px);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  &__content {
    height: calc(100% - 60px);
    overflow-y: auto;
  }
  .head {
    padding: 15px 12px 12px;
    .search {
    }
    &__name {
      margin-bottom: 12px;
      color: var(--supply-text-main);
      font-weight: 600;
      font-size: 16px;
    }
    &__con {
      min-width: 197px;
      > span {
        color: var(--supply-text-secondary);
        font-size: 14px;
      }
      /deep/ .wpg-radio-group-small .wpg-radio-button-wrapper {
        padding: 0 12px;
      }
    }
  }
}
</style>
