`<!--
 * @Description: 历史数据的搜索条件组件
 * @version:
 * @Author: liuct
 * @Date: 2021-07-14 15:10:52
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2022-06-21 10:34:42
-->
<template>
  <w-form-model :model="form" class="query-form">
    <w-form-model-item v-if="periodTime" label="时段">
      <w-select v-model="form.type" @change="changeType">
        <w-select-option v-for="item in typeList" :key="item.value" :value="item.value">
          {{ item.label }}
        </w-select-option>
      </w-select>
    </w-form-model-item>

    <w-form-model-item>
      <w-radio-group v-model="form.interval" @change="changeInter">
        <slot name="radio" :type="form.type"></slot>
        <w-radio-button v-for="item in intervals" :key="item.value" :value="item.value">
          {{ item.label }}
        </w-radio-button>
      </w-radio-group>
    </w-form-model-item>

    <template v-if="form.type === '0'">
      <w-form-model-item class="range-box" v-if="form.interval === ''">
        <w-range-picker
          v-model="form.date"
          :show-time="{ format: 'HH:mm' }"
          format="YYYY-MM-DD HH:mm"
          @change="changeSearch"
        />
      </w-form-model-item>
    </template>

    <template v-if="form.type === '1'">
      <w-form-model-item v-for="(item, index) in dateList" :key="index">
        <div
          class="date-con"
          @mouseenter="item.showClear = true"
          @mouseleave="item.showClear = false"
        >
          <w-date-picker
            v-show="form.interval === '1'"
            v-model="item.date"
            :allowClear="false"
            @change="changeSearch"
          />
          <w-month-picker
            v-show="form.interval === '2'"
            v-model="item.date"
            :allowClear="false"
            @change="changeSearch"
          />
          <w-icon v-show="item.showClear" type="ic_close" @click="clearDate(index)"></w-icon>
          <span v-if="index !== 4" class="text">与</span>
        </div>
      </w-form-model-item>
      <w-form-model-item>
        <w-icon
          type="plus"
          v-show="
            (dayList.length < 5 && form.interval === '1') ||
              (monthList.length < 5 && form.interval === '2')
          "
          @click="addTimeSelect"
        ></w-icon>
        <w-tooltip>
          <template slot="title">
            最多可添加5个日期
          </template>
          <w-icon type="ic_error_outline" class="supply-mx-2"></w-icon>
        </w-tooltip>
      </w-form-model-item>
    </template>
    <w-form-model-item v-if="form.type === '0' && form.interval !== 'alarm'" label="间隔">
      <w-select v-model="form.space" @change="changeInterval">
        <w-select-option v-for="item in spaces" :key="item.value" :value="item.value">
          {{ item.label }}
        </w-select-option>
      </w-select>
    </w-form-model-item>
    <slot></slot>
    <w-form-model-item class="reset-btn" v-if="showReset">
      <w-button type="primary" @click="reset">
        重置
      </w-button>
    </w-form-model-item>
  </w-form-model>
</template>

<script>
import { intervals0, intervals1, spaces0, spaces1, typeList } from './data';
export default {
  name: 'Search',
  props: {
    itemConfig: {
      default: () => {},
      type: Object
    },
    showReset: {
      default: false,
      type: Boolean
    },
    periodTime: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      intervals: intervals0,
      spaces: spaces0,
      typeList,
      form: {
        type: '0',
        interval: '1hours', // 时段
        space: '1', // 间隔
        date: [this.$moment().subtract(1, 'hours'), this.$moment()]
      },
      dayList: [{ date: this.$moment(), showClear: false }],
      monthList: [{ date: this.$moment(), showClear: false }]
    };
  },
  computed: {
    dateList() {
      return this.form.interval === '1' ? this.dayList : this.monthList;
    }
  },
  methods: {
    reset() {
      this.form = {
        type: '0',
        interval: '1hours', // 时段
        space: '1', // 间隔
        date: [this.$moment().subtract(1, 'hours'), this.$moment()]
      };
      this.changeSearch(false);
      this.$emit('reset');
    },
    changeType(type) {
      this.spaces = type === '0' ? spaces0 : spaces1;
      this.intervals = type === '0' ? intervals0 : intervals1;
      this.form.space = this.spaces[0].value;
      this.form.interval = this.intervals[0].value;
      this.$emit('changeType', type);
      this.changeSearch();
    },

    changeInter() {
      if (this.form.type === '0') {
        if (this.form.interval === '1hours' || this.form.interval === '') {
          this.form.space = this.spaces[0].value;
        } else if (this.form.interval === '24hours') {
          this.form.space = this.spaces[1].value;
        } else {
          this.form.space = this.spaces[4].value;
        }
      } else {
        this.form.space = this.spaces[0].value;
      }

      this.changeSearch();
    },
    changeInterval() {
      const params = { dates: [], period: '', timeEnum: '' };
      const [{ value, timeEnum }] = this.spaces.filter(item => item.value === this.form.space);
      params.period = value;
      params.timeEnum = timeEnum;
      // 单时段
      if (this.form.interval === '') {
        // 自定义初始化为当天时间
        let startTime = this.form.date[0].format('YYYY-MM-DD HH:mm:ss');
        let endTime = this.form.date[1].format('YYYY-MM-DD HH:mm:ss');
        if (startTime === endTime) {
          startTime = this.form.date[0].format('YYYY-MM-DD') + ' 00:00:00';
          endTime = this.form.date[1].format('YYYY-MM-DD') + ' 23:59:59';
        }
        params.dates.push({ startTime, endTime });
      } else {
        const [{ type, space }] = this.intervals.filter(item => item.value === this.form.interval);
        params.dates.push({
          startTime: this.$moment()
            .subtract(space, type)
            .format('YYYY-MM-DD HH:mm:ss'),
          endTime: this.$moment().format('YYYY-MM-DD HH:mm:ss')
        });
      }
      this.$emit('search', params);
    },

    addTimeSelect() {
      const maxNum = 5;
      // 判断当前类型是日还是月
      if (this.form.interval === '1') {
        // 添加的这个的日期则为上一个日期的前一天
        const len = this.dayList.length;
        if (len < maxNum) {
          const date = this.dateList[len - 1].date.format('YYYY-MM-DD');
          this.dayList.push({
            date: this.$moment(date).subtract(1, 'day'),
            showClear: false
          });
        }
      } else {
        const len = this.monthList.length;
        if (len < maxNum) {
          const date = this.dateList[len - 1].date.format('YYYY-MM-DD');
          this.monthList.push({
            date: this.$moment(date).subtract(1, 'months'),
            showClear: false
          });
        }
      }
      this.changeSearch();
    },

    clearDate(index) {
      if (this.form.interval === '1') {
        if (this.dayList.length > 1) {
          this.dayList.splice(index, 1);
          this.changeSearch();
        } else {
          this.$message.error('这已经是最后一个，不能再删除了');
        }
      } else {
        if (this.monthList.length > 1) {
          this.monthList.splice(index, 1);
          this.changeSearch();
        } else {
          this.$message.error('这已经是最后一个，不能再删除了');
        }
      }
    },

    changeSearch(query = true) {
      const params = { dates: [], period: '', timeEnum: '' };
      if (this.form.type === this.typeList[0].value) {
        // 单时段
        if (this.form.interval === '') {
          // 自定义初始化为当天时间
          let startTime = this.form.date[0].format('YYYY-MM-DD HH:mm:ss');
          let endTime = this.form.date[1].format('YYYY-MM-DD HH:mm:ss');
          if (startTime === endTime) {
            startTime = this.form.date[0].format('YYYY-MM-DD') + ' 00:00:00';
            endTime = this.form.date[1].format('YYYY-MM-DD') + ' 23:59:59';
          }
          let days = this.form.date[1].diff(this.form.date[0], 'day');
          if (days > 1) {
            params.period = 1;
            params.timeEnum = 'HOURS';
            this.form.space = this.spaces[4].value;
          } else if (days == 1) {
            params.period = 5;
            params.timeEnum = 'MINUTES';
            this.form.space = this.spaces[1].value;
          } else {
            params.period = 1;
            params.timeEnum = 'MINUTES';
            this.form.space = this.spaces[0].value;
          }
          params.dates.push({ startTime, endTime });
        } else {
          const [{ type, space }] = this.intervals.filter(
            item => item.value === this.form.interval
          );
          params.dates.push({
            startTime: this.$moment()
              .subtract(space, type)
              .format('YYYY-MM-DD HH:mm:ss'),
            endTime: this.$moment().format('YYYY-MM-DD HH:mm:ss')
          });
        }
        if (this.form.interval === '1hours' || this.form.interval === '24hours') {
          const [{ value, timeEnum }] = this.spaces.filter(item => item.value === this.form.space);
          params.period = value;
          params.timeEnum = timeEnum;
        } else if (this.form.interval === '3days') {
          params.period = 1;
          params.timeEnum = 'HOURS';
        } else if (this.form.interval === '7days') {
          params.period = 1;
          params.timeEnum = 'HOURS';
        }
      } else {
        // 多时段
        const dates = this.dateList.map(d => {
          const item = { startTime: '', endTime: '' };
          if (this.form.interval === intervals1[0].value) {
            item.startTime = d.date.format('YYYY-MM-DD') + ' 00:00:00';
            item.endTime = d.date.format('YYYY-MM-DD') + ' 23:59:59';
            params.timeEnum = 'HOURS';
          } else {
            item.startTime = d.date.format('YYYY-MM') + '-01 00:00:00';
            item.endTime = d.date.endOf('month').format('YYYY-MM-DD') + ' 23:59:59';
            params.timeEnum = 'DAYS';
          }
          return item;
        });
        params.dates = dates;
        params.period = 1;
      }
      if (query) {
        this.$emit('search', params);
      }
    }
  }
};
</script>

<style lang="less" scoped>
.query-form {
  height: 80px;
  padding: 0 12px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;

  .wpg-form-item {
    display: flex;
    margin: 0;
    padding: 0 12px 0 0;
  }

  .wpg-form-item-label {
    margin-right: 8px;
  }

  .reset-btn {
    margin-bottom: 2px;
  }
  .icon-add {
    border: 1px solid #ccc;
    padding: 4px;
    border-radius: 4px;
    margin: 0 8px 0;
    cursor: pointer;
  }

  .icon {
    position: relative;
    font-size: 18px;
    &:hover {
      color: #4285f4;
    }
  }

  .date-con {
    position: relative;

    .icon {
      position: absolute;
      font-size: 16px;
      border-radius: 55%;
      background: #666;
      color: #fff;
      top: -4px;
      right: 17px;
      cursor: pointer;
    }

    .wpg-calendar-picker {
      width: 136px;
    }

    .text {
      font-size: 12px;
      color: #999999;
      margin-left: 8px;
    }
  }
}
.range-box {
  /deep/ .wpg-input {
    min-width: 356px !important;
    padding: 8px 2px;
  }
}
</style>
