<template>
  <div class="base-info wfc1">
    <div class="form-title">五日生化需氧量检测</div>
    <w-info-form ref="bod5Form" :model="form" :fields="baseFields" :layout="layout" :footer="null">
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
import { BOD5_FIELDS } from './config';
import InfoMixin from './InfoMixin';

export default {
  name: 'Bod5Info',
  mixins: [InfoMixin],
  props: {
    validate: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      baseFields: BOD5_FIELDS,
      columns: [
        {
          title: '水样名称',
          dataIndex: 'configName',
          key: 'configName',
          align: 'center',
          width: 180
        },
        {
          title: '五日生化需氧量(mg/L)',
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
      this.$refs['bod5Form'].validate(valid => {
        this.$emit('update:validate', !!valid);
      });
    },
    resetFields() {
      this.$refs['bod5Form'].$_resetFields();
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
