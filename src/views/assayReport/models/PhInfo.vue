<template>
  <div class="base-info wfc1">
    <div class="form-title">pH检测模块</div>
    <w-info-form
      ref="phInfoForm"
      :model="form"
      :fields="baseFields"
      :layout="layout"
      :footer="null"
    >
    </w-info-form>
    <div class="table-container">
      <w-table
        :columns="columns"
        :data-source="tableData"
        :loading="loading"
        bordered
        :pagination="false"
      >
        <template slot="dataValue" slot-scope="text, record">
          <w-input v-model="record.dataValue" type="number" :style="{ width: '260px' }" />
        </template>
      </w-table>
    </div>
  </div>
</template>

<script>
import { PH_FIELDS } from './config';
import InfoMixin from './InfoMixin';

export default {
  name: 'PhInfo',
  mixins: [InfoMixin],
  props: {
    validate: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      baseFields: PH_FIELDS,
      columns: [
        {
          title: '取样点',
          dataIndex: 'configName',
          key: 'configName',
          align: 'center',
          width: 180
        },
        {
          title: 'pH检测结果',
          dataIndex: 'dataValue',
          key: 'dataValue',
          align: 'center',
          width: 180,
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
      this.$refs['phInfoForm'].validate(valid => {
        this.$emit('update:validate', !!valid);
      });
    },
    resetFields() {
      this.$refs['phInfoForm'].$_resetFields();
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
