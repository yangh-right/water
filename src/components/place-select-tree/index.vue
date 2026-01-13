<template>
  <w-tree-select
    v-model="selectValue"
    :dropdown-style="{ maxHeight: '360px', overflow: 'auto' }"
    :treeData="showTreeData"
    :placeholder="placeholder"
    :getPopupContainer="node => node.parentNode"
    :replaceFields="{ title: 'name', value: 'id', key: 'id' }"
    @change="changeValue"
    :treeDefaultExpandedKeys="placeIdList"
    tree-default-expand-all
  >
  </w-tree-select>
</template>

<script>
export default {
  name: 'PlaceSelectTree',
  props: {
    value: {
      type: String,
      default: ''
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
    },
    allCanSelect: {
      // 是否可以选择所有地点
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      selectValue: '',
      treeData: []
    };
  },
  computed: {
    showTreeData() {
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
    value(val) {
      this.selectValue = val || undefined;
    },
    // 在地点树改变时，判断value是否存在地点树的Id可选列表中
    placeIdList: {
      handler(list) {
        if (this.showTreeData?.length && !list.includes(this.value)) {
          // this.clearValue();
        }
      },
      deep: true
    }
  },
  created() {
    this.selectValue = this.value || undefined;
    this.getTreeData();
  },
  methods: {
    filterTreeData(list) {
      const res = list.filter(item => this.showType.includes(item.type));
      res.forEach(item => {
        if (this.allCanSelect) {
          item.selectable = true;
        }
        if (item.children && item.children.length > 0) {
          item.children = this.filterTreeData(item.children);
        }
      });
      return res;
    },
    async getTreeData() {
      this.treeData = [];
      // 需要传入污水厂Id才能请求地址
      if (this.waterPlantId) {
        const res = await this.$http.get(
          `/place/getStructureByStationId?waterPlantId=${this.waterPlantId}`
        );
        if (res.success) {
          this.treeData = res.resultData;
        }
      }
    },
    clearValue() {
      this.selectValue = undefined;
      this.$emit('input', undefined);
    },
    changeValue(value, label, extra) {
      let structureObj = {
        id: undefined,
        code: undefined,
        name: undefined,
        type: undefined,
        positionType: undefined
      };
      if (value) {
        // 存在parentPath，去构筑物id
        if (extra?.triggerNode?.$vnode?.data?.props?.parentPath) {
          structureObj.id = extra?.triggerNode?.$vnode?.data?.props?.parentPath.split(',')[0];
        } else {
          // 不存在parentPath，value为构筑物或仓库id
          structureObj.id = value;
        }
        // 取构筑物code和name，拼接设备编号
        this.showTreeData.forEach(item => {
          if (item.id === structureObj.id) {
            structureObj.code = item.coding;
            structureObj.name = item.name;
            structureObj.type = item.type === 2 ? '仓库' : '构筑物';
            structureObj.positionType = item.type;
          }
        });
      }
      this.$emit('input', value);
      this.$emit('change', value, structureObj);
    }
  }
};
</script>

<style lang="less" scoped></style>
