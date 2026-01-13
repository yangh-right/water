<!--
 * @Author: wangyr
 * @Date: 2023-06-15 15:56:01
 * @LastEditors: wangyr
 * @LastEditTime: 2024-05-11 11:20:00
 * @Description:
-->
<template>
  <cockpit-card :cardTitle="cardTitle">
    <div class="content">
      <radar-chart
        v-if="pointsArr.length > 0"
        :darkTheme="'light'"
        :option="radarOption"
        ref="radarChart"
      ></radar-chart>
      <div v-else class="tips">
        <w-empty id="ssmal" style="margin:auto" size="small"></w-empty>
      </div>
      <w-spin :spinning="isLoading" class="chart-spin"></w-spin>
    </div>
  </cockpit-card>
</template>

<script>
import { isNumber } from 'lodash-es';
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
  watch: {
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
      pointsArr: [],
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
          this.radarOption.series[0].areaStyle = {
            normal: {
              color: {
                type: 'linear',
                x: 0, //右
                y: 0, //下
                x2: 0, //左
                y2: 1,
                colorStops: [
                  {
                    offset: 0,
                    color: '#0091FF'
                  },
                  {
                    offset: 1,
                    color: '#00468C'
                  }
                ],
                globalCoord: false
              },
              opacity: 1 // 区域透明度
            }
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
  }
};
</script>

<style lang="less" scoped>
.content {
  width: 100%;
  height: 100%;
  position: relative;
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
