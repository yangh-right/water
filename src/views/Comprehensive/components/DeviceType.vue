<template>
  <w-tree-select
    class="device-type"
    v-model="treeValue"
    :tree-data="treeData"
    :tree-checkable="!isSingleSelect"
    :maxTagCount="maxTagCount"
    :replaceFields="replaceFields"
    :allowClear="allowClear"
    :placeholder="placeholder"
    :dropdownStyle="dropdownStyle"
    :getPopupContainer="getPopupContainer"
    @change="changeTreeValue"
  >
    <template #label="row">
      <span class="wfc3" style="cursor: not-allowed">{{
        row ? row.label : row.dictName || '--'
      }}</span>
    </template>
    <template #maxTagPlaceholder="text">
      <span :title="`+ ${text.length} ...`">+ {{ text.length }} ...</span>
    </template>
  </w-tree-select>
</template>

<script>
import { getDeviceTypeApi } from '@/api/public';
import { mapState } from 'vuex';
import _ from 'lodash';
export default {
  name: 'DeviceType',
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    maxTagCount:{
            type: Number,
      default: 2
    },
    value: [Array, String],
    // 是否为单选
    isSingleSelect: {
      type: Boolean,
      default: false
    },
    showAll: {
      type: Boolean,
      default: false
    },
    allowClear: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      treeValue: [],
      replaceFields: {
        title: 'dictName',
        key: 'dictCode',
        value: 'dictCode'
      },
      treeData: [],
      dropdownStyle: {
        maxHeight: '300px',
        overflow: 'auto'
      }
    };
  },
  computed: {
    ...mapState('device', ['deviceType']),
    placeholder() {
      if (this.isSingleSelect) {
        return '请选择设备分类';
      }
      return '不限';
    }
  },
  watch: {
    value(newV) {
      this.treeValue = newV;
    }
  },
  created() {
    this.getDeviceTree();
  },
  methods: {
    // 获取设备树
    async getDeviceTree() {
      this.treeValue = this.value;
      if (this.deviceType.length > 0) {
        this.treeData = this.handleTreeData(_.cloneDeep(this.$store.state.device.deviceType));
      } else {
        const { resultData } = await getDeviceTypeApi();
        this.handleData(resultData);
        this.$store.commit('device/setDeviceType', resultData);
        this.treeData = this.handleTreeData(_.cloneDeep(resultData));
      }
      // console.log(this.treeData, "this.treeData");
    },
    handleTreeData(treeData) {
      if (this.isSingleSelect) {
        return treeData.map(item => {
          let label = item.dictName;
          delete item.dictName;
          return {
            ...item,
            selectable: false,
            label: label,
            scopedSlots: { title: 'label' }
          };
        });
      } else {
        return treeData.map(item => {
          return {
            ...item
          };
        });
      }
    },
    handleData(dataList) {
      dataList.forEach(item => {
        item.scopedSlots = false;
        if (this.isSingleSelect) item['selectable'] = false;
        for (let key in item.data) {
          item[key] = item.data[key];
        }
        if (item.children && item.children.length) {
          this.handleData(item.children);
        } else {
          if (this.isSingleSelect) item['selectable'] = true; // 单选时 仅能选择小类
        }
      });
    },
    changeTreeValue(value, label, extra) {
      this.$emit('change', value, label, extra, this.treeData);
    },
    getPopupContainer(trigger) {
      return trigger.parentNode;
    }
  }
};
</script>

<style lang="less" scoped>
.device-type {
  width: 100%;
}
</style>
