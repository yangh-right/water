<template>
  <div class="base-info wfc1">
    <div class="form-title">悬浮物（SS）检测</div>
    <w-info-form ref="ssForm" :model="form" :fields="baseFields" :layout="layout" :footer="null">
    </w-info-form>
    <div class="table-container">
      <w-table
        :columns="columns"
        :data-source="tableData"
        :loading="loading"
        bordered
        :pagination="false"
      >
        <template slot="samplingVolume" slot-scope="text, record">
          <w-input v-model="record.samplingVolume" type="number" :style="{ width: '100px' }" />
        </template>
        <template slot="w1" slot-scope="text, record">
          <w-input v-model="record.w1" type="number" :style="{ width: '100px' }" />
        </template>
        <template slot="w2" slot-scope="text, record">
          <w-input v-model="record.w2" type="number" :style="{ width: '100px' }" />
        </template>
        <template slot="dataValue" slot-scope="text, record">
          <w-input v-model="record.dataValue" type="number" :style="{ width: '260px' }" />
        </template>
      </w-table>
    </div>
  </div>
</template>

<script>
import { SUSPENDED_FIELDS } from './config';
import InfoMixin from './InfoMixin';

export default {
  name: 'SsInfo',
  mixins: [InfoMixin],
  props: {
    validate: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      baseFields: SUSPENDED_FIELDS,
      columns: [
        {
          title: '水样名称',
          dataIndex: 'configName',
          key: 'configName',
          align: 'center',
          width: 180
        },
        {
          title: '取样体积 （mL）',
          dataIndex: 'samplingVolume',
          key: 'samplingVolume',
          align: 'center',
          width: 120,
          scopedSlots: {
            customRender: 'samplingVolume'
          }
        },
        {
          title: 'W1(g)',
          dataIndex: 'w1',
          key: 'w1',
          align: 'center',
          width: 120,
          scopedSlots: {
            customRender: 'w1'
          }
        },
        {
          title: 'W2(g)',
          dataIndex: 'w2',
          key: 'w2',
          align: 'center',
          width: 120,
          scopedSlots: {
            customRender: 'w2'
          }
        },
        {
          title: 'SS(mg/L)',
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
      this.$refs['ssForm'].validate(valid => {
        this.$emit('update:validate', !!valid);
      });
    },
    resetFields() {
      this.$refs['ssForm'].$_resetFields();
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
