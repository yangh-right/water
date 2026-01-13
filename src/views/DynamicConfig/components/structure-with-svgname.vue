<template>
  <StructureFormSvg
    ref="form"
    :waterPlantId="waterPlantId"
    :showTheme="false"
    :form="form"
    :loading="loading"
    @submit="handleSubmit"
  >
    <template #extra="{ item, idx, index }">
      <w-col :span="7">
        <w-form-model-item
          required
          label="组态名称"
          :prop="`domains[${idx}].strus[${index}].svgName`"
          :rules="[
            {
              required: true,
              message: '组态图纸不能为空!'
            }
          ]"
        >
          <w-input v-model="item.svgName" :max-length="32" placeholder="请填写" @input="handleChange($event, item)" />
        </w-form-model-item>
      </w-col>
    </template>
  </StructureFormSvg>
</template>

<script>
import StructureFormSvg from './structure-form-svg.vue';

export default {
  name: 'StructureWidthExtraSvgname',
  components: { StructureFormSvg },
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
