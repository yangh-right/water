<template>
  <!-- 仪表管理 -->
  <div class="device-view">
    <w-form-table-page>
      <template #form>
        <w-form-model
          :labelCol="layout.labelCol"
          :wrapperCol="layout.wrapperCol"
          :model="searchForm"
          class="supply-w-full"
        >
          <w-row :gutter="6">
            <w-col :span="6">
              <w-form-model-item name="keyword" label="关键词">
                <w-input
                  v-model="searchForm.keyword"
                  placeholder="可搜索标准标题/标准编号/标准类型"
                  allowClear
                />
              </w-form-model-item>
            </w-col>
            <w-col :span="6">
              <w-form-model-item name="status" label="状态">
                <w-select v-model="searchForm.status" :options="statusList">
                  <w-select-option
                    v-for="item in statusList"
                    :key="item.dictValue"
                    :value="item.dictValue"
                    >{{ item.dictName }}</w-select-option
                  >
                </w-select>
              </w-form-model-item>
            </w-col>
            <w-col class="supply-float-right" :span="8">
              <w-form-model-item class="supply-float-right" :wrapperCol="{ flex: 1 }">
                <w-button class="supply-mr-3" type="primary" icon="ic_add" @click="handleAdd">
                  <span>新增</span>
                </w-button>
                <w-button class="supply-mr-3" icon="reload" @click="handleReset">
                  <span>重置</span>
                </w-button>
                <w-button class="supply-mr-3" type="primary" icon="ic_search" @click="handleSearch">
                  <span>查询</span>
                </w-button>
                <w-button class="supply-mr-3" @click="handleImport"
                  ><w-icon type="ic_publish" />导入</w-button
                >
                <w-button @click="handleExport"><w-icon type="ic_file_download" />导出</w-button>
              </w-form-model-item>
            </w-col>
          </w-row>
        </w-form-model>
      </template>
      <template #table>
        <w-info-table
          style="height: 100%"
          show-index
          :columns="columns"
          :data-source="dataSource"
          :page="searchForm"
          :loading="loading"
          :scroll="{ x: 2000 }"
          @handleEdit="handleEdit"
          @handleDelete="handleDelete"
          @handleDetail="handleDetail"
          @changePage="handlePageChange"
        >
          <template #status="{ text }">
            <span>{{ statusObj[text] || '' }}</span>
          </template>
          <template #content="{ row }">
            <a @click="handleDetail(row)">查看详情</a>
          </template>
          <template #workType="{ row }">
            <span>{{ getDicName(workTypeList, row.workType, 'label') }}</span>
          </template>
        </w-info-table>
      </template>
    </w-form-table-page>
    <w-modal
      class="secondary-modal"
      :visible="addInfoModelLoading"
      :maskClosable="false"
      title="作业标准"
      width="1000px"
      @cancel="cancelAddInfoModel"
      @ok="addInfoModelOk"
    >
      <w-form-model
        ref="addInfoFormRule"
        :model="addInfoForm"
        :rules="addInfoFormRule"
        v-bind="layout"
      >
        <w-row type="flex" justify="space-between">
          <w-col span="12">
            <w-form-model-item label="标题：" label-for="selectType" prop="title">
              <span v-if="preview">{{ addInfoForm.title }}</span>
              <w-input
                v-else
                v-model="addInfoForm.title"
                placeholder="请输入"
                style="width: 100%"
              ></w-input>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="标准编号：" label-for="standardCode" prop="standardCode">
              <span v-if="preview">{{ addInfoForm.standardCode }}</span>
              <w-input
                v-else
                v-model="addInfoForm.standardCode"
                placeholder="请输入"
                style="width: 100%"
              ></w-input>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="标准类型：" label-for="selectType" prop="standardType">
              <span v-if="preview">{{ addInfoForm.standardType }}</span>
              <w-input
                v-else
                v-model="addInfoForm.standardType"
                placeholder="请输入"
                style="width: 100%"
              ></w-input>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="作业类型" label-for="selectType" prop="workType">
              <span v-if="preview">{{
                getDicName(workTypeList, addInfoForm.workType, 'label') || ''
              }}</span>
              <w-select v-else v-model="addInfoForm.workType" placeholder="请选择">
                <w-select-option
                  v-for="(item, index) in workTypeList"
                  :key="index"
                  :value="item.value"
                >
                  {{ item.label }}
                </w-select-option>
              </w-select>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="排序" label-for="selectType" prop="orderIndex">
              <span v-if="preview">{{ addInfoForm.orderIndex }}</span>
              <w-input-number
                style="width:100%"
                :min="1"
                :step="1"
                :precision="0"
                v-else
                v-model="addInfoForm.orderIndex"
                placeholder="请输入"
              >
              </w-input-number>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="适用范围：" label-for="applicableScope">
              <span v-if="preview">{{ addInfoForm.applicableScope }}</span>
              <w-input
                v-else
                v-model="addInfoForm.applicableScope"
                placeholder="请输入"
                style="width:100%"
              ></w-input>
            </w-form-model-item>
          </w-col>
          <w-col span="24">
            <w-form-model-item
              label="标准内容："
              label-for="selectType"
              prop="content"
              :labelCol="labelColWidth1"
              :wrapperCol="wrapperCol"
            >
              <span v-if="preview" v-html="htmlContent"></span>
              <vc-editor v-else v-model="addInfoForm.content" placeholder="请输入内容" />
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="责任部门：" label-for="selectType" prop="responsibleDept">
              <span v-if="preview">{{ addInfoForm.responsibleDept }}</span>
              <w-input
                v-else
                v-model="addInfoForm.responsibleDept"
                placeholder="请输入"
                style="width:100%"
              ></w-input>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="责任人：" label-for="responsiblePerson">
              <span v-if="preview">{{ addInfoForm.responsiblePerson }}</span>
              <w-input
                v-else
                v-model="addInfoForm.responsiblePerson"
                placeholder="请输入"
                style="width:100%"
              ></w-input>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="状态：" label-for="selectType" prop="status">
              <span v-if="preview">{{ statusObj[addInfoForm.status] || '' }}</span>
              <w-select v-else v-model="addInfoForm.status" placeholder="请选择">
                <w-select-option
                  v-for="(item, index) in statusList"
                  :key="index"
                  :value="item.dictValue"
                >
                  {{ item.dictName }}
                </w-select-option>
              </w-select>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="版本号：" label-for="version">
              <span v-if="preview">{{ addInfoForm.version }}</span>
              <w-input
                v-else
                v-model="addInfoForm.version"
                placeholder="请输入"
                style="width:100%"
              ></w-input>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="创建人：" label-for="createBy">
              <span v-if="preview">{{ addInfoForm.createBy }}</span>
              <w-input
                v-else
                v-model="addInfoForm.createBy"
                placeholder="请输入"
                style="width:100%"
              ></w-input>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="备注：" label-for="remark">
              <span v-if="preview">{{ addInfoForm.remark }}</span>
              <w-input
                v-else
                v-model="addInfoForm.remark"
                placeholder="请输入"
                style="width:100%"
              ></w-input>
            </w-form-model-item>
          </w-col>
          <w-col span="24">
            <w-form-model-item
              label="附件："
              label-for="selectType"
              prop="attachments"
              :labelCol="labelColWidth1"
              :wrapperCol="wrapperCol"
            >
              <file-list
                :fileList="addInfoForm.attachments"
                :isEdit="!preview"
                @deleteFile="deleteFile"
                @uploadFile="uploadFile"
              ></file-list>
            </w-form-model-item>
          </w-col>
          <w-col span="24">
            <w-form-model-item
              label="视频："
              label-for="selectType"
              :disabled="preview"
              prop="video"
              :labelCol="labelColWidth1"
              :wrapperCol="wrapperCol"
            >
              <upload-file
                :multiple="false"
                :accept="'.mp4,.webm,.ogg'"
                @change="fileChange('video', $event)"
                fileListComponent="videoList"
                v-model="addInfoForm.video"
                placeholder="请选择"
              />
            </w-form-model-item>
          </w-col>
          <w-col span="24">
            <w-form-model-item
              label="注意事项："
              label-for="selectType"
              prop="content"
              :labelCol="labelColWidth1"
              :wrapperCol="wrapperCol"
            >
              <span v-if="preview" v-html="precautions"></span>
              <vc-editor v-else v-model="addInfoForm.precautions" placeholder="请输入注意事项" />
            </w-form-model-item>
          </w-col>
          <w-col span="24">
            <w-form-model-item
              label="录音："
              label-for="selectType"
              prop="recording"
              :labelCol="labelColWidth1"
              :wrapperCol="wrapperCol"
            >
              <upload-file
                :multiple="true"
                :limit="10"
                :accept="'.mp3,.wav,.ogg,.aac,.flac'"
                @change="fileChange('recording', $event)"
                :disabled="preview"
                fileListComponent="nameList"
                v-model="addInfoForm.recording"
                placeholder="请选择"
              />
            </w-form-model-item>
          </w-col>
          <w-col span="24">
            <w-form-model-item
              label="处理前图片："
              label-for="selectType"
              prop="beforeProcessingImages"
              :labelCol="labelColWidth1"
              :wrapperCol="wrapperCol"
            >
              <upload-file
                :multiple="true"
                :limit="10"
                @change="fileChange('beforeProcessingImages', $event)"
                :disabled="preview"
                accept=".png,.jpg,.jpeg,.bmp,.gif"
                v-model="addInfoForm.beforeProcessingImages"
                placeholder="请选择"
              />
            </w-form-model-item>
          </w-col>
          <w-col span="24">
            <w-form-model-item
              label="	处理后图片："
              label-for="selectType"
              prop="afterProcessingImages"
              :labelCol="labelColWidth1"
              :wrapperCol="wrapperCol"
            >
              <upload-file
                :multiple="true"
                :limit="10"
                :disabled="preview"
                accept=".png,.jpg,.jpeg,.bmp,.gif"
                @change="fileChange('afterProcessingImages', $event)"
                v-model="addInfoForm.afterProcessingImages"
                placeholder="请选择"
              />
            </w-form-model-item>
          </w-col>
        </w-row>
      </w-form-model>
    </w-modal>
    <div ref="fileCon" style="display: none">
      <input
        id="file"
        ref="file"
        type="file"
        name="fileUpload"
        style="display: none"
        accept=".xls,.xlsx,.XLS,.XLSX"
        @change="handleFile"
      />
    </div>
  </div>
</template>

<script>
import UploadFile from '@/components/UploadFile/UploadFile';
import { columns, searchForm, workTypeList } from './config';
import { cloneDeep } from 'lodash';
import { exportFile, getDicName } from '@/utils/util';
import {
  workStandardPage,
  workStandardAdd,
  workStandardDeleteById,
  workStandardEdit,
  exportWorkStandard,
  sysDictListByCode,
  importWorkStandard
} from '@/api/deviceManagement';
export default {
  name: 'WorkStandard',
  components: {
    UploadFile,
    FileList: () => import('@/views/pressureEquipments/FileList.vue')
  },
  data() {
    return {
      workTypeList,
      installAddressMap: {},
      modalInfo: {},
      isCommonScreen: true,
      loading: false,
      addInfoModelLoading: false, // 新增信息-弹框loading
      isAdd: true, // 是否新建
      title: '仪表台账',
      preview: false,
      layout: {
        colon: true, // 冒号
        span: 7,
        wrapperCol: { span: 18 },
        labelCol: { span: 6 },
        gutter: [12, 8] //栅格间隔[水平间距，垂直间距]
      },
      addInfoFormRule: {
        title: [{ required: true, message: '标题不能为空', trigger: 'change' }],
        standardCode: [{ required: true, message: '标准编号不能为空', trigger: 'change' }],
        standardType: [{ required: true, message: '标准类型不能为空', trigger: 'change' }],
        workType: [{ required: true, message: '作业类型不能为空', trigger: 'change' }],
        orderIndex: [{ required: true, message: '排序不能为空', trigger: 'change' }]
      },
      autoSize: {
        minRows: 2,
        maxRows: 10
      },
      statusObj: {},
      statusList: [],
      htmlContent: '',
      addInfoForm: {
        id: '',
        title: '',
        standardCode: '',
        attachments: [],
        standardType: '',
        status: undefined,
        content: '',
        applicableScope: '',
        responsibleDept: '',
        responsiblePerson: '',
        version: '',
        createBy: '',
        remark: '',
        workType: undefined,
        video: undefined,
        precautions: undefined,
        recording: undefined,
        beforeProcessingImages: undefined,
        afterProcessingImages: undefined
      },
      labelColWidth: {
        span: 7
      },
      labelColWidth1: {
        span: 3
      },
      wrapperCol: {
        span: 21
      },
      page: { size: 20, current: 1, total: 0 },
      searchForm: cloneDeep(searchForm),
      columns,
      dataSource: []
    };
  },
  created() {
    this.getDeviceStatus();
  },
  activated() {
    this.handleSearch();
  },
  methods: {
    getDicName,
    async getDeviceStatus() {
      let res = await sysDictListByCode('workStandardStatus');
      let { status, resultData } = res;
      if (status === 'complete') {
        this.statusList = resultData;
        resultData.forEach(item => {
          this.statusObj[item.dictValue] = item.dictName;
        });
      }
    },
    fileChange(key, fileList) {},
    handleFileData(fileList) {
      return fileList.map(item => {
        let newFile = {
          ...item
        };
        if (item?.response?.resultData) {
          newFile = {
            ...item.response.resultData,
            ...item
          };
        }
        newFile.name = newFile.oldName || newFile.name;
        delete newFile.response;
        return newFile;
      });
    },
    handleSearch() {
      this.page.current = 1;
      this.getDeviceList();
    },
    async getDeviceList() {
      this.loading = true;
      const { resultData } = await workStandardPage({ ...this.searchForm, page: this.page });
      setTimeout(() => {
        this.dataSource = resultData.records;
        this.searchForm.total = resultData.total;
        this.loading = false;
      }, 500);
    },
    handleReset() {
      this.searchForm = cloneDeep(searchForm);
      this.handleSearch();
    },
    deleteFile(id) {
      let index = this.addInfoForm.attachments.find(v => v.id === id);
      this.addInfoForm.attachments.splice(index, 1);
    },
    uploadFile(data) {
      this.addInfoForm.attachments.push(data);
    },
    handleEdit(row) {
      this.preview = false;
      this.isAdd = false;
      this.addInfoForm = cloneDeep(row);
      this.handleFileForm();
      this.addInfoForm.attachments =
        this.addInfoForm.attachments.map(item => {
          if (item.id) {
            return item;
          } else {
            return JSON.parse(item);
          }
        }) || [];
      this.addInfoModelLoading = true;
    },
    handleDetail(row) {
      this.isAdd = false;
      this.preview = true;
      this.addInfoForm = cloneDeep(row);
      this.handleFileForm();
      this.addInfoForm.attachments =
        this.addInfoForm.attachments.map(item => {
          if (item.id) {
            return item;
          } else {
            return JSON.parse(item);
          }
        }) || [];
      this.htmlContent = row?.content || '';
      this.addInfoModelLoading = true;
    },
    handleFileForm() {
      this.addInfoForm.video = this.addInfoForm.video
        ? JSON.parse(this.addInfoForm.video)
        : undefined;
      this.addInfoForm.recording = this.addInfoForm.recording
        ? JSON.parse(this.addInfoForm.recording)
        : undefined;
      this.addInfoForm.beforeProcessingImages = this.addInfoForm.beforeProcessingImages
        ? JSON.parse(this.addInfoForm.beforeProcessingImages)
        : undefined;
      this.addInfoForm.afterProcessingImages = this.addInfoForm.afterProcessingImages
        ? JSON.parse(this.addInfoForm.afterProcessingImages)
        : undefined;
    },
    handleAdd() {
      this.preview = false;
      this.isAdd = true;
      this.addInfoForm = {
        id: '',
        title: '',
        standardCode: '',
        standardType: '',
        status: undefined,
        content: '',
        applicableScope: '',
        attachments: [],
        responsibleDept: '',
        responsiblePerson: '',
        version: '',
        createBy: '',
        remark: '',
        workType: undefined,
        video: undefined,
        precautions: undefined,
        recording: undefined,
        beforeProcessingImages: undefined,
        afterProcessingImages: undefined
      };
      this.addInfoModelLoading = true;
    },
    cancelAddInfoModel() {
      this.addInfoModelLoading = false;
      this.$refs.addInfoFormRule && this.$refs.addInfoFormRule.resetFields();
    },
    //  弹框确定按钮
    addInfoModelOk() {
      if (this.preview) {
        this.cancelAddInfoModel();
        return false;
      }
      this.$refs.addInfoFormRule.validate(valid => {
        if (valid) {
          this.tableLoading = true;
          let params = {
            ...this.addInfoForm,
            video: this.addInfoForm.video
              ? JSON.stringify(this.handleFileData(this.addInfoForm.video))
              : undefined,
            recording: this.addInfoForm.recording
              ? JSON.stringify(this.handleFileData(this.addInfoForm.recording))
              : undefined,
            beforeProcessingImages: this.addInfoForm.beforeProcessingImages
              ? JSON.stringify(this.handleFileData(this.addInfoForm.beforeProcessingImages))
              : undefined,
            afterProcessingImages: this.addInfoForm.afterProcessingImages
              ? JSON.stringify(this.handleFileData(this.addInfoForm.afterProcessingImages))
              : undefined
          };
          if (this.isAdd) {
            workStandardAdd(params).then(response => {
              this.tableLoading = false;
              if (response.status === 'complete') {
                this.$message.success('添加成功!');
              }
            });
          } else {
            workStandardEdit(params).then(response => {
              if (response.status === 'complete') {
                this.tableLoading = false;
                this.$message.success('保存成功!');
              }
            });
          }
          this.getDeviceList();
          this.addInfoModelLoading = false;
          this.cancelAddInfoModel();
        }
      });
    },
    handleDelete(row) {
      this.$confirm({
        title: '确定要删除该项记录吗？',
        okText: '确定删除',
        type: 'warning',
        cancelText: '取消',
        onCancel: () => {},
        onOk: () => {
          this.deleteDevice(row.id);
        }
      });
    },
    async deleteDevice(id) {
      try {
        let { success } = await workStandardDeleteById(id);
        if (success) {
          this.$message.success('删除成功！');
          this.handleSearch();
        }
      } catch (error) {
        console.log(error);
      }
    },
    handleImport() {
      this.$refs.file.click();
    },
    handleExport() {
      const vo = this.searchForm;
      exportWorkStandard(vo).then(res => {
        exportFile(res, '作业标准');
      });
    },
    async handleFile() {
      let file = this.$refs.file.files[0];
      let formData = new FormData();
      formData.append('file', file);
      let res = await importWorkStandard(formData);
      if (res.status == 'complete') {
        this.$message.success('导入成功');
      } else {
        this.$message.error(res.errorMessage);
      }
      this.getDeviceList();
      document.getElementById('file').value = '';
    },
    // 页码change
    handlePageChange(current, pageSize) {
      this.page.current = current;
      this.page.size = pageSize;
      this.getDeviceList();
    }
  }
};
</script>

<style lang="less" scoped>
.device-view {
  width: 100%;
  height: 100%;
  /deep/.wpg-form {
    padding: 5px 20px;
    background: var(--supply-color-bg-card-DEFAULT);
  }
  .wpg-form-item {
    margin-bottom: 0 !important;
  }
}
/deep/ .wpg-modal-body {
  height: 550px;
  overflow: auto;
}
/deep/ .wpg-form-item {
  margin-bottom: 12px;
}
</style>
