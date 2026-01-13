<!--
 * @Description:
 * @version:
 * @Author: fengtaotao
 * @Date: 2023-05-23 14:29:38
 * @LastEditors: wangyr
 * @LastEditTime: 2024-09-07 11:20:05
-->
<template>
  <div class="content">
    <div class="content-header">
      <div class="content-title">{{ title }}</div>
      <div class="form">
        <div class="form-item">
          <w-range-picker
            class="select-item"
            style="width: 300px"
            v-model="picTime"
            format="YYYY-MM-DD"
            placeholder="请选择时间"
            :disabled-date="disabledDate"
            @change="picTimeChange"
          />
        </div>
      </div>
    </div>
    <w-spin :spinning="loading" class="spin">
      <div class="chart-wrapper">
        <div v-if="pointsArr.length > 0" class="card-inner">
          <div class="echart-block">
            <pie-chart ref="alarmChart" :option="pieOption"> </pie-chart>
          </div>
          <div class="points-list">
            <div v-for="(item, i) in pointsArr" :key="item.name" class="point-tab">
              <div class="label">
                <span class="ico-react" :style="{ background: colors[i] }"></span>{{ item.name }}
              </div>
              <div class="precent">{{ item.count }}次</div>
            </div>
          </div>
        </div>
        <w-empty v-else class="empty"></w-empty>
      </div>
    </w-spin>
  </div>
</template>
<script>
import {
  AlarmNameCount // 报警类型数
} from '@/api/diagnosis';
import { pieOption } from './data';
export default {
  name: 'ExceptionAnalysis',
  props: {
    title: {
      type: String,
      default: ''
    },
    waterPlantId: {
      type: String,
      default: ''
    }
  },
  components: {
    PieChart: () => import('@/components/chart/PieChart.vue')
  },
  data() {
    return {
      loading: false,
      picTime: [this.$moment().subtract(7, 'days'), this.$moment()],
      colors: [
        '#2F7FFF',
        '#FF6781',
        '#28D6FE',
        '#FFA66D',
        '#2BDEAB',
        '#FFD739',
        '#A259F5',
        '#F9D54A',
        '#0171CE'
      ],
      pointsArr: [],
      pieOption,
      endTime: '',
      startTime: '',
      type: '1'
    };
  },
  inject: ['state'],
  watch: {
    waterPlantId: {
      immediate: true,
      handler(val) {
        if (val) {
          this.getAlarmType();
        }
      }
    },
    'state.theme': {
      handler(newValue) {
        if (newValue === 'dark') {
          this.pieOption.series[0].label.rich.name.color = '#fff';
        } else {
          this.pieOption.series[0].label.rich.name.color = '#333';
        }
      },
      immediate: true
    }
  },
  created() {},
  methods: {
    async getAlarmType() {
      this.loading = true;
      this.startTime = this.$moment(this.picTime[0]).format('YYYY-MM-DD 00:00:00');
      this.endTime = this.$moment(this.picTime[1]).format('YYYY-MM-DD 23:59:59');
      let param = {
        startTime: this.startTime,
        endTime: this.endTime,
        confirmStatus: '',
        orgIds: [],
        alarmTypeCode: '',
        status: 0,
        alarmLevels: ['1', '2', '3', '4'],
        keyWord: '',
        stationIds: ['allCheck', this.waterPlantId],
        currentPage: 1,
        pageSize: 20,
        alarmSortType: 'org'
      };
      let { resultData, status } = await AlarmNameCount(param);
      this.loading = false;
      if (status === 'complete') {
        this.pointsArr = resultData;
        this.pointsArr.forEach(item => {
          item['value'] = item.count;
        });
        this.pieOption.series[0].data = this.pointsArr;
      }
    },
    picTimeChange() {
      this.getAlarmType();
    },
    disabledDate(current) {
      return current && current > this.$moment().endOf('day');
    }
  }
};
</script>

<style lang="less" scoped>
.content {
  height: 230px;
  background: var(--supply-color-bg-card-DEFAULT);
  border-radius: 4px;
  &-header {
    width: 100%;
    padding: 15px 12px;
    display: inline-flex;
    justify-content: space-between;
    align-items: center;
    height: 40px;
  }
  &-title {
    font-weight: 600;
    font-size: 16px;
    color: var(--supply-color-main);
    letter-spacing: 0;
  }
  .form {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .form-item {
    margin-top: 10px;
    margin-left: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .spin {
    height: calc(100% - 40px);
  }

  .card-inner {
    width: 100%;
    height: 100%;
    position: relative;
    padding: 0 12px;
    box-sizing: border-box;
    display: flex;
    align-items: center;

    .echart-block {
      width: 46%;
      height: 100%;
      text-align: center;
    }
    .points-list {
      width: 54%;
      height: 100%;
      padding-left: 12px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      .point-tab {
        width: 100%;
        height: 26px;
        margin-bottom: 8px;
        padding: 0 8px;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .label {
          font-family: PingFangSC-Regular, sans-serif;
          font-weight: 400;
          font-size: 14px;
          color: var(--supply-color-secondary);
          letter-spacing: 0;

          .ico-react {
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 1.76px;
            margin-right: 6px;
          }
        }
        .precent {
          font-weight: 400;
          font-size: 14px;
          color: var(--supply-color-main);
          letter-spacing: 0;
          text-align: right;
        }
      }
    }
  }
  .chart-wrapper {
    height: 100%;
    padding: 10px 0;
  }
  .empty {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  /deep/ .wpg-select-selection--single {
    height: 32px;
  }
  /deep/ .wpg-spin-container {
    height: 100%;
  }
  /deep/ .wpg-select {
    width: 120px !important;
  }
}
</style>
