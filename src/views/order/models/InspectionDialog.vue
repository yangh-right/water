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
    <div v-if="visible && isEdit">
      <w-form-model
        ref="form"
        v-bind="layout"
        :model="form"
        :rules="rules">
        <w-row>
          <w-col :span="12" class="org-select">
            <w-form-model-item label="选择污水厂" prop="waterPlantId">
              <FactorySelect
                v-model.trim="form.waterPlantId"
                :disabled="editType === 2 || editType === 3"
                :showAll="false"
                :autoSelect="true"
                placeholder="请选择污水厂"
                @change="handleChange"
              ></FactorySelect>
            </w-form-model-item>
          </w-col>
          <w-col :span="12">
            <w-form-model-item label="计划名称" prop="planName">
              <w-input
                v-model.trim="form.planName"
                :maxLength="100"
                allowClear
                placeholder="请输入计划名称"
              ></w-input>
            </w-form-model-item>
          </w-col>
          <w-col :span="12">
            <w-form-model-item label="计划描述" prop="remark">
              <w-input
                v-model="form.remark"
                placeholder="请输入计划描述"
                :maxLength="100"
                allowClear
              />
            </w-form-model-item>
          </w-col>
          <w-col v-show="formItemShow" :span="12">
            <w-form-model-item label="执行周期" prop="cycleType">
              <w-select
                v-model="form.cycleType"
                style="width: 40%; min-width: 80px;"
                default-value="0"
                :getPopupContainer="triggerNode => triggerNode.parentNode"
                @change="handleCycleChange"
              >
                <w-select-option :value="-1">
                  天
                </w-select-option>
                <w-select-option :value="0">
                  周
                </w-select-option>
                <w-select-option :value="1">
                  月
                </w-select-option>
                <w-select-option :value="9">
                  自定义
                </w-select-option>
              </w-select>
            </w-form-model-item>
          </w-col>
          <w-col :span="24">
            <w-form-model-item label="计划时间" prop="rangeTime" v-bind="layout1">
              <w-range-picker
                v-model="form.rangeTime"
                :disabledDate="disabledDate"
                :allowClear="false"
                format="YYYY-MM-DD"
                :placeholder="['开始时间', '结束时间']"
              >
                <w-icon
                  slot="suffixIcon"
                  type="ic_date_range"
                  style="margin-top: -10px;font-size: 20px;"
                ></w-icon>
              </w-range-picker>
            </w-form-model-item>
          </w-col>
          <w-col v-if="formItemShow && form.cycleType !== -1" :span="12">
            <w-form-model-item :label="formItemShow ? '工单生成日期' : ''" prop="cycleDay">
              <w-select
                v-if="form.cycleType === 0"
                v-model="form.cycleDay"
                :maxTagCount="1"
                mode="multiple"
                placeholder="请选择工单生成日期"
              >
                <w-select-option v-for="item in weekList" :key="item" :value="item">
                  {{ '星期' + weekdays[item] }}
                </w-select-option>
              </w-select>

              <w-select
                v-if="form.cycleType === 1"
                v-model="form.cycleDay"
                :maxTagCount="1"
                mode="multiple"
                placeholder="请选择工单生成日期"
              >
                <w-select-option v-for="item in monthList" :key="item">
                  {{ item + '号' }}
                </w-select-option>
              </w-select>

              <!-- 线下 自定执行周期处理 -->
              <w-select
                v-if="form.cycleType === 9"
                v-model="form.cycleDay"
                :maxTagCount="1"
                mode="multiple"
                placeholder="请选择工单生成日期"
              >
                <w-select-option v-for="item in customList" :key="item.code" :value="item.code">
                  {{ item.name }}
                </w-select-option>
              </w-select>

              <w-date-picker
                v-if="form.cycleType === 2 || form.cycleType === 3"
                v-model="form.cycleDay"
                :valueFormat="'YYYY-MM-DD'"
              />
            </w-form-model-item>
          </w-col>
          <w-col v-show="formItemShow" :span="12">
            <w-form-model-item label="工单标题" prop="ticketTitle">
              <w-input
                v-model.trim="form.ticketTitle"
                :max="50"
                placeholder="请输入工单标题"
              ></w-input>
            </w-form-model-item>
          </w-col>

          <w-col v-show="formItemShow" :span="12">
            <w-form-model-item label="工单模板" prop="ticketTemplateCode">
              <w-select
                v-model="form.ticketTemplateCode"
                style="min-width: 198px;"
                :getPopupContainer="triggerNode => triggerNode.parentNode"
                show-search
                option-filter-prop="children"
                placeholder="请选择工单模板"
              >
                <w-select-option v-for="item in templateList" :key="item.code" :value="item.code">
                  {{ item.name }}
                </w-select-option>
              </w-select>
            </w-form-model-item>
          </w-col>

          <w-col v-show="!formItemShow" :span="12" class="execute-cycle">
            <w-col :span="13">
              <w-form-model-item label="计划周期" prop="everyCycleTimes" v-bind="layout2">
                <w-input-number v-model="form.everyCycleTimes" style="width: 70px;" :min="1" placeholder="每几" />
              </w-form-model-item>
            </w-col>
            <w-col :span="5">
              <w-form-model-item label="" prop="cycleType" v-bind="layout3">
                <w-select
                  v-model="form.cycleType"
                  style="width: 70px;"
                  default-value="0"
                  :getPopupContainer="triggerNode => triggerNode.parentNode"
                  @change="handleCycleChange"
                >
                  <w-select-option :value="0">
                    周
                  </w-select-option>
                  <w-select-option :value="1">
                    月
                  </w-select-option>
                </w-select>
              </w-form-model-item>
            </w-col>
            <w-col :span="6">
              <w-form-model-item label="" prop="cycleTimes" v-bind="layout3">
                <div style="display: flex; align-items: center;">
                  <w-input-number v-model="form.cycleTimes" :min="1" placeholder="几次" style="width: 70px;"/>
                  <span style="white-space: nowrap;">次</span>
                </div>
              </w-form-model-item>
            </w-col>
          </w-col>
          
          <!-- <w-col v-show="!formItemShow" :span="12">
            <w-form-model-item label="负责人" prop="selectUserBase">
              <w-select
                v-model="form.selectUserBase"
                :maxTagCount="1"
                allow-clear
                :multiple="false"
                style="width: 198px"
                placeholder="请选择负责人"
                :filter-option="filterOption"
                @change="userBaseChange"
              >
                <w-select-option v-for="item in userBaseList" :key="item.key" :value="item.value">
                  {{ item.title }}
                </w-select-option>
              </w-select>
            </w-form-model-item>
          </w-col> -->

          <w-col v-if="form.planType === '1'" :span="12" class="org-select">
            <w-form-model-item label="选择组态" prop="serviceId">
              <w-select
                v-if="form.planType === '1'"
                v-model="form.serviceId"
                :disabled="editType === 2 || editType === 3"
                allow-clear
                placeholder="请选择组态"
              >
                <w-select-option v-for="item in svgList" :key="item.id" :value="item.id">
                  {{ item.svgName }}
                </w-select-option>
              </w-select>
            </w-form-model-item>
          </w-col>

          <w-col v-if="formItemShow" :span="12">
            <w-form-model-item label="巡检路线" prop="serviceId">
              <w-select
                v-model="form.serviceId"
                allow-clear
                placeholder="请选择巡检路线"
              >
                <w-select-option v-for="item in inspectList" :key="item.id" :value="item.id">
                  {{ item.inspectionType }}
                </w-select-option>
              </w-select>
            </w-form-model-item>
          </w-col>

          <w-col v-show="formItemShow" :span="12">
            <w-form-model-item label="优先级" prop="ticketPriority">
              <w-select
                v-model="form.ticketPriority"
                style="min-width: 80px;"
                placeholder="请选择优先级"
                :getPopupContainer="triggerNode => triggerNode.parentNode"
              >
                <w-select-option v-for="item in ticketPriority" :key="item.code" :value="item.code">
                  {{ item.name }}
                </w-select-option>
              </w-select>
            </w-form-model-item>
          </w-col>

          <w-col
            :span="24"
            v-show="form.planType === '2' || form.planType === '3' || form.planType === '5'"
          >
            <w-form-model-item label="执行人员/群组" prop="userBaseDTOS" v-bind="layout1">
              <Ticket-Dispatch v-model="form.userBaseDTOS" style="width: 400px" />
            </w-form-model-item>
          </w-col>
        </w-row>
      </w-form-model>
    </div>
  </w-modal>
</template>

<script>
import TicketDispatch from '@/components/ticket-dispatch';
import { mapState, mapMutations, mapGetters } from 'vuex';
import FactorySelect from '@/components/factory-select/index.vue';
import moment from 'moment';
import {
  updateInspectPlan,
  selectInspectPlanNew,
  getSysDictItemByCode,
  getListBySmallType,
  getAllUser,
  updateInspectPlanNew,
  getInspectionLinePage
} from '@/api/plan';
import { sysDictListByCode, queryPumpHouse } from '@/api/manage';
import { siteSvgList } from '@/api/configuration';
const EDIT_TYPE_MAP = {
  1: '新增',
  2: '编辑',
  3: '查看'
};

const CYCLE_TYPE = {
  0: '周',
  '-1': '天',
  1: '月',
  2: '季',
  3: '年',
  9: '周期'
};

const PLAN_TYPE = {
  1: '线上巡检',
  2: '线下巡检',
  3: '保养',
  5: '化验计划'
};

/* 切换计划类型与知识联动，根据value传名称keyWord */
const KNOW_TYPE = {
  1: '巡检',
  2: '巡检',
  3: '保养'
};

const columnDetail = [
  {
    title: '序号',
    dataIndex: 'index',
    key: 'index',
    customRender: (text, row, index) => {
      return index + 1;
    }
  },
  {
    title: '污水厂名称',
    dataIndex: 'title',
    key: 'title'
  }
];

const WEEK_DAYS = ['', '一', '二', '三', '四', '五', '六', '日'];
const WEEK_LIST = [];
let MONTH_LIST = [];
for (let i = 1; i < 32; i++) {
  MONTH_LIST.push(i.toString());
}
for (let i = 1; i < 8; i++) {
  WEEK_LIST.push(i.toString());
}

let defaultForm = {
  planType: undefined,
  planName: '',
  orgId: undefined,
  serviceId: undefined,
  activeFlag: true,
  everyCycleTimes: 1,
  cycleTimes: 1,
  cycleDay: undefined,
  startTime: '',
  endTime: '',
  rangeTime: [],
  userBaseDTOS: [],
  remark: '',
  pumpHouseVOS: [],
  orgName: '',
  cycleType: 0,
  pumpIds: [],
  ticketTemplateCode: undefined,
  ticketPriority: '1',
  ticketTitle: ''
};

export default {
  components: {
    TicketDispatch,
    FactorySelect
  },

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
    initPlanType: {
      type: String,
      default: ''
    },
    inspectData: {
      type: Object,
      default: () => ({})
    },
    planTypeList: {
      //计划类型
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      pumpData: '',
      ticketPriority: [],
      templateList: [],
      relatePumps: [], //已关联的泵房列表
      form: { ...defaultForm, planType: this.initPlanType },
      rules: {
        planType: [{ required: true, message: '请选择计划类型' }],
        planName: [
          { required: true, message: '请输入计划名称' },
          { max: 100, message: '计划名称最多100个字符' }
        ],
        cycle: [{ required: true, validator: this.validatePass, tirgger: 'change' }],
        everyCycleTimes: [
          { required: true, validator: this.validatecycle1, tirgger: ['blur', 'change'] }
        ],
        cycleType: [
          { required: true, validator: this.validatecycle2, tirgger: ['blur', 'change'] }
        ],
        cycleTimes: [
          { required: true, validator: this.validatecycle3, tirgger: ['blur', 'change'] }
        ],
        serviceId: [
          {
            required: true,
            type: 'number',
            message: this.initPlanType === '1' ? '请选择组态' : '请选择巡检线路',
            tirgger: ['blur', 'change']
          }
        ],
        rangeTime: [{ required: true, validator: this.validateDate, trigger: ['blur', 'change'] }],
        remark: [{ required: true, message: '请填写计划描述', trigger: 'blur' }],
        ticketTemplateCode: [{ required: false, message: '请选择工单模板' }],
        ticketTitle: [
          { required: false, message: '请输入工单标题' },
          { max: 50, message: '工单标题最多50个字符' }
        ],
        ticketPriority: [{ required: false, message: '请选择工单优先级' }],
        waterPlantId: [{ required: true, message: '请选择污水厂', trigger: ['change'] }],
        cycleDay: [{ required: true, message: '请选择工单生成日期', trigger: ['blur', 'change'] }]
      },
      layout: {
        labelCol: { span: 8 },
        wrapperCol: { span: 16 }
      },
      layout1: {
        labelCol: { span: 4 },
        wrapperCol: { span: 20 }
      },
      layout2: {
        labelCol: { span: 15 },
        wrapperCol: { span: 9 }
      },
      layout3: {
        labelCol: { span: 2 },
        wrapperCol: { span: 22 }
      },
      confirmLoading: false,
      visible: false,
      isEdit: this.editable,
      svgList: [],
      inspectList: [],
      // 负责人列表
      userBaseList: [],
      // 选中负责人列表
      selectUserBase: [],
      // 选中污水厂列表
      selectPumpList: [],
      // 污水厂列表
      allPumpList: [],
      newList: [],
      // 子节点列表
      isChildList: [],
      // 查看详情列表
      columnDetail,
      detailPumpList: [],
      // 周列表
      weekList: WEEK_LIST,
      weekdays: WEEK_DAYS,
      // 月列表
      monthList: MONTH_LIST,
      addId: 0,
      params: {
        ids: [],
        type: 'org',
        page: {
          current: 1,
          size: 10000
        },
        keyword: ''
      },
      pages: 0
    };
  },

  computed: {
    ...mapState('dict', {
      operationType: state => state.operation_type
    }),
    ...mapState('region', {
      orgTree: 'orgTree',
      orgList: 'orgList'
    }),
    ...mapGetters('dictionary', ['waterPlantTree', 'firstWaterPlant']),
    modalTitle() {
      let text = EDIT_TYPE_MAP[this.editType];
      if (this.isEdit && this.editType === 3) {
        text = '编辑';
      }
      return `${text}计划`;
    },
    okText() {
      return this.isEdit ? '提交' : '编辑';
    },
    // 线下 自定义执行周期的 工单生成时间列表
    customList() {
      let list = [];
      // 执行周期为自定义 并且 计划时间已选
      if (this.form.cycleType === 9 && this.form.rangeTime.length > 0) {
        let startDate = this.$moment(this.form.rangeTime[0]);
        let endDate = this.$moment(this.form.rangeTime[1]);
        for (; startDate.isSameOrBefore(endDate); startDate.add(1, 'days')) {
          list.push({
            code: startDate.format('YYYY-MM-DD'),
            name: startDate.format('YYYY-MM-DD') + ' ' + `星期${WEEK_DAYS[startDate.weekday() + 1]}`
          });
        }
      }
      return list;
    },
    cycleDays() {
      let list = [];
      if (this.form.cycleType === '0') {
        for (let i = 1; i <= 31; i++) {
          list.push({
            code: String(i),
            name: `${i}号`
          });
        }
      }

      if (this.form.cycleType === '1') {
        for (let i = 1; i <= 7; i++) {
          list.push({
            code: String(i),
            name: `星期${WEEK_DAYS[i]}`
          });
        }
      }

      return list;
    },
    orgName() {
      if (this.form.orgId && this.orgList.length) {
        let item = this.orgList.find(o => o.orgId === this.form.orgId);

        return item ? item.orgName : '-';
      }

      return '';
    },
    templateName() {
      if (this.form.ticketTemplateCode && this.templateList.length) {
        let item = this.templateList.find(o => o.code === this.form.ticketTemplateCode);

        return item ? item.name : '-';
      }

      return '';
    },
    priorityName() {
      if (this.form.ticketPriority && this.ticketPriority.length) {
        let item = this.ticketPriority.find(o => o.code === this.form.ticketPriority);

        return item ? item.name : '-';
      }

      return '';
    },
    cycleDay() {
      if (this.form.cycleType && this.form.cycleDay) {
        return this.cycleDayFormat(this.form.cycleDay, this.form.cycleType);
      }

      return '';
    },
    cycleType() {
      const record = this.form;
      if (record.planType === '1') {
        return `${record.everyCycleTimes}${CYCLE_TYPE[record.cycleType]}${record.cycleTimes}次`;
      } else {
        let len;
        if (record.cycleDay) {
          len = record.cycleDay.length;
        } else {
          len = 0;
        }
        return `1${CYCLE_TYPE[record.cycleType]}${len}次`;
      }
    },
    planType() {
      return PLAN_TYPE[this.form.planType];
    },
    isKeyWord() {
      return KNOW_TYPE[this.form.planType];
    },
    charge() {
      let list = [];
      this.form.userBaseDTOS.forEach(item => {
        list.push(item.userName);
      });
      return list.join(',');
    },
    // 线下巡检或保养时显示其余form
    formItemShow() {
      let show = false;
      switch (this.form.planType) {
        case '2':
          show = true;
          break;
        case '3':
          show = true;
          break;
        case '5':
          show = true;
          break;
        default:
          show = false;
          break;
      }
      return show;
    },
    treeData() {
      let keyword = this.params.keyword;
      let list = [];
      if (keyword) {
        list = this.allPumpList.filter(pump => {
          return pump.title.indexOf(keyword) > -1 || pump.value.indexOf(keyword) > -1;
        });
      } else {
        list = this.allPumpList;
      }
      if (list.length <= 0) return [];
      return [{ title: '全选', key: 'allCheck', value: 'allCheck', children: list }];
    },
    filetrKeys() {
      return data => {
        if (data.length <= 0) return [];
        let list = data.filter(d => this.treeData[0].children.find(t => t.value === d));
        let idx = data.findIndex(p => p === 'allCheck');
        let len = idx >= 0 ? data.length - 1 : data.length;
        if (len === this.treeData[0].children.length) {
          // 全选
          if (idx < 0) list.push('allCheck');
        } else {
          if (idx >= 0) list.splice(idx, 1);
        }
        return list;
      };
    }
  },

  watch: {
    editable(val) {
      this.isEdit = val;
    },
    visible(val) {
      if (val) {
        this.isEdit = this.editable;
        // this.getUserList(this.inspectData.planType ? this.inspectData.planType : '1');
        this.getSvgList();
        this.getInspectionList();
        this.restoreData();
        if (this.editType === 1) {
          this.queryTemplate();
        }
      } else {
        this.params = {
          ids: [],
          type: 'org',
          page: {
            current: 1,
            size: 10000
          },
          keyword: ''
        };
        this.allPumpList = [];
      }
    },
    'form.planType': {
      handler() {
        if (
          this.form.planType === '2' ||
          this.form.planType === '3' ||
          this.form.planType === '5'
        ) {
          this.rules.ticketTemplateCode[0].required = true;
          this.rules.ticketPriority[0].required = true;
          this.rules.ticketTitle[0].required = true;
          this.rules.cycleDay[0].required = true;
          this.rules.cycleTimes[0].required = false;
          this.rules.everyCycleTimes[0].required = false;
        } else {
          this.rules.ticketTemplateCode[0].required = false;
          this.rules.ticketPriority[0].required = false;
          this.rules.ticketTitle[0].required = false;
          this.rules.cycleDay[0].required = false;
          this.rules.cycleTimes[0].required = true;
          this.rules.everyCycleTimes[0].required = true;
        }
      },
      immediate: true
    },
    'form.cycleType': {
      immediate: true,
      handler(val) {
        switch (val) {
          case -1:
            this.form.rangeTime = [
              this.$moment()
                .startOf('day')
                .format('YYYY-MM-DD HH:mm:ss'),
              this.$moment()
                .endOf('day')
                .format('YYYY-MM-DD HH:mm:ss')
            ];
            break;
          case 0:
            this.form.rangeTime = [
              this.$moment().format('YYYY-MM-DD HH:mm:ss'),
              this.$moment()
                .add(7, 'days')
                .format('YYYY-MM-DD HH:mm:ss')
            ];
            break;
          case 1:
            this.form.rangeTime = [
              this.$moment().format('YYYY-MM-DD HH:mm:ss'),
              this.$moment()
                .add(1, 'month')
                .format('YYYY-MM-DD HH:mm:ss')
            ];
            break;
          case 9:
            this.form.rangeTime = [];
            break;
          default:
            break;
        }
      }
    },
    allPumpList: {
      handler(val) {
        if (!this.isEdit) {
          return;
        }
        let pumps = [];
        this.selectPumpList.forEach(p => {
          let pump = val.find(item => item.key === p);
          if (pump) pumps.push(pump);
        });
        this.form.pumpHouseVOS = pumps;
      },
      deep: true
    },
    selectPumpList: {
      handler(val) {
        if (!this.isEdit || this.allPumpList.length <= 0) {
          return;
        }
        let vos = [];
        val.forEach(v => {
          if (v !== 'allCheck') {
            vos.push(this.allPumpList.find(p => p.value === v));
          }
        });
        this.form.pumpHouseVOS = vos;

        // 触发pumpHouseVOS的必选表单校验
        this.$refs.pumpHouseVOS.onFieldChange();
      },
      deep: true
    }
  },
  mounted() {},
  methods: {
    async getInspectionList() {
      let res = await getInspectionLinePage({
        page: {
          current: 1,
          size: 1000
        }
      });
      if (res.status === 'complete') {
        this.inspectList = res.resultData?.records || [];
      }
    },
    handlerEdit() {
      this.siteVisible = true;
      this.showModal = 'relateSite';
      this.formData.orgId = this.form.orgId;
      this.formData.relatePumps = this.relatePumps;
      this.modal = Object.assign(this.modal, {
        title: '关联泵房',
        width: '1200px',
        height: '600px'
      });
    },
    filterOption(input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      );
    },
    /* 工单模版词语 */
    ...mapMutations('setting', ['changeInspection']),
    async queryTemplate() {
      let path = '';
      if (this.form.planType === '2') {
        path = 'purificationInspect';
      } else if (this.form.planType === '3') {
        path = 'purificationMaintenance';
      } else if (this.form.planType === '5') {
        path = 'zhjs-szhy';
      } else {
        path = '';
      }
      console.log('path', path);

      if (!path) {
        this.templateList = [];
        this.form.ticketTemplateCode = '';
        return;
      }
      let ret = await getListBySmallType(path);
      let data = ret.resultData || [];
      this.templateList = data;
      if (this.templateList.length > 0) {
        if (this.isEdit) {
          this.form.ticketTemplateCode = this.templateList[0].code;
        }
        if (this.editType === 1) {
          this.form.ticketTemplateCode = this.templateList[0].code;
        }
      }
    },
    /* 优先级 */
    async getTicketPriority() {
      let res = await getSysDictItemByCode('ticket_priority');

      this.ticketPriority = res.resultData || [];
    },

    async selectInspectPlan(id) {
      let res = await selectInspectPlanNew(id);
      let ret = res.resultData || {};

      this.selectUserBase = [];
      ret?.userBaseDTOS?.forEach(item => {
        this.selectUserBase.push(item.id);
      });

      this.selectPumpList =
        ret?.pumpHouseVOS?.length > 0 ? ret?.pumpHouseVOS?.map(r => r.pumpHouseId) : [];

      if (res.status === 'complete') {
        let cycleDay = null;
        if (ret.cycleDay) {
          if (ret.cycleType === 9) {
            cycleDay = ret.cycleDay.split(',');
          } else {
            cycleDay = ret.cycleDay.includes('-') ? ret.cycleDay : ret.cycleDay.split(',');
          }
        }

        let formPumpHouseVOS =
          ret?.pumpHouseVOS?.length > 0
            ? ret.pumpHouseVOS.map(r => {
                return {
                  title: r.pumpHouseName,
                  value: r.pumpHouseId,
                  key: r.pumpHouseId,
                  orgId: r.orgId
                };
              })
            : [];
        this.form = {
          ...ret,
          cycleDay,
          userBaseDTOS:
            ret?.userBaseDTOS?.map(r => {
              return {
                id: r.userId,
                name: r.userName,
                type: r.userType
              };
            }) || [],
          plannedTrajectory: ret.plannedTrajectory ? JSON.parse(ret.plannedTrajectory) : [],
          // cycleDay: ret.cycleDay ? ret.cycleDay.split(',') : [],
          activeFlag: !!ret.activeFlag,
          rangeTime: [moment(ret.startTime), moment(ret.endTime)],
          pumpHouseVOS: formPumpHouseVOS
        };
        this.getPumpsByOrgId();
        this.pumpData = ret.pumpIds;
        this.queryTemplate();
      }
    },

    async updateInspectPlan(data) {
      let res = await updateInspectPlan(data);

      let ret = res.status === 'complete';

      if (!ret) {
        this.$message.error(res.errorMessage || '编辑失败');
      }

      return ret;
    },

    handlePlanTypeChange(val) {
      // 清空已选择列表
      this.selectUserBase = [];
      this.form.userBaseDTOS = [];
      // 更新负责人列表
      // this.getUserList(val);
      this.selectPumpList = [];
      this.form.pumpHouseVOS = [];
      this.form.ticketTemplateCode = '';
      this.form.cycleType = -1;
      this.queryTemplate();
    },

    async submit() {
      let rangeTime = this.form.rangeTime;
      let org = this.orgList.find(o => o.orgId === this.form.orgId);

      let day = this.form.cycleDay;
      let cycleDay;
      if (day === undefined || day === null) {
        cycleDay = undefined;
      } else if (typeof day === 'string') {
        cycleDay = day;
      } else {
        cycleDay = day.join(',');
      }

      let data = {
        ...this.form,
        orgName: org ? org.orgName : '',
        cycleDay,
        userBaseDTOS:
          this.form?.userBaseDTOS?.map(u => {
            return {
              userName: u.name,
              userId: u.id,
              userType: u.type
            };
          }) || [],
        plannedTrajectory: this.form.plannedTrajectory
          ? JSON.stringify(this.form.plannedTrajectory)
          : '',
        startTime: rangeTime[0] ? moment(rangeTime[0]).format('YYYY-MM-DD') : '',
        endTime: rangeTime[1] ? moment(rangeTime[1]).format('YYYY-MM-DD') : '',
        pumpHouseVOS: this.form.pumpHouseVOS.map(p => {
          return {
            pumpHouseName: p.title,
            pumpHouseId: p.value,
            orgId: p.orgId
          };
        })
        // activeFlag: this.form.activeFlag ? 1 : 0
      };
      if (this.inspectData.id) {
        data.id = this.inspectData.id;
      }
      // if (data.cycle_day) {
      //   data.cycle_day = data.cycle_day.join(',')
      // }

      delete data.rangeTime;
      if (data.cycleType === -1) data.cycleDay = '1';
      this.confirmLoading = true;
      updateInspectPlanNew(data).then(res => {
        if (res.status === 'complete') {
          this.confirmLoading = false;
          let text = EDIT_TYPE_MAP[this.editType];
          if (this.isEdit && this.editType === 3) {
            text = '编辑';
          }

          this.$message.success(`${text}成功`);
          this.$emit('update');
          this.visible = false;
          this.changeInspection();
        } else {
          this.confirmLoading = false;
        }
      });
    },

    disabledDate(current) {
      return current && current < moment().startOf('day');
    },

    cycleDayFormat(cycleDay, cycleType) {
      let days = cycleDay;

      if (cycleType === '0') {
        let ret = days.map(day => {
          return `${day}号`;
        });

        return ret.join(',');
      }

      if (cycleType === '1') {
        let ret = days.map(day => {
          return `周${WEEK_DAYS[day]}`;
        });

        return ret.join(',');
      }

      return days.join(',');
    },

    operationTypeFormat(operationType) {
      const item = this.operationType.find(v => v.code === operationType);

      return item ? item.name : '--';
    },

    handleChange() {
      this.pumpData = [];
      this.form.ticketTemplateCode = '';

      if (this.form.orgId) {
        this.getPumpsByOrgId();
      }

      this.queryTemplate();
    },

    handleCycleChange() {
      this.form.cycleDay = [];
    },

    // 设置默认的计划时间
    setDefaultRangeTime() {
      switch (this.form.cycleType) {
        case -1:
          this.form.rangeTime = [
            this.$moment()
              .startOf('day')
              .format('YYYY-MM-DD HH:mm:ss'),
            this.$moment()
              .endOf('day')
              .format('YYYY-MM-DD HH:mm:ss')
          ];
          break;
        case 0:
          this.form.rangeTime = [
            this.$moment().format('YYYY-MM-DD HH:mm:ss'),
            this.$moment()
              .add(7, 'days')
              .format('YYYY-MM-DD HH:mm:ss')
          ];
          break;
        case 1:
          this.form.rangeTime = [
            this.$moment().format('YYYY-MM-DD HH:mm:ss'),
            this.$moment()
              .add(1, 'month')
              .format('YYYY-MM-DD HH:mm:ss')
          ];
          break;
        case 9:
          this.form.rangeTime = [];
          break;
        default:
          break;
      }
    },
    restoreData() {
      this.$store.dispatch('region/GenerateOrgs').then(() => {
        if (this.orgList.length === 1) {
          this.form.orgId = this.orgList[0].orgId;
          this.handleChange();
        }
      });

      this.selectUserBase = [];

      if (!this.ticketPriority.length) {
        this.getTicketPriority();
      }
      this.pumpData = [];

      this.newList = [];

      if (this.editType === 1) {
        this.form = { ...defaultForm, planType: this.initPlanType };
        this.selectPumpList = [];
        // 设置默认的计划时间
        this.setDefaultRangeTime();
      } else {
        this.selectInspectPlan(this.inspectData.id);
      }
    },

    handleOk() {
      if (this.isEdit) {
        this.$refs.form.validate(valid => {
          if (valid) {
            this.submit();
          }
        });
      } else {
        // this.visible = false;
        this.isEdit = true;
      }
    },

    handleCancel() {
      if (this.$refs.form) {
        this.$refs.form.resetFields();
      }
      this.visible = false;
    },
    async getSvgList() {
      let params = {
        current: 1,
        size: 999,
        keyWord: '',
        condition: {}
      };
      siteSvgList(params).then(res => {
        const { status, resultData } = res;
        if (status === 'complete') {
          resultData.records.forEach(item => {
            item.key = item.id;
            item.label = item.svgName;
            item.value = item.id;
          });
          this.svgList = resultData.records;
        }
      });
    },
    // 获取负责人列表
    getUserList(val) {
      if (val === '1') {
        getAllUser(val).then(res => {
          if (res.status === 'complete') {
            this.userBaseList = [];
            res.resultData.forEach(item => {
              this.userBaseList.push({
                title: item.userName,
                value: item.id,
                key: item.id
              });
            });
          }
        });
      } else {
        sysDictListByCode('nextOperator').then(res => {
          if (res.status === 'complete') {
            this.userBaseList = [];
            res.resultData.forEach(item => {
              this.userBaseList.push({
                title: item.name,
                value: item.value,
                key: item.value
              });
            });
          }
        });
      }
    },
    // 选中负责人
    userBaseChange(value, option) {
      this.form.userBaseDTOS = [];
      // item.componentOptions.children[0].text
      option.forEach(item => {
        this.form.userBaseDTOS.push({
          userName:
            this.form.planType === '1'
              ? item.componentOptions.children[0].text
              : item.componentOptions.propsData.value,
          id: item.componentOptions.propsData.value
          // userName: item.componentOptions.children[0].text
        });
      });
    },

    // 选择污水厂列表
    checkPump(checkedKeys, e) {
      let { checked, checkedNodes, node } = e;
      let val = node.$options.propsData.value;
      if (checked) {
        let data = checkedNodes;
        if (val === 'allCheck') {
          data = this.treeData[0].children;
          if (!this.selectPumpList.find(p => p === 'allCheck')) {
            this.selectPumpList.push('allCheck');
          }
        }
        data.forEach(item => {
          let { value } = val === 'allCheck' ? item : item.data.props.dataRef;
          if (!this.selectPumpList.find(p => p === value)) {
            this.selectPumpList.push(value);
          }
        });
      } else {
        if (val === 'allCheck') {
          this.selectPumpList = [];
        } else {
          this.selectPumpList.splice(
            this.selectPumpList.findIndex(p => p === val),
            1
          );
          let idx = this.selectPumpList.findIndex(p => p === 'allCheck');
          if (idx >= 0) this.selectPumpList.splice(idx, 1);
        }
      }
    },
    // 删除选中污水厂
    deletePump(item) {
      this.selectPumpList.forEach((v, i) => {
        if (v === item.value) {
          this.selectPumpList.splice(i, 1);
          let idx = this.selectPumpList.findIndex(p => p === 'allCheck');
          if (idx >= 0) this.selectPumpList.splice(idx, 1);
        }
      });
    },
    validateSvg(rule, value, callback) {
      console.log('00000', this.form.planType);
      if (!value && this.form.planType === '1') {
        callback(new Error('请选择组态'));
      } else {
        callback();
      }
    },
    validatecycle1(rule, value, callback) {
      if (!value) {
        callback(new Error('请输入周期数值'));
      } else {
        callback();
      }
    },
    validatecycle2(rule, value, callback) {
      if (!value && value !== 0) {
        callback(new Error('请选择周期类型'));
      } else if (value === 0) {
        if (this.form.cycleTimes > 7) {
          callback(new Error('周期为周时，不能大于7天'));
        } else {
          callback();
        }
      } else if (value === 1) {
        if (this.form.cycleTimes > 30) {
          callback(new Error('周期为月时，不能大于30天'));
        } else {
          callback();
        }
      } else if (value === 2) {
        if (this.form.cycleTimes > 90) {
          callback(new Error('周期为季时，不能大于90天'));
        } else {
          callback();
        }
      } else if (value === 3) {
        if (this.form.cycleTimes > 365) {
          callback(new Error('周期为年时，不能大于365天'));
        } else {
          callback();
        }
      } else {
        callback();
      }
    },
    validatecycle3(rule, value, callback) {
      if (!value) {
        callback(new Error('请输入执行次数'));
      } else if (this.form.cycleType === 0) {
        if (value > 7) {
          callback(new Error('周期为周时，不能大于7天'));
        } else {
          callback();
        }
      } else if (this.form.cycleType === 1) {
        if (value > 30) {
          callback(new Error('周期为月时，不能大于30天'));
        } else {
          callback();
        }
      } else if (this.form.cycleType === 2) {
        if (value > 90) {
          callback(new Error('周期为季时，不能大于90天'));
        } else {
          callback();
        }
      } else if (this.form.cycleType === 3) {
        if (value > 365) {
          callback(new Error('周期为年时，不能大于365天'));
        } else {
          callback();
        }
      } else {
        callback();
      }
    },
    // 表单验证
    validatePass(rule, value, callback) {
      if (!this.form.everyCycleTimes) {
        callback(new Error('请输入周期数值'));
      } else {
        if (!this.form.cycleType && this.form.cycleType !== 0) {
          callback(new Error('请输入周期类型'));
        } else {
          if (!this.form.cycleTimes) {
            callback(new Error('请输入周期次数'));
          } else {
            switch (this.form.cycleType) {
              case 0:
                if (this.form.cycleTimes > 7) {
                  callback(new Error('周期为周时，不能大于7天'));
                } else {
                  callback();
                }
                break;
              case 1:
                if (this.form.cycleTimes > 30) {
                  callback(new Error('周期为月时，不能大于30天'));
                } else {
                  callback();
                }
                break;
              case 2:
                if (this.form.cycleTimes > 90) {
                  callback(new Error('周期为周时，不能大于90天'));
                } else {
                  callback();
                }
                break;
              case 3:
                if (this.form.cycleTimes > 365) {
                  callback(new Error('周期为周时，不能大于365天'));
                } else {
                  callback();
                }
                break;
              default:
                break;
            }
            callback();
          }
        }
      }
    },
    // 时间大于七天验证
    validateDate(rule, value, callback) {
      if (!value.length) {
        callback(new Error('请选择计划时间'));
      } else {
        if (this.form.cycleType === 0) {
          if (
            new Date(value[1]._d).getTime() - new Date(value[0]._d).getTime() <
            6 * 24 * 60 * 60 * 1000
          ) {
            callback(new Error('选择日期间隔必须大于等于7天'));
          } else {
            callback();
          }
        } else if (this.form.cycleType === 1) {
          if (
            new Date(value[1]._d).getTime() - new Date(value[0]._d).getTime() <
            30 * 24 * 60 * 60 * 1000
          ) {
            callback(new Error('选择日期间隔必须大于等于31天'));
          } else {
            callback();
          }
        } else if (this.form.cycleType === 2) {
          if (
            new Date(value[1]._d).getTime() - new Date(value[0]._d).getTime() <
            89 * 24 * 60 * 60 * 1000
          ) {
            callback(new Error('选择日期间隔必须大于等于90天'));
          } else {
            callback();
          }
        } else if (this.form.cycleType === 3) {
          if (
            new Date(value[1]._d).getTime() - new Date(value[0]._d).getTime() <
            364 * 24 * 60 * 60 * 1000
          ) {
            callback(new Error('选择日期间隔必须大于等于365天'));
          } else {
            callback();
          }
        } else {
          callback();
        }
      }
    },
    /** 根据组织id查询污水厂 */
    getPumpsByOrgId() {
      if (this.editType === 1) this.selectPumpList = [];
      this.params.ids = this.handleData(this.orgTree, []);
      queryPumpHouse(this.params).then(res => {
        let { status, resultData } = res;
        let list =
          status === 'complete'
            ? resultData.map(r => {
                return {
                  title: r.stationName,
                  value: r.id,
                  key: r.id,
                  orgId: r.orgId
                };
              })
            : [];
        this.pages = resultData.length;
        this.allPumpList = list;
      });
    },
    /** 处理数据 */
    handleData(orgs, ids = [], flag = false) {
      if (orgs.length <= 0) return [];
      orgs.forEach(org => {
        if (org.key === this.form.orgId || flag) {
          ids.push(org.key);
          if (org.children && org.children.length) {
            this.handleData(org.children, ids, true);
          }
        } else {
          if (org.children && org.children.length) {
            this.handleData(org.children, ids);
          }
        }
      });
      return ids;
    },
    /** 搜索污水厂 */
    onChange(e) {
      this.params.keyword = e;
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
  .select-pump-list {
    flex: 0 0 255px;
    width: 255px;
    height: 255px;
    margin-top: 8px;
    padding: 12px;
    overflow: auto;
    // border: 1px solid #D6D6D6;
    border: 1px solid var(--supply-color-border-DEFAULT);
    .vc-empty {
      margin: 16px 0;
    }
    .select-pump-box {
      .select-pump-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 35px;
        margin-bottom: 5px;
        padding: 0 8px;
        background: var(--supply-color-bg-invalid);

        i {
          cursor: pointer;
        }
      }
    }
  }
}

// 计划周期 每周几次
.execute-cycle {
  display: flex;
}
</style>
