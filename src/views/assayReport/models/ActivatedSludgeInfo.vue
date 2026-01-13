<template>
  <div class="base-info wfc1">
    <div class="form-title">曝气池活性污泥</div>
    <w-info-form
      ref="activatedSludgeForm"
      :model="form"
      :fields="baseFields"
      :layout="layout"
      :footer="null"
    >
    </w-info-form>
    <div class="table-container">
      <w-table
        :columns="columns"
        :scroll="{ x: 1200 }"
        :data-source="tableData"
        :loading="loading"
        bordered
        :pagination="false"
      >
        <template slot="samplingVolume" slot-scope="text, record">
          <w-input v-model="record.samplingVolume" type="number" :style="{ width: '100px' }" />
        </template>
        <template slot="sv30" slot-scope="text, record">
          <w-input v-model="record.sv30" type="number" :style="{ width: '100px' }" />
        </template>
        <template slot="w1" slot-scope="text, record">
          <w-input v-model="record.w1" type="number" :style="{ width: '100px' }" />
        </template>
        <template slot="w2" slot-scope="text, record">
          <w-input v-model="record.w2" type="number" :style="{ width: '100px' }" />
        </template>
        <template slot="w3" slot-scope="text, record">
          <w-input v-model="record.w3" type="number" :style="{ width: '100px' }" />
        </template>
        <template slot="w4" slot-scope="text, record">
          <w-input v-model="record.w4" type="number" :style="{ width: '100px' }" />
        </template>
        <template slot="mlss" slot-scope="text, record">
          <w-input v-model="record.mlss" type="number" :style="{ width: '100px' }" />
        </template>
        <template slot="mlvss" slot-scope="text, record">
          <w-input v-model="record.mlvss" type="number" :style="{ width: '100px' }" />
        </template>
        <template slot="dataValue" slot-scope="text, record">
          <w-input v-model="record.dataValue" type="number" :style="{ width: '100px' }" />
        </template>
      </w-table>
    </div>
  </div>
</template>

<script>
import { ACTIVATED_SLUDGE_FIELDS } from './config';
import InfoMixin from './InfoMixin';

export default {
  name: 'ActivatedSludgeInfo',
  mixins: [InfoMixin],
  props: {
    validate: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      baseFields: ACTIVATED_SLUDGE_FIELDS,
      columns: [
        {
          title: '水样名称',
          dataIndex: 'configName',
          key: 'configName',
          align: 'center',
          width: 120
        },
        {
          title: '取样体积 V',
          dataIndex: 'samplingVolume',
          key: 'samplingVolume',
          align: 'center',
          width: 120,
          scopedSlots: {
            customRender: 'samplingVolume'
          }
        },
        {
          title: 'SV30(%)',
          dataIndex: 'sv30',
          key: 'sv30',
          align: 'center',
          width: 120,
          scopedSlots: {
            customRender: 'sv30'
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
          title: 'W3(g)',
          dataIndex: 'w3',
          key: 'w3',
          align: 'center',
          width: 120,
          scopedSlots: {
            customRender: 'w3'
          }
        },
        {
          title: 'W4(g)',
          dataIndex: 'w4',
          key: 'w4',
          align: 'center',
          width: 120,
          scopedSlots: {
            customRender: 'w4'
          }
        },
        {
          title: 'MLSS(mg/L)',
          dataIndex: 'mlss',
          key: 'mlss',
          align: 'center',
          width: 120,
          scopedSlots: {
            customRender: 'mlss'
          }
        },
        {
          title: 'MLVSS(mg/L)',
          dataIndex: 'mlvss',
          key: 'mlvss',
          align: 'center',
          width: 180,
          scopedSlots: {
            customRender: 'mlvss'
          }
        },
        {
          title: 'SVI(mL/g)',
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
      this.$refs['activatedSludgeForm'].validate(valid => {
        this.$emit('update:validate', !!valid);
      });
    },
    resetFields() {
      this.$refs['activatedSludgeForm'].$_resetFields();
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
