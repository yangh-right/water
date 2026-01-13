<template>
  <w-cascader
    v-model="selectValue"
    :popupStyle="{ maxHeight: '360px', overflow: 'auto' }"
    changeOnSelect
    expandTrigger="hover"
    :options="showTreeData"
    :placeholder="placeholder"
    :field-names="{ label: 'name', value: 'id', children: 'children' }"
    :getPopupContainer="node => node.parentNode"
    :displayRender="handleDisplayRender"
    @change="changeValue"
  >
  </w-cascader>
</template>

<script>
import { cloneDeep } from 'lodash';
export default {
  name: 'PlaceCascader',
  props: {
    value: {
      type: Array,
      default: () => []
    },
    waterPlantId: {
      type: String,
      require: true,
      default: ''
    },
    placeholder: {
      type: String,
      default: '请选择地点'
    },
    showType: {
      // 展示的地点类型,0构筑物，1水池，2构筑物下面的位置，3水池下面的位置, 4仓库
      type: Array,
      default() {
        return [0, 1, 2, 3];
      }
    }
  },
  data() {
    return {
      selectValue: undefined,
      treeData: [],
      notSelectList: []
    };
  },
  computed: {
    showTreeData() {
      console.log(this.filterTreeData(this.treeData));
      return this.filterTreeData(this.treeData);
    },
    placeIdList() {
      let list = [];
      let getTreeIdList = (tree, list) => {
        tree.forEach(item => {
          if (item.selectable) {
            list.push(item.id);
          }
          if (item.children?.length) {
            getTreeIdList(item.children, list);
          }
        });
      };
      getTreeIdList(this.showTreeData, list);
      return list;
    }
  },
  watch: {
    waterPlantId() {
      this.getTreeData();
    },
    value: {
      handler(val) {
        this.selectValue = cloneDeep(val) || undefined;
      },
      deep: true
    },
    // 在地点树改变时，判断value是否存在地点树的Id可选列表中
    placeIdList: {
      handler() {},
      deep: true
    },
    selectValue: {
      handler(val) {
        if (val && val.length === 1 && this.notSelectList.includes(val[0])) {
          this.selectValue = undefined;
        }
      },
      deep: true
    }
  },
  created() {
    this.selectValue = cloneDeep(this.value) || undefined;
    this.getTreeData();
  },
  methods: {
    handleDisplayRender({ labels }) {
      if (labels && labels?.length) {
        return labels.join(' - ');
      }
      return '';
    },
    filterTreeData(list) {
      console.log(this.showType);
      const res = list.filter(item => this.showType.includes(item.type));
      res.forEach(item => {
        if (item.children && item.children.length > 0) {
          item.children = this.filterTreeData(item.children);
        } else {
          item.children = undefined;
          delete item.children;
        }
      });
      return res;
    },
    async getTreeData() {
      this.treeData = [];
      // 需要传入污水厂Id才能请求地址
      if (this.waterPlantId) {
        const res = await this.$http.get(
          `/place/getInstallationLocationTree?waterPlantId=${this.waterPlantId}`
        );
        if (res.success) {
          this.treeData = cloneDeep(res.resultData);
          console.log(this.treeData, res.resultData);
          this.notSelectList = res.resultData?.filter(i => !i.selectable).map(i => i.id);
        }
      }
    },
    clearValue() {
      if (this.value?.length) {
        this.selectValue = undefined;
        this.$emit('change', undefined, undefined);
        this.$emit('input', undefined);
      }
    },
    changeValue(value, options) {
      this.$emit('input', value);
      this.$emit('change', value, options);
    }
  }
};
</script>

<style lang="less" scoped></style>
