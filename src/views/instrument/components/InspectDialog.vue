<template>
  <w-modal
    class="inspect-dialog secondary-modal"
    :title="editType === 1 ? '新增计划' : '编辑计划'"
    :visible="visible"
    :destroyOnClose="true"
    :maskClosable="false"
    :confirm-loading="confirmLoading"
    :width="600"
    centered
    okText="提交审批"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <div class="table-page-search-wrapper">
      <w-form-model
        ref="form"
        :model="form"
        :label-col="{ span: 5 }"
        :wrapper-col="{ span: 19 }"
        :rules="rules"
      >
        <w-form-model-item label="污水厂选择" prop="waterPlantId">
          <factory-select
            class="factory-select"
            v-model="form.waterPlantId"
            placeholder="请选择污水厂"
            @change="factoryChange()"
          ></factory-select>
        </w-form-model-item>
        <w-form-model-item label="设备选择" prop="deviceId">
          <w-select
            v-model="form.deviceId"
            :options="deviceList"
            placeholder="请选择设备"
          ></w-select>
        </w-form-model-item>
        <w-form-model-item label="保养类型" prop="operateType">
          <w-select
            v-model="form.operateType"
            :options="operateTypeList"
            placeholder="请选择保养类型"
          ></w-select>
        </w-form-model-item>
        <w-form-model-item class="cycle-times" label="保养周期" prop="cycleTimes">
          每月
          <w-input-number v-model.number="form.cycleTimes" :min="1" :max="5" placeholder="几次" />次
        </w-form-model-item>
        <w-form-model-item label="保养时间" prop="cycleDay">
          <w-select
            v-model="form.cycleDay"
            mode="multiple"
            style="width: 100%"
            :placeholder="cycleDayPlaceholder"
            @change="handleChange($event, 'cycleDay')"
          >
            <w-select-option v-for="item in monthList()" :key="item">{{
              item + '号'
            }}</w-select-option>
          </w-select>
        </w-form-model-item>
        <w-form-model-item label="保养人" prop="transactor">
          <w-select
            v-model="form.transactor"
            :maxTagCount="1"
            mode="multiple"
            style="width: 100%"
            placeholder="请选择保养人"
            :filter-option="filterOption"
            :options="transactorList"
          ></w-select>
        </w-form-model-item>
      </w-form-model>
    </div>
  </w-modal>
</template>

<script>
import storage from '@/utils/storage';
import { USER_INFO } from '@/store/mutation-types';
import { Base64 } from 'js-base64';
import { queryList } from '@/api/deviceManagement';
import FactorySelect from '@/components/factory-select/index';
import { selectAttachUserPage, addOrUpdate } from '@/api/plan';
let MONTH_LIST = [];
for (let i = 1; i < 32; i++) {
  MONTH_LIST.push(i.toString());
}

let defaultForm = {
  deviceId: '',
  operateType: '',
  waterPlantId: '',
  cycleDay: [], // 巡检日期 多个逗号隔开
  cycleTimes: undefined, // 月巡检次数
  transactor: [] // 巡检人 多个逗号隔开
};

export default {
  props: {
    inspectData: {
      type: Object,
      default: () => ({})
    },
    editType: {
      type: Number,
      default: 1 // 1新增  2编辑
    },
    operateList: {
      type: Array,
      default: () => []
    }
  },
  components: {
    FactorySelect
  },
  data() {
    return {
      form: { ...defaultForm },
      rules: {
        waterPlantId: [{ required: true, message: '请选择污水厂', trigger: ['blur', 'change'] }],
        deviceId: [{ required: true, message: '请选择设备', trigger: ['blur', 'change'] }],
        operateType: [{ required: true, message: '请选择保养类型', trigger: ['blur', 'change'] }],
        cycleTimes: [
          {
            required: true,
            message: '请输入保养周期',
            type: 'number',
            tirgger: ['blur', 'change']
          }
        ],
        cycleDay: [
          { required: true, validator: this.validateCycleDay, trigger: ['blur', 'change'] }
        ],

        transactor: [{ required: true, message: '请选择保养人', trigger: ['blur', 'change'] }]
      },
      deviceList: [],
      confirmLoading: false,
      visible: false,
      transactorList: [] // 巡检人列表
    };
  },

  computed: {
    operateTypeList() {
      return this.operateList.slice(1);
    },
    monthList() {
      return type => {
        return type === 2 ? MONTH_LIST.slice(0, 28) : MONTH_LIST;
      };
    },
    //保养时间选择个数要和每月保养次数保持一致
    cycleDayPlaceholder() {
      return this.form.cycleTimes > 0
        ? `请选择${this.form.cycleTimes}个时间`
        : '请先填写每月保养次数';
    }
  },

  watch: {
    visible(val) {
      if (val) {
        this.getUserList();
        this.getDeviceList();
        this.isEdit = this.editable;
        if (this.inspectData) this.handleFormData();
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
      }
    },
    inspectData: {
      async handler(val) {
        if (val) this.handleFormData();
      },
      immediate: true,
      deep: true
    }
  },

  methods: {
    /** 选择日期排序 从小到大 */
    handleChange(selectKeys, code) {
      this.form[code] = selectKeys.sort((a, b) => Number(a) - Number(b));
    },
    // 水厂改变，重新请求设备
    factoryChange() {
      this.getDeviceList();
    },
    /** 设备列表 */
    async getDeviceList() {
      let params = {
        deviceParentType: 'purification_Y',
        waterPlantId: this.form.waterPlantId
      };
      let { status, resultData } = await queryList(params);
      if (status === 'complete') {
        let list = resultData.records.map(v => {
          return {
            label: v.deviceName,
            value: v.deviceId
          };
        });
        this.deviceList = list;
      }
    },
    /** 表单数据 */
    async handleFormData() {
      const {
        cycleTimes,
        deviceId,
        cycleDay,
        waterPlantId,
        operateType,
        transactor
      } = this.inspectData;

      this.form = {
        cycleTimes,
        deviceId,
        waterPlantId,
        operateType,
        cycleDay: cycleDay ? cycleDay.split(',') : [],

        transactor: transactor ? transactor.split(',') : []
      };
    },

    /** 保存 */
    handleOk() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.submit();
        }
      });
    },

    /** 取消 */
    handleCancel() {
      this.visible = false;
      if (this.$refs.form) {
        this.$refs.form.resetFields();
      }
    },

    /** 提交表单数据 */
    submit() {
      const userInfo = JSON.parse(Base64.decode(storage.get(USER_INFO)));
      this.confirmLoading = true;
      const { cycleDay, transactor, deviceId, waterPlantId, operateType } = this.form;
      let transactorName = '';
      transactor.map(item => {
        transactorName += this.transactorList.find(v => v.value === item).label + ',';
      });
      let params = {
        ...this.form,
        smallType: 'ybby',
        operateTypeName: this.operateTypeList.find(item => item.value === operateType).label,
        cycleDay: cycleDay.join(),
        deviceName: this.deviceList.find(item => item.value === deviceId).label,
        waterPlantName: this.$store.state.factoryList.find(item => item.id === waterPlantId)
          .stationName,
        transactor: transactor.join(),
        transactorName
      };
      if (this.editType === 2) {
        //编辑
        params.id = this.inspectData.id;
        params.createTime = this.inspectData.createTime;
        params.createBy = this.inspectData.createBy;
        params.updateBy = userInfo.loginName;
        params.updateTime = this.$moment().format('YYYY-MM-DD HH:mm:ss');
      } else {
        //新增
        params.createTime = this.$moment().format('YYYY-MM-DD HH:mm:ss');
        params.createBy = userInfo.loginName;
      }
      addOrUpdate(params).then(res => {
        if (res.status === 'complete') {
          this.$message.success('保存成功');
          this.visible = false;
          this.$refs.form.resetFields();
          this.$emit('update');
        }
        this.confirmLoading = false;
      });
    },

    /** 校验巡检时间选择数量 */
    validateCycleDay(rule, value, callback) {
      if (this.form.cycleTimes && value.length !== this.form.cycleTimes) {
        callback(new Error(`请选择${this.form.cycleTimes}个时间`));
      } else {
        callback();
      }
    },

    filterOption(input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      );
    },

    // 巡检人员列表
    async getUserList() {
      let params = {
        page: {
          current: 1,
          size: 999
        }
      };
      const { status, resultData } = await selectAttachUserPage(params);
      this.transactorList =
        status === 'complete'
          ? resultData.records.map(t => {
              return {
                label: t.userName,
                value: t.id
              };
            })
          : [];
    }
  }
};
</script>

<style lang="less" scoped>
.wpg-form-item {
  &.cycle-times /deep/ .wpg-input-number {
    width: calc(100% - 52px);
  }
}
</style>
