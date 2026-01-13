<template>
  <w-modal :title="title" :visible="visible" @ok="handleOk" @cancel="handleCancel">
    <w-form-model ref="form" :model="form" :rules="rules" :colon="true" :labelCol="{ span: 5 }" :wrapperCol="{ span: 19 }">
      <w-form-model-item prop="costPlaceId" label="成本点">
        <w-tree-select
          dropdownClassName="cost-dropdown"
          v-model="form.costPlaceId"
          placeholder="请选择成本点"
          :treeData="costPlaceOptions"
          :treeDefaultExpandAll="true"
          :getPopupContainer="node => node.parentNode"
          :replaceFields="{
            title: 'name',
            value: 'id',
            key: 'id'
          }"
          @change="costPlaceChange"
        ></w-tree-select>
      </w-form-model-item>

      <!-- v-if="form.timeType === '1'" -->
      <w-form-model-item v-if="form.timeType === '1'" prop="entryTime" label="发生月份">
        <w-month-picker v-model="timeForm.month" :allowClear="false" placeholder="请选择发生月份" :disabledDate="disabledDate" @change="timeChange"></w-month-picker>
      </w-form-model-item>
      <!-- v-else-if="form.timeType === '2'" -->
      <w-form-model-item v-else-if="form.timeType === '2'" prop="entryTime" label="发生年份">
        <w-date-picker
          mode="year"
          :open="isOpen"
          format="YYYY"
          v-model="timeForm.year"
          :allowClear="false"
          placeholder="请选择发生年份"
          :disabledDate="disabledDate"
          @change="timeChange"
          @openChange="handleOpenChange"
          @panelChange="handlePanelChange"
        ></w-date-picker>
      </w-form-model-item>
      <!-- v-else  -->
      <w-form-model-item v-else prop="entryTime" label="发生时间">
        <span style="display: flex; justify-content: space-between; align-items: center">
          <w-date-picker v-model="timeForm.date" :allowClear="false" placeholder="请选择发生日期" :disabledDate="disabledDate" @change="timeChange"></w-date-picker>
          <w-time-picker
            v-model="timeForm.time"
            :allowClear="false"
            placeholder="请选择发生时间"
            format="HH:mm"
            :disabledHours="disabledHours"
            :disabledMinutes="disabledMinutes"
            @change="timeChange"
          ></w-time-picker>
        </span>
      </w-form-model-item>

      <w-form-model-item prop="type" label="计算类型">
        {{ form.type === null ? '' : form.type === 1 ? '成本金额' : '成本消耗' }}
      </w-form-model-item>
      <w-form-model-item prop="entryNum" label="录入数值">
        <span style="display: flex; justify-content: space-between">
          <w-input v-model="form.entryNum" placeholder="请填写录入数值" style="flex: 1; margin-right: 10px"></w-input>
          <span>{{ costPlaceUnit }}</span>
        </span>
      </w-form-model-item>
    </w-form-model>
  </w-modal>
</template>

<script>
import { costRules } from './config';
import { cloneDeep } from 'lodash-es';
// import YearPicker from '@/components/timePicker/YearPicker';
import dayjs from 'dayjs';
import moment from 'moment';
export default {
  name: 'InputModal',
  // components: { YearPicker },
  props: {
    title: {
      type: String,
      default: ''
    },
    visible: {
      type: Boolean,
      default: false
    },
    typeId: {
      type: String,
      default: ''
    },
    isEdit: {
      type: Boolean,
      default: false
    },
    waterPlantId: {
      type: String,
      default: ''
    },
    outerForm: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      form: {
        costPlaceId: undefined,
        entryTime: undefined,
        type: null,
        entryNum: undefined,
        // 0-次，1-月，2-年
        timeType: '0'
      },
      rules: costRules,
      // 发送月份/发送时间表单
      timeForm: {
        year: null,
        month: null,
        date: null,
        time: null
      },
      // 成本点选项
      costPlaceOptions: [],
      // 成本点对应单位
      costPlaceUnit: '',
      // 成本点信息
      costPlaceNode: {},
      // 发生时间字典
      entryTimeDict: {
        0: '请选择成本发生时间',
        1: '请选择成本发生月份',
        2: '请选择成本发生年份'
      },
      // 年份组件
      isOpen: false
    };
  },
  watch: {
    visible(val) {
      if (!val) return;
      this.getInit();
    }
  },
  methods: {
    async getInit() {
      if (this.isEdit) {
        this.form = cloneDeep(this.outerForm);
        if (this.form.timeType === '0') {
          this.timeForm.date = this.outerForm.entryTime.slice(0, 10);
          this.timeForm.time = this.outerForm.entryTime;
        } else if (this.form.timeType === '1') {
          this.timeForm.month = this.outerForm.entryTime.slice(0, 7);
        } else {
          this.timeForm.year = this.outerForm.entryTime.slice(0, 4);
        }
        // 单位
        let { resultData } = await this.$http.get(`/costPlace/getUnitByPlaceId?costPlaceId=${this.form.costPlaceId}`);
        this.costPlaceUnit = resultData;
      }
      this.getOptions();
    },
    async getOptions() {
      const { resultData } = await this.$http.get(`/costPlace/getPlaceTreeByTypeId?costTypeId=${this.typeId}`);
      this.costPlaceOptions = resultData.children;
    },
    async handleOk() {
      let cb = await this.$refs.form.validate();
      if (cb) {
        let submitForm = {
          costTypeId: this.typeId,
          costSmallTypeId: this.form.costSmallTypeId,
          costPlaceId: this.form.costPlaceId,
          entryTime: this.form.entryTime,
          timeType: this.form.timeType,
          entryNum: this.form.entryNum,
          waterPlantId: this.waterPlantId,
          type: this.form.type
        };
        console.log('submitForm', submitForm);
        // return;
        if (this.isEdit) await this.$http.put('/costEntry', { id: this.form.id, ...submitForm });
        else await this.$http.post('/costEntry', submitForm);
        this.handleCancel();
      }
    },
    handleCancel() {
      this.$refs.form.resetFields();
      this.form = {
        costPlaceId: undefined,
        entryTime: undefined,
        type: null,
        entryNum: undefined,
        // 0-次，1-月，2-年
        timeType: '0'
      };
      Object.keys(this.timeForm).forEach(key => {
        this.timeForm[key] = null;
      });
      this.$emit('update:visible', false);
      this.$emit('getList');
    },

    // 选择成本点时，根据成本点id获取成本点信息
    async costPlaceChange() {
      this.$refs.form.clearValidate();
      let { resultData: {records}} = await this.$http.post('/costPlace/list', { ids: [this.form.costPlaceId] });
      // 录入形式
      this.form.timeType = records[0].entryMode;
      this.rules.entryTime[0].message = this.entryTimeDict[records[0].entryMode];
      // 计算类型
      this.form.type = +records[0].calculateType;
      // 成本点单项
      const { smallTypeId } = this.findNode();
      this.form.costSmallTypeId = smallTypeId;
      // 单位
      let res = await this.$http.get(`/costPlace/getUnitByPlaceId?costPlaceId=${this.form.costPlaceId}`);
      this.costPlaceUnit = res.resultData;
    },
    // 成本点单项查询
    findNode() {
      let res = {};
      this.costPlaceOptions.forEach(item => {
        if (item.id === this.form.costPlaceId) res = item;
        if (item.children && item.children.length > 0) {
          item.children.forEach(child => {
            if (child.id === this.form.costPlaceId) res = child;
          });
        }
      });
      return res;
    },

    // 从不同类型时间组件中获取录入时间
    timeChange() {
      if (this.form.timeType === '0') {
        // 按次
        this.form.entryTime = this.timeForm.date && this.timeForm.time ? `${moment(this.timeForm.date).format('YYYY-MM-DD')} ${moment(this.timeForm.time).format('HH:mm:00')}` : null;
      } else if (this.form.timeType === '1') {
        // 按月
        this.form.entryTime = this.timeForm.month ? this.timeForm.month.format('YYYY-MM-01 00:00:00') : null;
      } else {
        // 按年
        this.form.entryTime = this.timeForm.year ? `${this.timeForm.year}-01-01 00:00:00` : null;
        this.$refs.form.validateField(['entryTime']);
      }
    },
    handleOpenChange() {
      this.isOpen = true;
    },
    handlePanelChange(v) {
      this.timeForm.year = this.$moment(v).format('YYYY');
      this.timeChange();
      this.isOpen = false;
    },
    // 时间组件禁用
    disabledDate(current) {
      return current && current > Date.now();
    },
    disabledHours() {
      let hours = [];
      if (moment(this.timeForm.date).format('YYYY-MM-DD') === this.$moment(new Date()).format('YYYY-MM-DD')) {
        hours = Array.from(new Array(24 - new Date().getHours()).keys());
        hours = hours.map(hour => 24 - hour);
      }
      return hours;
    },
    disabledMinutes(selectedHour) {
      let minutes = [];
      if (selectedHour < new Date().getHours()) return minutes;
      minutes = Array.from(new Array(60 - new Date().getMinutes()).keys());
      minutes = minutes.map(minute => 60 - minute);
      return minutes;
    }
  }
};
</script>
<style lang="less" scoped>
/deep/ .wpg-select-tree-node-content-wrapper-unselectable {
  color: #999 !important;
}
html[data-wpg-theme='dark'] {
  /deep/ .wpg-select-tree-node-content-wrapper-unselectable {
    color: #495057 !important;
  }
}
</style>
<style lang="less">
html[data-wpg-theme='dark'] {
  .cost-dropdown {
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  }
}
</style>
