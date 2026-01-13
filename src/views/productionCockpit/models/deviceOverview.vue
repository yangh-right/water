<!--
 * @Author: wangyr
 * @Date: 2023-09-05 10:30:42
 * @LastEditors: fengtaotao
 * @LastEditTime: 2025-03-18 09:51:21
 * @Description: 设备概览组件
-->
<template>
  <!-- 使用单位卡片组件，传递卡片标题 -->
  <unit-card :cardTitle="cardTitle">
    <!-- 下钻详情 -->
    <!-- <div slot="headerRight" class="workforce" @click="goTeamManage">
      <span>详情</span>
      <w-icon type="right" style="margin-left:4px;font-size: 12px;"></w-icon>
    </div> -->
    <!-- 标题区域，显示设备总数 -->
    <div class="title">
      <div class="icon"></div>
      <div class="name">设备总数：</div>
      <div class="total">{{ total }}<span class="unit">个</span></div>
    </div>
    <div class="info-box">
      <!-- 饼图区域 -->
      <div class="echart-block">
        <pie-chart ref="chart" :defaultHighlight="false" :option="option" @click="goTeamManage">
        </pie-chart>
      </div>
      <!-- 设备类型 -->
      <div class="points-list">
        <div v-for="(item, i) in deviceTypeList" :key="item.name" class="point-tab">
          <div class="label">
            <div class="ico-react">
              <div
                class="ico-react_inner"
                :style="{ background: colorList[i] || colorList[0] || '#0375FF' }"
              ></div>
            </div>
            {{ item.name }}
          </div>
          <div class="value">{{ item.num }}个</div>
        </div>
      </div>
    </div>
  </unit-card>
</template>

<script>
import { themeMixin } from '@/core/mixins.ts';
import { deviceOverview } from '@/api/cockpit.js';

export default {
  name: 'deviceOverview',
  mixins: [themeMixin], // 使用主题混入
  components: {
    PieChart: () => import('@/components/chart/PieChart.vue'), // 异步加载饼图组件
    empty: () => import('../components/empty.vue'), // 空状态组件
    UnitCard: () => import('@/components/CardBox/CockpitCard.vue') // 单位卡片组件
  },
  props: {
    // 水厂ID
    waterPlantId: {
      type: String,
      default: '',
      required: true
    },
    // 卡片标题
    cardTitle: {
      type: String,
      default: '设备概览'
    }
  },

  data() {
    return {
      loading: false, // 加载状态
      // 主题配置
      themeConfigMap: {
        default: {
          color: '#333',
          subColor: '#666',
          className: 'card-default'
        },
        dark: {
          color: '#fff',
          subColor: '#ADB5BD',
          className: 'card-dark'
        }
      },
      colorList: [
        '#0375FF',
        '#00C07C',
        '#FFBB02',
        '#FF5630',
        '#6554C0',
        '#00B8D9',
        '#845EC2',
        '#FF9671',
        '#00A36C'
      ], // 颜色列表
      deviceTypeList: [], // 设备类型数据
      // 饼图配置
      option: {
        color: this.colorList, // 直接在这里定义颜色，避免引用未定义的变量
        title: {
          text: '0',
          left: 'center',
          top: '35%',
          textStyle: {
            color: this.theme === 'dark' ? '#ffffff' : '#333333',
            fontSize: '22.4px'
          },
          subtext: '总计(个)',
          subtextStyle: {
            color: '#666666',
            fontSize: '14px'
          }
        },
        legend: {
          show: false
        },
        series: [
          {
            type: 'pie', // 饼图
            radius: ['65%', '85%'],
            roseType: false,
            avoidLabelOverlap: true,
            label: {
              show: false
            },
            padAngle: 2,
            labelLine: {
              show: false
            },
            data: []
          }
        ]
      }
    };
  },
  computed: {
    // 计算设备总数
    total() {
      if (!this.deviceTypeList.length) return 0;
      // 遍历设备类型列表，累加每个元素的num属性值
      return this.deviceTypeList.reduce(
        (sum, item) =>
          // 累加当前项的num，若num不存在则按0计算
          sum + (item.num || 0),
        0
      ); // 初始值为0
    }
  },
  watch: {
    // 监听水厂ID变化
    waterPlantId: {
      handler: 'initData',
      immediate: true
    }
  },
  methods: {
    // 初始化数据，获取设备概览信息
    async initData() {
      if (!this.waterPlantId) return;

      this.loading = true;
      try {
        const { status, resultData } = await deviceOverview({
          waterPlantId: this.waterPlantId
        });
        if (status === 'complete' && resultData && Array.isArray(resultData)) {
          this.deviceTypeList = resultData.map(item => {
            return {
              ...item,
              value: item.num || 0
            };
          });

          // 更新饼图数据
          this.option.series[0].data = this.deviceTypeList;

          // 计算总数
          let total = this.deviceTypeList.reduce((sum, item) => {
            return sum + (item.num || 0);
          }, 0);

          // 更新饼图标题
          this.option.title.text = total;

          // 强制更新图表
          this.$nextTick(() => {
            if (this.$refs.chart) {
              this.$refs.chart.updateChart();
            }
          });
        }
      } catch (error) {
        console.error('设备概览数据获取失败:', error);
        // 设置默认空数据
        this.deviceTypeList = [];
        this.option.series[0].data = [];
        this.option.title.text = '0';
      } finally {
        this.loading = false;
      }
    },
    // 主题改变事件
    themeChange() {
      this.option.title.textStyle.color = this.themeConfig.color;
      this.option.title.subtextStyle.color = this.themeConfig.subColor;
    },
    // 跳转到班组管理
    goTeamManage() {
      this.drillDown({
        path: '/Comprehensive/DeviceLedger'
      });
    }
  }
};
</script>

<style lang="less" scoped>
.workforce {
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: PingFangSC-Regular, sans-serif;
  font-weight: 400;
  font-size: 14px;
  color: #999999;
  letter-spacing: 0;
  cursor: pointer;
}
.title {
  padding: 0 13px;
  width: 100%;
  height: 36px;
  background: var(--supply-cockpit-legend);
  border-radius: 4px;
  display: flex;
  align-items: center;
  font-weight: 400;
  font-size: 14px;
  margin-bottom: 12px;
  color: var(--supply-color-main);
  letter-spacing: 0;

  .icon {
    width: 21px;
    height: 21px;
    background: url('~@/assets/productionCockpit/block.png') no-repeat;
    background-size: 100% 100%;
    margin-right: 12px;
  }

  .total {
    font-weight: 600;
    .unit {
      font-size: 12px;
      font-weight: 400;
      color: var(--supply-color-third);
    }
  }
}

.info-box {
  flex-direction: row;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  width: 100%;
  height: calc(100% - 36px);

  .echart-block {
    width: 180px;
    height: 180px;
    text-align: center;
    background: url('~@/assets/safeCockpit/chart_bg.png') center center no-repeat;
    background-size: 65% 65%;
    .label-wrap {
      position: absolute;
    }
  }

  .points-list {
    width: 200px;
    height: 100%;
    padding-left: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .point-tab {
      width: 100%;
      height: 32px;
      background: var(--supply-cockpit-legend);
      margin-top: 8px;
      padding: 0 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-radius: 2px;

      .label {
        width: 140px;
        font-family: PingFangSC-Regular, sans-serif;
        font-weight: 400;
        font-size: 14px;
        color: var(--supply-color-main);
        letter-spacing: 0;
        line-height: 18px;

        .ico-react {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          width: 12px;
          height: 12px;
          background: #fff;
          border-radius: 12px;
          margin-right: 10px;
        }
        .ico-react_inner {
          width: 8px;
          height: 8px;
          border-radius: 8px;
        }
      }

      .value {
        font-family: MiSans-Medium, sans-serif;
        font-weight: 500;
        font-size: 14px;
        color: var(--supply-color-main);
        letter-spacing: 0;

        .unit {
          font-family: Aliba, sans-serif;
          color: #ffffffff;
          font-size: 16px;
          line-height: 0;
          letter-spacing: 0;
        }
      }
    }
  }
}
</style>
