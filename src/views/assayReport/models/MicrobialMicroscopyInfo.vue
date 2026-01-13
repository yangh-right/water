<template>
  <div class="base-info wfc1">
    <div class="form-title">微生物镜检</div>
    <w-info-form
      ref="microbialForm"
      :model="form"
      :fields="baseFields"
      :layout="layout"
      :footer="null"
    >
    </w-info-form>
    <div class="table-container">
      <w-table
        :columns="columns"
        :scroll="{ x: 600 }"
        :data-source="tableData"
        :loading="loading"
        bordered
        :pagination="false"
      >
        <template slot="color" slot-scope="text, record">
          <w-input v-model="record.color" :style="{ width: '100px' }" />
        </template>
        <template slot="shape" slot-scope="text, record">
          <w-input v-model="record.shape" :style="{ width: '100px' }" />
        </template>
        <template slot="settlability" slot-scope="text, record">
          <w-input v-model="record.settlability" :style="{ width: '100px' }" />
        </template>
        <template slot="dataValue" slot-scope="text, record">
          <w-input v-model="record.dataValue" :style="{ width: '100px' }" />
        </template>
      </w-table>
    </div>
  </div>
</template>

<script>
import { MICROBIAL_MICROSCOPY_FIELDS } from './config';
import InfoMixin from './InfoMixin';

export default {
  name: 'MicrobialMicroscopyInfo',
  mixins: [InfoMixin],
  props: {
    validate: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      baseFields: MICROBIAL_MICROSCOPY_FIELDS,
      columns: [
        {
          title: '检测项目',
          dataIndex: 'configName',
          key: 'configName',
          align: 'center',
          width: 120
        },
        {
          title: '颜色',
          dataIndex: 'color',
          key: 'color',
          align: 'center',
          width: 120,
          scopedSlots: {
            customRender: 'color'
          }
        },
        {
          title: '形状',
          dataIndex: 'shape',
          key: 'shape',
          align: 'center',
          width: 120,
          scopedSlots: {
            customRender: 'shape'
          }
        },
        {
          title: '沉降性',
          dataIndex: 'settlability',
          key: 'settlability',
          align: 'center',
          width: 120,
          scopedSlots: {
            customRender: 'settlability'
          }
        },
        {
          title: '微生物',
          dataIndex: 'dataValue',
          key: 'dataValue',
          align: 'center',
          width: 120,
          scopedSlots: {
            customRender: 'dataValue'
          }
        }
      ],
      tableData: []
    };
  },
  watch: {},
  activated() {},
  methods: {
    formValidate() {
      this.$refs['microbialForm'].validate(valid => {
        this.$emit('update:validate', !!valid);
      });
    },
    resetFields() {
      this.$refs['microbialForm'].$_resetFields();
    }
  }
};
</script>

<style lang="less" scoped>
.base-info {
  width: 100%;
  .form-title {
    padding-bottom: 10px;
    margin-top: 10px;
    font-size: 16px;
  }
  .form-special {
    position: relative;
    .button-container {
      position: absolute;
      left: 100%;
      top: 0;
      display: flex;
    }
  }
}
.table-container {
  margin-top: 10px;
}
</style>
