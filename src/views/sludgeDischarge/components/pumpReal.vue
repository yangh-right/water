<template>
  <div class="content">
    <div class="content-title">
      <div class="title">{{ title }}</div>
    </div>
    <w-spin :spinning="loading" class="spin">
      <div class="pump-content">
        <div class="header">
          <div class="legend-con">
            <div v-for="(item, index) in colors" :key="index">
              <span :style="`background:${item.color}`"></span>
              {{ item.name }}
            </div>
          </div>
        </div>
        <div class="match-content">
          <w-row class="chart-row" v-for="row in tableData" :key="row.pumpId" :gutter="4">
            <w-col class="chart-col" v-for="(item, j) in 24" :key="j" :span="1">
              <div :class="['stop-bar', 'bar', 'father-bar']">
                <!-- 背景色 -->
                <div
                  v-for="(bar, i) in row['match'][2 * j]"
                  :key="i"
                  :class="[bar.bgClass, 'bar']"
                  :style="{ position: 'absolute', left: bar.left, width: bar.percent, zIndex: 9 }"
                ></div>
                <!-- 值 -->
                <div
                  v-for="(bar, i) in row['match'][2 * j]"
                  :key="bar.startTime"
                  :class="['lucency-bar', 'bar']"
                  :style="{ position: 'absolute', left: 0, width: '100%', zIndex: 10 }"
                >
                  <span v-if="i === 0" class="max-frequency"
                    >{{ bar.status === '2' && !!bar.max ? bar.max : '' }}
                  </span>
                </div>
                <!-- 提示信息 -->
                <div
                  v-for="(bar, i) in row['match'][2 * j]"
                  :key="bar.startTime + i"
                  :class="['tooltip-bar', 'bar']"
                  :style="{
                    position: 'absolute',
                    left: bar.left,
                    width: bar.percent,
                    zIndex: 11
                  }"
                >
                  <w-tooltip>
                    <template slot="title">
                      <span>{{ bar.startTime.slice(0, -3) }} ~ {{ bar.endTime.slice(0, -3) }}</span>
                    </template>
                    <div class="full-bar">&nbsp;</div>
                  </w-tooltip>
                </div>
              </div>
              <div :class="['stop-bar', 'bar', 'father-bar', 'second-bar']">
                <div
                  v-for="(bar, i) in row['match'][2 * j + 1]"
                  :key="i"
                  :class="[bar.bgClass, 'bar']"
                  :style="{ position: 'absolute', left: bar.left, width: bar.percent, zIndex: 9 }"
                ></div>
                <div
                  v-for="(bar, i) in row['match'][2 * j + 1]"
                  :key="bar.startTime"
                  :class="['lucency-bar', 'bar']"
                  :style="{ position: 'absolute', left: 0, width: '100%', zIndex: 10 }"
                >
                  <span v-if="i === 0" class="max-frequency">{{
                    bar.status === '2' && !!bar.max ? bar.max : ''
                  }}</span>
                </div>
                <!-- 提示信息 -->
                <div
                  v-for="(bar, i) in row['match'][2 * j + 1]"
                  :key="bar.startTime + i"
                  :class="['tooltip-bar', 'bar']"
                  :style="{
                    position: 'absolute',
                    left: bar.left,
                    width: bar.percent,
                    zIndex: 11
                  }"
                >
                  <w-tooltip>
                    <template slot="title">
                      <span>{{ bar.startTime.slice(0, -3) }} ~ {{ bar.endTime.slice(0, -3) }}</span>
                    </template>
                    <div class="full-bar">&nbsp;</div>
                  </w-tooltip>
                </div>
              </div>
            </w-col>
          </w-row>
          <w-row v-if="tableData.length > 0" class="chart-row" :gutter="0">
            <w-col class="chart-col chart-bottom" v-for="(item, index) in 24" :key="item" :span="1">
              <span
                :class="[
                  'bar-time',
                  index === 23 ? 'bar-last' : '',
                  index !== 0 ? 'bar-other' : ''
                ]"
                >{{ index }}</span
              >
            </w-col>
          </w-row>
          <div v-if="!tableData.length" class="tips">
            <w-empty></w-empty>
          </div>
        </div>
      </div>
    </w-spin>
  </div>
</template>
<script>
export default {
  name: 'pumpReal',
  components: {},
  props: {
    title: {
      type: String,
      default: ''
    },
    waterPlantId: {
      type: String,
      default: ''
    },
    tableData: {
      type: Array,
      default: function() {
        return [];
      },
      required: true
    }
  },
  data() {
    return {
      currentType: 'line',
      loading: false,
      colors: [
        { color: '#58D0D3', name: '工频' },
        { color: '#008184', name: '变频 ' },
        { color: '#B8D0D2', name: '停止' },
        { color: '#E1E1E1', name: '离线' }
      ],
      data: []
    };
  },
  computed: {},
  watch: {
    tableData: {
      handler() {
        // console.log('eee', this.tableData);
      }
    }
  },
  methods: {
    handlerType(type) {}
  },
  created() {},
  mounted() {}
};
</script>

<style lang="less" scoped>
.content {
  width: 100%;
  height: 240px;
  background-color: var(--supply-color-bg-card-component);
  &-title {
    padding: 15px 12px;
    height: 50px;
    .title {
      font-weight: 600;
      font-size: 16px;
      letter-spacing: 0;
      margin-right: 20px;
    }
  }
  .spin {
    height: calc(100% - 50px);
  }
  .pump-content {
    width: 100%;
    height: 100%;

    .header {
      margin: 10px 0;
      clear: both;
      overflow: hidden;

      .legend-con {
        display: flex;
        float: left;
        > div {
          display: flex;
          align-items: center;

          span {
            width: 8px;
            height: 12px;
            margin: 0 10px;
          }
        }
      }
    }

    .match-content {
      margin-top: 10px;
      .chart-row {
        margin-bottom: 5px;
        position: relative;
        .chart-col {
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          .bar-time {
            font-size: 12px;
            color: #969999;
          }
          .bar-time::before {
            content: '';
            height: 5px;
            border-left: 1px solid var(--supply-color-border-DEFAULT);
            position: absolute;
            left: 0px;
            top: -5px;
          }
          .bar-other {
            margin-left: -5px;
          }
          .bar-last::after {
            content: '24 h';
            position: absolute;
            right: -10px;
          }
        }
        .bar {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48%;
          height: 32px;
          border-radius: 2px;
          background-color: #e1e1e1;
          color: #ffffff;
          font-size: 12px;
        }
        .father-bar {
          position: relative;
        }
        .noraml-bar {
          background-color: #58d0d3;
        }
        .shake-bar {
          background-color: #008184;
        }
        .stop-bar {
          background-color: #b8d0d2;
        }
        .lucency-bar {
          background-color: transparent;
        }
        .tooltip-bar {
          background-color: transparent;
        }
        .full-bar {
          width: 100%;
          height: 100%;
        }
        .chart-bottom {
          border-top: 1px solid var(--supply-color-border-DEFAULT);
          padding-top: 2px;
          margin-top: 2px;
        }
        .chart-bottom::after {
          content: '';
          height: 5px;
          border-left: 1px solid var(--supply-color-border-DEFAULT);
          position: absolute;
          right: 0px;
          top: -5px;
        }
      }
    }
  }
}
</style>
