<template>
  <div class="form-wrapper">
    <w-form-model ref="form" :model="form" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }">
      <slot name="prev" :form="form" />
      <template v-for="(item, idx) in form.domains">
        <w-row :key="item.key + '-' + idx" :gutter="[12]">
          <w-col :span="7">
            <w-form-model-item
              :ref="`${form.domains[idx].key}-name`"
              :prop="`domains[${idx}].name`"
              label="指标名称"
              :rules="[
                {
                  required: true,
                  message: '不能为空!'
                }
              ]"
            >
              <w-input :max-length="32" v-model="item.name" placeholder="指标名称"></w-input>
            </w-form-model-item>
          </w-col>
          <w-col :span="7">
            <w-form-model-item :ref="`${form.domains[idx].key}-unit`" :prop="`domains[${idx}].unit`" label="指标单位">
              <w-input :max-length="32" v-model="item.unit" placeholder="指标单位"></w-input>
            </w-form-model-item>
          </w-col>
          <slot name="extra" :item="item" :idx="idx" />
          <w-col :span="3">
            <w-form-model-item :wrapper-col="{ span: 24 }">
              <w-button
                v-if="form.domains.length > 1"
                type="link"
                size="small"
                icon="delete"
                class="wfc-alarm remove-button"
                @click="handleRemoveField(idx, item)"
              >
                删除
              </w-button>
              <w-button
                v-if="form.domains.length === idx + 1"
                type="link"
                size="small"
                icon="plus"
                class="add-button"
                @click="handleAddField"
              >
                添加
              </w-button>
            </w-form-model-item>
          </w-col>
        </w-row>
      </template>
      <slot />
    </w-form-model>
    <div class="footer">
      <w-button type="primary" :loading="loading" @click="handleSubmit">提交</w-button>
    </div>
  </div>
</template>

<script>
import CommonMixin from '../mixins/common-mixin';

const defaultData = {
  message: '配置编码不能为空!',
  label: '配置编码',
  placeholder: '选择配置编码'
};
export default {
  name: 'index-unit',
  mixins: [CommonMixin],
  inheritAttrs: false,
  props: {
    waterPlantId: {
      type: String
    },
    form: {
      type: Object
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      configData: defaultData,
      modelList: [],
      deviceList: [],
      // 记录对应deviceId下的point
      pointMap: {}
    };
  },
  watch: {
    waterPlantId: {
      handler(val) {
        if (val) {
          this.initForm();
        }
      },
      immediate: true
    }
  },
  activated() {
    this.initForm();
  },
  mounted() {
    this.initForm();
  },
  methods: {
    initForm() {
      if (this.form.domains.length) {
        console.log(this.form);
      } else {
        this.handleAddField();
      }
    },

    handleRemoveField(idx) {
      this.form.domains.splice(idx, 1);
    },
    // 新增字段
    handleAddField() {
      this.form.domains.push({
        key: Date.now(),
        name: undefined,
        unit: undefined
      });
    },
    handleSubmit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.$emit('submit', this.form.domains.slice(0));
        }
      });
    }
  }
};
</script>

<style lang="less" scoped>
.form-wrapper {
  .footer {
    flex: 0 0 54px;
    text-align: right;
    padding: 0 24px;
    margin-top: 24px;
  }
}
</style>
