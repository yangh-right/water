<!--
 * @Author: wangyr
 * @Date: 2023-06-15 15:56:01
 * @LastEditors: wangyr
 * @LastEditTime: 2024-06-05 09:50:53
 * @Description:
-->
<template>
  <cockpit-card :cardTitle="cardTitle">
    <div class="content">
      <div class="chart-box">
        <radar-chart
          v-if="pointsArr.length > 0"
          :darkTheme="'light'"
          :option="radarOption"
          ref="radarChart"
        ></radar-chart>
        <div v-else class="tips">
          <w-empty id="ssmal" style="margin:auto" size="small"></w-empty>
        </div>
      </div>
      <div class="ponit-box">
        <div class="point-tab" v-for="item in pointsArr" :key="item.indicatorName">
          <div class="point-label">
            <w-tooltip placement="topLeft" style="cursor: pointer;">
              <template slot="title">
                {{ item.indicatorMemo }}
              </template>
              {{ item.indicatorName }}
            </w-tooltip>
          </div>
          <w-tooltip placement="topLeft" style="cursor: pointer;">
            <template slot="title">
              <div class="point-value">
                {{
                  !!item.indicatorValue || item.indicatorValue == '0' ? item.indicatorValue : '--'
                }}
                {{ item.indicatorUnit }}
              </div>
            </template>
            <div class="point-value">
              {{ !!item.indicatorValue || item.indicatorValue == '0' ? item.indicatorValue : '--' }}
              {{ item.indicatorUnit }}
            </div>
          </w-tooltip>
        </div>
      </div>
      <w-spin :spinning="isLoading" class="chart-spin"></w-spin>
    </div>
  </cockpit-card>
</template>

<script>
import { isNumber } from 'lodash-es';
const ColorMap = {
  dark: ['#5C85CC'],
  default: ['#DEF1FF'],
  green: ['#DEF7FF'],
  red: ['#FFE5DE']
};
import { radarOption } from './data';
import CockpitCard from './CockpitCard.vue';
import { sludgeHealthEvaluation } from '@/api/cockpit.js';
export default {
  name: 'HealthRemark',
  components: {
    CockpitCard,
    RadarChart: () => import('@/components/chart/RadarChart.vue')
  },
  props: {
    factoryId: {
      type: String,
      required: true
    }
  },
  inject: ['state'],
  watch: {
    'state.theme': {
      immediate: true,
      handler(newValue) {
        // this.color = ColorMap[newValue] || ColorMap['default'];
        this.areaColor = !!ColorMap[newValue] ? ColorMap[newValue][0] : ColorMap['default'][0];
        this.initData();
      }
    },
    factoryId: {
      handler(val) {
        if (val) {
          this.initData(val);
        }
      }
    }
  },
  data() {
    return {
      cardTitle: '活性污泥健康度评价',
      radarOption,
      color: [],
      pointsArr: [],
      areaColor: '',
      isLoading: false
    };
  },
  computed: {},
  activated() {
    if (this.factoryId) {
      this.initData(this.factoryId);
    }
  },
  methods: {
    async initData(id) {
      if (!id) return false;
      this.isLoading = true;
      let params = {
        line: 0,
        waterPlantId: id
      };
      let { status, resultData } = await sludgeHealthEvaluation(params);
      if (status === 'complete' && Array.isArray(resultData.dataList)) {
        this.pointsArr = resultData.dataList.map(point => {
          return {
            ...point,
            name: point.indicatorName,
            max: 100
          };
        });
        // 各个维度的最大值
        if (this.pointsArr.length > 0) {
          let data = this.pointsArr.map(item =>
            isNumber(item.score) ? (item.score * 5).toFixed(2) : 0
          );
          this.radarOption.radar[0].indicator = this.pointsArr;
          this.radarOption.series[0].color = this.color;
          this.radarOption.series[0].areaStyle = {
            color: this.areaColor
          };
          this.radarOption.series[0].data = [
            {
              name: '活性淤泥健康度',
              value: data
            }
          ];
        }
      }
      this.isLoading = false;
    }
  },
  created() {},
  mounted() {}
};
</script>

<style lang="less" scoped>
.content {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .chart-box {
    width: 166px;
    height: 75%;
    margin-right: 4px;
  }
  .ponit-box {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .point-tab {
      height: 28px;
      padding: 0 4px;
      box-sizing: border-box;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--supply-color-bg-card-dark);
      margin-bottom: 4px;
      .point-label {
        color: var(--mft-5-cls);
        span {
          font-size: 12px;
        }
      }
      .point-value {
        width: 72px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        text-align: right;
        font-size: 12px;
        color: var(--supply-color-main);
      }
    }
  }
  .chart-spin {
    position: absolute;
    left: 50%;
    top: 50%;
    z-index: 10;
    transform: translate(-50%, -50%);
  }
  .tips {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>
