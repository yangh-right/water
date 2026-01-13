<template>
  <tree
    type="device"
    :value="treeData"
    :orgId="orgId"
    :list="list"
    :direction="direction"
    :disabled="disabled"
    :readonly="readonly"
    :multiple="multiple"
    :selectable="selectable"
    :columns="columns"
    @change="handleChange"
  />
</template>

<script>
import Tree from './Tree';

export default {
  name: 'DeviceTree',

  components: {
    Tree
  },

  props: {
    value: {
      type: [String, Object, Array],
      default: null
    },
    direction: {
      type: String,
      default: 'column'
    },
    orgId: {
      type: String,
      default: ''
    },
    list: {
      type: [Array],
      default: () => []
    },
    disabled: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    },
    selectable: {
      type: Boolean,
      default: false
    },
    multiple: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      treeData: this.formatVal(this.value),
      columns: [
        {
          title: '序号',
          dataIndex: 'index',
          width: 120
        },
        {
          title: '设备名称',
          dataIndex: 'title',
          width: 200
        },
        {
          title: '设备地址',
          dataIndex: 'address'
        }
      ]
    };
  },

  watch: {
    value(val) {
      this.treeData = this.formatVal(val);
    }
  },

  methods: {
    formatVal(val) {
      return val ? val : [];
    },

    handleChange(data, extra) {
      this.$emit('input', data, extra);
    }
  }
};
</script>
