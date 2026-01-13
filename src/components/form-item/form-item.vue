<template>
  <w-form-model-item
    :ref="field.name"
    :prop="field.name"
    :rules="field.rules"
    :required="field.required"
    :label-col="field.labelCol"
    :wrapper-col="field.wrapperCol"
    :label="field.label"
    :colon="field.colon"
    :autoLink="true"
    :class="{ 'label-auto': labelAuto }"
  >
    <slot :name="field.name" :field="field" :form="form" :type="type">
      <div :class="[field.disabled && field.disabledMsg ? 'disable-msg' : '']">
        <p v-if="field.type === 'text' || type === types.INFO" :title="hideTitle" class="text-field ellipsis">
          {{ form[field.name] || '--' }}
        </p>
        <component
          :is="`w-` + field.type"
          v-else
          v-model.trim="form[field.name]"
          :class="field.class"
          :placeholder="field.placeholder || field.label"
          :options="(field.extraOption || []).concat(field.options)"
          :disabled="disabled ? true : type === types.INFO ? true : field.disabled"
          v-bind="field.attrs"
          v-on="field.listeners"
          @blur="
            () => {
              $refs[field.name].onFieldBlur();
            }
          "
          @change="
            () => {
              $refs[field.name].onFieldChange();
            }
          "
        >
          <!-- eslint-disable vue/valid-v-for-->
          {{ field }}
          <template v-for="opt in field.extraOption">
            <w-select-option :key="getUUid()" v-if="field.type === 'select'" :value="opt.value" :title="opt.label" :disabled="opt.disabled || false">
              {{ opt.label }}
            </w-select-option>
          </template>
          <template v-for="opt in field.options">
            <w-select-option :key="getUUid()" v-if="field.type === 'select'" :value="opt.value" :title="opt.label" :disabled="opt.disabled || false">
              {{ opt.label }}
            </w-select-option>
          </template>
          <template v-if="field.type === 'radio-group' && field.attrs && field.attrs.type === 'button'">
            <w-radio-button v-for="opt in field.options" :key="getUUid()" :value="opt.value" :name="opt.label">
              {{ opt.label }}
            </w-radio-button>
          </template>
        </component>
      </div>
    </slot>
  </w-form-model-item>
</template>
<script>
import { types } from './config';
import { v4 as uuidV4 } from 'uuid';

export default {
  name: 'InfoFormItem',
  inheritAttrs: false,
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    labelAuto: {
      type: Boolean,
      default: false
    },
    field: {
      type: Object,
      required: true,
      validator: val => {
        if (val.name === undefined || val.type === undefined) {
          return false;
        }
        return true;
      }
    },
    form: {
      type: Object,
      default: () => ({})
    },
    type: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      types
    };
  },

  computed: {
    options() {
      const { dict } = this.field;
      if (dict) {
        /**
         * 先从 dict 取, 不存在则从 vuex 中获取, 最后是 options
         */
        return (this.$dict?.dictList || {})[dict] || this.$store.getters?.[dict];
      }
      return [];
    },
    // 处理是否显示文字提示
    hideTitle() {
      let title = '';
      if (this.field?.hideTitle) {
        title = '';
      } else {
        title = this.form[this.field.name];
      }
      return title;
    }
  },

  watch: {
    options() {
      this.handleOptions();
    }
  },
  beforeCreate() {
    this.getUUid = uuidV4;
  },
  created() {
    this.handleOptions();
  },
  methods: {
    handleOptions() {
      const dict = this.field.dict;
      if (dict) {
        this.field.options = this.options;
        this.field.attrs = {
          ...this.field.attrs,
          treeData: (this.field.extraOption || []).concat(this.options)
        };
      }
    }
  }
};
</script>

<style lang="less" scoped>
.wpg-form-item {
  font-size: 14px;

  /deep/ .wpg-radio-group {
    font-size: 14px;

    span {
      font-size: 14px;
    }
  }

  /deep/ .wpg-form-explain {
    /* 避免破坏布局 */
    position: absolute;
    white-space: nowrap;
  }

  .text-field {
    max-width: 100%;
  }
  // label先定为80 输入框占剩余宽度
  &.label-auto {
    display: flex;

    /deep/ .wpg-form-item-label {
      flex-basis: 80px;
      // width: fit-content;
    }

    /deep/ .wpg-form-item-control-wrapper {
      flex: 1;
    }
  }
}

/deep/.wpg-input-number,
.wpg-calendar-picker,
.wpg-time-picker,
.wpg-select {
  width: 100%;
}

.ellipsis {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
