<!--
 * @Description:
 * @version:
 * @Author: fengtaotao
 * @Date: 2023-05-23 14:29:38
 * @LastEditors:  Do not edit
 * @LastEditTime: 2024-05-29 10:44:13
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
          <a-popover slot="dateCellRender" slot-scope="value">
            <template #content>
              <div v-for="item in getListData(value).list" :key="item.typeCode">
                <w-badge color="#2db7f5" />
                <span class="ticket-type">{{ item.typeName }}({{ item.num }})</span>
              </div>
            </template>
            <span class="calendar-badge">
              <w-badge v-if="getListData(value).hasPlan" :count="getListData(value).num" />
            </span>
          </a-popover>
        </w-calendar>
      </div>
    </w-spin>
  </div>
</template>
<script>
import { getTickerCalendar } from '@/api/optimization';
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
      startTime: moment()
        .startOf('month')
        .format('YYYY-MM-DD 00:00:00'),
      endTime: moment()
        .endOf('month')
        .format('YYYY-MM-DD 23:59:59'),
      curTime: moment().format('YYYY-MM-DD HH:mm:ss'),
      loading: false,
      calendarTicketList: []
    };
  },
  watch: {
    waterPlantId: {
      immediate: true,
      handler(val) {
        if (val) {
          this.getTickerCalendar();
        }
      }
    }
  },
  created() {},
  methods: {
    getListData(value) {
      let dateTime = value.format('YYYY-MM-DD');
      let item = this.calendarTicketList.find(item => item.dateTime === dateTime);
      return {
        hasPlan: item ? true : false,
        list: item ? item.list : [],
        num: item ? item.num : 0
      };
    },
    async getTickerCalendar() {
      this.loading = true;
      let params = {
        waterPlantId: this.waterPlantId, //传水厂id
        startTime: this.startTime,
        endTime: this.endTime,
        processingType: ''
      };
      let { resultData, status } = await getTickerCalendar(params);
      this.loading = false;
      if (status === 'complete') {
        if (resultData.length) {
          this.calendarTicketList = resultData;
        } else {
          this.calendarTicketList = [];
        }
      }
    },
    onPanelChange(value, mode) {
      this.startTime = moment(value)
        .startOf('month')
        .format('YYYY-MM-DD 00:00:00');
      this.endTime = moment(value)
        .endOf('month')
        .format('YYYY-MM-DD 23:59:59');
      this.getTickerCalendar();
    }
  }
};
</script>

<style lang="less" scoped>
.content {
  height: 270px;
  background: var(--supply-color-bg-card-DEFAULT);
  border-radius: 4px;
  overflow: hidden;

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
        right: 50%;
        margin-right: -4px;
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
