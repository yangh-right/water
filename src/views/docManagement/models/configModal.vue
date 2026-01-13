<template>
  <w-modal
    :destroyOnClose="true"
    :title="runTimeObj ? '编辑' : '新增'"
    :visible="visible"
    height="80vh"
    width="650px"
    centered
    :maskClosable="false"
    @cancel="cancel"
    @ok="handlerFrom"
  >
    <w-row class="config-wrap">
      <w-form-model
        ref="form"
        :model="form"
        :rules="rules"
        :labelCol="{ span: 10 }"
        :wrapperCol="{ span: 14 }"
      >
        <w-col span="24">
          <w-form-model-item label="选择污水厂" prop="waterPlantId">
            <FactorySelect v-model.trim="form.waterPlantId" autoSelect></FactorySelect>
          </w-form-model-item>
        </w-col>
        <w-col span="24">
          <w-form-model-item label="构筑物名称" prop="placeId">
            <w-select v-model="form.placeId" placeholder="请选择构筑物名称" showSearch allowClear>
              <w-select-option
                v-for="item in structureList"
                :key="item.value"
                :value="item.value"
                >{{ item.label }}</w-select-option
              >
            </w-select>
          </w-form-model-item>
        </w-col>
        <w-col span="24">
          <w-form-model-item label="风险等级" prop="riskLevel">
            <w-select v-model="form.riskLevel" placeholder="请选择风险等级" showSearch allowClear>
              <w-select-option
                v-for="item in riskLevelList"
                :key="item.value"
                :value="item.value"
                >{{ item.label }}</w-select-option
              >
            </w-select>
          </w-form-model-item>
        </w-col>
      </w-form-model>
    </w-row>
  </w-modal>
</template>

<script>
import { cloneDeep } from 'lodash-es';
import FactorySelect from '@/components/factory-select/index.vue';
import { addOrUpdateFile } from '@/api/riskManagement';
const paramsData = {
  waterPlantId: '',
  placeId: undefined,
  riskLevel: undefined,
  modelPointName: undefined, //模型监测量
  entryName: '',
  entryValue: '',
  dataTime: null
};
export default {
  name: 'ConfigEdit',
  components: {
    FactorySelect
  },
  props: {
    runTimeObj: {
      type: Number,
      default: 0
    },
    rowData: {
      type: Object,
      default: () => {}
    },
    structureList: {
      type: Array,
      default: () => []
    },
    riskLevelList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      form: cloneDeep(paramsData),
      visible: false,
      rules: {
        waterPlantId: [{ required: true, message: '请选择水厂' }]
      }
    };
  },
  watch: {
    visible(val) {
      if (val) {
        this.initData();
      }
    },
    runTimeObj(val) {
      if (!val) {
        this.form = cloneDeep(paramsData);
      }
    }
  },
  mounted() {
    this.form.dataTime = this.$moment().format('YYYY-MM-DD HH:mm:ss');
  },
  methods: {
    initData() {
      if (!(this.rowData === null) && this.runTimeObj) {
        this.form = {
          ...this.rowData,
          riskLevel: Number(this.rowData.riskLevel)
        };
      }
    },
    cancel() {
      this.visible = false;
      this.$emit('cancel');
    },
    handlerFrom() {
      this.$refs.form.validate(async valid => {
        if (valid) {
          let params = {
            ...this.form
          };
          let { status } = await addOrUpdateFile(params);
          if (status === 'complete') {
            let message = this.runTimeObj ? '编辑成功' : '新增成功';
            this.$message.success(message);
            this.visible = false;
            this.form = cloneDeep(paramsData);
            this.$emit('cancel', true);
          } else {
            return false;
          }
        } else {
          return false;
        }
      });
    }
  }
};
</script>

<style lang="less" scoped>
.config-wrap {
  max-height: 70vh;
  overflow: auto;
}
/deep/.wpg-form-item-label {
  width: 150px;
}
.form-footer {
  position: absolute;
  right: 20px;
  bottom: 20px;
}
.af-time {
  position: relative;

  &::after {
    content: '年';
    font-weight: 500;
    font-size: 14px;
    color: var(--supply-color-third);
    position: absolute;
    right: -20px;
    top: 7px;
  }
}
</style>
