<!--
  @author: zhangxiang
  @date: 2021-08-27 18:01:33
  @desc：设施
-->
<template>
  <div class="form-wrapper">
    <w-form-model ref="form" :model="form" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }">
      <template v-for="(item, idx) in form.domains">
        <w-row :key="item.key" :gutter="[12]">
          <w-col :span="7">
            <w-form-model-item
              :ref="`${form.domains[idx].key}-facilitiesId`"
              required
              label="设施选择"
              :prop="`domains[${idx}].facilitiesId`"
              :rules="{
                required: true,
                message: '设施不能为空!',
                trigger: 'change'
              }"
            >
              <w-info-tree-select
                v-model="item.facilitiesId"
                :tree-data="stationTree"
                placeholder="选择设施"
                :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                @change="handleStationChange"
              />
            </w-form-model-item>
          </w-col>

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

export default {
  name: 'StationForm',
  mixins: [CommonMixin],
  watch: {
    waterPlantId: {
      handler(val) {
        if (val) {
          this.getStationTree();
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
      }
    },
    // 新增字段
    handleAddField() {
      this.form.domains.push({
        key: Date.now(),
        facilitiesId: undefined
      });
    },
    handleSubmit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          const list = this.form.domains.map((i) => ({
            key: i.key,
            facilitiesId: i.facilitiesId
          }));
          this.$emit('submit', list);
        }
      });
    },
    handleStationChange() {}
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
