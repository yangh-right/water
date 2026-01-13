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
          <w-form-model-item label="内回流" prop="internalReflux">
            <w-input v-model="form.internalReflux" placeholder="请输入内回流" />
          </w-form-model-item>
        </w-col>
        <w-col span="24">
          <w-form-model-item label="内回流比" prop="internalRefluxRatio">
            <w-input v-model="form.internalRefluxRatio" placeholder="请输入内回流比" />
          </w-form-model-item>
        </w-col>
        <w-col span="24">
          <w-form-model-item label="外回流" prop="externalReflux">
            <w-input v-model="form.externalReflux" placeholder="请输入外回流" />
          </w-form-model-item>
        </w-col>
        <w-col span="24">
          <w-form-model-item label="外回流比" prop="externalRefluxRatio">
            <w-input v-model="form.externalRefluxRatio" placeholder="请输入外回流比" />
          </w-form-model-item>
        </w-col>
        <w-col span="24">
          <w-form-model-item label="班组" prop="teamId">
            <w-select v-model="form.teamId" placeholder="请选择班组" allowClear>
              <w-select-option v-for="item in teamList" :key="item.value" :value="item.value">{{
                item.label
              }}</w-select-option>
            </w-select>
          </w-form-model-item>
        </w-col>
        <w-col span="24">
          <w-form-model-item label="上报人" prop="creator">
            <w-select v-model="form.creator" placeholder="请选择创建人" allowClear>
              <w-select-option v-for="item in personList" :key="item.value" :value="item.value">{{
                item.label
              }}</w-select-option>
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
import { addDataRecord, updateDataRecord } from '@/api/analysis';
import { personList } from '@/api/baseInfo';
const paramsData = {
  waterPlantId: '',
  internalReflux: '',
  internalRefluxRatio: '',
  externalReflux: '',
  externalRefluxRatio: '',
  creator: undefined,
  teamId: undefined,
  id: undefined
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
    }
  },
  data() {
    return {
      form: cloneDeep(paramsData),
      personList: [],
      teamList: [],
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
  created() {
    this.getpersonList();
    this.getTeamList();
  },
  methods: {
    initData() {
      if (!(this.rowData === null) && this.runTimeObj) {
        this.form = {
          ...this.rowData
        };
      }
    },
    async getpersonList() {
      const { success, resultData } = await personList({});
      if (success) {
        this.personList = resultData?.map(item => {
          return {
            label: item.userName,
            value: item.id
          };
        });
      }
    },
    async getTeamList() {
      const { success, resultData } = await this.$http.post('/team/list', {
        currentPage: 1,
        pageSize: 999
      });
      if (success) {
        this.teamList = resultData?.records.map(item => {
          return {
            label: item.name,
            value: item.id
          };
        });
      }
    },
    cancel() {
      this.visible = false;
      this.$emit('cancel');
    },
    handlerFrom() {
      this.$refs.form.validate(async valid => {
        if (valid) {
          let {
            waterPlantId,
            internalReflux,
            internalRefluxRatio,
            externalReflux,
            externalRefluxRatio,
            creator,
            teamId,
            id
          } = this.form;
          let params = {
            waterPlantId,
            internalReflux,
            internalRefluxRatio,
            externalReflux,
            externalRefluxRatio,
            teamId,
            creator,
            id,
            dataTime: this.$moment().format('YYYY-MM-DD HH:mm:ss')
          };
          let method = this.runTimeObj ? updateDataRecord : addDataRecord;
          let { status } = await method(params);
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
