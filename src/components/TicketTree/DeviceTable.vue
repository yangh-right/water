<template>
  <div>
    <list-table
      :columns="columns"
      :list="list"
      :readonly="readonly"
      @change="handleChange"
    ></list-table>
  </div>
</template>

<script>
import Table from './Table';

const columns = [
  {
    title: '设备名称/参数',
    dataIndex: 'deviceName',
    key: 'deviceName',
    type: 'string',
    rules: [{ required: true, message: '设备名称不能为空' }],
    width: 100
  },
  {
    title: '台/套数',
    dataIndex: 'deviceNumber',
    key: 'deviceNumber',
    type: 'number',
    rules: [{ required: true, message: '套数不能为空' }],
    width: 80
  },
  {
    title: '使用年限',
    dataIndex: 'devicePeriod',
    key: 'devicePeriod',
    type: 'number',
    rules: [{ required: true, message: '使用年限不能为空' }],
    width: 80
  }
];

export default {
  name: 'DeviceTable',

  components: {
    ListTable: Table
  },

  props: {
    readonly: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    value: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      list: this.formatVal(this.value),
      columns: Object.freeze(columns)
    };
  },

  watch: {
    value(val) {
      this.list = this.formatVal(val);
    }
  },

  methods: {
    formatVal(val) {
      return val ? val : [];
    },

    handleChange(list) {
      this.$emit('input', list);
    }
  }
};
</script>
