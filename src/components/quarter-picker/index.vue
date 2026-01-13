<template>
  <vc-trigger
    popup-transition-name="slide-up"
    prefix-cls="wpg-calendar-picker-container"
    :popup-class-name="dropdownClassName"
    :builtin-placements="placements"
    :popup-visible="sOpen"
    :popup-align="align"
    :placement="placement"
    :action="disabled && !sOpen ? [] : ['click']"
    :destroy-popup-on-hide="true"
    @popupVisibleChange="onVisibleChange"
  >
    <span class="wpg-calendar-picker" @mouseenter="handleMouseEnter">
      <div>
        <input
          type="text"
          class="wpg-calendar-picker-input wpg-input wpg-input-sm"
          :value="displayValue"
          :placeholder="placeholder"
        />

        <w-icon
          v-if="clearable"
          type="close-circle"
          class="wpg-calendar-picker-clear"
          @click.stop="handleClickIcon"
        />

        <w-icon
          type="ic_date_range"
          class="wpg-calendar-picker-icon"
          style="margin-right: 3px; font-size: 16px"
        />
      </div>
    </span>

    <div slot="popup" class="wpg-calendar wpg-calendar-picker-container-content">
      <div class="wpg-calendar-panel">
        <div class="wpg-calendar-input-wrap" showclear="true">
          <div class="wpg-calendar-date-input-wrap">
            <input
              ref="calendarInput"
              :value="displayValue"
              :placeholder="placeholder"
              class="wpg-calendar-input"
            />
          </div>
        </div>
        <div class="wpg-calendar-date-panel">
          <div class="wpg-calendar-header">
            <a
              role="button"
              aria-label="前一年"
              class="wpg-calendar-prev-year-btn"
              @click="prevYear"
            />
            <span role="button" class="wpg-calendar-ym-select">
              <a role="button" class="wpg-calendar-year-select">{{ yearLabel }}</a>
            </span>
            <a
              role="button"
              aria-label="后一年"
              class="wpg-calendar-next-year-btn"
              @click="nextYear"
            />
          </div>
          <div class="wpg-calendar-body" style="width: 300px; margin: 10px 0">
            <table class="wpg-quarter-table" @click="handleTableClick">
              <caption v-show="false">
                季度选择器 - 选择年度季度
              </caption>
              <thead v-show="false">
                <tr>
                  <th scope="col">上半年</th>
                  <th scope="col">下半年</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="available" :class="getCellStyle(0)">
                    <a class="cell">第一季度</a>
                  </td>
                  <td class="available" :class="getCellStyle(1)">
                    <a class="cell">第二季度</a>
                  </td>
                </tr>
                <tr>
                  <td class="available" :class="getCellStyle(2)">
                    <a class="cell">第三季度</a>
                  </td>
                  <td class="available" :class="getCellStyle(3)">
                    <a class="cell">第四季度</a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </vc-trigger>
</template>

<script>
import moment from 'moment';
import VcTrigger from '@wpg/design-vue/es/vc-trigger';
import placements from '@wpg/design-vue/es/vc-calendar/src/picker/placements';
import KeyCode from '@wpg/design-vue/es/_util/KeyCode';
import {
  formatDate,
  isDateObject,
  nextDate,
  nextYear,
  parseDate,
  prevYear,
  range
} from './date-util';

function hasClass(el, cls) {
  if (!el || !cls) {
    return false;
  }
  if (cls.includes(' ')) {
    throw new Error('className should not contain space.');
  }
  if (el.classList) {
    return el.classList.contains(cls);
  } else {
    return ` ${el.className} `.includes(` ${cls} `);
  }
}

// 获取指定年份和季度的所有日期
const datesInYearAndQuarter = (year, quarter) => {
  const numOfDays = getDayCountOfQuarter(year, quarter);
  const firstDay = new Date(year, quarter * 3, 1);
  return range(numOfDays).map(n => nextDate(firstDay, n));
};

// 获取指定年份和季度总天数
const getDayCountOfQuarter = (year, quarter) => {
  switch (quarter) {
    case 0: // 第一季度包含二月，需要对是否闰年进行判断处理
      if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
        return 91;
      } else {
        return 90;
      }
    case 1:
      return 91;
    default:
      return 92;
  }
};

export default {
  name: 'QuarterPicker',
  components: {
    VcTrigger
  },
  props: {
    align: {
      type: Object,
      default: () => {
        return {
          points: ['tl', 'tl'],
          overflow: {
            adjustX: 1,
            adjustY: 1
          },
          offset: [0, -3],
          targetOffset: [0, 0]
        };
      }
    },
    dropdownClassName: {
      type: String,
      default: ''
    },
    placement: {
      type: String,
      default: 'bottomLeft'
    },
    size: String,
    format: String, // 显示在输入框中的格式，引入季度：q（阿拉伯数字）、Q（中文数字）
    valueFormat: String,
    placeholder: String,
    prefixIcon: String,
    disabled: Boolean,
    allowClear: {
      type: Boolean,
      default: true
    },
    width: {
      // 组件宽度
      type: String,
      default: ''
    },
    disabledDate: {}, // 不可用的日期
    value: null
  },
  data() {
    return {
      showClose: false,
      sOpen: false,
      placements,
      date: new Date(),
      quarterText: ['一', '二', '三', '四']
    };
  },
  computed: {
    clearable() {
      return this.allowClear && this.displayValue;
    },
    displayValue() {
      if (!this.value) {
        return null;
      }
      // 季度，从0开始
      const quarter = parseInt(this.parsedValue.getMonth() / 3);
      let fDate = formatDate(this.parsedValue, this.format);
      fDate = fDate.replace(/q/, quarter + 1).replace(/Q/, this.quarterText[quarter]);
      return fDate;
    },
    year() {
      return this.date.getFullYear();
    },
    yearLabel() {
      return `${this.year} 年`;
    },
    parsedValue() {
      if (!this.value) {
        return this.value;
      }
      if (isDateObject(this.value)) {
        return this.value;
      }
      // 非时间格式且设置了valueFormat，进行时间转换
      if (this.valueFormat) {
        return parseDate(this.value, this.valueFormat);
      }
      // 非时间格式且未设置valueFormat，再尝试转换时间
      return new Date(this.value);
    }
  },
  watch: {
    value(value) {
      this.date = value ? this.parsedValue : new Date();
    },

    sOpen(open) {
      if (open) {
        this.focusCalendar();
      }
    }
  },
  methods: {
    setOpen(open, callback) {
      if (this.sOpen !== open) {
      }
    },
    openCalendar(callback) {
      this.setOpen(true, callback);
    },
    closeCalendar(callback) {
      this.setOpen(false, callback);
    },
    focus() {
      if (!this.sOpen) {
        this.$el.focus();
      }
    },
    focusCalendar() {
      setTimeout(() => {
        this.$refs.calendarInput.focus();
      }, 100);
    },
    onVisibleChange(open) {
      this.sOpen = open;
    },
    handleMouseEnter() {
      if (this.disabled) {
        return;
      }
      if (this.value && this.clearable) {
        this.showClose = true;
      }
    },
    handleClickIcon(event) {
      if (this.disabled) {
        return;
      }
      if (this.showClose) {
        this.$emit('input', null);
        this.$emit('change', null);
        this.showClose = false;
        this.sOpen = false;
        this.$refs.reference?.blur();
      }
    },
    handleMousedownIcon(event) {
      // 阻止鼠标按下清空按钮，防止清空数据时季度选择面板闪现
      event.preventDefault();
    },
    handleTableClick(event) {
      let target = event.target;
      if (target.tagName === 'A') {
        target = target.parentNode;
      }

      if (target.tagName !== 'TD') {
        return;
      }
      if (hasClass(target, 'disabled')) {
        return;
      }
      const column = target.cellIndex;
      const row = target.parentNode.rowIndex;
      // 季度，从0开始
      const quarter = row * 2 + column;
      // 季度开始月份，从0开始
      const month = quarter * 3;
      let newDate = new Date(this.year, month, 1);
      newDate = moment(newDate);
      if (this.valueFormat) {
        newDate = formatDate(newDate, this.valueFormat);
      }
      this.sOpen = false;
      this.$emit('input', newDate);
      this.$emit('change', newDate);
    },
    prevYear() {
      this.date = prevYear(this.date);
    },
    nextYear() {
      this.date = nextYear(this.date);
    },
    getCellStyle(quarter) {
      const style = {};
      const today = new Date();
      const date = this.parsedValue ? this.parsedValue : today;
      style.disabled =
        typeof this.disabledDate === 'function'
          ? datesInYearAndQuarter(this.year, quarter).every(this.disabledDate)
          : false;
      // 当前选中的季度样式
      style.current = date.getFullYear() === this.year && parseInt(date.getMonth() / 3) === quarter;
      // 今日所在季度样式
      style.quarter =
        today.getFullYear() === this.year && parseInt(today.getMonth() / 3) === quarter;
      return style;
    }
  }
};
</script>

<style>
.wpg-quarter-picker {
  line-height: 30px;
}

.wpg-quarter-popover {
  padding: 0;
}

.wpg-quarter-table {
  width: 100%;
  margin: -1px;
  font-size: 12px;
  border-collapse: collapse;
}

.wpg-quarter-table td {
  padding: 16px 3px;
  text-align: center;
  cursor: pointer;
}

.wpg-quarter-table td .cell {
  display: block;
  width: 70px;
  height: 26px;
  margin: 0 auto;
  line-height: 26px;
  color: #868e96;
  border-radius: 2px;
}

.wpg-quarter-table td .cell:hover {
  color: #4285f4;
  background: #f1f6fd;
}

.wpg-quarter-table td.current:not(.disabled) .cell {
  color: #fff;
  background: #4285f4;
}

.wpg-quarter-table td.quarter .cell {
  /* color: #409eff; */

  /* font-weight: 700; */
}

.wpg-quarter-table td.disabled .cell {
  color: #495057;
  cursor: not-allowed;
  background: #1b2027;
}
</style>
