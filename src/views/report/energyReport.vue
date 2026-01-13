<!--
 * @Description: 水电量报表
 * @Author: limz
 * @Date: 2021-07-22 16:01:45
 * @LastEditTime: 2024-04-26 11:12:53
 * @LastEditors: wangyr
-->
<template>
  <div class="water-elec">
    <report-table
      ref="reportTable"
      :defaultPoints="['flowPv', 'powerPv']"
      :isExceptionShow="true"
      :item="item"
    ></report-table>
  </div>
</template>

<script>
import { periodWaterElecOptions, pumpDeviceLevelList, waterPlainOptions } from './models/data';
import {
  flowPowerPage, // 水电量报表分页查询
  exportFlowPowerExcel // 导出
} from '@/api/report';
export default {
  name: 'EnergyReport',
  components: {
    ReportTable: () => import('./models/ReportTable.vue')
  },
  data() {
    return {
      item: {
        title: '水电量报表',
        treeType: 'pump', // 选择设备device/泵房pump
        plainOptions: Object.freeze(waterPlainOptions), // 可勾选监测量
        intervalShow: false, // 是否显示间隔
        queryData: flowPowerPage,
        export: exportFlowPowerExcel,
        isShowSum: true,
        timeType: 'day',
        dataLevel: 0,
        date: '',
        typeList: [
          { label: '日报', value: 'day' },
          { label: '月报', value: 'month' },
          { label: '年报', value: 'year' }
        ],
        pumpIds: [],
        deviceIds: [],
        reportName: 'waterElec',
        showPumpDeviceLevel: true,
        pumpDeviceLevelList: pumpDeviceLevelList,
        pumpDeviceLevel: 'pumpLevel', // pumpLevel deviceLevel
        periodOptions: periodWaterElecOptions,
        exportFileName: '水电量',
        periodEndCount: 6
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
      let {
        sessionStorageId,
        timeType,
        indicators,
        date,
        pumpIds,
        deviceIds,
        reportName,
        showPumpDeviceLevel,
        pumpDeviceLevelList,
        pumpDeviceLevel,
        periodOptions,
        exportFileName,
        periodEndCount,
        drillDownTime
      } = this.$route.query;
      this.drillDownTime = drillDownTime;
      // 处理sessionStorageId
      if (sessionStorageId) {
        let param = JSON.parse(sessionStorage.getItem(sessionStorageId) || '{}');
        this.item = {
          ...this.item,
          ...param
        };
      }
      if (timeType) {
        this.item.timeType = timeType;
      }
      if (indicators) {
        if (indicators instanceof String) {
          indicators = indicators.split(',');
        }
        this.item.indicators = indicators;
      }
      if (date) {
        this.item.date = date;
      }
      if (pumpIds) {
        if (pumpIds instanceof String) {
          pumpIds = pumpIds.split(',');
        }
        this.item.pumpIds = pumpIds;
      }
      if (deviceIds) {
        if (deviceIds instanceof String) {
          deviceIds = deviceIds.split(',');
        }
        this.item.deviceIds = deviceIds;
      }

      if (showPumpDeviceLevel) {
        this.item.showPumpDeviceLevel = showPumpDeviceLevel;
      }
      if (reportName) {
        this.item.reportName = reportName;
      }
      if (pumpDeviceLevelList) {
        this.item.pumpDeviceLevelList = pumpDeviceLevelList;
      }
      if (pumpDeviceLevel) {
        this.item.pumpDeviceLevel = pumpDeviceLevel;
      }
      if (periodOptions) {
        this.item.periodOptions = periodOptions;
      }
      if (exportFileName) {
        this.item.exportFileName = exportFileName;
      }
      if (periodEndCount) {
        this.item.periodEndCount = periodEndCount;
      }
    }
  }
};
</script>

<style scoped lang="less">
.water-elec {
  height: 100%;
}
</style>
