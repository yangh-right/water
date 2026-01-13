<!--
 * @Description: 请输入....
 * @Author: huhaiou
 * @Date: 2022-03-24 13:03:14
 * @LastEditTime: 2022-03-24 16:11:34
 * @LastEditors: huhaiou
-->
<template>
    <w-modal
      class="secondary-modal"
      v-model="isVisible"
      wrapClassName="sheet-modal"
      title="线上巡检报表导出"
      :width="720"
      centered
      :footer="false"
      @cancel="close"
    >
      <w-form-model
        ref="sheetForm"
        :labelCol="{ span: 4 }"
        :wrapperCol="{ span: 20 }"
        :model="sheetForm"
        :rules="rules"
      >
        <w-form-model-item
          label="类型："
          prop="dateType"
        >
          <w-radio-group v-model="sheetForm.dateType">
            <w-radio-button value="day">
              日报
            </w-radio-button>
            <w-radio-button value="week">
              周报
            </w-radio-button>
          </w-radio-group>
        </w-form-model-item>
        <w-form-model-item
          label="日期范围："
          prop="date"
        >
          <w-date-picker v-if="sheetForm.dateType === 'day'" v-model="sheetForm.date" placeholder="选择日期" :allowClear="false">
            <w-icon slot="suffixIcon" type="smile" />
          </w-date-picker>
          <w-week-picker v-if="sheetForm.dateType === 'week'" v-model="sheetForm.date" placeholder="选择周" :allowClear="false">
            <w-icon slot="suffixIcon" type="smile" />
          </w-week-picker>
        </w-form-model-item>
        <w-form-model-item
          has-feedback
          label="巡检人："
          prop="userId"
        >
          <w-select
            v-model="sheetForm.userId"
            mode="multiple"
            show-search
            placeholder="选择巡检人"
            option-filter-prop="children"
            style="width: 300px"
            :filter-option="filterOption"
          >
            <w-select-option v-for="opt in allUsers" :key="opt.id" :value="opt.id">
              {{ opt.userName }}
            </w-select-option>
          </w-select>
        </w-form-model-item>
        <w-form-model-item :wrapperCol="{ span: 20, offset: 4 }">
          <w-button class="supply-float-left" @click="exportSheet">导出</w-button>
        </w-form-model-item>
      </w-form-model>
    </w-modal>
</template>

<script>
import moment from 'moment';
import {
  ExportInspecterSheet // 导出
} from '@/api/home';
import { getAllUser } from '@/api/plan';
import { exportFile } from '@/utils/util';

export default {
  name: 'InspectSheetModal',
  props: {
    visible: {
      type: Boolean,
      default: false,
      required: true,
    },
    title: {
      type: String,
      default: '',
    }
  },
  data() {
    return {
      isVisible: false,
      sheetForm: {
        dateType: 'day',
        date: moment(),
        userId: []
      },
      layout: {
        labelCol: { span: 4 },
        wrapperCol: { span: 20 }
      },
      rules: {
        userId: [{
            type: 'array',
            required: true,
            message: '请至少选择一个巡检人！',
            trigger: 'change',
          },]
      },
      allUsers: []
    }
  },
  mounted() {
    this.isVisible = this.visible;
    this.getAllUser();
  },
  methods: {
    /* 巡检人下拉列表数据 */
    async getAllUser() {
      let ret = await getAllUser(1);
      let allUsers = ret.resultData || [];
      this.allUsers = allUsers;
    },

    /* 导出巡检人报表 */
    exportSheet() {
      this.$refs.sheetForm.validate(valid => {
        if (valid) {
          let { dateType, date, userId } = this.sheetForm;
          let params = {
            type: dateType,
            startDateStr: dateType === 'day' ? date.format('YYYY-MM-DD 00:00:00') : date.weekday(0).format('YYYY-MM-DD 00:00:00'),
            endDateStr: dateType === 'day' ? date.format('YYYY-MM-DD 23:59:59') : date.weekday(6).format('YYYY-MM-DD 23:59:59'),
            userId
          };
          ExportInspecterSheet(params).then(res => {
            this.close();
            exportFile(res, '线上巡检'  + (dateType === 'day' ?  ('日报' + date.format('YYYY-MM-DD')) : ('周报' + date.weekday(0).format('YYYY-MM-DD') + '~' + date.weekday(6).format('YYYY-MM-DD'))));
          });
        } else {
          return false;
        }
      });
    },

    /* 下拉过滤 */
    filterOption(input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      );
    },

    /* 关闭弹窗 */
    close() {
      this.$emit('update:visible', false);
    }
  }
}
</script>
