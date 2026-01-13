<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2024-05-07 15:58:05
 * @LastEditors: wangyr
 * @LastEditTime: 2024-10-11 16:19:12
 * @Description:
-->
<template>
  <div class="warn-diagnosis">
    <w-range-picker
      size="small"
      class="btn"
      @change="getData"
      v-model="date"
      :allowClear="false"
      show-time
      format="YYYY-MM-DD HH:mm:ss"
    />
    <card-box :title="handlePointName(pointName) + '曲线'">
      <div class="point-wrapper">
        <w-select
          size="small"
          ref="structureSelect"
          placeholder="请选择"
          @change="selectPoint"
          mode="multiple"
          :maxTagTextLength="6"
          :maxTagCount="3"
          v-model="curPoints"
          class="structure-select"
        >
          <w-select-option
            :title="item.name"
            v-for="(item, index) in pointList"
            :key="item.name"
            :value="item.name"
            >{{ item.name }}</w-select-option
          >
        </w-select>
        <w-spin :spinning="spinning" class="chart">
          <line-chart :option="option"></line-chart>
        </w-spin>
      </div>
    </card-box>
  </div>
</template>

<script>
import { getHistoryData, getPointStandardList } from '@/api/diagnosis';
import { genPointOption, handlePointName } from './config';
import { themeMixin } from '@/core/mixins';
import moment from 'moment';
import CardBox from './CardBox';
export default {
  mixins: [themeMixin],
  props: {
    alarmInfo: {
      type: Object,
      default: () => ({})
    },
    pointName: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      visible: false,
      spinning: false,
      curPoints: [],
      pointList: [],
      isSelectHover: false,
      option: genPointOption(),
      date: [moment().startOf('day'), moment().endOf('day')]
    };
  },

  components: { CardBox, LineChart: () => import('@/components/CardBox/chartBox.vue') },
  computed: {
    title() {
      return '进水' + (this.alarmInfo.pointName || '');
    }
  },
  watch: {
    alarmInfo: {
      handler(val) {
        this.curPoints = [];
        this.date = [
          moment(this.alarmInfo.startTime)
            .subtract(12, 'hours')
            .startOf('day'),
          moment(this.alarmInfo.startTime)
            .add(12, 'hours')
            .endOf('day')
        ];
        this.getData();
      },
      immediate: true
    }
  },
  methods: {
    handlePointName,
    mouseenter() {
      this.isSelectHover = true;
      this.visible = true;
    },
    mouseout() {
      this.isSelectHover = false;
      setTimeout(() => {
        if (!this.isSelectHover) {
          this.visible = false;
        }
      }, 100);
    },
    visibleChange(val) {
      if (val) {
        this.visible = true;
      } else {
        setTimeout(() => {
          if (!this.isSelectHover) {
            this.visible = false;
          }
        }, 100);
      }
    },
    selectPoint() {
      let series = this.pointList.filter(item => this.curPoints.includes(item.name));
      this.option.series = series;
      this.option.legend.data = series.map(item => item.legend);
      if (this.option.legend.data?.length > 6) {
        this.option.grid[0].top = '80px';
      } else if (this.option.legend.data?.length > 3) {
        this.option.grid[0].top = '60px';
      } else {
        this.option.grid[0].top = '40px';
      }
    },
    themeChange() {
      this.option.color = this.getThemeConfig();
    },
    async getData() {
      if (this.alarmInfo.pumpHouseId && this.alarmInfo.expertDecisionType) {
        // 获取设备id
        const devicePointsMap = {};
        let conditionExpressionValue = this.alarmInfo.expertProcessControl
          ?.conditionExpressionValue;
        conditionExpressionValue = conditionExpressionValue
          ? JSON.parse(conditionExpressionValue)
          : {};
        Object.keys(conditionExpressionValue).forEach(key => {
          if (key.includes('_p') && conditionExpressionValue[key].includes('_')) {
            let data = conditionExpressionValue[key].split('_');
            if (!devicePointsMap[data[0]]) {
              devicePointsMap[data[0]] = [];
            }
            devicePointsMap[data[0]].push(data[1]);
          }
        });
        let deviceIds = Object.keys(devicePointsMap);
        this.spinning = true;
        let params1 = {
          waterPlantId: this.alarmInfo.pumpHouseId,
          queryType: 'day',
          pointName: this.pointName,
          startTime: this.date?.[0].format('YYYY-MM-DD HH:mm:ss') || '',
          endTime: this.date?.[1].format('YYYY-MM-DD HH:mm:ss') || ''
        };
        let params2 = {
          waterPlantId: this.alarmInfo.pumpHouseId,
          pointName: this.pointName,
          typeList: [3, 4]
        };
        let res = await Promise.allSettled([
          getHistoryData(params1),
          getPointStandardList(params2)
        ]);
        this.spinning = false;
        this.getStructureData(res[0].value || {}, deviceIds);
        this.themeChange();
        let newPoints = this.pointList.filter(item => this.curPoints.includes(item.name));
        let avDevices = this.pointList?.filter(item => deviceIds.includes(item.deviceId));
        this.curPoints = newPoints.length
          ? newPoints.map(item => item.name)
          : avDevices.length
          ? [avDevices?.[0]?.name]
          : [];
        this.selectPoint();
      }
    },
    async getStructureData(res, deviceIds) {
      const { resultData, status } = res;
      if (status === 'complete') {
        this.pointList = [];
        this.option.xAxis[0].axisLabel.formatter = value => {
          return value?.slice(11, 13) ?? value;
        };
        let avDevices = resultData?.filter(item => deviceIds.includes(item.deviceId));
        let chartItem = avDevices.length ? avDevices[0] : resultData?.[0] || {};
        this.option.xAxis[0].data = chartItem?.dataAndTimeList?.map(item => item.date) || [];
        this.option.yAxis[0].name = chartItem?.unit;
        resultData?.forEach(item => {
          this.pointList.push({
            name: item.deviceName,
            deviceId: item.deviceId,
            type: 'line',
            legend: { icon: 'rect', name: item.deviceName },
            smooth: true,
            data: item.dataAndTimeList?.map(item => item.pv)
          });
        });
      }
    }
  }
};
</script>
<style lang="less" scoped>
/deep/ .card-box__title {
  .text {
    max-width: 150px;
  }
}
/deep/ .structure-select {
  width: 100%;
}
.point-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
  .chart {
    flex: 1;
    overflow: hidden;
  }
}
.warn-diagnosis {
  width: 100%;
  height: 100%;
  position: relative;
  .btn {
    width: 282px !important;
    z-index: 10;
    position: absolute;
    right: 16px;
    top: 10px;
  }
}
/deep/ .wpg-spin-container {
  height: 100%;
}
</style>
