<template>
  <w-modal
    :title="modalTitle"
    :visible="visible"
    :maskClosable="false"
    :confirm-loading="confirmLoading"
    :width="820"
    centered
    :okText="okText"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <div v-if="visible">
      <w-form-model 
        ref="pointFrom" 
        v-bind="layout" 
        :model="form" 
        :rules="rules">
        <w-row type="flex" justify="space-between">
          <w-col :span="12" class="org-select">
            <w-form-model-item label="选择污水厂" prop="waterPlantId">
              <FactorySelect
                v-model.trim="form.waterPlantId"
                :disabled="editType === 2"
                :showAll="false"
                :autoSelect="true"
                placeholder="请选择污水厂"
              ></FactorySelect>
            </w-form-model-item>
          </w-col>
          <w-col :span="12">
            <w-form-model-item label="构筑物" prop="placeId">
              <w-select
                class="select-item"
                placeholder="请选择构筑物"
                :getPopupContainer="triggerNode => triggerNode.parentNode"
                v-model="form.placeId"
                :options="paramsOptions"
              ></w-select>
            </w-form-model-item>
          </w-col>
          <w-col :span="12">
            <w-form-model-item label="巡检点位编号" prop="inspectionPointCode">
              <w-input
                v-model="form.inspectionPointCode"
                placeholder="请输入巡检点位编号"
                :maxLength="100"
                allowClear
              />
            </w-form-model-item>
          </w-col>
          <w-col :span="12">
            <w-form-model-item label="巡检点位名称" prop="inspectionPointName">
              <w-input
                v-model="form.inspectionPointName"
                placeholder="请输入巡检点位编号"
                :maxLength="100"
                allowClear
              />
            </w-form-model-item>
          </w-col>
          <w-col :span="24">
            <w-form-model-item label="注意事项" prop="attention"  v-bind="layout2">
              <w-input
                v-model="form.attention"
                placeholder="请输入注意事项"
                :maxLength="100"
                allowClear
              />
            </w-form-model-item>
          </w-col>
        </w-row>
      </w-form-model>
    </div>
  </w-modal>
</template>

<script>
import { addOrUpdateInspectionPoint } from '@/api/plan';
import { getStructureByStationId } from '@/api/optimization';
import FactorySelect from '@/components/factory-select/index.vue';

let defaultForm = {
  placeId: undefined,
  waterPlantId: '',
  inspectionPointCode: '',
  inspectionPointName: '',
  attention: '',
  inspectionPointList: []
};
export default {
  name: 'InspectionPoint',
  components: { FactorySelect },
  props: {
    editable: {
      type: Boolean,
      default: true
    },
    readonly: {
      type: Boolean,
      default: false
    },
    editType: {
      type: Number,
      default: 1 // 1->新增信息; 2->编辑信息;
    },
    inspectionPointData: {
      type: Object,
      default: () => ({})
    }
  },

  data() {
    return {
      form: { ...defaultForm },
      rules: {
        waterPlantId: [{ required: true, message: '请选择污水厂', trigger: ['change'] }],
        inspectionPointCode: [{ required: true, message: '请输入巡检点位编号' }],
        inspectionPointName: [{ required: true, message: '请输入巡检点位名称' }],
        placeId: [{ required: true, message: '请选择构筑物' }]
      },
      confirmLoading: false,
      visible: false,
      isEdit: this.editable,
      paramsOptions: [],
      inspectionPointList: [],
      svgList: [],
      layout: {
        labelCol: { span: 8 },
        wrapperCol: { span: 16 }
      },
      layout2: {
        labelCol: { span: 4 },
        wrapperCol: { span: 20 }
      }
    };
  },

  computed: {
    modalTitle() {
      let text = this.editType === 1 ? '新增' : '编辑';
      return `${text}巡检点`;
    },
    okText() {
      return this.editType === 1 ? '提交' : '编辑';
    }
  },

  watch: {
    visible(val) {
      if (!val) {
        this.restoreData();
      }
    },
    inspectionPointData: {
      handler(val) {
        if (Object.keys(val).length > 0) {
          this.handlerEdit();
        }
      },
      deep: true
    },
    'form.waterPlantId': {
      handler(val) {
        if (val) {
          this.form.waterPlantId = val;
          this.getStructure();
        }
      }
    }
  },
  mounted() {},
  methods: {
    handlerEdit() {
      console.log('this.inspectionPointData', this.inspectionPointData);
      this.visible = true;
      this.isEdit = true;
      this.form = {
        ...this.inspectionPointData
      };
    },

    async submit() {
      let data = {
        ...this.form
      };
      let res = await addOrUpdateInspectionPoint(data);
      if (res.status === 'complete') {
        this.$message.success(this.inspectionPointData.id ? '编辑成功' : '新增成功');
        this.$emit('update');
        this.visible = false;
      }
    },
    restoreData() {
      this.form = { ...defaultForm };
      this.svgList = [];
      this.userBaseList = [];
    },
    async getStructure() {
      let res = await getStructureByStationId(this.form.waterPlantId);
      let { status, resultData } = res;
      if (status === 'complete') {
        this.paramsOptions = resultData.map(item => {
          let obj = {};
          obj.value = item.id;
          obj.label = item.name;
          return obj;
        });
      }
    },
    handleCancel() {
      this.visible = false;
    },
    handleOk() {
      this.submit();
    }
  }
};
</script>

<style lang="less" scoped>
@import '@/styles/switch.less';
.select-pump {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  .link-pump {
    align-items: center;
    display: flex;
  }
  .link-pump-btn {
    margin-left: 6px;
    color: var(--supply-color-primary-DEFAULT);
    &:hover {
      color: var(--supply-color-primary-hover);
    }
    &:active {
      color: var(--supply-color-primary-active);
    }
    cursor: pointer;
  }
  .icon-ic_chevron_right_more {
    align-self: center;
  }
  &-tree {
    /deep/ .wpg-tree {
      width: 100%;
      max-height: 223px;
      overflow-x: hidden;
      overflow-y: auto;
    }
  }
}

/deep/.wpg-form-header .wpg-info-form .wpg-form-item {
  margin-bottom: 0;
}
/deep/.wpg-form {
  padding: 5px 20px;
  background: var(--supply-color-bg-card-DEFAULT);
}
/deep/ .wpg-modal-body {
  max-height: 550px;
  overflow: auto;
}
/deep/ .wpg-form-item {
  margin-bottom: 12px;
}
</style>
