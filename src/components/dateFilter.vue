<template>
  <div v-if="fullOptions" class="dateFilter">
    <!-- 日期快速选择 -->
    <w-radio-group v-if="fastTypes && fastTypes.length" v-model="curFastType" button-style="solid">
      <w-radio-button v-for="f in fastTypes" :key="f.value" :value="f.value">{{
        f.label
      }}</w-radio-button>
    </w-radio-group>

    <!-- 日期筛选 -->
    <w-select
      v-if="filterTypes && filterTypes.length > 1"
      v-model="curFilterType"
      :options="filterTypes"
    />
    <!-- 日期单选 -->
    <template v-if="!checkRange(curOption.type)">
      <w-date-picker
        v-if="curOption.mode === 'day'"
        v-model="startDate"
        v-bind="curOption.attrs"
        :disabled-date="disabledDate"
      />
      <w-month-picker
        v-else-if="curOption.mode === 'month'"
        v-model="startDate"
        v-bind="curOption.attrs"
        :disabled-date="disabledDate"
      />
      <!-- <w-year-picker
        v-else-if="curOption.type === 'Y'"
        v-model="startDate"
        v-bind="curOption.attrs"
        :disabled-date="disabledDate"
      /> -->
    </template>
    <!-- 日期范围 -->
    <template v-else>
      <w-date-picker
        v-if="curOption.mode === 'day'"
        v-model="startDate"
        v-bind="curOption.attrs.start"
        :disabled-date="disabledStartDate"
      />
      <w-month-picker
        v-else-if="curOption.mode === 'month'"
        v-model="startDate"
        v-bind="curOption.attrs.start"
        :disabled-date="disabledStartDate"
      />
      <span class="dateFilter-split">~</span>
      <w-date-picker
        v-if="curOption.mode === 'day'"
        v-model="endDate"
        v-bind="curOption.attrs.end"
        :disabled-date="disabledEndDate"
      />
      <w-month-picker
        v-if="curOption.mode === 'month'"
        v-model="endDate"
        v-bind="curOption.attrs.end"
        :disabled-date="disabledEndDate"
      />
    </template>
  </div>
</template>

<script>
import moment from 'moment';

const GB = {
  genDefaultOptions() {
    return [
      {
        type: 'D',
        mode: 'day',
        label: '日',
        defaultValue: moment(),
        attrs: {
          format: 'YYYY-MM-DD',
          placeholder: '请选择日期',
        },
      },
      {
        type: 'PD',
        mode: 'day',
        label: '昨日',
        defaultValue: moment().subtract(1, 'day').endOf('day'),
        attrs: {
          format: 'YYYY-MM-DD',
          placeholder: '请选择日期',
        },
      },
      {
        type: 'M',
        mode: 'month',
        label: '月',
        defaultValue: moment(),
        attrs: {
          format: 'YYYY-MM',
          placeholder: '请选择月份',
        },
      },
      {
        type: 'PM',
        mode: 'month',
        label: '上月',
        defaultValue: moment().subtract(1, 'month').endOf('month'),
        attrs: {
          format: 'YYYY-MM',
          placeholder: '请选择月份',
        },
      },
      {
        type: 'Y',
        mode: 'year',
        label: '年',
        defaultValue: moment(),
        attrs: {
          format: 'YYYY',
          placeholder: '请选择年份',
        },
      },
      {
        type: 'PY',
        mode: 'year',
        label: '去年',
        defaultValue: moment().subtract(1, 'year').endOf('year'),
        attrs: {
          format: 'YYYY',
          placeholder: '请选择年份',
        },
      },
      {
        type: 'DR',
        mode: 'day',
        label: '日范围',
        defaultValue: [moment().startOf('month'), moment()],
        attrs: {
          format: 'YYYY-MM-DD',
          placeholder: ['开始日期', '结束日期'],
        },
      },
      {
        type: 'MR',
        mode: 'month',
        label: '月范围',
        defaultValue: [moment().startOf('year'), moment()],
        attrs: {
          format: 'YYYY-MM',
          placeholder: ['开始月份', '结束月份'],
        },
      },
    ];
  },
  genBasicOptions(type) {
    return (
      {
        range: {
          // 范围
          label: '日期',
          defaultValue: [moment(), moment()],
          attrs: {
            format: 'YYYY-MM-DD',
            placeholder: ['开始日期', '结束日期'],
          },
        },
        single: {
          // 单选
          label: '日期',
          defaultValue: moment(),
          attrs: {
            format: 'YYYY-MM-DD',
            placeholder: '请选择日期',
          },
        },
      }[type] || {}
    );
  },
};

export default {
  name: 'DateFilter',
  inheritAttrs: false,
  props: {
    options: {
      type: Array,
      default: () => [],
    },
    value: Object,
  },
  data() {
    return {
      fullOptions: null, // 完整配置
      filterTypes: [], // 筛选类型下拉选项
      curFilterType: undefined, // 当前筛选类型
      startDate: undefined, // 开始日期
      endDate: undefined, // 结束日期
      fastTypes: [], // 快速选择选项
      curFastType: undefined, // 当前快速选择类型
    };
  },
  computed: {
    curOption() {
      return (
        this.fullOptions?.find((v) => v.type === this.curFilterType && v.showType === 'complex') ||
        {}
      );
    },
    curFastOption() {
      return (
        this.fullOptions?.find((v) => v.type === this.curFastType && v.showType === 'fast') || {}
      );
    },
  },
  watch: {
    options() {
      this.initOptions();
    },
    curFilterType: 'initDate',
    value() {
      this.initFilterType();
    },
    startDate: 'handleChange',
    endDate: 'handleChange',
    curFastType: 'handleFastChange',
  },
  created() {
    this.initOptions();
  },
  methods: {
    /**
     * @description: 初始化配置
     * @return {*}
     */
    initOptions() {
      const defaultOptions = GB.genDefaultOptions();
      let _options = [];

      this.options.forEach((v) => {
        const isSimple = typeof v === 'string';

        const type = isSimple ? v : v.type;
        const showType = isSimple || !v.showType ? 'complex' : v.showType;
        let item = defaultOptions.find((_v) => _v.type === type);

        if (!item && this.checkProperty(v)) {
          const basicType = this.checkRange(v.type) ? 'range' : 'single';
          item = GB.genBasicOptions(basicType);
        }

        if (item && _options.every((_v) => _v.type !== type || _v.showType !== showType)) {
          // 配置合并
          item = isSimple ? item : { ...item, ...v, attrs: { ...item.attrs, ...v.attrs } };

          // 范围配置拆分
          if (this.checkRange(item.type)) {
            item.attrs = Object.entries(item.attrs).reduce(
              (s, [k, v]) => {
                const isArr = Array.isArray(v);
                s.start[k] = isArr ? v[0] : v;
                s.end[k] = isArr ? v[1] : v;
                return s;
              },
              { start: {}, end: {} }
            );
          }

          if (!item.showType) item.showType = showType;
          _options.push(item);
        }
      });

      if (_options.length) {
        this.fullOptions = _options;
        this.fastTypes = _options
          .filter((f) => f.showType === 'fast')
          .map((v) => ({ label: v.label, value: v.type }));
        this.filterTypes = _options
          .filter((f) => f.showType === 'complex')
          .map((v) => ({ label: v.label, value: v.type }));
      } else {
        this.fullOptions = null;
        this.filterTypes = [];
        this.fastTypes = [];
      }

      this.initFilterType();
    },

    /**
     * @description: 初始化筛选项
     * @return {*}
     */
    initFilterType() {
      if (this.fullOptions) {
        if (this.value && this.value.showType === 'fast') {
          this.curFastType = this.value.type;
          this.curFilterType = this.filterTypes[0]?.value ?? undefined;
        } else if (this.value && this.value.showType === 'complex') {
          this.curFilterType = this.value.type;
        } else {
          this.curFastType = this.fastTypes[0]?.value ?? undefined;
          this.curFilterType = this.filterTypes[0]?.value ?? undefined;
        }
      } else {
        this.curFilterType = undefined;
        this.curFastType = undefined;
      }
    },

    /**
     * @description: 初始化日期控件日期(日期控件与下拉筛选关联)
     * @return {*}
     */
    initDate() {
      if (this.curOption && !this.curFastType) {
        const { type, defaultValue } = this.curOption;
        if (this.checkRange(type)) {
          this.startDate = defaultValue[0];
          this.endDate = defaultValue[1];
        } else {
          this.startDate = defaultValue;
        }
      } else {
        this.startDate = undefined;
        this.endDate = undefined;
      }
    },

    /**
     * @description: 快速选择时间变化
     * @return {*}
     */
    handleFastChange() {
      if (this.curFastType) {
        const {
          defaultValue,
          mode,
          attrs: { format },
        } = this.curFastOption;
        const value = [defaultValue.clone().startOf(mode), defaultValue.clone()];
        const dateFormat = [value[0].format(format), value[1].format(format)];
        this.startDate = undefined;
        this.endDate = undefined;

        const data = {
          type: this.curFastType,
          showType: 'fast',
          value,
          format: dateFormat,
        };
        this.emitData(data);
      }
    },

    /**
     * @description: 处理日期控件时间变化
     * @return {*}
     */
    handleChange() {
      const isRange = this.checkRange(this.curFilterType);
      if ((isRange && this.startDate && this.endDate) || (!isRange && this.startDate)) {
        const { mode, attrs } = this.curOption;
        const format = attrs?.format || attrs?.start?.format || '';
        const value = isRange
          ? [this.startDate.clone().startOf(mode), this.endDate.clone()]
          : [this.startDate.clone().startOf(mode), this.startDate.clone()];
        const dateFormat = [value[0]?.format(format), value[1]?.format(format)];
        this.curFastType = undefined;

        const data = {
          type: this.curFilterType,
          showType: 'complex',
          value: value,
          format: dateFormat,
        };
        this.emitData(data);
      }
    },

    /**
     * @description: 数据派发
     * @param {*} data
     * @return {*}
     */
    emitData(data) {
      this.$emit('change', data);
      this.$emit('input', data);
    },

    /**
     * @description: 日期禁用
     * @return {*}
     */
    disabledDate(current) {
      const cb = () => current && current > moment().endOf(this.curOption.mode);
      return this.disabledDateHandler(cb, this.curOption.attrs.disabledDate, current);
    },

    disabledStartDate(current) {
      const cb = () => {
        const { mode } = this.curOption;
        return (
          current &&
          (current > moment().endOf(mode) ||
            (this.endDate && current >= this.endDate.clone().startOf(mode)))
        );
      };
      return this.disabledDateHandler(
        cb,
        this.curOption.attrs.start.disabledDate,
        current,
        'start',
        this.startDate,
        this.endDate
      );
    },

    disabledEndDate(current) {
      const cb = () => {
        const { mode } = this.curOption;
        return (
          current &&
          (current > moment().endOf(mode) ||
            (this.startDate && current <= this.startDate.clone().endOf(mode)))
        );
      };
      return this.disabledDateHandler(
        cb,
        this.curOption.attrs.end.disabledDate,
        current,
        'end',
        this.startDate,
        this.endDate
      );
    },

    disabledDateHandler(defaultCb, customCb, ...args) {
      return typeof customCb === 'function' ? customCb(...args) : defaultCb();
    },

    /**
     * @description: 检测是否范围选择
     * @param {*} type
     * @return {*}
     */
    checkRange(type) {
      return /R$/.test(type);
    },
    /**
     * @description: 判断是否为对象及具有type和mode属性
     * @param {*} type
     * @return {*}
     */
    checkProperty(obj) {
      return typeof obj === 'object' && obj.hasOwnProperty('type') && obj.hasOwnProperty('mode');
    },
  },
};
</script>

<style lang="less" scoped>
.dateFilter {
  display: inline-flex;

  :deep(.wpg-radio-group) {
    margin-right: 10px;
  }

  :deep(.wpg-select) {
    width: 120px;
    margin-right: 10px;
  }

  :deep(.wpg-calendar-picker) {
    width: 120px;
  }

  &-split {
    display: inline-block;
    padding: 0 6px;
    line-height: 36px;
  }
}
</style>
