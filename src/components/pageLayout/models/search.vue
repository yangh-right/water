<template>
  <v-space :size="getGutter()">
    <!-- 搜索项 -->
    <div v-for="field in fields" :key="field.fieldName" class="field">
      <!-- 标签 -->
      <span v-if="!isNil(field.label)" class="field-label">{{ field.label }}</span>
      <!-- 控件 -->
      <div class="field-item" :style="{ width: getFieldWidth(field) }">
        <!-- 文本输入框 -->
        <w-input
          v-if="field.fieldType === 'input'"
          v-model="formData[field.fieldName]"
          :placeholder="field.placeholder"
          :allow-clear="field.allowClear"
          v-bind="field.attrs"
          v-on="field.listeners"
        />
        <!-- 下拉选择框 -->
        <w-select
          v-else-if="field.fieldType === 'select'"
          v-model="formData[field.fieldName]"
          :options="field.options"
          :placeholder="field.placeholder"
          :allow-clear="field.allowClear"
          v-bind="field.attrs"
          v-on="field.listeners"
        />
        <!-- 树选择 -->
        <w-tree-select
          v-else-if="field.fieldType === 'treeSelect'"
          v-model="formData[field.fieldName]"
          dropdown-class-name="search-tree-select"
          :tree-data="field.treeData"
          :placeholder="field.placeholder"
          :allow-clear="field.allowClear"
          v-bind="field.attrs"
          v-on="field.listeners"
        />
        <!-- 多选树选择器 -->
        <xsc
          v-else-if="field.fieldType === 'xsc'"
          v-model="formData[field.fieldName]"
          :tree-data="field.treeData"
          :placeholder="field.placeholder"
          :allow-clear="field.allowClear"
          v-bind="field.attrs"
          v-on="field.listeners"
        />
        <!-- 级联选择器 -->
        <w-cascader
          v-else-if="field.fieldType === 'cascader'"
          v-model="formData[field.fieldName]"
          :options="field.options"
          :placeholder="field.placeholder"
          :allow-clear="field.allowClear"
          v-bind="field.attrs"
          v-on="field.listeners"
        />
        <!-- 年选择器 -->
        <w-year-picker
          v-else-if="field.fieldType === 'yearPicker'"
          v-model="formData[field.fieldName]"
          :placeholder="field.placeholder"
          :allow-clear="field.allowClear"
          v-bind="field.attrs"
          v-on="field.listeners"
        />
        <!-- 日期范围 -->
        <w-range-picker
          v-else-if="field.fieldType === 'rangePicker'"
          v-model="formData[field.fieldName]"
          :placeholder="field.placeholder"
          :allow-clear="field.allowClear"
          v-bind="field.attrs"
          v-on="field.listeners"
        />
        <!-- 日期筛选 -->
        <date-filter
          v-else-if="field.fieldType === 'dateFilter'"
          v-bind="field.attrs"
          v-model="formData[field.fieldName]"
          :placeholder="field.placeholder"
          :allow-clear="field.allowClear"
          v-on="field.listeners"
        />
      </div>
    </div>
    <!-- 搜索按钮 -->
    <v-space v-if="!global.searchHidden">
      <w-button type="primary" @click="handleSearch"><w-icon type="ic_search" />查询</w-button>
      <w-button @click="handleReset"><w-icon type="ic_find_replace" />重置</w-button>
    </v-space>
  </v-space>
</template>

<script>
import moment from 'moment';
import { isNil, isNumber, cloneDeep, debounce } from 'lodash-es';

const GB = {
  defaultPlaceholder: {
    input: '请输入',
    select: '请选择',
    treeSelect: '请选择',
    xsc: '请选择',
    cascader: '请选择',
  },
  defaultFieldWidth: 180,
};

export default {
  name: 'Search',
  components: {
    DateFilter: () => import('@/components/dateFilter.vue'),
    Xsc: () => import('@/components/CustomForm/xsc.vue'),
  },
  props: {
    options: Object,
  },
  data() {
    return {
      isNil,
      formData: {},
      handleEmitDebounce: debounce(this.handleEmit, 200),
    };
  },
  computed: {
    global() {
      return this.options?.global ?? {};
    },
    fields() {
      let fields = this.options?.fields ?? [];
      fields = cloneDeep(fields);

      fields.forEach((v) => {
        // 设置默认提示语
        if (isNil(v.placeholder)) {
          v.placeholder = GB.defaultPlaceholder[v.fieldType];
        }
        // 设置允许清除（默认应都支持清除，除非指定不清除）
        v.allowClear = isNil(v.allowClear) ? true : v.allowClear;

        // 年选择器：禁用未来设置
        if (v.fieldType === 'yearPicker') {
          if (v.disableFuture) {
            v.attrs = v.attrs || {};
            v.attrs.disabledDate = this.disabledYear;
          }
        }
      });

      return fields;
    },
  },
  watch: {
    fields: {
      immediate: true,
      handler: 'initFormData',
    },
    formData: {
      immediate: true,
      deep: true,
      handler: 'handleFormDataChange',
    },
  },
  methods: {
    /**
     * @description: 初始化表单数据
     * @return {*}
     */
    initFormData() {
      this.formData = this.fields.reduce((s, a) => {
        s[a.fieldName] = a.initialValue;
        return s;
      }, {});
    },

    /**
     * @description: 获取搜索项间隔
     * @return {*}
     */
    getGutter() {
      return this.global.gutter ?? 'middle';
    },

    /**
     * @description: 获取控件宽度
     * @param {*} field
     * @return {*}
     */
    getFieldWidth(field) {
      const fieldWidth = field.layout?.fieldWidth ?? this.global.fieldWidth ?? GB.defaultFieldWidth;
      return isNumber(fieldWidth) ? fieldWidth + 'px' : fieldWidth;
    },

    /**
     * @description: 处理查询
     * @return {*}
     */
    handleSearch() {
      this.handleEmitDebounce();
    },

    /**
     * @description: 处理重置
     * @return {*}
     */
    handleReset() {
      this.initFormData();
      // 非自动模式下手动派发
      if (!this.global.autoMode) {
        this.handleEmitDebounce();
      }
    },

    /**
     * @description: 处理表单数据变动
     * @return {*}
     */
    handleFormDataChange() {
      // 自动模式数据变动自动派发
      if (this.global.autoMode) {
        this.handleEmitDebounce();
      }
    },

    /**
     * @description: 数据派发
     * @return {*}
     */
    handleEmit() {
      this.$emit('filter:submit', this.formData);
    },

    /**
     * @description: 禁用年
     * @return {*}
     */
    disabledYear(current) {
      return current && current > moment().endOf('year');
    },
  },
};
</script>

<style lang="less" scoped>
.field {
  display: flex;
  align-items: center;

  &-label {
    margin-right: 8px;
    color: var(--mft-1-cls);
    white-space: nowrap;
  }
}

:deep(.wpg-select) {
  width: 100%;

  &-selection.wpg-select-selection--multiple {
    display: flex;
    height: 36px;
    overflow: auto;
  }
}

.wpg-cascader-picker {
  width: 100%;
}
</style>

<style lang="less">
.search-tree-select {
  span.wpg-select-tree-node-selected,
  span.wpg-select-tree-treenode-selected {
    background-color: var(--mbg-22-cls);
  }
}
</style>
