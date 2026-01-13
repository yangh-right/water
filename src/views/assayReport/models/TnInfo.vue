<template>
  <div class="base-info wfc1">
    <div class="form-title">分光光度法测定总氮</div>
    <w-info-form ref="tnForm" :model="form" :fields="baseFields" :layout="layout" :footer="null">
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
        <template slot="dilutionFactor" slot-scope="text, record">
          <w-input v-model="record.dilutionFactor" type="number" :style="{ width: '100px' }" />
        </template>
        <template slot="a220" slot-scope="text, record">
          <w-input v-model="record.a220" type="number" :style="{ width: '100px' }" />
        </template>
        <template slot="a275" slot-scope="text, record">
          <w-input v-model="record.a275" type="number" :style="{ width: '100px' }" />
        </template>
        <template slot="a2202a275" slot-scope="text, record">
          <w-input v-model="record.a2202a275" type="number" :style="{ width: '100px' }" />
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
import { TN_FIELDS } from './config';
import InfoMixin from './InfoMixin';

export default {
  name: 'TnInfo',
  mixins: [InfoMixin],
  props: {
    validate: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      baseFields: TN_FIELDS,
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
          title: 'A220',
          dataIndex: 'a220',
          key: 'a220',
          align: 'center',
          width: 120,
          scopedSlots: {
            customRender: 'a220'
          }
        },
        {
          title: 'A275',
          dataIndex: 'a275',
          key: 'a275',
          align: 'center',
          width: 120,
          scopedSlots: {
            customRender: 'a275'
          }
        },
        {
          title: 'A220-2A275',
          dataIndex: 'a2202a275',
          key: 'a2202a275',
          align: 'center',
          width: 120,
          scopedSlots: {
            customRender: 'a2202a275'
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
      this.$refs['tnForm'].validate(valid => {
        this.$emit('update:validate', !!valid);
      });
    },
    resetFields() {
      this.$refs['tnForm'].$_resetFields();
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
