<!--
  @author: zhangxiang
  @date: 2021-08-27 17:53:26
  @desc：监测量
-->
<template>
  <div class="form-wrapper">
    <w-form-model ref="form" :model="form" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }">
      <slot name="prev" :form="form" />
      <template v-for="(item, idx) in form.domains">
        <w-row :key="item.key" :gutter="[12]">
          <w-col :span="7">
            <w-form-model-item
              :ref="`${form.domains[idx].key}-pointName`"
              required
              label="监测量选择"
              :prop="`domains[${idx}].pointName`"
              :rules="{
                required: true,
                message: '监测量不能为空!',
                trigger: 'change'
              }"
            >
              <w-info-select
                v-model="item.pointName"
                :options="pointList"
                placeholder="选择监测量"
                mode="multiple"
                :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
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
import { selectDevicePointByDeviceEntityId } from '@/api/device-operation';

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
      pointList: []
    };
  },
  watch: {
    waterPlantId: {
      handler(val) {
        if (val) {
          this.getPointList();
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
    // 查询构筑物
    async getPointList() {
      try {
        // const { resultData } = await this.$axios.post('/waterwork-device-api/industryDevice/selectDevicePointByDeviceEntityId', {
        //   waterPlantId: this.waterPlantId,
        //   pageFlag: false
        // });
        const { resultData } = await selectDevicePointByDeviceEntityId({
          waterPlantId: this.waterPlantId
        });
        this.pointList = Object.freeze(
          resultData.map(i => ({
            key: i.id,
            value: i.pointName,
            label: i.pointMemo
          }))
        );
      } catch (error) {
        this.pointList = Object.freeze([]);
      }
    },

    // 新增字段
    handleAddField() {
      this.form.domains.push({
        key: Date.now(),
        pointName: undefined
      });
    },
    handleSubmit() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          const list = this.form.domains[0].pointName;
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
