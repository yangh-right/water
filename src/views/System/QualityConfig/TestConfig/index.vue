<!--
 * @Author: wangyr
 * @Date: 2023-04-12 11:40:41
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-04-15 13:54:09
 * @Description:
-->
<template>
  <div class="full-view wbgc-card wrapper">
    <w-tabs class="full-view" @change="callback">
      <w-tab-pane key="SamplePoint" tab="采样点"> <SamplePoint ref="SamplePoint"/></w-tab-pane>
      <w-tab-pane key="QuotaComposition" tab="指标组合"
        ><QuotaComposition ref="QuotaComposition"
      /></w-tab-pane>
      <w-tab-pane key="SampleVector" tab="采样容器"><SampleVector ref="SampleVector"/></w-tab-pane>
      <w-tab-pane key="Preservatives" tab="保存剂"><Preservatives ref="Preservatives"/></w-tab-pane>
    </w-tabs>
  </div>
</template>

<script>
import SamplePoint from '@/views/System/QualityConfig/TestConfig/components/SamplePoint';
import QuotaComposition from '@/views/System/QualityConfig/TestConfig/components/QuotaComposition';
import SampleVector from '@/views/System/QualityConfig/TestConfig/components/SampleVector';
import Preservatives from '@/views/System/QualityConfig/TestConfig/components/Preservatives';
export default {
  name: 'TestConfig',
  components: { SamplePoint, QuotaComposition, SampleVector, Preservatives },
  data() {
    return {};
  },
  methods: {
    callback(key) {
      // 切换Tab时刷新组件
      this.$nextTick(() => {
        this.$refs[key].getInit();
      });
    }
  }
};
</script>

<style lang="less" scoped>
.wrapper {
  border-radius: 4px;
}

/deep/ .wpg-tabs-content {
  height: calc(100% - 48px);
}

/deep/ .info-table-view {
  height: 100%;
}

/deep/ .form-wrap,
/deep/ .table-warp,
/deep/ .form-wrap,
/deep/ .table-warp {
  box-shadow: none !important;
}

/deep/ .table-warp,
/deep/ .table-wrap {
  padding: 0 !important;
}
</style>
