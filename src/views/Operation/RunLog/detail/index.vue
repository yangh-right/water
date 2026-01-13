<!-- 运行日志详情 -->
<template>
  <div class="full-view log-detail">
    <w-detail-header pageTitle="运行日志详情" @handleBack="handleGoBack">
      <template>
        <w-button @click="handleGoBack">返回</w-button>
        <w-button type="primary" style="margin-left: 10px" @click="handleEdit">编辑</w-button>
      </template>
    </w-detail-header>
    <template v-if="!loading">
      <div class="wbgc-card basic-info-wrap">
        <h4>基本信息</h4>
        <w-info-form
          ref="basicForm"
          style="width: 100%"
          :fields="basicFields"
          :model="detailData"
          :layout="layout"
          :footer="null"
        >
          <template #waterPlantId="{ form }">
            <span>{{ form.waterPlantName }}</span>
          </template>
          <template #onDutyDate="{ form }">
            <span>{{ form.startDate | formData }}</span>
          </template>
          <template #classId="{ form }">
            <span
              >{{ form.shiftName }} {{ form.startDate | formTime }}-{{
                form.endDate | formTime
              }}</span
            >
          </template>
          <template #shiftPerson="{ form }">
            <span>{{ form.nameList }} </span>
          </template>
        </w-info-form>
      </div>
      <div class="wbgc-card run-data-wrap">
        <h4>运行数据</h4>
        <div v-for="item in detailData.runLogFormJson" :key="item.title">
          <div class="form-title">
            <p>{{ item.title }}</p>
          </div>
          <w-info-form
            class="model-form"
            :fields="getRunFields(item.modelFields)"
            :model="item.formData"
            :layout="modelLayout"
            :footer="null"
          >
            <template #backFlow="{ form }">
              <span>{{ form.backFlow }}</span>
              <span class="unit">m<sup>3</sup>/h</span>
            </template>
            <template #inBackFlow="{ form }">
              <span>{{ form.inBackFlow }}</span>
              <span class="unit">m<sup>3</sup>/h</span>
            </template>
            <template #ORP="{ form }">
              <span>{{ form.ORP }}</span>
              <span class="unit">mv</span>
            </template>
            <template #MLSS="{ form }">
              <span>{{ form.MLSS }}</span>
              <span class="unit">mg/L</span>
            </template>
            <template #DO="{ form }">
              <span>{{ form.DO }}</span>
              <span class="unit">mg/L</span>
            </template>
            <template #NN="{ form }">
              <span>{{ form.NN }}</span>
              <span class="unit">mg/L</span>
            </template>
          </w-info-form>
        </div>
      </div>
    </template>
    <w-spin size="large" v-else class="loading" />
  </div>
</template>

<script>
import { basicFields } from '../components/config';
import moment from 'moment';
import _ from 'lodash-es';

export default {
  inject: ['closeTab'],
  data() {
    return {
      detailData: {},
      basicFields,
      layout: { span: 12, labelCol: { span: 4 }, wrapperCol: { span: 12 }, colon: true },
      modelLayout: { span: 12, labelCol: { span: 10 }, wrapperCol: { span: 14 }, colon: true },
      detailId: '',
      loading: false
    };
  },
  filters: {
    formData(val) {
      return moment(val).format('YYYY-MM-DD');
    },
    formTime(val) {
      return moment(val).format('HH:mm');
    }
  },

  mounted() {},
  activated() {
    this.detailId = this.$route.query.id;
    this.handleSearch();
  },
  methods: {
    getRunFields(fields) {
      return fields || [];
    },
    async handleSearch() {
      this.loading = true;
      try {
        let { resultData } = await this.$http.get('/runLog/queryById?id=' + this.detailId);
        resultData.nameList = resultData.nameList.toString();
        this.detailData = resultData;
        this.detailData.runLogFormJson =
          resultData.runLogFormJson && JSON.parse(resultData.runLogFormJson);
      } catch (error) {
        console.log(error);
      } finally {
        this.loading = false;
      }
    },
    handleGoBack() {
      this.closeTab();
      this.goto('/Operation/RunLog');
    },
    handleEdit() {
      this.goto({
        path: '/Operation/RunLog/edit',
        query: { id: this.detailId, waterPlantId: this.detailData.waterPlantId }
      });
    }
  }
};
</script>
<style lang="less" scoped>
@import '/src/views/Operation/RunLog/style/logView.less';

.log-detail {
  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }

  .run-data-wrap {
    margin-top: 10px;
    padding: 15px;
    overflow: auto;
    width: 100%;
    .form-title {
      height: 35px;
      padding: 0 10px;
      line-height: 35px;
      font-size: 14px;
    }
    .unit {
      margin-left: 5px;
    }
  }
}

html:not([data-wpg-theme='dark']) {
  .form-title {
    background: #f2f6fc;
  }
}

html[data-wpg-theme='dark'] {
  .form-title {
    background: #333b46;
  }
}
</style>
