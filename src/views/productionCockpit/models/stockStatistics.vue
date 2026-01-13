<template>
  <!-- 使用单位卡片组件，传递卡片标题 -->
  <unit-card :cardTitle="cardTitle">
    <!-- 右侧头部区域，包含物料类型选择 -->
    <div slot="headerRight">
      <w-select style="width: 152px" size="small" v-model="currentPoint" @change="handleChange">
        <w-select-option
          v-for="(item, index) in pointsArr"
          :key="item.materielTypeNo"
          :value="item.materielTypeNo"
        >
          {{ item.materielTypeName }}
        </w-select-option>
      </w-select>
    </div>
    <!-- 折线图组件 -->
    <line-chart
      :darkTheme="'light'"
      powerType="powerSupply"
      :option="barOption"
      @myChartClick="myChartClick"
      ref="inChart"
    ></line-chart>
  </unit-card>
</template>

<script>
import { getStockList, getTopMaterialType } from '@/api/cockpit';
export default {
  name: 'stockStatistics',
  components: {
    // 异步加载折线图组件
    LineChart: () => import('@/components/chart/LineChart.vue'),
    // 异步加载单位卡片组件
    UnitCard: () => import('@/components/CardBox/CockpitCard.vue')
  },
  props: {
    // 水厂ID
    waterPlantId: {
      type: String,
      default: ''
    },
    // 卡片标题
    cardTitle: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      pointsArr: [], // 物料类型列表
      currentPoint: '', // 当前选中的物料类型
      // 图表配置项
      barOption: {
        color: ['#28A8F3', '#00CC9D'], // 图表颜色
        grid: [
          {
            left: '3%',
            right: '3%',
            top: '18%',
            bottom: '4%'
          }
        ],
        legend: {
          show: true,
          itemWidth: 8,
          itemHeight: 8,
          right: 0,
          textStyle: {
            color: '#666666',
            fontWeight: 400,
            fontSize: 12
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          },
          formatter: params => {
            console.log('params', params);

            try {
              // 获取物料名称
              let html = params[0].name + '<br/>';
              // 遍历每个数据项，添加名称、数值和单位
              params.forEach(item => {
                html += `${item.marker}${item.seriesName}: ${item.value} ${item.data.unit}<br/>`;
              });
              return html;
            } catch (e) {
              return '';
            }
          }
        },
        xAxis: [
          {
            data: [] // X轴数据
          }
        ],
        yAxis: [
          {
            name: '', // Y轴单位
            nameTextStyle: {
              color: '#00000073',
              align: 'right'
            },
            minInterval: 1,
            type: 'value',
            axisTick: { show: false },
            axisLabel: {
              show: true,
              interval: 0,
              formatter: '{value}'
            },
            splitLine: { lineStyle: { type: 'solid' } }
          }
        ],
        series: [
          {
            type: 'bar', // 柱状图
            name: '存量',
            data: [],
            barMaxWidth: '10',
            itemStyle: {
              borderRadius: [100, 100, 0, 0] // 柱状图圆角
            }
          },
          {
            type: 'bar', // 柱状图
            name: '预警值',
            data: [],
            barMaxWidth: '10',
            itemStyle: {
              borderRadius: [100, 100, 0, 0]
            }
          }
        ]
      }
    };
  },
  watch: {
    // 监听水厂ID变化
    waterPlantId: {
      handler(val) {
        if (val) {
          this.getTopMaterial(); // 获取物料类型
        }
      },
      immediate: true
    }
  },
  methods: {
    // 获取物料类型
    async getTopMaterial() {
      const { success, resultData } = await getTopMaterialType();
      if (success && Array.isArray(resultData) && resultData.length > 0) {
        this.pointsArr = resultData.length ? resultData : [];
        this.handleChange(this.pointsArr[0]?.materielTypeNo);
      } else {
        this.handleChartData();
      }
    },
    myChartClick() {
      this.drillDown({
        path: '/warehouse/inventoryCheck'
      });
    },
    // 处理物料类型变化
    handleChange(val) {
      this.currentPoint = val;
      this.handleChart();
    },
    // 处理图表数据
    async handleChart() {
      this.dataAndTimeList = [];
      let params = {
        materielTypeNo: this.currentPoint,
        subTypeTree: true
      };
      const { success, resultData } = await getStockList(params);
      if (success && Array.isArray(resultData) && resultData.length > 0) {
        this.dataAndTimeList = resultData.map(item => {
          return {
            unit: item.unit || '',
            name: item.materielName,
            existingQuantity: item.existingQuantity,
            minInventory: item.minInventory
          };
        });
        this.handleChartData();
      }
    },
    // 更新图表数据
    handleChartData() {
      let data = [
        { name: '存量', data: [] },
        { name: '预警值', data: [] }
      ];
      let xData = [];

      this.dataAndTimeList.forEach(item => {
        xData.push(item.name);
        data[0].data.push({
          value: item.existingQuantity || 0,
          unit: item.unit || ''
        });
        data[1].data.push({
          value: item.minInventory || 0,
          unit: item.unit || ''
        });
      });

      this.barOption.xAxis[0].data = xData;

      // 更新图表 series 数据并添加单位信息
      this.barOption.series[0].data = data[0].data;
      this.barOption.series[1].data = data[1].data;
    }
  }
};
</script>

<style lang="less" scoped>
.card-inner {
  width: 100%;
  height: 100%;
  padding: 10px 0px 0;
  display: flex;
  flex-direction: column;
  .chart {
    flex: 1;
    overflow: hidden;
  }
}
</style>
