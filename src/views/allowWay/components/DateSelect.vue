<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2023-07-05 17:07:32
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2023-07-24 15:48:18
 * @Description: 
-->
<template>
  <span class="date-wrap">
    <w-radio-group class="date-radio" v-model="dateType" @change="timeChange">
      <w-radio-button
        v-for="(item, index) in btnList"
        :key="item.value"
        class="supply-border-0"
        :value="item.value"
      >
        {{ item.name }}
      </w-radio-button>
    </w-radio-group>
    <w-range-picker
      class="date-picker"
      :allowClear="false"
      size="small"
      :disabled-date="disabledDate"
      v-if="dateType === '3'"
      show-time
      v-model="date"
      @change="timeChange"
    />
  </span>
</template>

<script>
import moment from 'moment';
export default {
  name: 'DateSelect',
  props: {
    initDateType: {
      type: String,
      default: '0'
    }
  },
  data() {
    return {
      dateType: this.initDateType,
      date: [moment().startOf('day'), moment()],
      btnList: [
        { name: '今日', value: '0' },
        { name: '本周', value: '1' },
        { name: '本月', value: '2' },
        { name: '自定义', value: '3' }
      ]
    };
  },
  methods: {
    disabledDate(current) {
      return current && current > moment().endOf('day');
    },
    timeChange() {
      let timeFormat = 'YYYY-MM-DD HH:mm:ss';
      let dateParam = {};
      switch (this.dateType) {
        case '0':
          dateParam = {
            period: '1',
            timeEnum: 'HOURS',
            dates: {
              startTime: moment()
                .startOf('day')
                .format(timeFormat),
              endTime: moment().format(timeFormat)
            }
          };
          break;
        case '1':
          dateParam = {
            period: '1',
            timeEnum: 'DAYS',
            dates: {
              startTime: moment()
                .startOf('isoWeek')
                .format(timeFormat),
              endTime: moment()
                .endOf('isoWeek')
                .format(timeFormat)
            }
          };
          break;

        case '2':
          dateParam = {
            period: '1',
            timeEnum: 'DAYS',
            dates: {
              startTime: moment()
                .startOf('month')
                .format(timeFormat),
              endTime: moment()
                .endOf('month')
                .format(timeFormat)
            }
          };
          break;

        case '3':
          dateParam = {
            ...this.getPeriod(this.date[1], this.date[0]),
            dates: {
              startTime: this.date[0].format(timeFormat),
              endTime: this.date[1].format(timeFormat)
            }
          };
          break;

        default:
          break;
      }
      this.$emit('change', dateParam);
    },
    getPeriod(startTime, endTime) {
      if (startTime && endTime) {
        const diffHours = Math.abs(moment(startTime).diff(endTime, 'hour'));
        if (diffHours <= 1) {
          return {
            period: '5',
            timeEnum: 'MINUTES'
          };
        } else if (diffHours > 1 && diffHours <= 24) {
          return {
            period: '1',
            timeEnum: 'HOURS'
          };
        } else {
          return {
            period: '1',
            timeEnum: 'DAYS'
          };
        }
      } else {
        return { period: '1', timeEnum: 'HOURS' };
      }
    }
  }
};
</script>
<style lang="less" scoped>
.date-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  /deep/ .date-radio {
    margin-left: auto;
    white-space: nowrap;
    .wpg-radio-button-wrapper,
    .wpg-radio-button-wrapper-checked {
      &:focus-within {
        outline: none;
        box-shadow: none;
      }
    }
    .wpg-radio-button-wrapper {
      height: unset;
      line-height: unset;
      padding: 0 6px;
      box-shadow: none;
      &:first-child {
        border: 0;
      }
    }
    .wpg-radio-button-wrapper {
      &::before {
        width: 0;
      }
    }
  }
  /deep/ .date-picker {
    width: unset !important;
    max-width: 275px;
  }
}
</style>
