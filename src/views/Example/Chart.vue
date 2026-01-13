<template>
  <div>
    <!-- -->

    <!-- -->
    <w-button>{{ state.theme }}</w-button>
    <VChart style="height: 400px;" :theme="theme" :option="option" />
    <div class="list">

      <div :style="{backgroundColor:getColor(index)}" class="item" v-for="(item, index) in 36" :key="index"></div>
    </div>
  </div>
</template>
<script>
import { defineComponent } from '@vue/composition-api';
// import { use } from "echarts/core";
// import { CanvasRenderer } from "echarts/renderers";
// import { PieChart } from "echarts/charts";
// import {
//   TitleComponent,
//   TooltipComponent,
//   LegendComponent
// } from "echarts/components";
import VChart from "vue-echarts";

// use([
//   CanvasRenderer,
//   PieChart,
//   TitleComponent,
//   TooltipComponent,
//   LegendComponent
// ]);


export default defineComponent({
  components: {
    VChart
  },
  inject: ['state'],
  watch: {
    // 'state.theme'() {

    // }
  },
  computed: {
    theme() {
      return this.state.theme === 'dark' ? 'dark' : 'light'
    }
  },
  methods: {
    getColor(i) {
      let color = 'hsl('+ 10*i%360+','+20+'%,'+20+'%)'
      // let color = 'hsl('+ 67*i%360+','+(43*i+50)%100+'%,'+(43*i+50)%100+'%)'
      return color
    }},
  setup() {
    return {
      option: {
        title: {
          text: 'Traffic Sources',
          left: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          data: ['Direct', 'Email', 'Ad Networks', 'Video Ads', 'Search Engines']
        },
        series: [
          {
            name: 'Traffic Sources',
            type: 'pie',
            radius: '55%',
            center: ['50%', '60%'],
            label: {
              // show: false
              // color: '#fff'
            },
            data: [
              { value: 335, name: 'Direct' },
              { value: 310, name: 'Email' },
              { value: 234, name: 'Ad Networks' },
              { value: 135, name: 'Video Ads' },
              { value: 1548, name: 'Search Engines' }
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }
    };
  }
});
</script>
<style lang='less' scoped>
  .list{
    width: 100%;
    .item{
      margin-bottom: 2px;
      height: 2px;
      width: 80%;

    }
  }
</style>