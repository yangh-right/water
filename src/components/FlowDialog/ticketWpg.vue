<!--
 * @Description:三高
 * @version:
 * @Author: liuct
 * @Date: 2021-11-11 20:40:53
 * @LastEditors: Do not edit
 * @LastEditTime: 2022-10-25 11:01:35
-->
<template>
  <w-modal
    id="ticket_modal"
    class="ticket-dialog secondary-modal"
    :title="title"
    :visible="visible"
    :confirm-loading="confirmLoading"
    :width="800"
    okText="提交"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <w-config-provider :getPopupContainer="getPopupContainer">
      <div class="query-form ticket-create-container">
        <!-- layout="vertical" -->
        <w-form-model v-bind="formItemLayout">
          <w-form-model-item class="template-form-id" required label="工单类型">
            <w-row>
              <w-col :span="24">
                <w-select
                  :disabled="typeDisabled"
                  v-model="smallType"
                  placeholder="请选择工单类型"
                  :getPopupContainer="triggerNode => triggerNode.parentNode"
                >
                  <w-select-option v-for="c in templateTypeList" :key="c.code" :value="c.code">
                    {{ c.name }}
                  </w-select-option>
                </w-select>
              </w-col>
            </w-row>
          </w-form-model-item>

          <w-form-model-item class="template-form-id" required label="工单模板">
            <w-row>
              <w-col :span="24">
                <w-select
                  :disabled="templateDisabled"
                  v-model="templateId"
                  placeholder="请选择工单模板"
                  style="width: 100%;"
                  :getPopupContainer="triggerNode => triggerNode.parentNode"
                >
                  <w-select-option v-for="item in templates" :key="item.id" :value="item.code">
                    {{ item.name }}
                  </w-select-option>
                </w-select>
              </w-col>
            </w-row>
          </w-form-model-item>
        </w-form-model>

        <div class="template-form-container">
          <w-spin :spinning="spinning">
            <div class="template-form-box">
              <schema-form
                v-if="formConf"
                ref="parser"
                :key="formConfigKey"
                v-model="formData"
                :schema="formConf.schema"
                :formProps="formConf.formProps"
                :formFooter="{ show: false }"
              />

              <w-empty v-if="orgId && !formConf" :description="description" />
            </div>
          </w-spin>
        </div>
      </div>
    </w-config-provider>
  </w-modal>
</template>

<script>
import { mapState } from 'vuex';
import { APP_PREFIX_ANDROID } from '@/constants';
import cloneDeep from 'lodash.clonedeep';
import { SchemaForm } from '@wpg/form-design';
import { selectFormByTemplateId } from '@/api/form';
import { getListBySmallType } from '@/api/plan';
import { createTicket, getSysDictApi } from '@/api/work';
import uuid from '@/utils/uuid';
import config from '@/config/setting.config';

export default {
  name: 'TicketWpg',
  components: {
    SchemaForm
  },

  props: {
    noType: {
      type: Boolean,
      default: false
    },
    templateType: {
      type: String,
      default: ''
    },
    orderTemplateId: {
      type: String,
      default: ''
    },
    typeDisabled: {
      type: Boolean,
      default: false
    },
    templateDisabled: {
      type: Boolean,
      default: false
    },
    templateData: {
      type: Object,
      default: null
    }
  },

  data() {
    return {
      showOrg: false,
      orgId: '',
      templateId: '',
      smallType: '',
      templates: [],
      formConf: null,
      spinning: false,
      formConfigKey: '',
      confirmLoading: false,
      visible: false,
      formData: {},
      ticketData: null,
      formItemLayout: {
        labelCol: { span: 4 },
        wrapperCol: { span: 20 }
      },
      templateTypeList: []
    };
  },

  computed: {
    ...mapState('region', {
      orgTree: 'orgTree',
      orgList: 'orgList'
    }),
    title() {
      let item = this.templateTypeList.find(v => v.code === this.smallType);
      return item ? `创建${item.name}` : '创建流程';
    },
    description() {
      return this.orgId ? '该组织无相关工单模板' : '请先选择组织';
    },
    formKey() {
      if (this.templateId) {
        let idx = this.templates.findIndex(t => t.code === this.templateId);
        return idx > -1 ? this.templates[idx].formKey : '';
      } else {
        return '';
      }
    }
  },

  watch: {
    visible(val) {
      if (val) {
        this.formExtra = {};
        this.$store.dispatch('region/GenerateOrgs').then(() => {
          this.checkOrg();
        });
        this.smallType = this.templateTypeList?.length > 0 ? this.templateType : '';
      } else {
        this.formConf = null;
        this.orgId = '';
        this.templateId = '';
      }
      this.formData = {};
    },
    orgId() {
      if (this.orgId) {
        this.queryTemplate();
      }
    },
    smallType(val) {
      if (val) {
        this.queryTemplate();
      }
    },
    templateId() {
      if (this.templateId) {
        this.formData = {};
        if (!this.formKey) return;
        this.selectTemplateForm().then(() => {
          if (this.templateData) {
            this.fillForm();
          }
        });
      }
    }
  },
  created() {
    this.getSysDict();
  },
  methods: {
    getPopupContainer(node) {
      // 选择器弹出框渲染父节点上，解决滚动定位问题
      return node ? node.parentNode : document.body;
    },
    getSysDict() {
      let param = `/current_sys_small_type/${APP_PREFIX_ANDROID}`;
      getSysDictApi(param).then(res => {
        if (res.status === 'complete') {
          this.templateTypeList = res.resultData;
        }
      });
    },
    async queryTemplate() {
      if (!this.smallType) {
        return;
      }
      let ret = await getListBySmallType(this.smallType);
      let data = ret.resultData || [];
      this.templates = data;

      this.templateId =
        this.orderTemplateId && this.templateDisabled && this.typeDisabled
          ? this.orderTemplateId
          : data.length
          ? data[0].code
          : '';
    },
    async selectTemplateForm() {
      this.spinning = true;
      this.formConf = null;
      let ret = await selectFormByTemplateId(this.formKey);
      let result = ret.resultData || {};
      if (result.id) {
        // let data = this.handleFormFields(result.formJson);
        let formJson = this.updateUiOptions(result.formJson);
        this.spinning = false;
        this.formId = result.id;
        this.formConf = formJson;
        this.formConfigKey = uuid();
      }
    },

    async createTicket(data) {
      let formData = { ...data, ...this.formExtra };
      let alarmCreated = false;
      if (alarmCreated) {
        this.$message.warning('该报警已经绑定工单！');
        return false;
      } else {
        let params = {
          businessId: this.templateData.id,
          type: this.templateData.type === undefined ? 2 : this.templateData.type,
          createTicketDTO: {
            formId: this.formId,
            formJson: formData,
            templateCode: this.templateId,
            createTicketFormDTO: { ...formData, sysSource: 'secondary_water_supply_app_android' }
          }
        };

        if (this.noType) {
          delete params.type;
        }
        let ret = await createTicket(params);
        this.ticketData = ret.status === 'complete' ? ret.resultData : null;
        return ret.status === 'complete';
      }
    },

    updateUiOptions(formJson) {
      // let priority = formJson.schema.properties.priority;
      // priority['ui:options']['dataOptions']['action'] =
      //   '/getSysDictItemByCode/ticket_priority';
      return formJson;
    },

    handleOrgChange() {},

    handleFormFields(data) {
      if (data.fields) {
        data.fields.forEach(item => {
          if (item.__config__.url === '/common/getSysDictItemByCode/ticket_priority') {
            item.__config__.url = '/planTankClear/getSysDictItemByCode/ticket_priority';
          }
          if (item.__config__.url === '/productManagerClient/listCurrent') {
            item.__config__.url = '';
          }
          if (item.__vModel__ === 'solutionId') {
            item.orgId = this.orgId;
          }
        });
      }

      data.labelWidth = 150;

      return data;
    },

    checkOrg() {
      let showOrg = false;
      if (this.templateData && this.templateData.orgId) {
        this.orgId = this.templateData.orgId;
      } else {
        // let orgTree = this.orgTree;
        let orgList = this.orgList;

        // 如果只有一个组织，默认选中
        if (orgList.length === 1) {
          showOrg = false;
          this.orgId = orgList[0].orgId;
        } else {
          showOrg = true;
          this.orgId = orgList[0].orgId;
        }
      }

      this.showOrg = showOrg;
    },

    fillForm() {
      let data = {};
      if (this.templateType === 'planTankClear') {
        data.tankIds = this.stringifyValue(this.templateData.tankIds);
      }
      if (this.templateType === 'maintain') {
        data = {
          pumpIds: this.templateData.pumpIds,
          deviceComponents: this.templateData.deviceComponents
        };
      }
      if (this.templateType === 'waterRepair') {
        data = this.templateData;
      }
      if (this.templateType === 'planInspect') {
        if (this.templateData.pumpIds) {
          data = {
            pumpIds: this.templateData.pumpIds
          };
        }
      }

      if (this.templateData && this.templateData.solutionId) {
        data.solutionId = this.templateData.solutionId;
      }
      data = { ...data, ...this.templateData };
      if (this.$refs.parser) {
        this.formData = Object.assign(this.formData, data);
      }
    },

    stringifyValue(value) {
      let data = [];
      if (!value) return '';

      if (!Array.isArray(value)) {
        data = [value];
      } else {
        data = value;
      }

      return data;
    },

    handleSubmit(data) {
      let formData = cloneDeep(data);
      formData.priority = Number(formData.priority);
      this.confirmLoading = true;
      this.createTicket(formData)
        .then(ret => {
          this.confirmLoading = false;
          if (ret) {
            this.formConfigKey = uuid(); // 重置表单
            this.visible = false;
            this.$emit('update', true);

            setTimeout(() => {
              this.$emit('createTicket', this.ticketData);
              this.globalLoading.hide({ domId: 'ticket_modal' });
              this.$message.success('创建成功');
            }, 100);
          }
        })
        .catch(() => {
          this.confirmLoading = false;
        })
        .finally(() => {
          this.$emit('change', this.ticketData);
        });
    },

    handleOk() {
      if (this.$refs.parser) {
        this.$refs.parser.validate().then(valid => {
          let formData = this.$refs.parser.getFormData();

          if (valid) {
            this.globalLoading.show({ domId: 'ticket_modal' });
            this.handleSubmit(formData);
          }
        });
      } else {
        this.$message.error('请选择工单模板');
      }
    },

    handleCancel() {
      this.$emit('update', false);
      this.visible = false;
      this.formConfigKey = uuid(); // 重置表单
    }
  }
};
</script>

<style lang="less" scoped>
.ticket-dialog {
  /deep/ .wpg-modal-body {
    height: 450px;
    padding: 20px 40px;
    overflow: auto;
  }

  /deep/ .wpg-modal-footer {
    padding: 10px 40px 36px;
  }

  .template-form-id {
    // display: flex;
    width: 100%;
    padding: 12px;

    // /deep/ .ant-form-item-label {
    //   width: 150px;
    //   padding-right: 12px;
    //   border: 1px solid;
    //   text-align: left;
    // }

    // /deep/ .ant-form-item-control-wrapper {
    //   flex: 1;
    // }
  }
}
</style>
