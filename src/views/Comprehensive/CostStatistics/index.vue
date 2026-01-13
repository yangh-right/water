<!--
 * @Author: wangyr
 * @Date: 2024-04-15 17:25:51
 * @LastEditors: wangyr
 * @LastEditTime: 2024-04-22 08:43:52
 * @Description: 成本统计分析页面
-->
<template>
  <div class="cost-statistics">
    <div class="cost-statistics__header">
      <div class="factory-select">
        选择污水厂：
        <FactorySelect v-model="waterPlantId" style="width: 220px" auto-select />
      </div>
      <div class="date-picker">
        <span>选择月份：</span>
        <w-month-picker
          v-model="dateOption"
          class="month-picker"
          placeholder="选择月份"
          size="small"
          :allow-clear="false"
          :disabled-date="disabledDate"
          @change="handleDateChange"
        />
      </div>
    </div>

    <div class="cost-statistics__content">
      <PowerAnalysis
        :water-plant-id="waterPlantId"
        :loading="loading"
        :data-echart="dataEchart"
        class="analysis-card"
      />
      <StructuresAnalysis
        :water-plant-id="waterPlantId"
        :loading="loading"
        :points-data="pointsData"
        :timeObj="timeObj"
        class="analysis-card"
      />
      <DeviceAnalysis
        :water-plant-id="waterPlantId"
        :loading="loading"
        :points-data="pointsData"
        :waterRecordData="waterRecordData"
        class="analysis-card"
      />
    </div>
  </div>
</template>

<script>
import moment from 'moment';
import { getElectricalDeviceEnergyProportion } from '@/api/cockpit.js';
import { getEnergyDayData, getWaterRecordByDate } from '@/api/analysis.js';
import FactorySelect from '@/components/factory-select/index.vue';
import PowerAnalysis from './components/power-analysis';
import StructuresAnalysis from './components/structures-analysis';
import DeviceAnalysis from './components/device-analysis';

export default {
  name: 'CostStatistics',

  components: {
    FactorySelect,
    PowerAnalysis,
    StructuresAnalysis,
    DeviceAnalysis
  },

  data() {
    return {
      waterPlantId: '',
      timeObj: {
        startTime: moment()
          .startOf('month')
          .format('YYYY-MM-DD 00:00:00'),
        endTime: moment()
          .endOf('month')
          .format('YYYY-MM-DD 23:59:59')
      },
      configCodeList: [{ name: '电耗占比', code: 'P_Power' }],
      dateOption: this.$moment(),
      pointsData: [],
      loading: false,
      dataEchart: [],
      waterRecordData: []
    };
  },

  watch: {
    waterPlantId: {
      handler(val) {
        if (val) {
          this.initializeData();
        }
      },
      immediate: true
    }
  },

  methods: {
    /**
     * 初始化数据
     */
    async initializeData() {
      try {
        await Promise.all([
          this.getPointList(),
          this.getEnergyDayData(),
          this.getWaterRecordByDate()
        ]);
      } catch (error) {
        console.error('初始化数据失败:', error);
        this.$message.error('数据加载失败，请稍后重试');
      }
    },

    /**
     * 获取日期范围
     */
    getDateRange() {
      const startDate = this.$moment(this.dateOption)
        .startOf('month')
        .format('YYYY-MM-DD');
      const endDate = this.$moment(this.dateOption)
        .endOf('month')
        .format('YYYY-MM-DD');
      return { startDate, endDate };
    },

    /**
     * 设置加载状态
     */
    setLoadingState(state) {
      this.loading = state;
    },

    /**
     * 批量调用API
     */
    async batchApiCall(items, apiCallFn) {
      if (this.loading) return [];

      try {
        this.setLoadingState(true);
        const promises = items.map(item =>
          apiCallFn(item).catch(() => ({
            configCode: item.code,
            name: item.name,
            error: true
          }))
        );

        return await Promise.all(promises);
      } finally {
        this.setLoadingState(false);
      }
    },

    /**
     * 获取点位列表数据
     */
    async getPointList() {
      if (!this.waterPlantId) return;

      try {
        const { startDate, endDate } = this.getDateRange();
        this.timeObj = {
          startTime: startDate + ' 00:00:00',
          endTime: endDate + ' 23:59:59'
        };
        const results = await this.batchApiCall(this.configCodeList, async item => {
          const params = {
            waterPlantId: this.waterPlantId,
            // configCode: item.code,
            startTime: startDate + ' 00:00:00',
            endTime: endDate + ' 23:59:59',
            timePeriod: 'Days'
          };
          const res = await getElectricalDeviceEnergyProportion(params);
          return {
            error: false,
            configCode: item.code,
            name: item.name,
            ...res,
            ...params
          };
        });

        this.pointsData = results.filter(item => !item.error);
      } catch (error) {
        console.error('获取点位数据失败:', error);
      }
    },

    /**
     * 获取能耗数据
     */
    async getEnergyDayData() {
      try {
        this.setLoadingState(true);
        const { startDate, endDate } = this.getDateRange();

        const params = {
          dateType: 'day',
          deviceIdList: [],
          endDate,
          startDate,
          ratioFlag: true,
          statType: 0,
          waterPlantIdList: [this.waterPlantId]
        };

        const { resultData, status } = await getEnergyDayData(params);
        if (status === 'complete') {
          this.dataEchart = resultData;
        }
      } catch (error) {
        console.error('获取能耗数据失败:', error);
      } finally {
        this.setLoadingState(false);
      }
    },

    /**
     * 查询市政用水日用水量
     */
    async getWaterRecordByDate() {
      try {
        this.setLoadingState(true);
        const { startDate, endDate } = this.getDateRange();

        const params = {
          endTime: endDate,
          startTime: startDate
        };

        const { resultData, status } = await getWaterRecordByDate(params);
        if (status === 'complete') {
          this.waterRecordData = resultData;
        }
      } catch (error) {
        console.error('获取市政用水数据失败:', error);
      } finally {
        this.setLoadingState(false);
      }
    },

    /**
     * 日期变更处理
     */
    handleDateChange() {
      this.initializeData();
    },

    /**
     * 禁用日期判断
     */
    disabledDate(current) {
      return current && current > this.$moment().endOf('month');
    }
  }
};
</script>

<style lang="less" scoped>
.cost-statistics {
  height: 100%;
  overflow: hidden;
  position: relative;

  &__header {
    height: 50px;
    width: 100%;
    border-radius: 4px;
    background: var(--supply-color-bg-card-DEFAULT);
    display: flex;
    align-items: center;
    padding: 0 12px;
    margin-bottom: 10px;

    .factory-select {
      display: flex;
      align-items: center;
    }

    .date-picker {
      margin-left: 10px;
      display: flex;
      align-items: center;

      span {
        margin-right: 10px;
      }
    }
  }

  &__content {
    width: 100%;
    height: calc(100% - 60px);
    min-height: 742px;
    margin-top: 12px;
    display: flex;

    .analysis-card {
      flex: 0 0 calc(33.3% - 7px);
      height: 100%;
      border-radius: 4px;
      margin-right: 10px;

      &:last-child {
        margin-right: 0;
      }
    }
    .card:nth-child(2) {
      width: 33.3%;
    }
    .card:nth-child(3) {
      width: 33.3;
    }
  }
}
</style>
