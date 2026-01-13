<template>
  <tree
    type="tank"
    :value="treeData"
    :list="list"
    :orgId="orgId"
    :direction="direction"
    :disabled="disabled"
    :readonly="readonly"
    :selectable="selectable"
    :multiple="multiple"
    :columns="columns"
    @change="handleChange"
  />
</template>

<script>
import Tree from './Tree';

export default {
  name: 'TankTree',

  components: {
    Tree
  },

  props: {
    value: {
      type: [String, Object, Array],
      default: ''
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
    selectable: {
      type: Boolean,
      default: false
    },
    readonly: {
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
          width: 80
        },
        {
          title: '污水厂名称',
          dataIndex: 'pumpName',
          width: 120
        },
        {
          title: '水箱名称',
          dataIndex: 'title',
          width: 120
        },
        {
          title: '水箱地址',
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
