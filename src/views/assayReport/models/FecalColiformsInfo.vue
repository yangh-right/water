<template>
  <div class="base-info wfc1">
    <div class="form-title">粪大肠菌群</div>
    <w-info-form
      ref="fecalColiformsForm"
      :model="form"
      :fields="baseFields"
      :layout="layout"
      :footer="null"
    >
    </w-info-form>
    <div class="table-container">
      <w-table
        :columns="columns"
        :scroll="{ x: 960 }"
        :data-source="tableData"
        :loading="loading"
        bordered
        :pagination="false"
      >
        <template slot="samplingVolume" slot-scope="text, record">
          <w-input v-model="record.samplingVolume" type="number" :style="{ width: '100px' }" />
        </template>
        <template slot="startTime" slot-scope="text, record">
          <w-date-picker
            v-model="record.startTime"
            type="date"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            :style="{ width: '120px' }"
          />
        </template>
        <template slot="endTime" slot-scope="text, record">
          <w-date-picker
            v-model="record.endTime"
            type="date"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            :style="{ width: '120px' }"
          />
        </template>
        <template slot="macropore" slot-scope="text, record">
          <w-input v-model="record.macropore" type="number" :style="{ width: '100px' }" />
        </template>
        <template slot="micropore" slot-scope="text, record">
          <w-input v-model="record.micropore" type="number" :style="{ width: '100px' }" />
        </template>
        <template slot="fecalColiformsValue" slot-scope="text, record">
          <w-input v-model="record.fecalColiformsValue" type="number" :style="{ width: '100px' }" />
        </template>
        <template slot="dataValue" slot-scope="text, record">
          <w-input v-model="record.dataValue" type="number" :style="{ width: '100px' }" />
        </template>
      </w-table>
    </div>
  </div>
</template>

<script>
import { FECAL_COLIFORM_FIELDS } from './config';
import InfoMixin from './InfoMixin';

export default {
  name: 'FecalColiformsInfo',
  mixins: [InfoMixin],
  props: {
    validate: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      baseFields: FECAL_COLIFORM_FIELDS,
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
          title: '开始培养时间',
          dataIndex: 'startTime',
          key: 'startTime',
          align: 'center',
          width: 140,
          scopedSlots: {
            customRender: 'startTime'
          }
        },
        {
          title: '完成培养时间',
          dataIndex: 'endTime',
          key: 'endTime',
          align: 'center',
          width: 140,
          scopedSlots: {
            customRender: 'endTime'
          }
        },
        {
          title: '97孔数-大孔数',
          dataIndex: 'macropore',
          key: 'macropore',
          align: 'center',
          width: 120,
          scopedSlots: {
            customRender: 'macropore'
          }
        },
        {
          title: '97孔数-小孔数',
          dataIndex: 'micropore',
          key: 'micropore',
          align: 'center',
          width: 120,
          scopedSlots: {
            customRender: 'micropore'
          }
        },
        {
          title: '检验结果MPN/100mL',
          dataIndex: 'fecalColiformsValue',
          key: 'fecalColiformsValue',
          align: 'center',
          width: 120,
          scopedSlots: {
            customRender: 'fecalColiformsValue'
          }
        },
        {
          title: '最终结果（MPN/L）',
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
      this.$refs['fecalColiformsForm'].validate(valid => {
        this.$emit('update:validate', !!valid);
      });
    },
    resetFields() {
      this.$refs['fecalColiformsForm'].$_resetFields();
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
