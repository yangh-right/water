<template>
  <div class="main-content-wrap page-layout-wrap">
    <w-detail-header :pageTitle="title">
      <w-button
        type="primary"
        class="detail-button"
        :loading="subLoading"
        @click="submitForm"
        v-if="formType !== 'detail'"
      >
        提交
      </w-button>
      <w-button class="ml" @click="goBack">返回上级</w-button>
    </w-detail-header>
    <div class="content wbgc-card" v-loading="loading">
      <div class="title">基础信息</div>
      <w-divider />
      <w-info-form
        ref="baseForm"
        :fields="fields"
        :model="addForm"
        :layout="layout"
        :disabled="formType === 'detail'"
        :footer="null"
      >
        <template #productTimeDay>
          <div class="time-picker">
            <w-time-picker
              :disabled="formType === 'detail'"
              :open="open"
              v-model="productTime"
              format="HH:mm"
              @openChange="handleOpenChange"
              @change="changeTime"
            >
            </w-time-picker>
            <span class="time-picker-span">生产报表</span>
          </div>
        </template>
        <template #productTimeMonth>
          <div class="time-picker">
            <w-select style="width: 60px" v-model="reportDay" :disabled="formType === 'detail'">
              <w-select-option v-for="i in 31" :key="i" :value="i">{{ i }}</w-select-option>
            </w-select>
            <span class="time-picker-unit">日</span>
            <w-time-picker
              :open="open"
              :disabled="formType === 'detail'"
              v-model="productTime"
              format="HH:mm"
              @openChange="handleOpenChange"
              @change="changeTime"
            >
            </w-time-picker>
            <span class="time-picker-span">生产报表</span>
          </div>
        </template>
        <template #productTimeYear>
          <div class="time-picker">
            <w-select
              style="width: 60px"
              v-model="reportMonth"
              @change="changeMonth"
              :disabled="formType === 'detail'"
            >
              <w-select-option v-for="i in 12" :key="i" :value="i > 9 ? i : '0' + i">{{
                i
              }}</w-select-option>
            </w-select>
            <span class="time-picker-unit">月</span>
            <w-select style="width: 60px" v-model="reportDay" :disabled="formType === 'detail'">
              <w-select-option v-for="i in days" :key="i" :value="i > 9 ? i : '0' + i">{{
                i
              }}</w-select-option>
            </w-select>
            <span class="time-picker-unit">日</span>
            <w-time-picker
              :open="open"
              :disabled="formType === 'detail'"
              v-model="productTime"
              format="HH:mm"
              @openChange="handleOpenChange"
              @change="changeTime"
            >
            </w-time-picker>
            <span class="time-picker-span">生产报表</span>
          </div>
        </template>
      </w-info-form>
      <div class="title">处理人信息</div>
      <w-divider />
      <div class="info-title">提交处理人</div>
      <w-info-form
        class="person"
        ref="personForm"
        :fields="personFields"
        :model="subPersonForm"
        :layout="personLayout"
        :footer="null"
        :disabled="formType === 'detail'"
      >
      </w-info-form>
      <div class="info-title" v-if="subPersonForm.dealFlag === 1">审核处理人</div>
      <w-info-form
        v-if="subPersonForm.dealFlag === 1"
        class="person"
        ref="personForm"
        :fields="examPersonFields"
        :model="examPersonForm"
        :layout="personLayout"
        :footer="null"
        :disabled="formType === 'detail'"
      >
      </w-info-form>
    </div>
  </div>
</template>
<script>
import { layout, personLayout } from './config';
import _ from 'lodash-es';
import { sysDictListByCode } from '@/api/manage';
import { getAllUserList, getAllRolesList } from '@/api/public';
import { createOrUpdate, detailsById, designList } from '@/api/report';
import config from '@/config/setting.config';
import moment from 'moment';

export default {
  name: 'addReportConfig',
  inject: ['closeTab'],
  data() {
    return {
      title: '新增报表模板',
      subLoading: false,
      loading: false,
      formType: 'add', // add:新增， edit:编辑， detail:详情
      // 基础信息
      open: false,
      layout,
      fields: [],
      defaultFields: [
        {
          name: 'waterPlantId',
          label: '选择污水厂',
          type: 'select',
          placeholder: '请选择',
          colon: true,
          options: [],
          attrs: {
            allowClear: true
          },
          value: '',
          listeners: { change: this.handleChangeWaterPlant }
        },
        {
          name: 'designId',
          label: '关联报表设计',
          required: true,
          type: 'select',
          placeholder: '请选择',
          options: []
        },
        {
          name: 'templateType',
          label: '分类',
          required: true,
          type: 'select',
          placeholder: '请选择',
          options: []
        },
        {
          name: 'reportType',
          label: '报表类型',
          required: true,
          type: 'select',
          placeholder: '请选择',
          options: [],
          listeners: {
            change: this.changeReportType
          }
        }
      ],
      productTimeDay: {
        name: 'productTimeDay',
        label: '每天',
        type: 'input',
        placeholder: '请选择时间',
        listeners: {},
        colon: false,
        span: 24,
        labelCol: { span: 3 },
        wrapperCol: { span: 9 },
        rules: [{ validator: this.checkProductTimeDay, required: true }]
      },
      productTimeMonth: {
        name: 'productTimeMonth',
        label: '每月',
        type: 'input',
        placeholder: '请选择时间',
        listeners: {},
        colon: false,
        span: 24,
        labelCol: { span: 3 },
        wrapperCol: { span: 9 },
        rules: [{ validator: this.checkProductTimeMonth, required: true }]
      },
      productTimeYear: {
        name: 'productTimeYear',
        label: '每年',
        type: 'input',
        placeholder: '请选择时间',
        listeners: {},
        colon: false,
        span: 24,
        labelCol: { span: 3 },
        wrapperCol: { span: 9 },
        rules: [{ validator: this.checkProductTimeYear, required: true }]
      },
      // 基础信息
      addForm: {
        id: undefined,
        waterPlantId: undefined
      },
      noAuthList: [], // 关联报表设计数据，用于获取名称
      // 时间
      days: 31,
      reportMonth: '',
      reportDay: '',
      productTime: null,
      productTimeStr: '',
      // 处理人信息
      personLayout,
      // 提交处理人
      subPersonForm: {
        dealFlag: 1,
        assUser: '',
        assRole: ''
      },
      // 审核处理人
      examPersonForm: {
        examFlag: 1,
        assUser: '',
        assRole: ''
      },
      personFields: [
        {
          name: 'dealFlag',
          label: '是否需要提交',
          type: 'radio-group',
          listeners: {},
          options: [
            {
              label: '是',
              value: 1
            },
            {
              label: '否',
              value: 0
            }
          ]
        },
        {
          name: 'assUser',
          label: '关联用户',
          type: 'select',
          placeholder: '请选择',
          options: []
        },
        {
          name: 'assRole',
          label: '关联角色',
          type: 'select',
          placeholder: '请选择',
          options: []
        }
      ],

      defaultPersonFields: [
        {
          name: 'dealFlag',
          label: '是否需要提交',
          type: 'radio-group',
          listeners: {},
          options: [
            {
              label: '是',
              value: 1
            },
            {
              label: '否',
              value: 0
            }
          ]
        }
      ],
      examPersonFields: [
        {
          name: 'examFlag',
          label: '是否需要审核',
          type: 'radio-group',
          listeners: {},
          options: [
            {
              label: '是',
              value: 1
            },
            {
              label: '否',
              value: 0
            }
          ]
        },
        {
          name: 'assUser',
          label: '关联用户',
          type: 'select',
          placeholder: '请选择',
          options: []
        },
        {
          name: 'assRole',
          label: '关联角色',
          type: 'select',
          placeholder: '请选择',
          options: []
        }
      ],
      defaultExamFlagFields: [
        {
          name: 'examFlag',
          label: '是否需要审核',
          type: 'radio-group',
          listeners: {},
          options: [
            {
              label: '是',
              value: 1
            },
            {
              label: '否',
              value: 0
            }
          ]
        }
      ],
      assUser: {
        name: 'assUser',
        label: '关联用户',
        type: 'select',
        placeholder: '请选择',
        options: []
      },
      assRole: {
        name: 'assRole',
        label: '关联角色',
        type: 'select',
        placeholder: '请选择',
        options: []
      }
    };
  },
  watch: {
    $route: {
      async handler(val) {
        // this.addForm = _.cloneDeep({ id: '' });
        this.addForm.id = val.query?.id || undefined;
        this.addForm.waterPlantId = val.query?.waterPlantId || undefined;
        this.formType = val.query?.type;
        this.subPersonForm.dealFlag = 1;
        this.subPersonForm.assUser = ''; // 关联提交用户
        this.subPersonForm.assRole = '';

        this.examPersonForm.examFlag = 1;
        this.examPersonForm.assUser = ''; // 关联提交用户
        this.examPersonForm.assRole = '';

        if (this.addForm.id) {
          this.loading = true;
          // 获取编辑信息
          await this.getDetailsById();
          this.loading = false;
        }
      },
      deep: true,
      immediate: true
    },
    'addForm.reportType': {
      handler(val) {
        if (val) {
          if (val === 'day') {
            this.fields = _.cloneDeep([...this.defaultFields, this.productTimeDay]);
          } else if (val === 'month') {
            this.fields = _.cloneDeep([...this.defaultFields, this.productTimeMonth]);
          } else if (val === 'year') {
            this.fields = _.cloneDeep([...this.defaultFields, this.productTimeYear]);
          }
        } else {
          this.fields = _.cloneDeep([...this.defaultFields]);
        }
      },
      immediate: true,
      deep: true
    },
    subPersonForm: {
      handler(val) {
        if (val?.dealFlag === 1) {
          this.personFields = _.cloneDeep([
            ...this.defaultPersonFields,
            this.assUser,
            this.assRole
          ]);
        } else {
          this.personFields = _.cloneDeep([...this.defaultPersonFields]);
        }
      },
      deep: true,
      immediate: true
    },
    examPersonForm: {
      handler(val) {
        if (val?.examFlag === 1) {
          this.examPersonFields = _.cloneDeep([
            ...this.defaultExamFlagFields,
            this.assUser,
            this.assRole
          ]);
        } else {
          this.examPersonFields = _.cloneDeep([...this.defaultExamFlagFields]);
        }
      },
      deep: true,
      immediate: true
    }
  },
  mounted() {
    this.getSysDictListByCodeType(); // 获取报表分类字典
    this.getSysDictListByCodeCut(); // 获取报表类型字典
    this.getFactoryList();
    this.getAllUserList(); // 关联用户
    this.getAllRolesList(); // 关联角色
  },
  methods: {
    // 改变月份
    changeMonth(m) {
      let year = this.$dayjs(new Date()).format('YYYY');
      let month = m * 1;
      this.getDays(year, month);
      this.reportDay = '';
    },
    // 获取天数
    getDays(year, month) {
      if (month * 1 === 2) {
        this.days = new Date(year, month, 0).getDate() + 1;
      } else {
        this.days = new Date(year, month, 0).getDate();
      }
    },
    async submitForm() {
      this.$refs['baseForm'].validate(async val => {
        if (val) {
          let params = {
            id: '',
            name: '',
            templateType: '',
            reportType: '',
            validFlag: 0,
            designId: '',
            productTimeVal: {},
            dealFlag: 0,
            examFlag: 0,
            dealUserIds: '',
            dealRoleIds: '',
            examUserIds: '',
            examRoleIds: '',
            waterPlantName: '',
            waterPlantId: ''
          };
          // 获取当前时间
          if (this.addForm.reportType === 'day') {
            params.productTimeVal = { time: this.productTimeStr };
          } else if (this.addForm.reportType === 'month') {
            params.productTimeVal = { day: this.reportDay, time: this.productTimeStr };
          } else if (this.addForm.reportType === 'year') {
            params.productTimeVal = {
              month: this.reportMonth,
              day: this.reportDay,
              time: this.productTimeStr
            };
          }
          params.dealFlag = this.subPersonForm.dealFlag; // 是否需要提交
          params.examFlag =
            this.subPersonForm.dealFlag * 1 === 1 ? this.examPersonForm.examFlag : 0; // 是否需要审核
          params.templateType = this.addForm.templateType; // 字典code生产运行、水质化验
          params.reportType = this.addForm.reportType; // 日月年 字典
          params.validFlag = 1; // 是否有效
          params.designId = this.addForm.designId; // 关联报表设计id
          params.dealUserIds = this.subPersonForm.assUser; // 关联提交用户 assUser assRole
          params.dealRoleIds = this.subPersonForm.assRole; // 关联提交角色 assUser assRole
          params.examUserIds = this.examPersonForm.assUser; // 关联审核用户 assUser assRole
          params.examRoleIds = this.examPersonForm.assRole; // 关联审核角色 assUser assRole
          params.waterPlantName = this.addForm.waterPlantName; // 选择水厂
          params.waterPlantId = this.addForm.waterPlantId; //选择水厂
          params.id = this.addForm?.id || ''; // 编辑id
          params.name = this.noAuthList.filter(
            item => item.value === this.addForm.designId
          )[0]?.label; // 选择水厂
          let dealFlagForm = true;
          let examFlagForm = true;
          if (params.dealFlag) {
            dealFlagForm = false;
            if (params.dealUserIds || params.dealRoleIds) {
              dealFlagForm = true;
            } else {
              this.$message.warn('提交处理人，关联用户和关联角色至少填写一个！');
            }
          } else {
            dealFlagForm = true;
          }
          if (params.examFlag) {
            examFlagForm = false;
            if (params.examUserIds || params.examRoleIds) {
              examFlagForm = true;
            } else {
              this.$message.warn('审核处理人，关联用户和关联角色至少填写一个！');
            }
          } else {
            examFlagForm = true;
          }
          if (dealFlagForm && examFlagForm) {
            await createOrUpdate(params);
            this.$message.success(params.id ? '编辑成功！' : '新增成功！');
            this.goBack();
          }
        }
      });
    },
    // 获取编辑信息
    async getDetailsById() {
      let entityId = this.addForm.id;
      try {
        const { resultData } = await detailsById({ entityId });
        this.addForm.waterPlantId = resultData.waterPlantId; // 水厂
        this.addForm.designId = resultData.designId; // 关联报表设计
        this.addForm.templateType = resultData.templateType; // 分类
        this.addForm.reportType = resultData.reportType; // 报表类型

        this.subPersonForm.dealFlag = resultData.dealFlag;
        this.subPersonForm.assUser = resultData.dealUserIds; // 关联提交用户
        this.subPersonForm.assRole = resultData.dealRoleIds;

        this.examPersonForm.examFlag = resultData.examFlag;
        this.examPersonForm.assUser = resultData.examUserIds; // 关联提交用户
        this.examPersonForm.assRole = resultData.examRoleIds;
        let productTime = JSON.parse(resultData.productTimeVal);
        if (resultData.reportType === 'month') {
          // 日
          this.reportDay = productTime.day * 1;
        }
        if (resultData.reportType === 'year') {
          // 月
          this.reportMonth = productTime.month * 1;
          this.reportDay = productTime.day * 1;
        }
        this.productTime = moment(productTime.time, 'HH:mm');
        this.productTimeStr = productTime.time;
      } catch (error) {
        //
      }
    },
    goBack() {
      const { path } = this.$route;
      this.closeTab();
      this.goto('/report/ModuleReportConfig');
    },
    async getFactoryList() {
      const { resultData } = await this.$http.post('waterPlantClient/getWaterPlants');
      this.waterPlantsList = resultData.map(a => ({ label: a.stationName, value: a.id, ...a }));
      if (Array.isArray(this.waterPlantsList) && this.waterPlantsList.length > 0) {
        this.fields[0].options = this.waterPlantsList;
        this.fields[0].value = this.waterPlantsList[0].id;

        this.addForm.waterPlantId = this.waterPlantsList[0].id;
        await this.designListList(); // 关联报表设计
      }
    },
    // 获取报表分类字典
    async getSysDictListByCodeType() {
      let { resultData } = await sysDictListByCode('water_report_type');
      this.defaultFields[2].options = resultData.map(a => ({
        label: a.dictName,
        value: a.dictCode
      }));
      this.fields[2].options = resultData.map(a => ({ label: a.dictName, value: a.dictCode }));
    },
    // 获取报表类型字典
    async getSysDictListByCodeCut() {
      let { resultData } = await sysDictListByCode('water_report_form');
      this.defaultFields[3].options = resultData.map(a => ({
        label: a.dictName,
        value: a.dictCode
      }));
      this.fields[3].options = resultData.map(a => ({ label: a.dictName, value: a.dictCode }));
    },
    // 获取关联报表设计
    async designListList() {
      if (this.addForm?.waterPlantId) {
        const { resultData } = await designList(this.addForm.waterPlantId, {
          pageFlag: false,
          reportState: 'Y',
          isTemplate: 'N'
        });
        let list = resultData?.map(a => ({ label: a.reportName, value: a.id }));
        let designLists = [...list];
        if (this.$route.query?.designName && this.$route.query?.designId) {
          designLists = [
            {
              label: this.$route.query?.designName,
              value: this.$route.query?.designId
            },
            ...list
          ];
        }
        this.defaultFields[1].options = designLists;
        this.fields[1].options = designLists;
        this.noAuthList = designLists;
      }
    },
    // 获取用户
    async getAllUserList() {
      const { resultData } = await getAllUserList();
      this.assUser.options = resultData?.map(a => ({ label: a.userName, value: a.id }));
      if (this.subPersonForm.dealFlag * 1 === 1) {
        this.personFields[1].options = resultData?.map(a => ({ label: a.userName, value: a.id }));
        this.examPersonFields[1].options = resultData?.map(a => ({
          label: a.userName,
          value: a.id
        }));
      }
    },
    // 获取角色
    async getAllRolesList() {
      const { resultData } = await getAllRolesList({
        roleName: ''
      });
      this.assRole.options = resultData.map(a => ({ label: a.roleName, value: a.roleId }));
      if (this.examPersonForm.examFlag * 1 === 1) {
        this.personFields[2].options = resultData?.map(a => ({
          label: a.roleName,
          value: a.roleId
        }));
        this.examPersonFields[2].options = resultData?.map(a => ({
          label: a.roleName,
          value: a.roleId
        }));
      }
    },
    handleOpenChange(open) {
      this.open = open;
    },
    changeTime(time, timestr) {
      this.productTimeStr = timestr;
    },
    // 切换水厂
    handleChangeWaterPlant(value, label) {
      this.addForm.waterPlantName = label[0];
      // 切换报表列表
      this.designListList(); // 关联报表设计
      this.addForm.designId = '';
    },
    //  报表类型
    changeReportType(val) {
      this.addForm.reportType = val;
      // 月
      this.reportMonth = '';
      // 日
      this.reportDay = '';
      // 时间
      this.productTime = null;
    },
    // 检查day
    checkProductTimeDay(rule, value, callback) {
      if (!this.productTime) {
        callback(new Error('请选择时间！'));
      } else {
        callback();
      }
    },
    checkProductTimeMonth(rule, value, callback) {
      if (!this.productTime) {
        callback(new Error('请选择时间！'));
      }
      if (!this.reportDay) {
        callback(new Error('请选择日！'));
      }
      if (this.productTime && this.reportDay) {
        callback();
      }
    },
    checkProductTimeYear(rule, value, callback) {
      if (!this.productTime) {
        callback(new Error('请选择时间！'));
      }
      if (!this.reportMonth) {
        callback(new Error('请选择月！'));
      }
      if (!this.reportDay) {
        callback(new Error('请选择日！'));
      }
      if (this.productTime && this.reportMonth && this.reportDay) {
        callback();
      }
    }
  }
};
</script>

<style lang="less" scoped>
.ml {
  margin-left: 10px;
}
.page-layout-wrap {
  width: 100%;
  height: 100%;
  .content {
    height: calc(~'100% - 64px');
    padding: 20px;
    overflow: hidden;
    overflow-y: auto;
  }
}
.time-picker {
  display: flex;
  align-items: center;
}
.time-picker-unit {
  margin: 0 10px;
}
.time-picker-span {
  margin-left: 20px;
  width: 80px;
}
/deep/ .wpg-time-picker {
  flex: 1;
}
.info-title {
  height: 60px;
  padding-left: 20px;
  line-height: 60px;
}
</style>
