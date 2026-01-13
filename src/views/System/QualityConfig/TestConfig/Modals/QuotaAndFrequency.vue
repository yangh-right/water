<template>
  <div>
    <w-modal title="化验水质指标及频率" :visible="visible" @cancel="handleCancel">
      <w-row :span="24" :gutter="[12, 12]">
        <w-col :span="12">采样点名称: {{ form.name }}</w-col>
        <w-col :span="12">详细位置： {{ form.place }}</w-col>
      </w-row>
      <w-row :span="24">
        <span style="color: #999">注：采样点所采水样对应的化验指标及频率在化验工单中配置。</span>
      </w-row>
      <div class="full-table-wrap">
        <w-info-table v-loading="loading" showIndex :columns="pointInfoColumns" :data-source="data" :model="searchForm" :page="searchForm" :scroll="{ x: 600 }" @changePage="handlePageChange">
        </w-info-table>
      </div>
    </w-modal>
  </div>
</template>

<script>
import { pointInfoColumns } from '../components/config';
import mixin from '../components/mixin';
export default {
  name: 'QuotaAndFrequency',
  mixins: [mixin],
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    form: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      pointInfoColumns,
      data: [],
      searchForm: {}
    };
  },
  methods: {
    handleCancel() {
      this.$emit('update:visible', false);
    }
  }
};
</script>
<style lang="less" scoped>
/deep/ .wpg-modal {
  width: 800px !important;
}

/deep/ .form-table-warp .table-warp,
/deep/ .form-table-warp .table-wrap {
  box-shadow: none;
  padding: 0;
}
</style>
