<!--
 * @Author: wangyr
 * @Date: 2022-12-07 09:25:34
 * @LastEditors: wangyr
 * @LastEditTime: 2024-10-15 09:28:23
 * @Description:
-->
<template>
  <div class="pump-content">
    <w-row :gutter="12">
      <w-col :span="24">
        <div class="match-chart">
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
              <div class="match-name">{{ row.pumpId }}</div>
              <w-col class="chart-col" v-for="(item, i) in row.match" :key="i" :span="1">
                <span
                  v-for="bar in item"
                  :key="bar.combinationTime"
                  :class="[bar.bgClass, 'bar']"
                  >{{
                    bar.isOpen === 1 && bar.frequency !== 50 ? bar.frequency.toFixed(0) : ''
                  }}</span
                >
              </w-col>
            </w-row>
            <w-row v-if="tableData.length > 0" class="chart-row" :gutter="0">
              <w-col
                class="chart-col chart-bottom"
                v-for="(item, index) in 24"
                :key="item"
                :span="1"
              >
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
      </w-col>
    </w-row>
  </div>
</template>

<script>
import { matchColumns, toolIcon } from './data';

export default {
  name: 'pumpMatch',
  components: {},
  props: {
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
      toolIcon,
      currentType: 'line',
      colors: [
        { color: '#58D0D3', name: '运行' },
        { color: '#E1E1E1', name: '停止' }
      ],
      columns: matchColumns,
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
.pump-content {
  width: 100%;
  height: 100%;

  .header {
    margin: 10px 0;
    clear: both;
    overflow: hidden;
  }

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
  .tool-box {
    width: 100%;
    text-align: right;
    color: #999;

    .tool-icon {
      cursor: pointer;
      margin-right: 8px;

      &.active {
        color: var(--supply-color-primary-DEFAULT);
      }
    }
  }
  .match-content {
    margin-top: 10px;
    padding: 0 6px;
    .chart-row {
      margin-bottom: 5px;
      position: relative;
      .match-name {
        font-size: 14px;
        color: var(--supply-color-third);
        margin-right: 10px;
        position: absolute;
        top: 50%;
        left: -16px;
        transform: translateY(-50%);
      }
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
      .noraml-bar {
        background-color: #58d0d3;
      }
      .shake-bar {
        background-color: #008184;
      }
      .stop-bar {
        background-color: #b8d0d2;
      }
      .leave-bar {
        background-color: #e1e1e1;
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
  .des-cl {
    color: var(--supply-color-primary-DEFAULT);
  }
}
</style>
