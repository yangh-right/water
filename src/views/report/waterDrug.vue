<!--
 * @Author: wangyr
 * @Date: 2023-05-10 09:58:43
 * @LastEditors: wangyr
 * @LastEditTime: 2024-10-19 12:51:03
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
  getWaterMedicinalPage, // 水厂报表分页查询
  exportWaterMedicinalPage // 导出
} from '@/api/report';
export default {
  name: 'waterDrug',
  components: {
    ReportTable: () => import('./models/ReportTableEnergyWaterElec.vue')
  },
  data() {
    return {
      item: {
        title: '水量药效',
        treeType: 'pump', // 选择设备device/污水厂pump
        intervalShow: false, // 是否显示间隔
        queryData: getWaterMedicinalPage,
        export: exportWaterMedicinalPage,
        isShowSum: true,
        isShowTime: true,
        isCompare: false,
        timeType: 'day',
        date: '',
        typeList: [
          { label: '日报', value: 'day' },
          { label: '月报', value: 'month' }
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
