<!--
  @author: zhangxiang
  @date: 2021-09-07 16:09:45
  @desc：
-->
<template>
  <StructureForm ref="form" :waterPlantId="waterPlantId" :form="form" :loading="loading" @submit="handleSubmit">
    <template #extra="{ item, idx }">
      <w-col :span="7">
        <w-form-model-item
          required
          label="svgName"
          :prop="`domains[${idx}].svgName`"
          :rules="[
            {
              required: true,
              message: '不能为空!'
            }
          ]"
        >
          <w-input v-model="item.svgName" :max-length="32" placeholder="请填写" @input="handleChange($event, item)" />
        </w-form-model-item>
      </w-col>
    </template>
  </StructureForm>
</template>

<script>
import StructureForm from './structure-form.vue';

export default {
  name: 'StructureWidthExtraSvgname',
  components: { StructureForm },
  inheritAttrs: false,
  props: {
    form: {
      type: Object
    },
    waterPlantId: {
      type: String
    },
    loading: Boolean
  },

  methods: {
    initForm() {
      this.$refs['form'].initForm();
    },
    handleSubmit(value) {
      this.$emit('submit', {
        configParaList: value
      });
    },
    handleChange() {}
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
