<template>
  <div class="card">
    <div class="card-header">
      <div class="card-info">
        <div class="card-left">
          <p class="card-title wfc2">{{ block.blockName }}</p>
          <w-tooltip
            placement="bottomLeft"
            arrow-point-at-center
            :get-popup-container="triggerNode => triggerNode.parentNode"
          >
            <template slot="title">
              <div class="card-popup wbgc-card">
                <dl>
                  <dt class="wfc2">指标定义</dt>
                  <dd class="wfc3">{{ block.description || '暂无' }}</dd>
                </dl>
              </div>
            </template>
            <p class="card-icon">
              <w-icon type="ic_info_outline" style="font-size: 20px;" />
            </p>
          </w-tooltip>
          <slot name="card-hl" />
        </div>
        <!-- 头部右侧功能区 -->
        <div class="card-right">
          <w-radio-group :value="showType" @change="handleShowTypeChange" @click.native.stop>
            <w-radio-button ghost value="1">分析图</w-radio-button>
            <w-radio-button ghost value="2">详情</w-radio-button>
          </w-radio-group>
        </div>
      </div>
      <!-- 数据展示 -->
      <div v-if="block.blockShowType" class="card-count">
        <p class="card-pv wfc1">{{ block.data }}</p>
        <div class="card-pv-list">
          <dl v-for="(item, idx) in block.blockDataList" :key="idx">
            <dt class="wfc3">{{ item.name }}</dt>
            <dd
              class="wfc1"
              :class="[
                { 'wfc-success': item.showType === 1 },
                { 'wfc-alarm': item.showType === 2 }
              ]"
            >
              {{ item.data }}
              <i
                v-if="item.showType"
                :class="'icon-ic_trending_' + (item.showType === 1 ? 'up' : 'down')"
              />
            </dd>
          </dl>
        </div>
      </div>
    </div>
    <div v-if="records && records.length" class="card-main" @click.stop>
      <transition name="moveLeft">
        <!-- <charts
          v-if="showType === '1' && records"
          :key="chartsKey"
          :columns="columns"
          :records="records"
          :echart="echart"
          :zoom="zoom"
        /> -->
        <pie-chart
          v-if="showType === '1' && records"
          ref="alarmChart"
          :key="chartsKey"
          :option="echartOptions"
        >
        </pie-chart>
      </transition>
      <transition name="moveRight">
        <!-- 表格默认不显示，如果渲染会导致初次页面渲染很慢，所以用v-if和v-show搭配 -->
        <div v-show="showType === '2'" v-if="tableRender" class="card-table">
          <w-table
            :columns="tableColumns"
            :data-source="records"
            :pagination="pagination"
            :row-key="(_, i) => i + Math.random()"
            :scroll="{ x: tableColumns.reduce((a, b) => a + b, 0), y: 100 }"
          >
            <template v-for="column in tableColumns" :slot="column.key" slot-scope="text">
              <div v-if="dataMuch">
                <span>{{ text | ellipsis(10) }}</span>
              </div>
              <div v-else>
                <w-tooltip :title="text">
                  <span>{{ text | ellipsis(10) }}</span>
                </w-tooltip>
              </div>
            </template>

            <template slot="finishTikcetRate" slot-scope="text"> {{ text }}% </template>
            <template slot="timeoutRate" slot-scope="text"> {{ text }}% </template>
          </w-table>
        </div>
      </transition>
    </div>
    <empty v-else />
  </div>
</template>

<script>
import Empty from '@/components/empty.vue';
import { ellipsis } from '@/utils/util';

export default {
  name: 'Card',
  components: {
    Empty,
    PieChart: () => import('@/components/chart/PieChart.vue')
  },
  filters: {
    ellipsis
  },

  props: {
    columns: {
      type: Array,
      default: () => []
    },
    records: {
      type: Array,
      default: () => []
    },
    echart: {
      type: Object,
      default: () => ({})
    },
    block: {
      type: Object,
      default: () => ({})
    },
    kpiId: {
      type: String,
      default: ''
    },
    zoom: {
      type: Boolean,
      default: false
    },
    chartsKey: {
      type: Number,
      default: 0
    },
    openModal: {
      type: Boolean,
      default: false
    },
    dataMuch: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    records: {
      handler(val) {
        this.handleChart();
      },
      immediate: true,
      deep: true
    }
  },
  data() {
    return {
      showType: '1',
      chart: null,
      tableRender: false,
      tableColumns: [],
      echartOptions: null,
      pagination: { size: 'small' }
    };
  },
  mounted() {},
  methods: {
    handleChart() {
      this.echartOptions = {
        title: {
          text: '处理中工单总数',
          subtext: 0,
          textStyle: {
            fontSize: 15,
            color: '#999999'
          },
          subtextStyle: {
            fontSize: 21,
            color: 'black'
          },
          textAlign: 'center',
          x: '24%',
          y: '35%'
        },
        tooltip: {
          trigger: 'item',
          textStyle: {
            fontSize: 14
          },
          formatter: function(parms) {
            var str = '来源</br>' + parms.name + ': ' + parms.data.value;
            return str;
          }
        },
        legend: {
          type: 'scroll',
          orient: 'vertical',
          left: '60%',
          icon: 'rect',
          align: 'left',
          top: 'middle',
          textStyle: {
            color: '#8C8C8C',
            rich: {
              name: {
                verticalAlign: 'right',
                align: 'left',
                width: 35,
                fontSize: 12
              },
              value: {
                align: 'left',
                width: 60,
                fontSize: 12
              },
              count: {
                align: 'left',
                width: 80,
                fontSize: 12
              },
              upRate: {
                align: 'left',
                fontSize: 12,
                color: '#00cf90'
              },
              downRate: {
                align: 'left',
                fontSize: 12,
                color: '#ff5722'
              }
            }
          },
          height: 210
        },
        series: [
          {
            name: '',
            type: 'pie',
            center: ['25%', '45%'],
            radius: ['60%', '80%'],
            clockwise: false, //饼图的扇区是否是顺时针排布
            avoidLabelOverlap: false,
            label: {
              normal: {
                show: false
              }
            },
            labelLine: {
              show: false
            },
            data: []
          }
        ]
      };
      this.echartOptions.series[0].data = this.records;
      let that = this;
      this.echartOptions.legend.formatter = function(name) {
        let data = that.records;
        if (data && data.length) {
          for (var i = 0; i < data.length; i++) {
            if (name === data[i].name) {
              return '{name| ' + name + '}';
            }
          }
        }
      };
      this.echartOptions.title.subtext = this.records.reduce((prev, cur) => {
        return prev + cur.value;
      }, 0);
    },
    // 展示类型切换
    handleShowTypeChange(e) {
      this.showType = e.target.value;
      // 第一次table渲染状态记录（加快首屏渲染速度的同时缓存渲染结果）
      if (this.showType === '2' && !this.tableRender) {
        this.tableRender = true;
        this.tableColumns = this.columns.map(v => ({ ...v, scopedSlots: { customRender: v.key } }));
      }
    }
  }
};
</script>

<style scoped lang="less">
.card {
  display: flex;
  flex-direction: column;
  height: 260px;

  &-header {
    // padding: 14px 20px 0 30px;
  }

  &-info {
    display: flex;
    flex: none;
    align-items: center;
    justify-content: space-between;
  }

  &-left,
  &-right {
    display: flex;
    align-items: center;
  }

  &-title {
    font-size: 14px;
  }

  &-icon {
    display: flex;
    margin-left: 4px;
    color: #4285f4;
    font-size: 14px;
    cursor: pointer;
  }

  /deep/ .wpg-tooltip-inner {
    padding: 0;
  }

  &-popup {
    width: 130px;
    padding: 15px 16px 15px 20px;
    font-size: 12px;
    border-radius: 4px;

    dl:not(:first-of-type) {
      margin-top: 8px;
    }

    dt {
      display: flex;
      align-items: center;

      &::before {
        width: 6px;
        height: 6px;
        margin-right: 4px;
        margin-left: -10px;
        background-color: #71a3f8;
        border-radius: 50%;
        content: '';
      }
    }

    dd {
      margin-top: 2px;
      line-height: 1.5;
    }
  }

  &-right {
    .wpg-radio-button-wrapper {
      width: 52px;
      height: 24px;
      padding: 0;
      font-size: 12px;
      line-height: 22px;
      text-align: center;
    }
  }

  &-func {
    display: flex;
    margin-left: 10px;
    font-size: 20px;
    cursor: pointer;
  }

  &-count {
    display: flex;
    align-items: baseline;
    margin-top: 10px;
  }

  &-pv {
    min-width: 110px;
    font-size: 20px;
    line-height: 24px;
  }

  &-pv-list {
    display: flex;
    margin-left: 10px;

    dl {
      display: flex;

      &:not(:first-of-type) {
        margin-left: 18px;
      }
    }

    dd {
      margin-left: 2px;
    }
  }

  &-main {
    position: relative;
    flex: 1;
    margin-top: 8px;
    // overflow: hidden;
  }

  &-chart {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    padding-left: 20px;
  }

  &-table {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    height: 86%;
    padding: 0 0px 12px;
  }

  /deep/ .wpg-table {
    height: 100%;

    &-wrapper,
    &-content,
    &-body,
    &-scroll {
      height: 100%;
    }

    &-scroll {
      display: flex;
      flex-direction: column;
    }

    &-header {
      overflow-y: scroll !important;

      &::-webkit-scrollbar {
        background-color: #f2f6fc !important;
      }
    }

    &-body {
      flex: 1;
      max-height: none !important;
      overflow: auto !important;
    }

    &-tbody tr > td {
      max-width: 0;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }

  /deep/ .wpg-spin {
    &-nested-loading,
    &-container {
      height: 100%;
    }
  }
}

.moveLeft {
  &-enter-active,
  &-leave-active {
    transition: all 0.5s;
  }

  &-enter,
  &-leave-to {
    opacity: 1;
    // transform: translateX(-100%);
  }
}

.moveRight {
  &-enter-active,
  &-leave-active {
    transition: all 0.5s;
  }

  &-enter,
  &-leave-to {
    opacity: 0;
    // transform: translateX(100%);
  }
}

.view-detailed {
  position: absolute;
  top: 50px;
  right: 40px;
  z-index: 1;
  color: #4285f4 !important;
  cursor: pointer;
}
</style>
