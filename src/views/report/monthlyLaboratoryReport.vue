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
  waterQualityMonthReport, // 水厂报表分页查询
  exportWaterQualityMonthReport // 导出
} from '@/api/manage';
export default {
  name: 'monthlyLaboratoryReport',
  components: {
    ReportTable: () => import('./models/ReportTableEnergyWaterElec.vue')
  },
  data() {
    return {
      item: {
        title: '水质化验',
        treeType: 'pump', // 选择设备device/污水厂pump
        intervalShow: false, // 是否显示间隔
        queryData: waterQualityMonthReport,
        export: exportWaterQualityMonthReport,
        isShowSum: true,
        isShowTime: true,
        isCompare: true,
        timeType: 'month',
        date: '',
        typeList: [{ label: '月报', value: 'month' }],
        pumpIds: [],
        deviceIds: [],
        reportName: 'waterElec',
        showPumpDeviceLevel: false,
        pumpDeviceLevelList: pumpDeviceLevelList,
        pumpDeviceLevel: 'pumpLevel', // pumpLevel deviceLevel
        periodOptions: periodWaterElecOptions,
        exportFileName: '水厂',
        periodEndCount: 6,
        columns: [
          { title: '月份', dataIndex: 'month', key: 'month', align: 'center', width: 80 },
          { title: '日期', dataIndex: 'date', key: 'date', align: 'center', width: 80 },
          {
            title: 'PH',
            children: [
              { title: '进水', dataIndex: 'ph_in', key: 'ph_in', align: 'center', width: 80 },
              { title: '出水', dataIndex: 'ph_out', key: 'ph_out', align: 'center', width: 80 }
            ]
          },
          {
            title: 'SS',
            children: [
              { title: '进水', dataIndex: 'ss_in', key: 'ss_in', align: 'center', width: 80 },
              { title: '出水', dataIndex: 'ss_out', key: 'ss_out', align: 'center', width: 80 }
            ]
          },
          {
            title: 'COD',
            children: [
              { title: '进水', dataIndex: 'cod_in', key: 'cod_in', align: 'center', width: 80 },
              { title: '出水', dataIndex: 'cod_out', key: 'cod_out', align: 'center', width: 80 }
            ]
          },
          {
            title: 'BOD',
            children: [
              { title: '进水', dataIndex: 'bod_in', key: 'bod_in', align: 'center', width: 80 },
              { title: '出水', dataIndex: 'bod_out', key: 'bod_out', align: 'center', width: 80 }
            ]
          },
          // 第1张图新增指标
          {
            title: 'NH3-N',
            children: [
              { title: '进水', dataIndex: 'nh3_n_in', key: 'nh3_n_in', align: 'center', width: 80 },
              {
                title: '出水',
                dataIndex: 'nh3_n_out',
                key: 'nh3_n_out',
                align: 'center',
                width: 80
              }
            ]
          },
          {
            title: 'TP',
            children: [
              { title: '进水', dataIndex: 'tp_in', key: 'tp_in', align: 'center', width: 80 },
              { title: '出水', dataIndex: 'tp_out', key: 'tp_out', align: 'center', width: 80 }
            ]
          },
          {
            title: 'TN',
            children: [
              { title: '进水', dataIndex: 'tn_in', key: 'tn_in', align: 'center', width: 80 },
              { title: '出水', dataIndex: 'tn_out', key: 'tn_out', align: 'center', width: 80 }
            ]
          },
          {
            title: '粪大肠菌',
            children: [
              {
                title: '进水',
                dataIndex: 'fecal_coli_in',
                key: 'fecal_coli_in',
                align: 'center',
                width: 80
              },
              {
                title: '出水',
                dataIndex: 'fecal_coli_out',
                key: 'fecal_coli_out',
                align: 'center',
                width: 80
              }
            ]
          },
          // 第2张图新增指标
          {
            title: 'MLSS',
            children: [
              { title: '生物池1#', dataIndex: 'mlss_1', key: 'mlss_1', align: 'center', width: 80 },
              { title: '生物池2#', dataIndex: 'mlss_2', key: 'mlss_2', align: 'center', width: 80 }
            ]
          },
          {
            title: 'MLVSS',
            children: [
              {
                title: '生物池1#',
                dataIndex: 'mlvss_1',
                key: 'mlvss_1',
                align: 'center',
                width: 80
              },
              {
                title: '生物池2#',
                dataIndex: 'mlvss_2',
                key: 'mlvss_2',
                align: 'center',
                width: 80
              }
            ]
          },
          {
            title: 'f值',
            children: [
              {
                title: '生物池1#',
                dataIndex: 'f_ratio_1',
                key: 'f_ratio_1',
                align: 'center',
                width: 80
              },
              {
                title: '生物池2#',
                dataIndex: 'f_ratio_2',
                key: 'f_ratio_2',
                align: 'center',
                width: 80
              }
            ]
          },
          {
            title: 'SVI',
            children: [
              { title: '生物池1#', dataIndex: 'svi_1', key: 'svi_1', align: 'center', width: 80 },
              { title: '生物池2#', dataIndex: 'svi_2', key: 'svi_2', align: 'center', width: 80 }
            ]
          },
          {
            title: 'SV30',
            children: [
              { title: '生物池1#', dataIndex: 'sv30_1', key: 'sv30_1', align: 'center', width: 80 },
              { title: '生物池2#', dataIndex: 'sv30_2', key: 'sv30_2', align: 'center', width: 80 }
            ]
          },
          {
            title: 'DO',
            children: [
              { title: '生物池1#', dataIndex: 'do_1', key: 'do_1', align: 'center', width: 80 },
              { title: '生物池2#', dataIndex: 'do_2', key: 'do_2', align: 'center', width: 80 }
            ]
          }
        ]
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
