<!--
  @author: zhangxiang
  @date: 2021-08-27 17:53:26
  @desc：构筑物
-->
<template>
  <div class="form-wrapper">
    <w-form-model ref="form" :model="form" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }">
      <slot name="prev" :form="form" />
      <template v-for="(item, idx) in form.domains">
        <w-row :key="item.key + '-' + idx" :gutter="[12]">
          <w-col :span="7">
            <w-form-model-item
              :ref="`${form.domains[idx].key}-theme`"
              required
              label="主题选择"
              :prop="`domains[${idx}].theme`"
              :rules="{
                required: true,
                message: '主题不能为空!',
                trigger: 'change'
              }"
            >
              <w-info-select
                v-model="item.theme"
                :options="themes"
                placeholder="选择主题"
                :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
              />
            </w-form-model-item>
          </w-col>
          <w-col :span="7">
            <w-form-model-item
              :ref="`${form.domains[idx].key}-placeId`"
              required
              label="构筑物选择"
              :prop="`domains[${idx}].placeId`"
              :rules="{
                required: true,
                message: '构筑物不能为空!',
                trigger: 'change'
              }"
            >
              <w-info-select
                v-model="item.placeId"
                :options="structureList"
                placeholder="选择构筑物"
                :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
              />
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
import { themes } from '@/config/setting.config';

export default {
  name: 'StructureForm',
  mixins: [CommonMixin],
  props: {
    form: {
      type: Object
    }
  },
  data() {
    return {
      structureList: [],
      themes
    };
  },
  watch: {
    waterPlantId: {
      handler(val) {
        if (val) {
          this.getStructureList();
          this.initForm();
        }
      },
      immediate: true
    }
  },
  methods: {
    initForm() {
      if (this.form.domains.length === 0) {
        this.handleAddField();
      } else {
        this.form.domains.forEach((i) => {
          i.key = i.key ?? Date.now() + String((Math.random() * 1000).toFixed(0));
        });
      }
    },
    // 查询构筑物
    async getStructureList() {
      try {
        const { resultData } = await this.$axios.post('/waterwork-device-api/Structure/list', {
          waterPlantId: this.waterPlantId,
          pageFlag: false
        });
        this.structureList = Object.freeze(
          resultData.map((i) => ({
            key: i.id,
            value: i.id,
            label: i.structureName
          }))
        );
      } catch (error) {
        this.structureList = Object.freeze([]);
      }
    },

    // 新增字段
    handleAddField() {
      this.form.domains.push({
        key: Date.now(),
        placeId: undefined,
        structureName: undefined
      });
    },
    handleSubmit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          const list = this.form.domains.map((i) => {
            i.structureName = this.structureList.filter((item) => i.placeId === item.value)[0].label;
            return i;
          });
          this.$emit('submit', list);
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
