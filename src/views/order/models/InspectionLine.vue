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
        ref="form"
        v-bind="layout"
        :model="form"
        :rules="rules">
        <w-row type="flex">
          <w-col :span="12">
            <w-form-model-item label="巡检名称" prop="inspectionType">
              <w-input
                v-model.trim="form.inspectionType"
                :maxLength="100"
                allowClear
                placeholder="请输入巡检名称"
              ></w-input>
            </w-form-model-item>
          </w-col>
          <w-col :span="12">
            <w-form-model-item label="巡检线路编号" prop="code">
              <w-input
                v-model="form.code"
                placeholder="请输入巡检线路编号"
                :maxLength="100"
                allowClear
              />
            </w-form-model-item>
          </w-col>
          <w-col :span="12" class="org-select">
            <w-form-model-item label="巡检点" prop="inspectionPointIds">
              <w-select
                v-model="form.inspectionPointIds"
                mode="multiple"
                allowClear
                showSearch=true
                placeholder="请选择巡检点"
                :maxTagCount="1"
              >
                <w-select-option
                  v-for="item in inspectionPointList"
                  :key="item.id"
                  :value="item.id"
                >
                  {{ item.inspectionPointName }}
                </w-select-option>
              </w-select>
            </w-form-model-item>
          </w-col>
          <w-col :span="12">
            <w-form-model-item label="启用状态" prop="status">
              <w-radio-group v-model="form.status">
                <w-radio :value="1">启用</w-radio>
                <w-radio :value="0">未启用</w-radio>
              </w-radio-group>
            </w-form-model-item>
          </w-col>
          <w-col :span="12">
            <w-form-model-item label="排序" prop="sort">
              <w-input-number v-model="form.sort" :min="1" :max="100" />
            </w-form-model-item>
          </w-col>
        </w-row>
      </w-form-model>
    </div>
  </w-modal>
</template>

<script>
import {
  addOrUpdateInspectionLine,
  getInspectionLineDetail,
  getInspectionPointPage
} from '@/api/plan';

let defaultForm = {
  inspectionName: '',
  code: '',
  inspectionPointIds: [],
  userBaseDTOS: [],
  status: 1,
  sort: 1
};
export default {
  name: 'InspectionLine',
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
    inspectionLineData: {
      type: Object,
      default: () => ({})
    }
  },

  data() {
    return {
      form: { ...defaultForm },
      rules: {
        inspectionType: [
          { required: true, message: '请输入巡检名称' },
          { max: 100, message: '巡检名称最多100个字符' }
        ],
        code: [{ required: true, message: '请输入巡检线路编号', trigger: 'blur' }],
        inspectionPointIds: [{ required: true, message: '请选择巡检点', trigger: ['change'] }],
        status: [{ required: true, message: '请选择启用状态', trigger: ['change'] }],
        sort: [{ required: true, message: '请输入排序', trigger: 'blur' }]
      },
      confirmLoading: false,
      visible: false,
      isEdit: this.editable,
      inspectionPointList: [],
      svgList: [],
      layout: {
        labelCol: { span: 8 },
        wrapperCol: { span: 16 }
      }
    };
  },

  computed: {
    modalTitle() {
      let text = this.editType === 1 ? '新增' : '编辑';
      return `${text}巡检路线`;
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
    inspectionLineData: {
      handler(val) {
        if (Object.keys(val).length > 0) {
          this.selectInspectionLine(val.id);
        }
      },
      deep: true
    }
  },
  mounted() {
    this.getInspectionPointList();
  },
  methods: {
    handlerEdit() {
      this.visible = true;
      this.isEdit = true;
      this.selectInspectionLine(this.inspectionLineData.id);
    },
    async selectInspectionLine(id) {
      let res = await getInspectionLineDetail(id);
      let ret = res.status === 'complete' ? res.resultData : {};

      if (ret) {
        this.form = {
          ...ret,
          inspectionPointIds: JSON.parse(ret.inspectionPointIds)
        };
      }
    },

    async getInspectionPointList() {
      let res = await getInspectionPointPage({
        page: {
          current: 1,
          size: 1000
        }
      });
      if (res.status === 'complete') {
        this.inspectionPointList = res.resultData?.records || [];
      }
    },

    async submit() {
      let data = {
        ...this.form
      };
      let res = await addOrUpdateInspectionLine(data);
      if (res.status === 'complete') {
        this.$message.success(this.inspectionLineData.id ? '编辑成功' : '新增成功');
        this.$emit('update');
        this.visible = false;
      }
    },
    restoreData() {
      this.form = { ...defaultForm };
      this.form.inspectionPointVOS = [];
      this.svgList = [];
      this.userBaseList = [];
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
