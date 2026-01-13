<!--
 * @Author: wangyr
 * @Date: 2023-07-17 10:51:19
 * @LastEditors:  Do not edit
 * @LastEditTime: 2024-07-26 14:49:51
 * @Description:
-->
<template>
  <div class="instrument-box">
    <w-form-header
      newLine
      :layout="layout"
      :fields="fields"
      :model="searchForm"
      :loading="loading"
      class="supply-w-full"
    >
      <template #waterPlantId>
        <FactorySelect
          v-model.trim="searchForm.waterPlantId"
          :showAll="showAll"
          autoSelect
          @change="handleSearch"
        ></FactorySelect>
      </template>
      <template #placeholder>
        <span></span>
      </template>
      <template #footer>
        <w-button icon="ic_autorenew" :loading="loading" @click="handleReset">
          重置
        </w-button>
        <w-button type="primary" icon="ic_search" :loading="loading" @click="handleSearch">
          查询
        </w-button>
      </template>
    </w-form-header>
    <div v-if="pointsArr.length > 0" class="page-content">
      <div v-for="item in pointsArr" :key="item.pointName" class="filed-box">
        <div class="chart-box">
          <line-chart :darkTheme="'light'" :option="item.gaugeOption" ref="gaugeChart"></line-chart>
          <div class="title">{{deviceStatusDict[item.device.deviceStatus] }}</div>
        </div>
        <div class="filed-info">
          <div class="filed-item">
            <div class="label">仪表名称：</div>
            <div class="value">{{ item.device.deviceName }}</div>
          </div>
          <div class="filed-item">
            <div class="label">最近保养日期：</div>
            <div class="value">{{ item.ticketArchive.endTime }}</div>
          </div>
          <div class="filed-item">
            <div class="label">规格型号：</div>
            <div class="value">{{ item.device.deviceModelName }}</div>
          </div>
          <div class="filed-item">
            <div class="label">最近保养内容：</div>
            <div class="value">{{ item.ticketArchive.operateTypeName }}</div>
          </div>
          <div class="filed-item">
            <div class="label">安装位置：</div>
            <div class="value">{{ item.device.placeName }}</div>
          </div>
          <div class="filed-item">
            <div class="label">保养手册：</div>
            <div class="value drill" @click="toPreview">查看</div>
          </div>
          <w-divider dashed class="filed-divider" />
          <div class="filed-item">
            <div class="label filed-other">下一次保养内容：</div>
            <div class="value">{{ item.ticketPlanConfig.operateTypeName }}</div>
          </div>
          <div class="filed-item">
            <div class="label filed-other">下一次保养时间：</div>
            <div class="value">{{ item.ticketPlanConfig.nextOperateDate }}</div>
          </div>
        </div>
      </div>
    </div>
    <w-empty v-else class="empty"></w-empty>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import { headerFields, searchForm } from './components/data';
import {
  queryInstrumentPage,
  getStructureByStationId,
  sysDictListByCode,
} from '@/api/deviceManagement';
export default {
  name: 'InstrumentMaintenance',
  components: {
    LineChart: () => import('@/components/chart/LineChart.vue'),
    FactorySelect: () => import('@/components/factory-select/index.vue'),
  },
  data() {
    return {
      layout: {
        span: 5,
        wrapperCol: { span: 18 },
        gutter: [0], //栅格间隔[水平间距，垂直间距]
      },
      showAll: true,
      fields: headerFields,
      searchForm,
      loading: false,
      gaugeOption: {},
      deviceStatusDict: {},
      pointsArr: [],
    };
  },
  computed: {},
  inject: ['state'],
  watch: {
    'searchForm.waterPlantId': {
      handler(val) {
        this.getStructureList();
      },
      immediate: true,
    },
    'state.theme': {
      handler(newValue) {
          if (this.pointsArr.length > 0) {
          this.getOptionStateColor(newValue)  
          }
      },
      immediate: true,
    },},
  methods: {
    getOptionStateColor(newValue){
      this.pointsArr.forEach(item=>{
        if (newValue === 'dark') {
            item.gaugeOption.series[0].axisLabel.color = '#adb5bd';
            item.gaugeOption.series[0].detail.color = '#adb5bd';
            item.gaugeOption.series[0].data[0].title.color = '#adb5bd';
            item.gaugeOption.series[0].axisLine.lineStyle.color[0] = [1,'#000'];
        } else {
          item.gaugeOption.series[0].axisLabel.color = '#666';
          item.gaugeOption.series[0].detail.color = '#666';
          item.gaugeOption.series[0].data[0].title.color = '#666';
          item.gaugeOption.series[0].axisLine.lineStyle.color[0] = [1,'#e6ebf8'];
        }
        })
    },
    init() {
      Promise.allSettled([this.getDeviceStatusList(), this.getOperateTypeList()]).then(() => {
        this.getList();
      });
    },
    /** 保养类型数据字典 */
    async getOperateTypeList() {
      let { status, resultData } = await sysDictListByCode('instrument_maintenance_type');
      if (status === 'complete') {
        let list = resultData.map((v) => {
          return {
            label: v.dictName,
            value: v.dictValue,
          };
        });
        this.fields.find((i) => i.name === 'operateType').options = list;
      }
    },
    /** 仪表状态数据字典 */
    async getDeviceStatusList() {
      let { status, resultData } = await sysDictListByCode('purification_use_state');
      if (status === 'complete') {
        let list = resultData.map((v) => {
          return {
            label: v.dictName,
            value: v.dictCode,
          };
        });

        this.fields.find((i) => i.name === 'deviceStatus').options = list;
        list.map((item) => {
          this.deviceStatusDict[item.value] = item.label;
        });
      }
    },
    async getStructureList() {
      let res = await getStructureByStationId(this.searchForm.waterPlantId);
      let { status, resultData, errorMessage } = res;
      if (status === 'complete') {
        let list = resultData.map((v) => {
          return {
            label: v.name,
            value: v.id,
            ...v,
          };
        });
        this.fields.find((i) => i.name === 'placeId').options = list;
      }
    },
    drawGauge(data) {
      data.forEach((item) => {
        // 指定图表的配置项和数据
        let val = item.pointRealData.pointValue || 0;
        let min = item.pointRealData.minValue || 0;
        let max = item.pointRealData.maxValue || 1000;
        let colors = this.handleColor(val, min, max);
        let textColor = this.state.theme === 'dark' ? '#adb5bd' : '#666';
        let bgColor = this.state.theme === 'dark' ? '#000' : '#e6ebf8';
        let option = {
          grid: [
            {
              top: '8%',
              left: '3%',
              right: '4%',
              bottom: '4%',
              containLabel: true,
            },
          ],
          legend: {
            show: false,
          },
          series: [
            {
              type: 'gauge',
              radius: '100%', // 可调整该属性修改圆环大小
              center: ['50%', '55%'],
              progress: {
                show: true,
                width: 12,
                itemStyle: {
                  opacity: 1,
                  color: new echarts.graphic.LinearGradient(0, 1, 1, 0, colors),
                },
              },

              axisLine: {
                lineStyle: {
                  width: 12,
                  color: [
                    [1, bgColor],
                  ],
                },
              },
              axisTick: {
                length: 12,
                lineStyle: {
                  color: 'auto',
                  width: 0,
                },
              },
              splitLine: {
                show: false,
              },
              axisLabel: {
                distance: -4,
                color: textColor,
                fontSize: 12,
              },
              pointer: {
                length: '80%',
                width: 2,
              },
              anchor: {
                show: true,
                showAbove: true,
                size: 10,
                itemStyle: {
                  color: '#fff',
                  borderColor: '#4285F4',
                  borderWidth: 2.5,
                },
              },
              detail: {
                valueAnimation: true,
                fontSize: 18,
                color:textColor,
                offsetCenter: [0, '50%'],
              },
              min: min,
              max: max,
              data: [
                {
                  title: {
                    show: true,
                    color:textColor,
                    fontSize: 16
                  },
                  name:item.pointRealData.pointUnit,
                  value: val,
                },
              ],
            },
          ],
        };
        item.gaugeOption = option;
      });
      this.pointsArr = data;
    },
    handleColor(val, min, max) {
      let num = parseFloat((val - min) / (max - min));
      let originColor = [];
      if (0 <= num && num < 0.18) {
        originColor = [
          {
            offset: 0,
            color: 'rgba(66,133,244,1.000)',
          },
          {
            offset: 1,
            color: 'rgba(5,192,255,1.000)',
          },
        ];
      } else if (num >= 0.18 && num < 0.36) {
        originColor = [
          {
            offset: 0,
            color: 'rgba(66,133,244,1.000)',
          },
          {
            offset: 0.5,
            color: 'rgba(5,192,255,1.000)',
          },
          {
            offset: 1,
            color: 'rgba(109,212,0,1.000)',
          },
        ];
      } else if (num >= 0.36 && num < 0.54) {
        originColor = [
          {
            offset: 0,
            color: 'rgba(66,133,244,1.000)',
          },
          {
            offset: 0.33,
            color: 'rgba(5,192,255,1.000)',
          },
          {
            offset: 0.66,
            color: 'rgba(109,212,0,1.000)',
          },
          {
            offset: 1,
            color: 'rgba(255,189,7,1.000)',
          },
        ];
      } else if (num >= 0.54 && num < 0.72) {
        originColor = [
          {
            offset: 0,
            color: 'rgba(66,133,244,1.000)',
          },
          {
            offset: 0.25,
            color: 'rgba(5,192,255,1.000)',
          },
          {
            offset: 0.5,
            color: 'rgba(109,212,0,1.000)',
          },
          {
            offset: 0.75,
            color: 'rgba(255,189,7,1.000)',
          },
          {
            offset: 1,
            color: 'rgba(250,100,0,1.000)',
          },
        ];
      } else if (num >= 0.72) {
        originColor = [
          {
            offset: 0,
            color: 'rgba(66,133,244,1.000)',
          },
          {
            offset: 0.18,
            color: 'rgba(5,192,255,1.000)',
          },
          {
            offset: 0.36,
            color: 'rgba(109,212,0,1.000)',
          },
          {
            offset: 0.54,
            color: 'rgba(255,189,7,1.000)',
          },
          {
            offset: 0.72,
            color: 'rgba(250,100,0,1.000)',
          },
          {
            offset: 1,
            color: 'rgba(248,31,31,1.000)',
          },
        ];
      }

      return originColor;
    },
    toPreview() {
      this.drillDown({
        path: '/fileManagement',
      });
    },
    async getList() {
      let res = await queryInstrumentPage(this.searchForm);
      let { status, resultData, errorMessage } = res;
      if (status === 'complete') {
        let data = resultData;
        this.drawGauge(data);
      }
    },
    handleSearch() {
      this.getList();
    },
    handleReset() {
      this.searchForm = {
        waterPlantId: '',
        deviceStatus: '',
        operateType: '',
        placeId: '',
      };
      this.getList();
    },
  },
  created() {
    this.init();
  },
  mounted() {},
};
</script>

<style lang="less" scoped>
.instrument-box {
  height: 100%;
  position: relative;

  .page-content {
    width: 100%;
    height: calc(100% - 80px);
    overflow: auto;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-content: flex-start;
    margin-top: 12px;

    .filed-box {
      width: calc(50% - 6px);
      height: 166px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--supply-color-bg-card-DEFAULT);
      margin-bottom: 12px;
    }
    .chart-box {
      width: 34%;
      height: 100%;
      position: relative;

      .title {
        text-align: center;
        font-size: 12px;
        color: var(--supply-color-primary-DEFAULT);
        position: absolute;
        bottom: 6px;
        left: 0;
        right: 0;
      }
    }
    .filed-info {
      width: 66%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;

      .filed-item {
        width: 50%;
        margin-top: 4px;
        margin-bottom: 4px;
        display: flex;
        justify-content: flex-start;

        .label {
          font-size: 14px;
          color: var(--supply-color-secondary);
        }
        .filed-other {
          color: var(--supply-color-deviate);
        }
        .value {
          font-size: 14px;
          color: var(--supply-color-secondary);
          padding-left: 4px;
        }
        .drill {
          color: var(--supply-color-primary-DEFAULT);
          cursor: pointer;
        }
      }
    }
    .filed-divider {
      width: 100%;
      margin: 8px 0;
    }
  }
  .empty {
    margin-top: 10px;
  }
}
</style>
