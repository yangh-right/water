<template>
  <div class="base-info wfc1">
    <w-info-form ref="baseForm" :model="form" :fields="baseFields" :layout="layout" :footer="null">
      <template #waterPlantId>
        <factory-select v-model="form.waterPlantId" :allowClear="true"></factory-select>
      </template>
    </w-info-form>
  </div>
</template>

<script>
import { BASE_FIELDS } from './config';
import { sysDictListByCode } from '@/api/deviceManagement';
import { mapState } from 'vuex';
import FactorySelect from '@/components/factory-select/index.vue';
export default {
  name: 'BaseInfo',
  components: { FactorySelect },
  props: {
    validate: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      layout: {
        span: 12,
        labelCol: { span: 4 },
        wrapperCol: { span: 18 }
      },
      baseFields: BASE_FIELDS,
      form: {
        waterPlantId: '',
        samplingDate: ''
      }
    };
  },
  watch: {},
  activated() {},
  methods: {
    handleData() {
      return this.form;
    },
    formValidate() {
      this.$refs['baseForm'].validate(valid => {
        this.$emit('update:validate', !!valid);
      });
    },
    resetFields() {
      this.$refs['baseForm'].$_resetFields();
    },
    handleEditData(row) {
      this.form = {
        waterPlantId: row.waterPlantId,
        samplingDate: row.samplingDate
      };
    }
  }
};
</script>

<style lang="less" scoped>
.base-info {
  width: 100%;
  .form-special {
    position: relative;
    .button-container {
      position: absolute;
      left: 100%;
      top: 0;
      display: flex;
    }
  }
  .form-text {
    position: absolute;
    height: 40px;
    color: #999;
    width: 400px;
    top: 28px;
    left: 0;
    display: flex;
    align-items: center;
    .form-text-item {
      max-width: 30%;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
}
</style>
