<!--
 * @Author: wangyr
 * @Date: 2023-08-05 09:59:45
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-09-07 09:41:25
 * @Description:
-->
<template>
  <div class="page">
    <w-form-header :layout="layout" :fields="fields" class="supply-w-full">
      <template #waterPlantId>
        <FactorySelect
          style="max-width:179px"
          @change="factoryChange"
          v-model.trim="waterPlantId"
          autoSelect
        ></FactorySelect>
      </template>
      <template #footer></template>
    </w-form-header>

    <div class="page-item">
      <process-flow :waterPlantId="waterPlantId"></process-flow>
      <video-hls title="视频监控" :waterPlantId="waterPlantId"></video-hls>
      <exception-analysis title="异常分析" :waterPlantId="waterPlantId"></exception-analysis>
    </div>
    <div class="page-item">
      <run-strategy title="进水水质" :waterPlantId="waterPlantId"></run-strategy>
      <!-- <water-quality title="进水水质指标" :waterPlantId="waterPlantId"></water-quality> -->
      <run-param title="过程水质指标" :waterPlantId="waterPlantId"></run-param>
    </div>
    <div class="page-item">
      <device-run :waterPlantId="waterPlantId"></device-run>
      <keep-calendar :waterPlantId="waterPlantId"></keep-calendar>
    </div>
  </div>
</template>

<script>
import { runFields } from './components/data';
import FactorySelect from '@/components/factory-select/index.vue';
import ProcessFlow from './components/ProcessFlow.vue';
import WaterQuality from './components/WaterQuality.vue';
import KeepCalendar from './components/KeepCalendar.vue';
import DeviceRun from './components/DeviceRun.vue';
import RunParam from './components/RunParam.vue';
import VideoHls from './components/VideoHls.vue';
import RunStrategy from './components/RunStrategy.vue';
import ExceptionAnalysis from './components/ExceptionAnalysis.vue';

export default {
  name: 'biologicalPool',
  components: {
    ProcessFlow,
    FactorySelect,
    WaterQuality,
    DeviceRun,
    KeepCalendar,
    RunParam,
    VideoHls,
    RunStrategy,
    ExceptionAnalysis
  },
  data() {
    return {
      layout: {
        span: 6,
        wrapperCol: { span: 18 },
        gutter: [0] //栅格间隔[水平间距，垂直间距]
      },
      fields: runFields,
      waterPlantId: ''
    };
  },
  computed: {},
  watch: {},
  methods: {
    factoryChange() {}
  },
  created() {},
  mounted() {}
};
</script>

<style lang="less" scoped>
.page {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
}
.supply-w-full {
  margin-bottom: 12px;
}
.page-item {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 12px;

  // .page-left {
  //   width: 100%;
  //   display: flex;
  //   justify-content: space-between;
  //   flex-wrap: wrap;
  //   margin-bottom: 12px;
  //   height: auto;
  // }
  // .page-right {
  //   width: calc(33.5% - 6px);
  //   display: flex;
  //   flex-direction: column;
  //   justify-content: space-between;
  //   flex-wrap: wrap;
  //   margin-bottom: 12px;
  //   height: auto;
  // }
}
</style>
