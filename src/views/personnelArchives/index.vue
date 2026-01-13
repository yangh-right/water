<template>
  <div class="model-config">
    <w-form-table-page>
      <template #form>
        <w-form-header
          ref="info-form"
          :fields="fields"
          :title="null"
          newLine
          :model="searchForm"
          :neddRetain="false"
          :loading="tableLoading"
        >
          <template #waterPlantId>
            <factory-select
              class="factory-select"
              v-model="searchForm.waterPlantId"
              autoSelect
              @input="handleSearch"
              :showAll="true"
            ></factory-select>
          </template>
          <template #footer>
            <!-- <w-button icon="ic_vertical_align_bottom" type="primary" @click="handleImport"> 导入 </w-button> -->
            <w-button icon="ic_vertical_align_top" :loading="exportLoading" @click="handleExport">
              导出
            </w-button>
            <w-button class="resetButton" @click="handleAdd" type="primary">
              <w-icon type="ic_add"></w-icon>新增</w-button
            >
            <w-button icon="reload" @click="handleReset">
              <span>重置</span>
            </w-button>
            <w-button type="primary" icon="ic_search" @click="handleSearch">
              <span>查询</span>
            </w-button>
          </template>
        </w-form-header>
      </template>
      <template #table>
        <w-info-table
          :columns="columns"
          :data-source="tableList"
          :page="page"
          :scroll="{ x: 800 }"
          show-index
          :loading="tableLoading"
          @changePage="changePage"
        >
          <template #waterPlantId="{ text }">
            <span>{{ factoryObj[text] }}</span>
          </template>
          <template #action="{ row }">
            <span>
              <a @click="editInfo(row)">编辑</a>
              <w-divider type="vertical" />
            </span>
            <a @click="checkDetail(row)">详情</a>
            <span>
              <w-divider type="vertical" />
              <a @click="downLoad(row)">下载</a>
            </span>
            <span>
              <w-divider type="vertical" />
              <a @click="deleteInfo(row)">删除</a>
            </span>
          </template>
        </w-info-table>
      </template>
    </w-form-table-page>
    <AddModal
      ref="addModal"
      :width="560"
      :title="title"
      :type="type"
      :modelType="modelType"
      :form="modalForm"
      class="modal-wrapper"
    >
    </AddModal>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import axios from 'axios';
import serverConfig from '@/config/server.config';
import { exportFile } from '@/utils/util';
import FactorySelect from '@/components/factory-select/index';
import { generateEmployeeArchivesExcel } from '@/api/home';
import AddModal from './components/AddModal';
import { columns } from './config';

export default {
  name: 'PersonnelFiles',
  components: {
    FactorySelect,
    AddModal
  },
  data() {
    return {
      type: 'submit',
      modelType: 'add',
      searchForm: {},
      tableLoading: false,
      page: {
        currentPage: 1,
        pageSize: 20,
        total: 0
      },
      tableList: [],
      fields: [
        {
          label: '选择污水厂：',
          name: 'waterPlantId',
          type: 'select',
          colon: true,
          span: 8,
          wrapperCol: { span: 18 }
        },
        {
          search: true,
          name: 'keywords',
          type: 'input',
          span: 6,
          label: '关键字',
          placeholder: '请输入姓名/账户',
          wrapperCol: { span: 20 },
          listeners: {
            pressEnter: this.getList
          },
          colon: true
        }
      ],
      columns,
      title: '新增人员资质',
      defaultModalForm: {
        orgName: undefined,
        orgId: undefined,
        name: undefined,
        id: undefined,
        account: undefined,
        role: undefined
      },
      modalForm: {},
      fileListImg: [], // 上传的图片
      exportLoading: false,
      factoryObj: {} //水厂对象
    };
  },
  computed: {
    ...mapState(['factoryList'])
  },
  mounted() {
    this.$nextTick(() => {
      this.handleSearch();
    });
  },
  activated() {
    this.getList();
  },
  methods: {
    getFactoryObj() {
      this.factoryList.forEach(item => (this.factoryObj[item.id] = item.stationName));
    },
    // 重置
    handleReset() {
      this.page.currentPage = 1;
      this.page.pageSize = 20;
      this.searchForm.keywords = '';
      this.handleSearch();
    },
    handleSearch() {
      this.page.currentPage = 1;
      this.getList();
    },
    // 查询
    async getList() {
      this.tableLoading = true;
      try {
        const { resultData, count } = await this.$http.post('/EmployeeArchives/list', {
          keywords: this.searchForm.keywords,
          waterPlantId: this.searchForm.waterPlantId,
          ...this.page
        });
        this.tableList = resultData?.records || [];
        this.page.total = count;
        this.getFactoryObj();
        this.tableLoading = false;
      } catch (error) {
        this.tableLoading = false;
        this.tableList = [];
        this.page.total = 0;
      }
    },
    // 新增
    handleAdd() {
      this.type = 'submit';
      this.title = '新增人员资质';
      this.modelType = 'add';
      this.modalForm = { ...this.defaultModalForm, waterPlantId: this.searchForm.waterPlantId };
      this.$refs.addModal.setVisible();
    },
    // 查看员工详情
    async getEmployeeDetailInfo(row, isDown = false) {
      let { resultData, status } = await this.$http.get(
        '/EmployeeArchives/getEmployeeDetail?id=' + row.id
      );
      if (status == 'complete') {
        this.modalForm = { ...row, ...resultData };
        if (isDown) {
          this.downloadFile();
        } else {
          this.$refs.addModal.setVisible();
        }
      }
    },
    async downloadFile() {
      let url = this.modalForm?.fileIdAndNames[0]
        ? `${serverConfig.IMG_HOST_URL}${this.modalForm.fileIdAndNames[0].fileId}`
        : '';
      let name = this.modalForm?.fileIdAndNames[0]
        ? this.modalForm?.fileIdAndNames[0].fileName
        : '';
      if (url) {
        try {
          this.loading = true;
          const res = await axios({
            method: 'get',
            url,
            responseType: 'blob'
          });
          let data = res?.data || res;
          const blob = new Blob([data]);
          let elink = document.createElement('a');
          elink.download = name || 'filename';
          elink.style.display = 'none';
          let href = window.URL.createObjectURL(blob);
          elink.href = href;
          document.body.appendChild(elink);
          elink.click();
          document.body.removeChild(elink);
          window.URL.revokeObjectURL(href); // 释放掉blob对象
        } catch (error) {
          console.log(error);
        } finally {
          this.loading = false;
        }
      }
    },
    // 编辑
    editInfo(row) {
      this.title = '编辑人员资质';
      this.type = 'submit';
      this.modelType = 'edit';
      this.getEmployeeDetailInfo(row);
    },
    // 查看
    checkDetail(row) {
      this.type = 'submit';
      this.modelType = 'check';
      this.title = '人员资质';
      this.getEmployeeDetailInfo(row);
    },
    downLoad(row) {
      this.getEmployeeDetailInfo(row, true);
    },
    // 删除
    deleteInfo(row) {
      this.$confirm({
        title: '删除',
        content: '删除后不可恢复，是否确定删除?',
        onOk: async () => {
          await this.$http.get('/EmployeeArchives/deleteEmployeeArchives?id=' + row.id);
          this.$message.success('删除成功');
          this.getList();
        }
      });
    },
    changePage(current, pageSize) {
      this.page.currentPage = current;
      this.page.pageSize = pageSize;
      this.getList();
    },
    // 添加的图片id
    addFileId(fileListImg) {
      this.fileListImg = fileListImg;
    },
    /* 导出 */
    handleExport() {
      const data = {
        keywords: this.searchForm.keywords,
        waterPlantId: this.searchForm.waterPlantId,
        pageFlag: false
      };
      generateEmployeeArchivesExcel(data).then(res => {
        exportFile(res, '人员档案');
      });
    }
  }
};
</script>

<style lang="less" scoped>
/deep/ .resetButton {
  margin-left: 8px;

  span {
    margin-top: 1px !important;
  }
}
.model-config {
  width: 100%;
  height: 100%;
  .file-item {
    width: 70px;
    height: 20px;
    cursor: pointer;
  }
}
</style>
