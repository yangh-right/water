<template>
  <div>
    <div v-if="pump">
      <div class="pump-table-row">污水厂名称：{{ pump.pumpName }}</div>
      <div class="pump-table-row">污水厂地址：{{ pump.pumpAddress || '--' }}</div>
    </div>
  </div>
</template>

<script>
import { getPumpList } from '@/api/work';

export default {
  name: 'PumpTable',

  props: {
    readonly: {
      type: Boolean,
      default: false
    },
    value: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      pump: null
    };
  },

  watch: {
    value() {
      this.getPump();
    }
  },

  mounted() {
    this.getPump();
  },

  methods: {
    async getPump() {
      if (this.value) {
        let res = await getPumpList([this.value]);
        let list = res.resultData || [];

        this.pump = list[0] ? list[0] : null;
      }
    }
  }
};
</script>

<style lang="less" scoped>
.pump-table-row {
  ~ .pump-table-row {
    margin-top: 15px;
  }
}
</style>
