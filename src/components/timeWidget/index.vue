<template>
  <div v-if="visible" class="timeWidget">
    <div
      v-if="timeTypeVisible || hasRange"
      :class="['timeWidget-row', { 'st-half': timeTypes.length <= 2 }]"
    >
      <w-radio-group v-if="timeTypeVisible" v-model="curTimeType" size="small" button-style="solid">
        <w-radio-button v-for="item in timeTypes" :key="item.value" :value="item.value">{{
          item.label
        }}</w-radio-button>
      </w-radio-group>
      <w-select v-if="hasRange" v-model="curSelectType" size="small" :options="selectOptions" />
    </div>
    <div class="timeWidget-row">
      <w-date-picker
        v-if="curTimeType === 'd'"
        v-model="startDate"
        size="small"
        :placeholder="genPlaceholder('s')"
      />
      <w-month-picker
        v-else-if="curTimeType === 'm'"
        v-model="startDate"
        size="small"
        :placeholder="genPlaceholder('s')"
      />
      <w-quarter-picker
        v-else-if="curTimeType === 'q'"
        v-model="startDate"
        size="small"
        format="yyyy第q季度"
        :placeholder="genPlaceholder('s')"
      />
      <w-year-picker
        v-else-if="curTimeType === 'y'"
        v-model="startDate"
        size="small"
        :placeholder="genPlaceholder('s')"
      />
      <template v-if="isRangeSelect">
        <span class="timeWidget-split">~</span>
        <w-date-picker
          v-if="curTimeType === 'd'"
          v-model="endDate"
          size="small"
          :placeholder="genPlaceholder('e')"
        />
        <w-month-picker
          v-else-if="curTimeType === 'm'"
          v-model="endDate"
          size="small"
          :placeholder="genPlaceholder('e')"
        />
        <w-quarter-picker
          v-else-if="curTimeType === 'q'"
          v-model="endDate"
          size="small"
          format="yyyy第q季度"
          :placeholder="genPlaceholder('e')"
        />
        <w-year-picker
          v-else-if="curTimeType === 'y'"
          v-model="endDate"
          size="small"
          :placeholder="genPlaceholder('e')"
        />
      </template>
    </div>
  </div>
</template>

<script>
import moment from 'moment';
import { timeWidgetTypes } from '@/enum';
import WQuarterPicker from '@/components/quarter-picker/index.vue';

export default {
  name: 'TimeWidget',
  components: { WQuarterPicker },
  props: {
    types: {
      type: Array,
      default: () => ['d', 'm', 'q', 'y'],
    },
    hasRange: {
      type: Boolean,
      default: false,
    },
    value: Object,
  },
  data() {
    return {
      selectOptions: [
        { label: '指定选', value: 1 },
        { label: '范围选', value: 2 },
      ],
      curTimeType: undefined,
      curSelectType: 1,
      startDate: null,
      endDate: null,
    };
  },
  computed: {
    timeTypes() {
      return this.types
        .filter((v) => timeWidgetTypes[v])
        .map((v) => ({ label: timeWidgetTypes[v], value: v }));
    },
    visible() {
      return this.timeTypes.length > 0;
    },
    timeTypeVisible() {
      return this.timeTypes.length > 1 || this.hasRange;
    },
    isRangeSelect() {
      return this.curSelectType === 2;
    },
  },
  watch: {
    value: {
      immediate: true,
      handler: 'initData',
    },
    types: 'initFrame',
    hasRange: 'initFrame',
    curTimeType: 'updateDate',
    curSelectType: 'updateDate',
    startDate: 'updateDate',
    endDate: 'updateDate',
  },
  methods: {
    /**
     * @description: 初始化界面
     * @return {*}
     */
    initFrame() {
      this.curTimeType = this.timeTypes?.[0]?.value;
      this.curSelectType = 1;
      this.startDate = null;
      this.endDate = null;
    },

    /**
     * @description: 初始化数据
     * @return {*}
     */
    initData() {
      const { timeType, isRange, value } = this.value || {};
      this.curTimeType = timeType ?? this.timeTypes[0]?.value;
      this.curSelectType = isRange ? 2 : 1;
      if (this.isRangeSelect) {
        this.startDate = value?.[0] ?? null;
        this.endDate = value?.[1] ?? null;
      } else {
        this.startDate = value ?? null;
      }

      // if (this.visible) {
      //   this.updateDate();
      // }
    },

    /**
     * @description: 生成提示
     * @param {*} type
     * @return {*}
     */
    genPlaceholder(type) {
      if (type === 's') {
        return this.isRangeSelect ? '开始日期' : '请选择日期';
      }
      return '结束日期';
    },

    /**
     * @description: 更新日期
     * @return {*}
     */
    updateDate() {
      let date = {
        timeType: this.curTimeType,
        isRange: this.isRangeSelect,
        value: null,
      };

      if (!this.isRangeSelect) {
        date.value = this.startDate;
      } else {
        date.value = [this.startDate, this.endDate];
      }

      date.format = this.dateFormat(date);

      this.$emit('input', date);
      this.$emit('change', date);
    },

    /**
     * @description: 日期格式化
     * @param {*} timeType
     * @param {*} isRange
     * @param {*} value
     * @return {*}
     */
    dateFormat({ timeType, isRange, value }) {
      // 范围选时如果只选了一个，相当于指定选
      const val = isRange
        ? [value[0] || value[1]?.clone(), value[1] || value[0]?.clone()]
        : [value, value?.clone()];
      const arr = val.map((date, i) => {
        if (date && moment.isMoment(date)) {
          switch (timeType) {
            case 'd':
              return date.format('YYYYMMDD');
            case 'm':
              return date.format('YYYYMM');
            case 'q':
              return date[i ? 'endOf' : 'startOf']('quarter').format('YYYYMM');
            case 'y':
              return date.format('YYYY');
            default:
              return null;
          }
        }
        return null;
      });
      return arr;
    },
  },
};
</script>

<style lang="less" scoped>
.timeWidget {
  &-row {
    display: flex;
    gap: 10px;

    &:first-of-type {
      margin-bottom: 4px;
    }

    &:last-of-type {
      margin-bottom: 0;
    }

    &.st-half {
      .wpg-select {
        flex: 1;
      }
    }
  }

  &-split {
    display: inline-block;
    line-height: 28px;
  }
}

.wpg-radio {
  &-group {
    display: flex;
    flex: 1;
    font-size: 12px;
  }

  &-button-wrapper {
    flex: 1;
    text-align: center;
  }
}

.wpg-select {
  min-width: 80px;
  font-size: 12px;
}

:deep(.wpg-calendar-picker) {
  flex: 1;

  &-input,
  &-icon {
    font-size: 12px !important;
  }
}
</style>
