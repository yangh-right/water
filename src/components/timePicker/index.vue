<template>
  <div class="picker-wrapper">
    <w-radio-group v-model="selectedTimeType" button-style="solid" :size="size" style="margin-right: 16px">
      <w-radio-button v-for="item in radioOptionsInner" @click="timeTypeChange(item.type)" :key="item.type" :value="item.type">{{ item.name }}</w-radio-button>
    </w-radio-group>
    <year-date v-if="selectedTimeType === 'year'" :format="inputFormat(time)" @change="timeChange" :model="time" :disabledData="new Date().getFullYear()" />
    <component
      v-else
      :is="`w-${selectedTimeType}-picker`"
      :getCalendarContainer="triggerNode => triggerNode.parentNode || document.body"
      :format="inputFormat(time)"
      :valueFormat="valueFormat"
      :allowClear="false"
      :disabledDate="timePickerOptionInner.disabledDate || disabledDate"
      v-model="time"
      @change="timeChange"
      inputReadOnly
    />
  </div>
</template>

<script>
import yearDate from './YearPicker.vue';
import moment from 'moment';

const OPTIONS = [
  {
    type: 'date',
    name: '日'
  },
  {
    type: 'month',
    name: '月',
    dateType: 'month'
  },
  {
    type: 'year',
    name: '年'
  }
];
const TIME_MAP = {
  year: 'yearTime',
  month: 'monthTime',
  date: 'dateTime'
};
const FORMATTER_MAP = {
  year: 'YYYY',
  month: 'YYYY-MM',
  date: 'YYYY-MM-DD'
};
const DEFAULT_OPTION = {
  radioOptions: ['year', 'month', 'date'],
  defaultTimeType: 'year'
};
export default {
  name: 'timePicker',
  components: { yearDate },
  model: {
    prop: 'modelVal',
    event: 'change'
  },
  props: {
    timePickerOption: {
      type: Object,
      default: () => DEFAULT_OPTION
    },
    modelVal: {
      type: Object,
      default: undefined
    },
    size: {
      type: String,
      default: 'small'
    }
  },

  data() {
    return {
      timePickerOptionInner: DEFAULT_OPTION,
      selectedTimeType: this.timePickerOption.defaultTimeType,
      time: null,
      //要求能够 记忆上次选择的时间
      yearTime: null,
      monthTime: null,
      dateTime: null
    };
  },
  computed: {
    radioOptionsInner() {
      let temp = this.timePickerOptionInner.radioOptions;
      return temp && temp.length ? OPTIONS.filter(item => temp.includes(item.type)) : OPTIONS;
    },
    valueFormat() {
      return FORMATTER_MAP[this.selectedTimeType];
    }
  },
  watch: {
    timePickerOption: {
      handler() {
        Object.assign(this.timePickerOptionInner, this.timePickerOption);
      },
      immediate: true
    },
    modelVal: {
      deep: true,
      handler(val) {
        this.time = val?.time || moment().format(this.valueFormat);
        if (this.time.length === 10) this.selectedTimeType = 'date';
        else if (this.time.length === 7) this.selectedTimeType = 'month';
        else this.selectedTimeType = 'year';
      },
      immediate: true
    }
  },
  mounted() {
    this.timeChange(this.modelVal?.time);
  },
  methods: {
    timeTypeChange(timeType) {
      this.selectedTimeType = timeType;
      this.timeChange();
    },
    timeChange(time) {
      this.time = time ? time : this[TIME_MAP[this.selectedTimeType]] || moment().format(this.valueFormat);
      //记录时间
      this[TIME_MAP[this.selectedTimeType]] = this.time;
      let timeObj = {
        type: this.selectedTimeType,
        time: this.time,
        startDate: moment(this.time).startOf(this.selectedTimeType).format('YYYY-MM-DD 00:00:00'),
        endDate: moment(this.time).endOf(this.selectedTimeType).format('YYYY-MM-DD 23:59:59')
      };

      this.$emit('change', timeObj);
    },
    //回显框的显示
    inputFormat(selectedTime) {
      let curentTime = moment().format(this.valueFormat);
      switch (this.selectedTimeType) {
        case 'date':
          //昨日
          if (selectedTime === moment().subtract(1, 'day').format(this.valueFormat)) return '昨日';
          //今日
          else if (selectedTime === curentTime) return '今日';
          //明日
          else if (selectedTime === moment().add(1, 'day').format(this.valueFormat)) return '明日';
          break;
        case 'month':
          //上月
          if (selectedTime === moment().subtract(1, 'month').format(this.valueFormat)) return '上月';
          //本月
          else if (selectedTime === curentTime) return '本月';
          break;
        case 'year':
          //去年
          if (selectedTime === moment().subtract(1, 'year').format(this.valueFormat)) return '去年';
          //今年
          else if (selectedTime === curentTime) return '今年';
          break;
        default:
          break;
      }
    },
    disabledDate(current) {
      switch (this.selectedTimeType) {
        case 'date':
          return current && current > moment().endOf('day');
        case 'month':
          return current && current > moment().endOf('month');
        case 'year':
          return current && current > moment().endOf('year');
      }
    }
  }
};
</script>

<style lang="less" scoped>
.picker-wrapper {
  width: 100%;
  display: flex;

  /deep/ .wpg-calendar-picker {
    flex: 1;
  }
  /deep/ .wpg-calendar-picker-input {
    height: 28px;
    line-height: 28px;
  }

  /deep/ .wpg-calendar-picker-container {
    top: 0 !important;
  }

  /deep/ .wpg-calendar-input-wrap {
    height: 28px;
    padding: 2px 10px;
  }
}
</style>
