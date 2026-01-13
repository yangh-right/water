<!--
 * @Author: wangyr
 * @Date: 2023-05-10 09:58:43
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-06-29 15:28:56
 * @Description:
-->
<template>
  <div class="water-elec">
    <report-table ref="reportTable" :isExceptionShow="true" :item="item"></report-table>
  </div>
</template>

<script>
import { periodWaterElecOptions, pumpDeviceLevelList } from './models/data';
import {
  waterPlantPage, // 水厂报表分页查询
  exportWaterPlantExcel // 导出
} from '@/api/report';
export default {
  name: 'EnergyReport',
  components: {
    ReportTable: () => import('./models/ReportTableEnergyWaterElec.vue')
  },
  data() {
    return {
      item: {
        title: '污水厂',
        treeType: 'pump', // 选择设备device/污水厂pump
        intervalShow: false, // 是否显示间隔
        queryData: waterPlantPage,
        export: exportWaterPlantExcel,
        isShowSum: true,
        isShowTime: false,
        isCompare: false,
        timeType: 'day',
        date: '',
        typeList: [
          { label: '日报', value: 'day' },
          { label: '月报', value: 'month' },
          { label: '年报', value: 'year' }
        ],
        pumpIds: [],
        deviceIds: [],
        reportName: 'waterElec',
        showPumpDeviceLevel: false,
        pumpDeviceLevelList: pumpDeviceLevelList,
        pumpDeviceLevel: 'pumpLevel', // pumpLevel deviceLevel
        periodOptions: periodWaterElecOptions,
        exportFileName: '水厂',
        periodEndCount: 6,
        columns: []
      }
    };
  },
  activated() {
    if (this.$route.query.drillDownTime && this.drillDownTime !== this.$route.query.drillDownTime) {
      this.initQuery();
      this.$nextTick(() => {
        this.$refs.reportTable.updateQuery();
      });
    }
  },
  methods: {
    initQuery() {
      // 接收url query参数
    }
  }
};
</script>

<style scoped lang="less">
.water-elec {
  height: 100%;
}
</style>
