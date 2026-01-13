<!--
 * @Author: wangyr
 * @Date: 2023-05-26 10:02:21
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-05-26 15:32:28
 * @Description:
-->
<template>
  <div class="cockpit-wrapper overallControl">
    <div v-if="statData.length" id="overall" class="overallControl-overall"></div>
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
    props: {
    statData: {
      type: Array,
      default: () => []
    },
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
    },
    statData(val){
      if(val){
         this.getTankControlMode();
      }
    }
  },
  mounted() {
  },
  methods: {
    async getTankControlMode() {
      let num = 0;
      this.statData.forEach(item=>{
        item.name = item.label;
        num =num+Number(item.value);
      })
      this.option = {
        length: {
          show: false
        },
        grid: [
          {
            top: '10%',
            left: '5%',
            containLabel: true
          }
        ],
        title: {
          text: '总数', //主标题文本

          subtext: `${num}个`, //副标题文本

          left: 'center',

          top: '35%',

          textStyle: {
            fontSize: 12,
            color: '#999999',

            align: 'center'
          },

          subtextStyle: {

            fontSize: 18,

            color: '#333333'
          }
        },

        series: [
          {
            type: 'pie',
            // clickable: false, // 是否开启点击
            // minAngle: 15, // 最小扇区角度（0 ~ 360），防止扇区太小影响交互
            // startAngle: 45, // 起始角度
            // avoidLabelOverlap: true, // 是否启用防止标签重叠策略
            // hoverAnimation: false, // 是否开启 hover 在扇区上的放大动画效果。
            // silent: true, // 图形是否不响应和触发鼠标事件
            radius: ['35%', '60%'],
            center: ['50%', '50%'],
            label: {
              show: true,
              fontSize: '16',
              align: 'left',
              formatter(v) {
                return '{b|' + v.name + '} \n {c|' + v.value + '个}';
              },
              rich: {
                b: {
                  color: '#666666',
                  fontSize: 12,
                  lineHeight: 24,
                  height: 24,
                  align: 'center'
                },
                c: {
                  color: '#333333',
                  fontSize: 14,
                  lineHeight: 20,
                  align: 'center'
                }
              }
            },

            // labelLine: {
            //   show: false
            // },
            data:  this.statData
          }
        ]
      };

      this.color = [
        this.themeColor[0].normal,
        this.themeColor[1].normal,
        this.themeColor[2].normal
      ];
      let vm =this;
      this.$nextTick(()=>{
      vm.$echarts.init(document.getElementById('overall')).setOption(this.option);
      })
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
  width: 100%;
  height: 100%;
  overflow: hidden;
  .overallControl-overall {
    width: 100%;
    height: 100%;
    margin-top: -20px;
    margin-left: -30px;
  }
}
</style>
