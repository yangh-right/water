<!--
 * @Description:
 * @version:
 * @Author: fengtaotao
 * @Date: 2023-05-23 14:29:38
 * @LastEditors: wangyr
 * @LastEditTime: 2024-05-16 10:59:29
-->
<template>
  <div class="content">
    <div class="content-header">
      <div class="content-title">{{ title }}</div>
      <div class="supply-flex">
        <!-- <w-radio-group class="" v-model="line" size="small" button-style="solid">
          <w-radio-button v-for="item in lineList" :key="item.dictCode" :value="item.dictValue">
            {{item.dictName}}
          </w-radio-button>
        </w-radio-group> -->
        <date-select class="supply-ml-3" @change="dateChange" v-if="showDate"></date-select>
      </div>
    </div>
    <div class="content-body">
      <slot :date="date" :line="line"></slot>
    </div>
  </div>
</template>
<script>
import moment from 'moment';
import DateSelect from './DateSelect.vue';
export default {
  name: 'BlockWrap',
  props: {
    title: {
      type: String,
      default: ''
    },
    showDate: {
      type: Boolean,
      default: false
    },
    lineList: {
      type: Array,
      default: () => []
    }
  },
  components: {
    DateSelect
  },
  data() {
    return {
      line: '0',
      date: {
        period: '5',
        timeEnum: 'MINUTES',
        dates: {
          startTime: moment()
            .startOf('day')
            .format('YYYY-MM-DD HH:mm:ss'),
          endTime: moment().format('YYYY-MM-DD HH:mm:ss')
        }
      }
    };
  },
  methods: {
    dateChange(date) {
      this.date = date;
    }
  }
};
</script>

<style lang="less" scoped>
.content {
  width: calc(50% - 6px);
  background: var(--supply-color-bg-card-DEFAULT);
  border-radius: 4px;
  &-header {
    width: 100%;
    padding: 15px 12px;
    display: inline-flex;
    justify-content: space-between;
    align-items: center;
    height: 40px;
  }
  &-title {
    font-weight: 600;
    font-size: 16px;
    color: var(--supply-color-main);
    letter-spacing: 0;
  }
  &-body {
    height: calc(100% - 40px);
  }
  .form-item {
    margin-top: 10px;
    width: 80px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .tabs {
    padding: 0 12px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    cursor: pointer;
    .tab {
      height: 24px;
      line-height: 24px;
      margin-right: 8px;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 0 15px;
      background: #f4f6f8;
      color: #666666;
      border-radius: 12px;
      font-size: 14px;
    }
    .active {
      color: #5b8ff9;
      background: #5b8ff91a;
    }
  }
  .spin {
    height: calc(100% - 44px);
  }
  .chart-wrapper {
    height: 100%;
    padding: 0 0 10px;
  }
  .table-wrapper {
    padding: 0 12px;
    box-sizing: border-box;
    margin: 0;
  }
  .empty {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  /deep/ .wpg-select-selection--single {
    height: 32px;
  }
  /deep/ .wpg-spin-container {
    height: 100%;
  }
}
</style>
