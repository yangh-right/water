<template>
  <w-tree-select
    v-model="selectValue"
    :dropdown-style="{ maxHeight: '360px', overflow: 'auto' }"
    :treeData="treeData"
    :getPopupContainer="node => node.parentNode"
    :replaceFields="{ title: 'name', value: 'id', key: 'id', children: 'child' }"
    :treeDefaultExpandedKeys="treeIdList"
    @change="changeValue"
    placeholder="请选择设备"
    tree-default-expand-all
  >
  </w-tree-select>
</template>

<script>
export default {
  name: 'DeviceSelectTree',
  props: {
    value: {
      type: String,
      default: ''
    },
    positionId: {
      type: String,
      require: true,
      default: ''
    }
  },
  data() {
    return {
      selectValue: '',
      treeData: []
    };
  },
  computed: {
    treeIdList() {
      let list = [];
      let getTreeIdList = (tree, list) => {
        tree.forEach(item => {
          if (item.selectable) {
            list.push(item.id);
          }
          if (item.child.length) {
            getTreeIdList(item.child, list);
          }
        });
      };
      getTreeIdList(this.treeData, list);
      return list;
    }
  },
  watch: {
    positionId(newV, oldV) {
      this.getTreeData();
      if (oldV) {
        this.clearValue();
      }
    },
    value(val) {
      this.selectValue = val || undefined;
    }
  },
  created() {
    this.selectValue = this.value || undefined;
    this.getTreeData();
  },
  methods: {
    async getTreeData() {
      this.treeData = [];
      // 需要传入位置Id才能请求设备
      if (this.positionId) {
        const res = await this.$http.get(`sewageDeviceApi/Device/getDeviceTree?positionId=${this.positionId}`);
        if (res.success) {
          this.treeData = res.resultData;
        }
      }
    },
    clearValue() {
      this.selectValue = undefined;
      this.$emit('input', '');
    },
    changeValue(value, label, extra) {
      this.$emit('change', value, label, extra);
      this.$emit('input', value);
    }
  }
};
</script>

<style lang="less" scoped></style>
