<!-- 运行日志编辑 -->
<template>
  <div class="full-view log-add">
    <w-detail-header pageTitle="编辑运行日志" @handleBack="handleGoBack">
      <template>
        <w-button @click="handleGoBack">返回</w-button>
        <w-button type="primary" style="margin-left: 10px" @click="handleSubmit('edit')"
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
import FormItem from '../components/form-item';
import FactorySelect from '@/components/factory-select/index';
import moment from 'moment';
import commonMixin from '@/views/Emergency/Practice/components/commonMixin';
import deMixin from '@/views/Operation/RunLog/components/mixin';

export default {
  mixins: [commonMixin, deMixin],
  data() {
    return {
      logId: '',
      waterPlantId: ''
    };
  },
  components: { FactorySelect, FormItem },
  deactivated() {
    // 从nav栏关闭此tab时重置选项
    if (this.state.tabs.filter(v => v.name === '编辑运行日志').length === 0) {
      this.handleReset();
    }
  },
  activated() {
    this.logId = this.$route.query.id;
    this.waterPlantId = this.$route.query.waterPlantId;
    this.getShiftList(this.waterPlantId);
    this.getClassList(this.waterPlantId);
  },
  watch: {
    logId(val) {
      if (!val) return;
      this.getLogContext();
    }
  },
  methods: {
    //编辑返回时清空已出现的验证
    handleReset() {
      this.logId = '';
      this.$refs['basicForm'].$_resetFields();
      this.runLogFormData = [];
      this.runLogFormJson = [];
    },
    // 根据ID获取日志内容
    async getLogContext() {
      try {
        let { resultData } = await this.$http.get('/runLog/queryById?id=' + this.logId);
        this.runLogFormJson = resultData.runLogFormJson && JSON.parse(resultData.runLogFormJson);
        this.runLogFormData = resultData.runLogFormData && JSON.parse(resultData.runLogFormData);
        this.$set(this.basicForm, 'waterPlantId', resultData.waterPlantId);
        this.$set(this.basicForm, 'shiftPerson', resultData.idList);
        this.$set(this.basicForm, 'onDutyDate', moment(resultData.startDate).format('YYYY-MM-DD'));
        //匹配班组id
        let classId = this.shiftList.find(item => item.name === resultData.shiftName);
        if (!classId) {
          this.$message.warn('该班次信息已置为无效,请重新选择班次');
          return;
        }
        this.$set(this.basicForm, 'classId', classId.id);
      } catch (error) {
        console.log(error);
      }
    },
    //修改运行日志
    async handleEdit(shiftObj, waterPlantName) {
      try {
        let { resultData } = await this.$http.put(`/runLog/update?id=${this.logId}`, {
          runLogFormData: this.runLogFormData,
          runLogFormJson: this.runLogFormJson,
          ...this.basicForm,
          ...shiftObj,
          waterPlantName: waterPlantName
        });
        if (resultData === '0') {
          this.$message.error('修改失败！');
        } else {
          this.$message.success('修改成功！');
          this.goBack();
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
