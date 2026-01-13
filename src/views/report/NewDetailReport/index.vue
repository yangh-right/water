<template>
  <div v-if="loading" v-loading="loading" class="wrapper-loading"></div>
  <div v-else class="wrapper">
    <w-detail-header :pageTitle="title">
      <template slot="extra">
        <w-divider type="vertical" style="height: 14px; background-color: transparent"></w-divider>
        <w-tag :color="color">
          {{ colorName }}
        </w-tag>
      </template>
      <w-button class="btn-item" @click="goBack">返回列表</w-button>
      <w-button class="btn-item" @click="exportFile" :loading="exportLoading">导出Excel</w-button>
      <w-button
        type="primary"
        class="btn-item"
        :loading="submitLoading"
        @click="submitReport"
        v-if="isDealExamFlag"
        >{{ handleText }}</w-button
      >
    </w-detail-header>
    <div class="content wbgc-card">
      <div class="wordLoading" v-loading="true" v-if="wordLoading"></div>
      <w-empty v-if="showEmpty" />
      <div class="wordText" v-html="wordText" v-else></div>
    </div>
    <w-modal title="上传补调文件" :visible="visible" @cancel="dispatchCancel" @ok="dispatchSubmit">
      <common-upload
        :multiple="false"
        v-model="dispatchFileList"
        type="upload-dragger"
        limit="1"
        accept=".xls,.xlsx"
        @change="afterFileUpload"
      >
      </common-upload>
    </w-modal>
    <w-modal
      v-modalDrag
      centered
      title="审核"
      :visible="dealVisible"
      :footer="null"
      @cancel="dealCancel"
    >
      <w-info-form
        ref="dealForm"
        :fields="fields"
        :model="addForm"
        :layout="layout"
        :loading="loading"
        @submit="dealSubmit"
        @cancel="dealCancel"
      >
      </w-info-form>
    </w-modal>
  </div>
</template>

<script>
import { exportFile } from '@/utils/util';
import CommonUpload from '@/components/Uploader/CommonUpload';
import { updateReport, isDealExam, examReportType } from '@/api/report';
import { downLoadFile, downLoadFileBuffer } from '@/api/public';
import config from '@/config/setting.config';
import { layout } from './config';
import { mapState } from 'vuex';

export default {
  name: 'NewDetailReport',
  components: { CommonUpload },
  inject: ['closeTab'],
  data() {
    return {
      isDealExamFlag: false, // 是否显示提交按钮
      isDealExams: [false, false],
      // 页面加载
      loading: false,
      // 按钮
      exportLoading: false,
      submitLoading: false,
      handleText: '提交',
      btnShow: 0,
      // 预览地址
      imgUrl: '',
      // 数据补调
      visible: false,
      dispatchFileList: [],
      fileId: '',
      uploadParam: '',
      wordLoading: false,
      wordText: '',
      excelAddress: '', //上传文件返回的文件id
      showEmpty: false,
      color: '',
      colorName: '',
      // 审核
      dealVisible: false,
      dealMark: '',
      layout,
      addForm: {
        passFlag: 1,
        remark: ''
      },
      fields: [
        {
          name: 'passFlag',
          label: '审核',
          required: true,
          type: 'radio-group',
          placeholder: '请选择',
          options: [
            {
              label: '通过',
              value: 1
            },
            {
              label: '不通过',
              value: 0
            }
          ]
        },
        {
          name: 'remark',
          label: '备注',
          type: 'textarea',
          placeholder: '请输入',
          value: ''
        }
      ]
    };
  },
  watch: {
    $route: {
      handler(val) {
        if (val.path.includes('/report/NewDetailReport')) {
          this.$nextTick(() => {
            this.color = val.query?.color;
            this.colorName = val.query?.colorName;
            this.isDealExam();
            this.getPreviewUrl();
          });
        }
      },
      deep: true,
      immediate: true
    }
  },
  computed: {
    ...mapState('account', ['user']),
    title() {
      return this.$route.query?.title;
    }
  },
  methods: {
    // 判断是否是提交-审核处理人
    async isDealExam() {
      let modelId = this.$route.query.modelId;
      if (modelId) {
        const { resultData } = await isDealExam({
          modelId,
          userId: this.user.userId
        });
        this.isDealExams = resultData;
        this.isDealExamFlag = false;
        let tj = this.isDealExams[0]; // true this.$route.query?.commitFlag 0
        let sh = this.isDealExams[1]; // true this.$route.query?.dealFlag
        if (tj && this.$route.query?.commitFlag * 1 === 0) {
          this.handleText = '提交';
          this.isDealExamFlag = true;
        }
        if (
          sh &&
          this.$route.query?.commitFlag * 1 === 1 &&
          this.$route.query?.dealFlag * 1 === 0
        ) {
          this.handleText = '审核';
          this.isDealExamFlag = true;
        }
      }
    },
    // 获取html
    getPreviewUrl() {
      this.wordLoading = true;
      if (this.$route.query?.htmlAddress) {
        downLoadFileBuffer(this.$route.query?.htmlAddress)
          .then(res => {
            let utf8 = new Uint8Array(res);
            let deCodeUtf = new TextDecoder();
            this.wordText = deCodeUtf.decode(utf8);
            if (this.wordText.includes('title')) {
              this.wordLoading = false;
              this.showEmpty = false;
            }
          })
          .catch(error => {
            this.wordLoading = false;
            this.showEmpty = true;
          });
        this.wordLoading = false;
      } else {
        this.wordLoading = false;
        this.showEmpty = true;
      }
    },
    // 数据补调
    dataDispatch() {
      this.visible = true;
    },
    beforeUpload() {
      if (this.dispatchFileList.length > 0) {
        this.$message.warning('请上传单个文件!');
        return false;
      }
    },
    afterUpload(file) {
      this.fileId = file[0].response.resultData;
    },
    // 文件处理
    afterFileUpload(fileList) {
      this.dispatchFileList = fileList;
      let id = fileList.map(file => file.id);
      this.excelAddress = id[0];
    },
    // 导出文件
    async exportFile() {
      try {
        this.exportLoading = true;
        await downLoadFile(this.$route.query?.excelAddress).then(res => {
          exportFile(res, this.title);
        });
      } catch (error) {
        // console.log(error);
      } finally {
        this.exportLoading = false;
      }
    },
    // 上传文件修改
    async dispatchSubmit() {
      await updateReport({
        id: this.$route.query?.id,
        excelAddress: this.excelAddress
      });
      this.$message.success('补调成功！');
      this.visible = false;
      this.goBack();
    },
    // 提交审核
    async submitReport() {
      this.submitLoading = true;
      let data = {
        id: this.$route.query?.id
      };
      let mess = '提交';

      let tj = this.isDealExams[0]; // true this.$route.query?.commitFlag 0
      let sh = this.isDealExams[1]; // true this.$route.query?.dealFlag
      if (tj && this.$route.query?.commitFlag * 1 === 0) {
        data.commitFlag = 1;
        mess = '提交';
        try {
          await updateReport({
            ...data
          });
          this.$message.success(`${mess}成功！`);
          this.goBack();
        } catch (error) {
          //
        } finally {
          this.submitLoading = false;
        }
      }

      if (sh && this.$route.query?.commitFlag * 1 === 1 && this.$route.query?.dealFlag * 1 === 0) {
        this.submitLoading = false;
        data.dealFlag = 1;
        mess = '审核';
        this.dealVisible = true;
      }
    },
    dispatchCancel() {
      this.visible = false;
    },
    // 返回列表
    goBack() {
      this.closeTab(
        this.$route.path.replace(
          `/${config.productCode}`,
          this.$route.query.from?.replace('/wpg-waterwork-001', '')
        )
      );
    },
    // 审核取消
    dealCancel() {
      this.$refs.dealForm.$_resetFields();
      this.loading = false;
      this.dealVisible = false;
    },
    // 审核提交
    async dealSubmit() {
      await examReportType({
        ...this.addForm,
        id: this.$route.query?.id
      });
      this.$message.success('审核成功！');
      this.dealVisible = false;
      this.goBack();
    }
  }
};
</script>
<style lang="less" scoped>
.wrapper {
  overflow: auto;

  /deep/ .wpg-tag {
    line-height: 32px;
  }
}

.wrapper-loading {
  width: 100%;
  height: 100%;
}

/deep/ .wpg-tag-orange {
  box-shadow: none;
}

.head-wrap {
  position: relative;
  width: 100%;
  height: 56px;
  margin-bottom: 10px;

  .left-head {
    position: absolute;
    top: 15px;
    left: 16px;
    font-size: 16px;
    color: #6281a3;
  }

  .right-head {
    position: absolute;
    top: 12px;
    right: 32px;

    .btn-item {
      height: 32px;
      margin-left: 10px;
    }
  }
}

.content {
  width: 100%;
  height: calc(~'100% - 72px');
  overflow: hidden;
  padding: 0 20px;
  .wordLoading {
    width: 100%;
    height: 100%;
  }
  .wordText {
    width: 100%;
    height: 100%;
    overflow: hidden;
    overflow-y: auto;
    display: flex;
    justify-content: center;
    /deep/ div {
      display: none !important;
    }
  }

  .content-info {
    width: 100%;
    height: 38px;
    margin-bottom: 20px;
    padding-top: 8px;
    padding-left: 20px;
    .info-item {
      margin-right: 50px;
    }
  }

  .content-report {
    padding: 0 10px;
    height: auto;
    img {
      width: auto;
      height: auto;
    }
  }
}
/deep/ .wpg-empty {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
