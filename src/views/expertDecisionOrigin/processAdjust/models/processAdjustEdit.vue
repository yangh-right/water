<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2024-06-27 14:40:00
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2024-08-16 16:42:35
 * @Description: 
-->
<template>
  <div class="edit-detail ">
    <div class="detail-content">
      <w-info-form
        ref="info_form"
        v-on="formEvent"
        v-bind="formProps"
        :layout="alllayout"
        :model="form"
        enterText="确定"
        :fields="fields"
      >
        <template #footer></template>
        <template #title1>
          <div class="shift-title">
            <double-square class="supply-mr-2"></double-square>
            <div class="name">一二期</div>
          </div>
        </template>
        <template #title2>
          <div class="phase-title">
            <double-square class="supply-mr-2"></double-square>
            <div class="name">三期</div>
          </div>
        </template>
        <template #fontColorObj>
          <w-popover trigger="click">
            <template slot="content">
              <sketch-picker v-model="form.fontColorObj" @input="updateValue($event, form)">
              </sketch-picker>
            </template>
            <span class="color-picker__trigger">
              <w-icon type="down-square" theme="filled" :style="{ color: form.fontColor }" />
            </span>
          </w-popover>
        </template>
        <template #[key] v-for="(key, index) in processKeys">
          <add-form
            class="phase-form"
            :defaultForm="defaultForm"
            :isDraggable="false"
            :key="key"
            :ref="key"
            :fields="phaseFields"
            v-model="form[key]"
          >
            <template #operateContent="{addForm}">
              <div style="padding-top: 3px" class="supply-flex supply-items-center">
                <custom-item-select
                  class="operate-select"
                  placeholder="请选择"
                  allowClear
                  :key="'content' + key"
                  v-model="addForm.operateContent"
                  :list="operateContentList"
                >
                  <w-select-option
                    v-for="(item, index) in operateContentList"
                    :key="item.value"
                    :value="item.value"
                  >
                    {{ item.label }}
                  </w-select-option>
                </custom-item-select>
                <w-icon class="operate-edit" type="edit" @click="editOperate(1)"></w-icon>
              </div>
            </template>
            <template #operatePosition="{addForm}">
              <div style="padding-top: 3px" class="supply-flex supply-items-center">
                <custom-item-select
                  :key="'position' + key"
                  placeholder="请选择"
                  allowClear
                  v-model="addForm.operatePosition"
                  :list="operateLocationList"
                >
                  <w-select-option
                    v-for="(item, index) in operateLocationList"
                    :key="item.value"
                    :value="item.value"
                  >
                    {{ item.label }}
                  </w-select-option>
                </custom-item-select>
                <w-icon class="operate-edit" type="edit" @click="editOperate(2)"></w-icon>
              </div>
            </template>
            <template #fontColorObj="{addForm}">
              <w-popover trigger="click">
                <template slot="content">
                  <sketch-picker
                    v-model="addForm.fontColorObj"
                    @input="updateValue($event, addForm)"
                  >
                  </sketch-picker>
                </template>
                <span class="color-picker__trigger">
                  <w-icon type="down-square" theme="filled" :style="{ color: addForm.fontColor }" />
                </span>
              </w-popover>
            </template>
          </add-form>
        </template>
      </w-info-form>
    </div>
    <div class="supply-text-right supply-pt-5">
      <w-button :loading="formProps.loading" @click="commit" class="supply-ml-5" type="primary"
        >确定</w-button
      >
      <w-button @click="$emit('action', false)" class="supply-ml-5">取消</w-button>
    </div>
    <drag-modal
      ref="editOperate"
      :width="750"
      :height="534"
      :maskClosable="false"
      :mask="true"
      :isShowFullBtn="false"
      title="操作管理"
    >
      <operate-option
        :defaultSearchForm="{ fillType: fillType }"
        :defaultDetailForm="{ fillType: fillType }"
        @operateChange="operateChange"
      ></operate-option>
    </drag-modal>
  </div>
</template>
<script>
import DragModal from '@/components/DragModal';
import moment from 'moment';
import operateOption from '../operateOption/index.vue';
import doubleSquare from './doubleSquare';
import customItemSelect from '@/components/Select/customItemSelect.vue';
import cloneDeep from 'lodash.clonedeep';
import { Sketch } from 'vue-color';
import addForm from '@/components/Form/addForm';
import { editProcessAdjust, getProcessControlEnum } from '@/api/diagnosis';
import {
  detailFields,
  phaseFields,
  processConfig,
  operateContentList,
  operateLocationList
} from './config';
import { formMixin } from '@/components/SearchTable/option';
export default {
  name: 'processAdjustEdit',
  mixins: [formMixin],
  components: {
    addForm,
    operateOption,
    doubleSquare,
    DragModal,
    'sketch-picker': Sketch,
    customItemSelect
  },
  props: {
    controlId: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      operateContentList: [],
      operateLocationList: [],
      detailFields,
      fillType: undefined,
      key: 0,
      defaultForm: {
        fontColorObj: {
          rgba: {}
        }
      },
      processKeys: ['processList1', 'processList2'],
      phaseFields,
      alllayout: {
        span: 8,
        wrapperCol: { span: 18 },
        labelCol: { span: 6 }
      },
      fields: detailFields
    };
  },
  created() {
    this.updateDict();
  },
  mounted() {},
  methods: {
    async updateDict() {
      const { resultData, status } = await getProcessControlEnum({
        page: { current: 1, size: 10000 }
      });
      if (status === 'complete') {
        let data =
          resultData?.records?.map(item => ({
            label: item.contentValue,
            value: item.contentValue,
            fillType: item.fillType
          })) || [];
        this.operateContentList = data.filter(item => item.fillType === 1);
        this.operateLocationList = data.filter(item => item.fillType === 2);
        this.key += 1;
      }
    },
    editOperate(fillType) {
      this.fillType = fillType;
      this.$refs.editOperate.visible = true;
    },
    operateChange() {
      this.updateDict();
    },
    handleForm() {
      this.form.fillDate = this.form.fillDate ? moment(this.form.fillDate) : undefined;
      this.form.fontColorObj = this.form.fontColor || { rgba: {} };
      processConfig.forEach(item => {
        this.form[item.key]?.forEach(process => {
          process.operateTime = process.operateTime
            ? moment(process.operateTime, 'HH:mm')
            : undefined;
        });
      });
    },
    updateValue(item, form) {
      form.fontColor = `rgba(${item.rgba.r}, ${item.rgba.g}, ${item.rgba.b}, ${item.rgba.a})`;
    },
    commit() {
      if (this.formProps.loading) return;
      this.formProps.loading = true;
      let isSetDone = true;

      if (!isSetDone) {
        this.formProps.loading = false;
        return;
      }
      this.$refs.info_form.validate(async valid => {
        const promises = [];
        this.processKeys.forEach(key => {
          this.$refs[key].forEach(form => {
            promises.push(form.handleForm());
          });
        });

        let res = await Promise.allSettled(promises);
        let isValid = res.every(item => {
          return item.status === 'fulfilled';
        });
        if (valid && isValid) {
          const shift = cloneDeep(this.form || {});
          processConfig.forEach(item => {
            shift[item.key]?.forEach(process => {
              process.waterPlantType = item.waterPlantType;
            });
          });
          let param = {
            id: shift.id,
            fillDate: shift.fillDate ? moment(shift.fillDate).format('YYYY-MM-DD') : undefined,
            classes: shift.classes,
            fontColor: shift.fontColor,
            waterQualitySituation: shift.waterQualitySituation,
            sludgeDischargeCondition: shift.sludgeDischargeCondition,
            controlId: this.controlId,
            remark: shift.remark,
            processControlOperateDetailList: [...shift.processList1, ...shift.processList2]
          };
          param.processControlOperateDetailList.forEach((item, i) => {
            item.operateTime = item.operateTime
              ? moment(item.operateTime, 'HH:mm').format('HH:mm')
              : undefined;
            item.operateOrder = i + 1;
          });
          this.formProps.loading = true;
          const { resultData, status } = await editProcessAdjust(param);
          if (status === 'complete') {
            let tip = '编辑成功!';
            this.$message.success(tip);
            this.$emit('action', true);
          }
        }
        this.formProps.loading = false;
      });
    }
  }
};
</script>
<style lang="less" scoped>
.edit-detail {
  display: flex;
  flex-direction: column;
  height: calc(100%);
  overflow-y: auto;
  overflow-x: hidden;
  padding: 8px 0;
  .detail-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 0 20px 0 20px;
    /deep/ .wpg-form-item {
      margin-bottom: 12px;
    }
  }
  /deep/ .wpg-form-explain {
    position: absolute;
  }
  .phase-form {
    /deep/ .wpg-col {
      .wpg-form-item {
        min-height: 54px;
      }
    }
    margin-right: 60px;
    /deep/ .action {
      top: -4px;
      right: -72px;
    }
    .operate-select {
      flex: 1;
      overflow: hidden;
    }
    .operate-edit {
      color: var(--supply-color-primary-DEFAULT);
      margin-left: 8px;
    }
  }
  .color-picker__trigger {
    width: 32px;
    height: 32px;
    padding: 1px 4px 2px;
    font-size: 20px;
    vertical-align: top;
    border: 1px solid #e6e6e6;
    border-radius: 4px;
    cursor: pointer;
  }
  .shift-title {
    display: flex;
    align-items: center;
  }
  .shift-form {
    /deep/.shift-action {
      right: -56px;
      top: 5px;
    }
    /deep/ .shift-item {
      margin-bottom: 16px;
      padding: 12px 12px 0;
      border-radius: 4px;
      border: 1px dashed var(--supply-color-third);
      &:nth-last-child(1) {
        margin-bottom: 0;
      }
    }
  }
  .phase-title {
    display: flex;
    align-items: center;
    .name {
      font-family: YouSheBiaoTiHei, sans-serif;
      color: var(--supply-color-main);
    }
  }
}
</style>
