<!-- 运行日志新增 -->
<template>
  <div class="full-view log-add">
    <w-detail-header pageTitle="新增运行日志" @handleBack="handleGoBack">
      <template>
        <w-button @click="handleGoBack">返回</w-button>
        <w-button type="primary" style="margin-left: 10px" @click="handleSubmit('add')"
          >保存</w-button
        >
      </template>
    </w-detail-header>
    <div class="wbgc-card basic-info-wrap">
      <h4>基本信息</h4>
      <w-info-form
        ref="basicForm"
        style="width: 100%"
        :fields="basicFields"
        :model="basicForm"
        :layout="layout"
        :footer="null"
      >
        <template #waterPlantId="{ form }">
          <factory-select v-model="form.waterPlantId" @change="factoryChange"></factory-select>
        </template>
        <template #onDutyDate="{ form }">
          <w-date-picker
            v-model="form.onDutyDate"
            :format="'YYYY-MM-DD'"
            valueFormat="YYYY-MM-DD"
            :disabledDate="disabledDate"
            style="width: 100%"
          />
        </template>
        <template #classId="{ form }">
          <w-select v-model="form.classId" placeholder="请选择班次">
            <w-select-option :value="item.id" v-for="item in shiftList" :key="item.id">
              {{ item.name }} （{{ item.startTime | formatTime }}-{{ item.endTime | formatTime }}）
            </w-select-option>
          </w-select>
        </template>
      </w-info-form>
    </div>
    <div class="wbgc-card run-data-wrap">
      <div class="run-data-head">
        <h4>运行数据</h4>
        <!-- <div class="add-new-title">
          <w-input v-model="newTitle" placeholder="请输入需要新增的运行数据名" @pressEnter="addItem"></w-input>
          <w-button type="primary" @click="addItem">新增</w-button>
        </div> -->
      </div>
      <template v-if="runLogFormJson.length">
        <div v-for="item in runLogFormJson" :key="item.title">
          <form-item
            :modelFields="item.modelFields"
            ref="formItem"
            :title="item.title"
            :modelForm="item.formData"
            @remove="removeItem"
          >
          </form-item>
        </div>
      </template>
      <w-empty v-else />
    </div>
  </div>
</template>

<script>
import { getFields } from '../components/config';
import FormItem from '../components/form-item';
import FactorySelect from '@/components/factory-select/index';
import commonMixin from '@/views/Emergency/Practice/components/commonMixin';
import deMixin from '@/views/Operation/RunLog/components/mixin';
export default {
  mixins: [commonMixin, deMixin],
  data() {
    return {
    };
  },
  components: { FactorySelect, FormItem },
  deactivated() {
    // 从nav栏关闭此tab时重置选项
    if (this.state.tabs.filter(v => v.name === '新增运行日志').length === 0) {
      this.handleReset();
    }
  },
  activated() {
    if (this.basicForm.waterPlantId) {
      this.getShiftList(this.basicForm.waterPlantId);
      this.getClassList(this.basicForm.waterPlantId);
    }
  },
  methods: {
    //新增返回时清空当前输入的数据信息
    handleReset() {
      this.$refs['basicForm'].$_resetFields();
      this.runLogFormData = ['厌氧池', '缺氧池', '好氧池'];
      this.runLogFormJson = [
        { 
          title: '厌氧池',
          formData: {},
          modelFields: getFields('backFlow', 'ORP', 'MLSS')
        },
        {
          title: '缺氧池',
          formData: {},
          modelFields: getFields('inBackFlow', 'ORP', 'MLSS')
        },
        {
          title: '好氧池',
          formData: {},
          modelFields: getFields('DO', 'MLSS', 'NN')
        }
      ];
    },
    //新增运行日志
    async handleAdd(shiftObj, waterPlantName) {
      try {
        let { resultData } = await this.$http.post('/runLog/insert', {
          runLogFormData: this.runLogFormData,
          runLogFormJson: this.runLogFormJson,
          ...this.basicForm,
          ...shiftObj,
          waterPlantName: waterPlantName
        });
        if (resultData === '0') {
          this.$message.error('新增失败！');
        } else if (resultData === '1') {
          this.$message.success('新增成功！');
          this.goBack();
        } else {
          this.$confirm({
            title: '该班次的运行日志已填写，您是要编辑该日志还是更换班次填写日志？',
            okText: '编辑该日志',
            cancelText: '填写其它班次',
            onOk: () => {
              this.closeTab();
              this.goto({
                path: '/Operation/RunLog/edit',
                query: { id: resultData, waterPlantId: this.basicForm.waterPlantId }
              });
            },
            onCancel: () => {}
          });
        }
      } catch (error) {
        console.log(error);
      }
    }
  }
};
</script>

<style lang="less" scoped>
@import '/src/views/Operation/RunLog/style/logView.less';
</style>
