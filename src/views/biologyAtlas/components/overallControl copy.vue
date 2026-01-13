<!--
 * @Author: wangyr
 * @Date: 2023-05-26 10:02:21
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-05-26 10:36:13
 * @Description:
-->
<template>
  <div class="cockpit-wrapper overallControl">
    <div id="overall" class="overallControl-overall"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import { ColorMap, colorText } from './data';
export default {
  name: 'overallControl',
  components: {
    PieChart: () => import('@/components/chart/PieChart.vue')
    // PieChart: () => import('@/components/chart/PieChart')
  },
  data() {
    return {
      ColorMap,
      colorText,
      option: {},
      data: [],
      color: ['#4285F4', '#2EDDF9', '#8479EA']
    };
  },
  computed: {
    themeColor: {
      get() {
        return this.ColorMap[this.state.theme] || this.ColorMap['default'];
      },
      set() {}
    },
    textColor: {
      get() {
        return this.colorText[this.state.theme] || this.colorText['default'];
      },
      set() {}
    }
  },
  inject: ['state'],
  watch: {
    'state.theme': {
      handler(newValue) {
        this.themeColor = this.ColorMap[newValue] || this.ColorMap['default'];
        this.textColor = this.colorText[newValue] || this.ColorMap['default'];
        this.getTankControlMode();
      }
    }
  },
  mounted() {
    this.getTankControlMode();
  },
  methods: {
    async getTankControlMode() {
      this.option = {
        series: [
          {
            type: 'pie',
            clickable: false, // 是否开启点击
            minAngle: 15, // 最小扇区角度（0 ~ 360），防止扇区太小影响交互
            startAngle: 45, // 起始角度
            avoidLabelOverlap: true, // 是否启用防止标签重叠策略
            hoverAnimation: false, // 是否开启 hover 在扇区上的放大动画效果。
            silent: true, // 图形是否不响应和触发鼠标事件
            radius: ['20%', '30%'],
            center: ['50%', '50%'],
            label: {
              show: true,
              fontSize: '16',
              align: 'left',
              formatter(v) {
                console.log(v);
                let text = v.name;
                  return text;

              }
            },
            labelLine: {
              show: false
            },
            data: [
              { value: 1, name: '一二' },
              { value: 735, name: '一' },
              { value: 580, name: '一' },
              { value: 484, name: '一二三' },
              { value: 300, name: '一二三' }
            ]
          }
        ]
      };

      this.color = [
        this.themeColor[0].normal,
        this.themeColor[1].normal,
        this.themeColor[2].normal
      ];
      this.$echarts.init(document.getElementById('overall')).setOption(this.option);
      // let res = await getTankControlMode();
      // let { status, resultData } = res;
      // if (status === 'complete') {
      //   this.data = resultData;
      //   this.handleDataForOption();
      // }
    }
  }
};
</script>

<style lang="less" scoped>
.overallControl {
  margin-top: 10px;
      width: 100%;
    height: 100%;
  .overallControl-overall{
    width: 100%;
    height: 100%;
  }
}
</style>
