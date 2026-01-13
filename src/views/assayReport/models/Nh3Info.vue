<template>
  <div class="base-info wfc1">
    <div class="form-title">分光光度法测定氨氮</div>
    <w-info-form ref="nh3Form" :model="form" :fields="baseFields" :layout="layout" :footer="null">
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
        <template slot="samplingVolume" slot-scope="text, record">
          <w-input v-model="record.samplingVolume" type="number" :style="{ width: '100px' }" />
        </template>
        <template slot="dilutionFactor" slot-scope="text, record">
          <w-input v-model="record.dilutionFactor" type="number" :style="{ width: '100px' }" />
        </template>
        <template slot="mass" slot-scope="text, record">
          <w-input v-model="record.mass" type="number" :style="{ width: '100px' }" />
        </template>
        <template slot="dataValue" slot-scope="text, record">
          <w-input v-model="record.dataValue" type="number" :style="{ width: '100px' }" />
        </template>
      </w-table>
    </div>
  </div>
</template>

<script>
import { NH3_FIELDS } from './config';
import InfoMixin from './InfoMixin';

export default {
  name: 'Nh3Info',
  mixins: [InfoMixin],
  props: {
    validate: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      baseFields: NH3_FIELDS,
      columns: [
        {
          title: '样品名称',
          dataIndex: 'configName',
          key: 'configName',
          align: 'center',
          width: 120
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
          title: '稀释倍数',
          dataIndex: 'dilutionFactor',
          key: 'dilutionFactor',
          align: 'center',
          width: 120,
          scopedSlots: {
            customRender: 'dilutionFactor'
          }
        },
        {
          title: '质量(ug)',
          dataIndex: 'mass',
          key: 'mass',
          align: 'center',
          width: 120,
          scopedSlots: {
            customRender: 'mass'
          }
        },
        {
          title: '浓度(mg/L)',
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
      this.$refs['nh3Form'].validate(valid => {
        this.$emit('update:validate', !!valid);
      });
    },
    resetFields() {
      this.$refs['nh3Form'].$_resetFields();
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
