<!-- 导入 -->
<template>
  <w-modal
    class="secondary-modal"
    :visible="model"
    title="批量导入"
    :width="800"
    :maskClosable="step !== 1"
    @cancel="closeModal"
  >
    <w-row class="ivu-mt-8 ivu-mb-8">
      <w-col span="24">
        <w-steps :current="step">
          <w-step title="上传文件" content></w-step>
          <w-step title="数据处理" content></w-step>
          <w-step title="处理结果" content></w-step>
        </w-steps>
      </w-col>
    </w-row>

    <div v-show="step === 0" style="min-height: 300px">
      <w-row>
        <w-col span="24">
          <w-list>
            <w-list-item>
              <div class="ivu-list-item-meta">
                <div class="ivu-list-item-metw-avatar">
                  <w-avatar icon="download" shape="square" />
                </div>
                <div class="ivu-list-item-meta-content">
                  <div class="ivu-list-item-meta-title">填写导入数据信息</div>
                  <div class="ivu-list-item-meta-description">
                    请按照数据模板的格式准备导入数据，模板中的表头名称不可更改，表头行不能删除
                  </div>
                  <div class="ivu-list-item-meta-link">
                    <a href="javascript:;" @click="handleExportExcel">下载模板</a>
                  </div>
                </div>
              </div>
            </w-list-item>
            <w-list-item>
              <div class="ivu-list-item-meta">
                <div class="ivu-list-item-meta-avatar">
                  <w-avatar icon="upload" shape="square" />
                </div>
                <div class="ivu-list-item-meta-content">
                  <div class="ivu-list-item-meta-title">上传填好的信息表</div>
                  <div class="ivu-list-item-meta-description">
                    文件后缀名必须为xls 或xlsx
                    （即Excel格式），文件大小不得大于10M，最多支持导入3000条数据
                  </div>
                  <div class="ivu-list-item-meta-link">
                    <a href="javascript:;" @click="uploadFile">上传文件</a>
                    <input
                      id="importFileIpt"
                      ref="file"
                      type="file"
                      name="fileUpload"
                      style="display: none"
                      accept=".xls,.xlsx,.XLS,.XLSX"
                      @change="handleFile"
                    />
                  </div>
                </div>
              </div>
            </w-list-item>
          </w-list>
        </w-col>
      </w-row>
      <w-alert
        type="warning"
        style="height: auto;"
        message="特别提示"
        description="导入过程中如发现标签不存在，会自动忽略该标签；取消本次操作，不会保存本次操作内容。"
        show-icon
      >
      </w-alert>
    </div>

    <div v-show="step === 1" style="height: 300px; padding-top: 24px">
      <div class="import-proccess-title">正在处理数据</div>
      <w-progress class="ivu-mb" :percent="percent" />
      <w-alert
        type="warning"
        style="height: auto;"
        message="特别提示"
        description="数据处理过程中，请勿关闭窗口或刷新页面"
        show-icon
      >
      </w-alert>
    </div>
    <div v-show="step === 2" style="height: 300px; padding-top: 24px">
      <w-result type="success" title="批量导入完成">
        <div slot="desc">您已成功导入1000条数据。</div>
      </w-result>
    </div>
    <div class="error-status" v-show="step === 3" style="height: 300px; padding-top: 24px">
      <w-result status="error" title="批量导入失败">
        <template #extra>
          <w-button type="default" @click="closeModal">关闭</w-button>
          <w-button type="primary" @click="step = 0">重新上传</w-button>
        </template>
        <div class="desc">
          请核对
          <PopTable
            ref="importResultPopTable"
            :tableHeight="250"
            placement="right"
            :getDataPromise="getRecord"
            :columns="recordTableColumns"
            hoverTxt="错误信息"
          />
          后，再重新上传。
        </div>
      </w-result>
    </div>

    <div slot="footer">
      <w-row type="flex" justify="space-between">
        <!-- <w-col span="8" style="text-align: left">
          <PopTable
            ref="importRecordPopTable"
            :tableHeight="250"
            placement="rightBottom"
            :getDataPromise="getRecord"
            :columns="recordTableColumns"
            hoverTxt="导入记录"
          />
        </w-col> -->
        <w-col span="16" style="text-align: right">
          <template v-if="step === 0">
            <w-button type="default" @click="closeModal">取消</w-button>
            <w-button type="primary" @click="handleSubmit">提交</w-button>
          </template>
          <template v-if="step == 2">
            <w-button type="default" @click="closeModal">关闭</w-button>
            <w-button type="primary" @click="handleContinue">继续导入</w-button>
          </template>
          <!-- <w-button type="primary" @click="step = 3">查看失败</w-button> -->
        </w-col>
      </w-row>
    </div>
  </w-modal>
</template>

<script>
import {
  downloadInTemplate,
  downloadOutTemplate,
  importInDetail,
  importOutDetail
} from '@/api/warehouse.js';
import randomNumber from '@/utils/random_number.js';
import { exportFile } from '../base/exportFile';
import PopTable from './pop-table';
export default {
  name: 'ImportModal',
  components: { PopTable },
  props: {
    value: {},
    modalType: {
      type: String
    }
  },
  watch: {
    value(val) {
      if (val) {
        this.init();
      }
    }
  },
  computed: {
    model: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit('input', val);
      }
    }
  },
  data() {
    return {
      step: 0,
      fileList: [],
      acceptType: '.xls,.xlsx',
      percent: 0,
      recordTableColumns: [
        {
          title: '时间',
          key: 'time',
          dataIndex: 'time',
          minWidth: 130
        },
        {
          title: '文件',
          key: 'value',
          dataIndex: 'value',
          minWidth: 100
        },
        {
          title: '上传人',
          key: 'name',
          dataIndex: 'name',
          minWidth: 80
        }
      ]
    };
  },
  methods: {
    init() {
      this.step = 0;
      this.fileList = [];
      document.getElementById('importFileIpt').value = '';
      this.$refs.importRecordPopTable.reset();
      this.$refs.importResultPopTable.reset();
    },
    closeModal() {
      this.model = false;
    },
    handleContinue() {
      this.init();
    },

    handleSubmit() {
      this.step += 1;
      this.percent = 0;
      const loopHandler = setInterval(() => {
        this.percent += randomNumber(0, 10);
        if (this.percent > 99) {
          clearInterval(loopHandler);
          this.percent = 100;
          this.step = 2;
        }
      }, 200);
    },
    uploadError(er, response, file) {
      this.fileList.splice(this.fileList.indexOf(file), 1);
    },
    uploadSuccess(res, file, fileList) {
      this.fileList.push(file);
    },
    removeFile(file, fileList) {
      this.fileList.splice(this.fileList.indexOf(file), 1);
    },
    async getRecord() {
      const items = [];

      for (let i = 0; i < randomNumber(1, 6); i++) {
        const minusDay = Math.floor(Math.random() * (10 - 1) + 1);
        items.push({
          name: `张三${i}`,
          value: `数据记录${randomNumber(1, 100)}.xls}`,
          time: this.$Date()
            .add(minusDay, 'day')
            .format('YYYY-MM-DD HH:mm:ss')
        });
      }
      return {
        total: 50,
        items: items
      };
    },
    stopDefault(e) {
      //阻止默认浏览器动作(W3C)
      if (e && e.preventDefault) e.preventDefault();
      //IE中阻止函数器默认动作的方式
      else window.event.returnValue = false;
      return false;
    },
    // 下载模板
    handleExportExcel(e) {
      let modalType = this.modalType;
      this.stopDefault(e);
      if ('in' === modalType) {
        downloadInTemplate().then(res => {
          exportFile(res, '入库登记模板');
        });
      } else if ('out' === modalType) {
        downloadOutTemplate().then(res => {
          exportFile(res, '出库登记模板');
        });
      }
    },
    uploadFile(e) {
      this.stopDefault(e);
      this.$refs.file.click();
    },
    async handleFile() {
      let val = this.$refs.file;
      if (!val) {
        return false;
      }
      var filePath = val.value;
      var fileExt = filePath.substring(filePath.lastIndexOf('.') + 1).toLowerCase();
      if (!this.acceptType.includes(fileExt)) {
        this.$message.error('文件格式错误，请导入.xls或.xlsx文件');
        return false;
      }
      let file = val.files[0];
      let maxSize = 10 * 1024; // kb

      if ((file.size / 1024 / 2).toFixed(1) >= maxSize) {
        this.$message.error('文件大小不得大于10M');
        return false;
      }
      let modalType = this.modalType;
      let formData = new FormData();
      formData.append('file', file);
      let res = '';
      if ('in' === modalType) {
        res = await importInDetail(formData);
      } else if ('out' === modalType) {
        res = await importOutDetail(formData);
      }
      if (res.status === 'complete') {
        this.$message.success(typeof res.resultData === 'string' ? res.resultData : '导入成功');
        console.log(res.resultData);
        this.$emit('changeFile', res.resultData);
      }
      document.getElementById('file').value = '';
    }
  }
};
</script>

<style lang="less" scoped>
.ivu-list-item-meta {
  display: flex;
  align-items: center;
  &-avatar {
    margin-right: 12px;
    /deep/ .wpg-avatar.wpg-avatar-icon {
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  &-content {
    font-size: 13px;
  }
  &-title {
    font-size: 15px;
    font-weight: 700;
    margin-bottom: 4px;
  }
}
.ivu-list-item-meta-link {
  font-size: 14px;
  font-weight: 500;
  margin-top: 4px;

  &--selected {
    .ivu-upload-select {
      display: none;
    }
  }
}
.import-proccess-title {
  font-size: 16px;
  font-weight: bold;
}
.error-status {
  /deep/ .wpg-result {
    padding: 12px 32px;
  }
}
</style>
