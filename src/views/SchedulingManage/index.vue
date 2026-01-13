<!--
 * @Description: 
 * @Author: JianYue
 * @Date: 2024-06-17 16:32:01
 * @LastEditTime: 2024-07-26 13:56:00
 * @LastEditors:  Do not edit
-->
<!-- 班组管理 -->
<template>
  <div class="team-manage-view">
    <w-form-header
      :fields="fields"
      :model="searchForm"
      :title="null"
      :layout="{ labelAuto: true }"
      :loading="loading"
      newLine
      :neddRetain="false"
    >
      <template #waterPlantId>
        <factory-select
          class="factory-select"
          v-model="searchForm.waterPlantId"
          autoSelect
          @input="handleSearch"
          :showAll="true"
        ></factory-select>
      </template>
      <template #monthValue>
        <div class="calendar-chart-time-picker">
          <w-button @click="lastMonth">前一月</w-button>
          <w-month-picker
            placeholder="Select month"
            :allowClear="false"
            v-model="searchForm.monthValue"
            format="YYYY-MM"
            valueFormat="YYYY-MM"
            :getCalendarContainer="triggerNode => triggerNode.parentNode || document.body"
            dropdownClassName="wpg-calendar-picker-with-popup-container"
          />
          <w-button @click="nextMonth">后一月</w-button>
        </div>
      </template>

      <template #footer>
        <w-button icon="reload" @click="handleReset">
          <span>重置</span>
        </w-button>
        <w-button type="primary" icon="ic_search" @click="handleSearch">
          <span>查询</span>
        </w-button>
      </template>
    </w-form-header>
    <div class="calendar-wrapper" v-loading="loading">
      <w-calendar mode="month" :value="month" ref="calendar" valueFormat="YYYY-MM">
        <template #headerRender>
          <ul class="week-header">
            <li>周一</li>
            <li>周二</li>
            <li>周三</li>
            <li>周四</li>
            <li>周五</li>
            <li>周六</li>
            <li>周日</li>
          </ul>
        </template>
        <template #dateFullCellRender="date">
          <div
            class="wpg-fullcalendar-date wbdc-pop-divider day-item"
            :class="{
              today: nowMoment === date.format('YYYY-MM-DD'),
              selected: selectedDate === date.format('YYYY-MM-DD')
            }"
          >
            <div :class="['date', isCurrentMonth(date) ? 'wfc1' : 'wfc3']">
              {{ date.format('DD') }}
            </div>
            <div class="wpg-fullcalendar-content">
              <ul class="info wfc2">
                <li
                  class="ellipsis"
                  v-for="(item, idx) in getCurrentDateInfo(date.format('YYYY-MM-DD'))"
                  :key="date.format('YYYY-MM-DD') + idx + item.clssVal.classId"
                >
                  <span
                    class="tag"
                    :style="{
                      backgroundColor: isValidDate(item, date.format('YYYY-MM-DD'))
                        ? item.clssVal.background
                        : '#767e8c'
                    }"
                    >{{ item.clssVal.className }}</span
                  ><span
                    class="users ellipsis wfc2"
                    :style="{
                      backgroundColor: isValidDate(item, date.format('YYYY-MM-DD'))
                        ? `${item.clssVal.background}1a`
                        : '#767e8c1a'
                    }"
                    >{{ getClassUserNames(item.classGroupAndUserVOList) }}</span
                  >
                </li>
              </ul>
            </div>
          </div>
        </template>
      </w-calendar>
      <div class="selected-class-info">
        <div class="title wbgc-deep wfc2">{{ this.selectedDate }}值班列表</div>
        <!-- 排班信息 -->
        <ul class="class-list" v-if="currentInfo.length">
          <li
            class="class-list-item"
            v-for="item in currentInfo"
            :key="item.clssVal.classId"
            style="padding-left: 0px;"
          >
            <div
              class="title ellipsis"
              :style="{ backgroundColor: isValidDate(item, selectedDate) ? '#4362FF' : '#767e8c' }"
            >
              {{ item.clssVal.className }}（ {{ item.clssVal.startTime }}-{{ item.clssVal.endTime }}
              ）
            </div>
            <div
              class="class-user-wrapper"
              :style="{
                backgroundColor: isValidDate(item, selectedDate) ? '#4362FF1a' : '#767e8c1a'
              }"
            >
              <template v-for="user in item.classGroupAndUserVOList">
                <ul
                  class="class"
                  v-if="user.userName"
                  :key="item.clssVal.classId + user.classGroupId + user.userId"
                  style="padding-left: 0px;"
                >
                  <li
                    class="user-item"
                    v-for="name in user.userName.split(',')"
                    :key="name + item.clssVal.classId + user.classGroupId + user.userId"
                  >
                    {{ name }}（{{ user.classGroupName }}）
                  </li>
                </ul>
              </template>
            </div>
          </li>
        </ul>
        <w-empty v-else />
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment';
import FactorySelect from '@/components/factory-select/index';
export default {
  name: 'TeamManage',
  components: { FactorySelect },
  data() {
    return {
      fields: [
        {
          label: '选择污水厂：',
          name: 'waterPlantId',
          type: 'select',
          colon: true,
          span: 8,
          wrapperCol: { span: 18 }
        },
        {
          name: 'monthValue',
          type: 'month',
          colon: true,
          span: 8,
          wrapperCol: { span: 18 }
        }
      ],
      searchForm: {
        waterPlantId: undefined,
        monthValue: moment().format('YYYY-MM')
      },
      loading: false,
      selectedDate: moment().format('YYYY-MM-DD'),
      currentInfo: [],
      classMap: {}, // 每一天的排班信息
      nowMoment: moment().format('YYYY-MM-DD'),
      selectMoment: moment().format('YYYY-MM')
    };
  },
  computed: {
    month() {
      return this.searchForm.monthValue;
    }
  },
  watch: {
    month() {
      this.getCalendarList();
    }
  },
  methods: {
    //获取当月日历起始时间
    getDayAll(starDay, endDay) {
      let arr = [];
      let dates = [];
      // 设置两个日期UTC时间
      let db = new Date(starDay);
      let de = new Date(endDay);
      // 获取两个日期GTM时间
      let s = db.getTime() - 24 * 60 * 60 * 1000;
      let d = de.getTime() - 24 * 60 * 60 * 1000;
      // 获取到两个日期之间的每一天的毫秒数
      for (let i = s; i <= d; ) {
        i = i + 24 * 60 * 60 * 1000;
        arr.push(parseInt(i));
      }
      // 获取每一天的时间  YY-MM-DD
      for (let j in arr) {
        let time = new Date(arr[j]);
        let year = time.getFullYear(time);
        let mouth = time.getMonth() + 1 >= 10 ? time.getMonth() + 1 : '0' + (time.getMonth() + 1);
        let day = time.getDate() >= 10 ? time.getDate() : '0' + time.getDate();
        let YYMMDD = year + '-' + mouth + '-' + day;
        dates.push(YYMMDD);
      }
      return dates;
    },
    handleSearch() {
      this.getCalendarList();
    },
    handleReset() {
      this.searchForm = {
        waterPlantId: undefined,
        monthValue: moment().format('YYYY-MM')
      };
    },
    // 月份切换
    lastMonth() {
      this.searchForm.monthValue = moment(this.month, 'YYYY-MM')
        .add(-1, 'month')
        .format('YYYY-MM');
    },
    nextMonth() {
      this.searchForm.monthValue = moment(this.month, 'YYYY-MM')
        .add(1, 'month')
        .format('YYYY-MM');
    },
    async getCalendarList() {
      try {
        this.loading = true;
        const startMonth = moment(this.month, 'YYYY-MM').startOf('month');
        const endMonth = moment(this.month, 'YYYY-MM').endOf('month');

        const startDay = moment(startMonth).subtract(startMonth.format('E') - 1, 'days');
        const endDay = moment(endMonth).add(7 - endMonth.format('E'), 'days');

        const days = 42; // 日历会展示42天的数据
        const diff = days - (endDay.diff(startDay, 'days') + 1);
        const startTime = moment(startMonth)
          .subtract(startMonth.format('E') - 1, 'days')
          .format('YYYY-MM-DD HH:mm:ss');
        const endTime = moment(endMonth)
          .add(7 - endMonth.format('E') + diff, 'days')
          .format('YYYY-MM-DD HH:mm:ss');
        this.getDayAll(startTime, endTime);
        const { resultData } = await this.$http.post('/oaClassSchedule/queryOaScheduleCalendar', {
          ...this.searchForm,
          startTime,
          endTime
        });
        // let arr = this.getDaysInMonth(this.nowMoment);
        let arr = this.getDayAll(startTime, endTime);
        arr.forEach((item, i) => {
          let index = i % resultData.length;
          arr[i] = {
            ...resultData[index],
            scheduleDate: item
          };
        });
        const classMap = {};
        arr.forEach(item => {
          classMap[item.scheduleDate] = item.classVals;
        });
        this.classMap = classMap;
        const selectedInfo = this.classMap[this.selectedDate];
        this.currentInfo = selectedInfo || this.currentInfo;
      } catch (error) {
        this.classMap = {};
        this.currentInfo = [];
      } finally {
        this.loading = false;
      }
    },
    getCurrentDateInfo(date) {
      return this.classMap[date] ?? [];
    },
    getClassUserNames(groups) {
      return groups
        .filter(i => i.userName)
        .map(i => i.userName)
        .join('、');
    },
    // 判断日期是否是本月
    isCurrentMonth(date) {
      return date.month() === moment().month();
    },
    // 判断当前日期是否过期
    isValidDate(item, date) {
      const { startTime, endTime } = item.clssVal;
      const now = moment();
      const start = `${date} ${startTime}`;
      const end = `${date} ${endTime}`;
      if (moment(start, 'YYYY-MM-DD HH:mm').isSameOrAfter(now)) {
        return true;
      }
      if (moment(end, 'YYYY-MM-DD HH:mm').isBefore(now)) {
        return false;
      }
      return true;
    }
  }
};
</script>
<style lang="less" scoped>
/deep/ .wpg-fullcalendar td {
  padding: 0 !important;
}
/deep/ .wpg-fullcalendar .day-item .wpg-fullcalendar-content ul.info {
  padding: 0;
}
.team-manage-view {
  height: 100%;
  .calendar-chart-time-picker {
    display: flex;
    align-items: center;
    > .wpg-btn,
    > .wpg-calendar-picker {
      margin-left: 12px;
    }
  }
  .calendar-wrapper {
    height: calc(100% - 74px);
    display: flex;
    background-color: var(--supply-color-bg-card-DEFAULT);
    margin-top: 12px;
    padding: 24px 24px;

    .wpg-fullcalendar-fullscreen {
      flex: 1;
      border: none;

      .week-header {
        display: flex;
        padding-left: 0px;
        margin-bottom: 0px;
        background-color: var(--supply-color-bg-tabelHead);

        > li {
          flex: 1;
          text-align: right;
          height: 28px;
          line-height: 28px;
          padding-right: 10px;
          border-width: 1px;
          border-style: solid;
          border-bottom-width: 0;
          border-color: var(--supply-color-border-split);
        }
      }

      /deep/ .wpg-fullcalendar {
        border: none;

        .wpg-fullcalendar-calendar-body {
          padding: 0;
          .wpg-fullcalendar-table {
            > thead {
              display: none;
            }
          }
        }

        .day-item {
          box-sizing: border-box;
          border-width: 1px;
          border-style: solid;
          padding: 2px 8px 0;
          margin: 0;
          font-size: 12px;
          cursor: pointer;
          height: 100px;
          border-color: var(--supply-color-border-split);
          // 去掉原组件的选中样式
          background-color: transparent;
          border-top-color: transparent;

          &.selected {
            background-color: rgba(118, 126, 140, 0.04);
            border-top: 1px solid #767e8c;
          }

          &.today {
            background-color: rgba(66, 133, 244, 0.1);
            border-top: 1px solid #4285f4;
          }

          div.date {
            text-align: right;
            font-size: 14px;
          }

          .wpg-fullcalendar-content {
            height: 64px;
            &::-webkit-scrollbar {
              display: none;
            }

            ul.info {
              flex: 1;
              min-height: 0;
              overflow-y: visible;
              li {
                display: flex;
                align-items: center;
                min-width: 0;
                &:not(:first-child) {
                  margin-top: 3px;
                }
                span.tag {
                  display: inline-block;
                  border-radius: 1px 0 0 1px;
                  color: #fff;
                  padding: 3px 4px;
                  line-height: 1;
                  font-size: 12px;

                  &.invalid {
                    background: #767e8c;
                  }
                }

                span.users {
                  padding-left: 4px;
                  border-radius: 0 1px 1px 0;
                  flex: 1 1 0;

                  &.invalid {
                    // background: #edeff1;
                  }
                }

                span.more {
                  line-height: 1;
                }
              }
            }
          }
        }
      }
    }
    .selected-class-info {
      flex-basis: 200px;
      margin-left: 22px;
      display: flex;
      flex-flow: column nowrap;

      .title {
        height: 28px;
        line-height: 28px;
        text-align: center;
      }

      .class-list {
        display: flex;
        flex-flow: column nowrap;
        flex: 1;

        &:last-child {
          flex: 1;
          display: flex;
          flex-flow: column nowrap;
        }
        &-item {
          font-size: 14px;

          .title {
            height: 36px;
            display: flex;
            align-items: center;
            padding-left: 8px;
            color: #fff;
          }
          .class-user-wrapper {
            padding: 12px 23px;
            .class {
              display: flex;
              flex-flow: column nowrap;

              &:last-child {
                flex: 1;
              }
            }
          }
        }
      }
    }
  }
}
</style>
