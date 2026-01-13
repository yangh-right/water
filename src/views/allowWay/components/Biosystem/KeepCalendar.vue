<!--
 * @Description:
 * @version:
 * @Author: fengtaotao
 * @Date: 2023-05-23 14:29:38
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2023-08-07 13:49:45
-->
<template>
  <div class="content">
    <div class="content-header">
      <div class="content-title">
        <span>保养日历</span><span class="keep-time">（当前时间：{{ curTime }}）</span>
      </div>
      <div class="form">
        <div class="form-item"></div>
      </div>
    </div>
    <w-spin :spinning="loading" class="spin">
      <div class="calendar-wrapper">
        <w-calendar @panelChange="onPanelChange" class="keep-calendar">
          <span class="calendar-badge" slot="dateCellRender" slot-scope="value">
            <w-badge class="" v-if="getListData(value)" color="#2db7f5" />
          </span>
        </w-calendar>
      </div>
    </w-spin>
  </div>
</template>
<script>
import { getAlarmTypeCount } from '@/api/optimization';
import { deviceOption } from './data';
import moment from 'moment';
export default {
  name: 'KeepCalendar',
  props: {
    title: {
      type: String,
      default: ''
    },
    waterPlantId: {
      type: String,
      default: ''
    }
  },
  components: {},
  data() {
    return {
      curTime: moment().format('YYYY-MM-DD HH:mm:ss'),
      loading: false
    };
  },
  watch: {
    waterPlantId() {
      // this.getAlarmType();
    }
  },
  created() {},
  methods: {
    getListData(value) {
      let hasPlan = false;
      if (moment(value).isSame(moment(), 'day')) {
        hasPlan = true;
      }
      return hasPlan;
    },

    onPanelChange(value, mode) {
      console.log(value, mode);
    }
  }
};
</script>

<style lang="less" scoped>
.content {
  height: 312px;
  width: calc(50% - 6px);
  background: var(--supply-color-bg-card-DEFAULT);
  border-radius: 4px;
  &-header {
    position: absolute;
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
    .keep-time {
      font-size: 14px;
      color: var(--supply-color-secondary);
    }
  }
  .calendar-wrapper {
    /deep/ .keep-calendar {
      .wpg-fullcalendar-header {
        padding: 12px 16px 0 0;
        .wpg-radio-group {
          display: none;
        }
      }
      .wpg-fullcalendar-date {
        height: 35px;
      }
      .calendar-badge {
        position: absolute;
        top: 10px;
        right: 25px;
      }
    }
  }
  /deep/ .wpg-badge-status-dot {
    background: var(--supply-color-primary-DEFAULT) !important;
    width: 4px;
    height: 4px;
  }
  .spin {
    height: calc(100% - 40px);
  }

  .card-inner {
    width: 100%;
    height: 100%;
    position: relative;
    padding: 0 12px;
    box-sizing: border-box;
    display: flex;
    align-items: center;

    .echart-block {
      width: 40%;
      height: 100%;
      text-align: center;
    }
    .points-list {
      width: 60%;
      height: 100%;
      display: flex;
      flex-flow: wrap;
      align-items: center;
      justify-content: flex-start;

      .point-tab {
        width: calc(50% - 14px);
        height: 26px;
        margin-bottom: 8px;
        padding: 0 8px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-right: 28px;
        &:nth-child(2n) {
          margin-right: 0px;
        }

        .label {
          font-family: PingFangSC-Regular, sans-serif;
          font-weight: 400;
          font-size: 14px;
          color: var(--supply-color-secondary);
          letter-spacing: 0;

          .ico-react {
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 1.76px;
            margin-right: 6px;
          }
        }
        .precent {
          font-weight: 400;
          font-size: 14px;
          color: var(--supply-color-main);
          letter-spacing: 0;
          text-align: right;
        }
      }
    }
  }

  .empty {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
