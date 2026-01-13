<!-- 文件管理页面 -->
<template>
  <div class="file-manage-view">
    <!-- 表单和表格布局 -->
    <w-form-table-page>
      <!-- 表单区域 -->
      <template #form>
        <w-form-header
          :fields="fields"
          :model="searchForm"
          :layout="{ labelAuto: true }"
          :title="null"
          :loading="loading"
          newLine
          :neddRetain="false"
        >
          <!-- 项目阶段步骤 -->
          <template #projectPhase>
            <div class="steps">
              <step
                v-for="(item, index) in steps"
                :key="item.dictCode"
                :index="index"
                :data="steps"
                :currentStep="currentStep"
                @changeStep="changeStep"
              ></step>
            </div>
          </template>
          <!-- 水厂选择 -->
          <template #waterPlantId>
            <factory-select
              class="factory-select"
              v-model="searchForm.waterPlantId"
              :showAll="!autoSelect"
              autoSelect
              @input="handleSearch"
            ></factory-select>
          </template>
          <!-- 操作按钮 -->
          <template #footer>
            <w-button type="primary" icon="ic_add" @click="handleAdd">新增</w-button>
            <w-button icon="reload" @click="handleReset">重置</w-button>
            <w-button type="primary" icon="ic_search" @click="handleSearch">查询</w-button>
            <!-- 返回控制 -->
            <return-control
              v-if="
                $route.query.backPath &&
                  $route.query.backPath.includes('/instrument/InstrumentMaintenance')
              "
              class="return-btn"
              :is-drill-down="true"
            ></return-control>
          </template>
        </w-form-header>
      </template>
      <!-- 表格区域 -->
      <template #table>
        <w-info-table
          showIndex
          :columns="columns"
          :data-source="tableData"
          :page="searchForm"
          :loading="loading"
          @downLoad="downLoad"
          @itemEdit="itemEdit"
          @itemDelete="itemDelete"
          @changePage="changePage"
          style="height: 100%"
        >
          <!-- 文件时间 -->
          <template #fileTime="{ row }">
            {{ row.date }}
          </template>
          <!-- 水厂名称 -->
          <template #plantId="{ row }">
            {{ row.plantId && factoryDict[row.plantId] }}
          </template>
          <!-- 文件格式图标 -->
          <template #fileFormat="{ row }">
            <img
              v-if="row.fileFormat.includes('excel') || row.fileFormat.includes('xls')"
              class="pre-icon"
              src="./../../assets/images/default/icons/ic_file_excel@2x.png"
              alt
            />
            <img
              v-else-if="row.fileFormat.includes('pdf')"
              class="pre-icon"
              src="./../../assets/images/default/icons/ic_file_pdf@2x.png"
              alt
            />
            <img
              v-else-if="
                row.fileFormat.includes('png') ||
                  row.fileFormat.includes('jpg') ||
                  row.fileFormat.includes('webp') ||
                  row.fileFormat.includes('gif')
              "
              class="pre-icon"
              src="./../../assets/images/default/icons/ic_file_pic@2x.png"
              alt
            />
            <img
              v-else-if="row.fileFormat.includes('doc')"
              class="pre-icon"
              src="./../../assets/images/default/icons/ic_file_word@2x.png"
              alt
            />
            <img
              v-else
              class="pre-icon"
              src="./../../assets/images/default/icons/ic_file_other@2x.png"
              alt
            />
          </template>
        </w-info-table>
      </template>
    </w-form-table-page>
    <!-- 新增/编辑弹窗 -->
    <add-model
      :visible.sync="visible"
      :title="modelTitle"
      :AddForm="modalForm"
      :modelType="modelType"
      :steps="steps"
    ></add-model>
  </div>
</template>

<script>
// 导入相关依赖
import serverConfig from '@/config/server.config';
import { getProjectStepApi } from '@/api/public';
import { getPage, deleteFile } from '@/api/fileManagement';
import { columns } from './components/config';
import FactorySelect from '@/components/factory-select/index';
import moment from 'moment';
import Step from './components/Step.vue';
import AddModel from './components/AddModel.vue';

export default {
  data() {
    return {
      columns, // 表格列配置
      visible: false, // 弹窗显示状态
      modelTitle: '新增', // 弹窗标题
      tableData: [], // 表格数据
      loading: false, // 加载状态
      modalForm: {}, // 弹窗表单数据
      modelType: '', // 弹窗类型（新增/编辑）
      downLoadUrl: `${serverConfig.IMG_BASE_URL}`, // 文件下载地址
      searchForm: {
        // 搜索表单数据
        waterPlantId: '',
        projectPhase: '',
        fileName: '',
        rangeTime: [this.$moment().subtract(1, 'years'), this.$moment()],
        createUser: '',
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      currentStep: 'approval', // 当前选中的项目阶段
      steps: [], // 项目阶段列表
      page: { size: 10, current: 1, pages: 0, total: 0 }, // 分页信息
      firstTime: 0, // 首次加载标记
      fields: [
        // 表单字段配置
        {
          label: '',
          name: 'projectPhase',
          type: 'input',
          span: 24
        },
        {
          label: '选择污水厂：',
          name: 'waterPlantId',
          type: 'select',
          span: 4
        },
        {
          label: '文件名称',
          name: 'fileName',
          type: 'input',
          span: 4
        },
        {
          label: ['时间'],
          name: 'rangeTime',
          type: 'rangePicker',
          span: 6
        },
        {
          label: '操作人',
          name: 'createUser',
          type: 'input',
          span: 4
        }
      ]
    };
  },
  computed: {
    // 是否自动选择水厂
    autoSelect() {
      return this.$store.state.factoryList?.length === 1;
    },
    // 水厂字典
    factoryDict() {
      let obj = {};
      this.$store.state.factoryList.map(item => {
        obj[item.id] = item.stationName;
      });
      return obj;
    }
  },
  components: { FactorySelect, Step, AddModel },
  activated() {
    this.getList();
  },
  created() {
    this.getProjectSteps();
  },
  methods: {
    // 切换项目阶段
    changeStep(data) {
      this.currentStep = data;
      this.getList();
    },
    // 获取项目阶段
    async getProjectSteps() {
      let res = await getProjectStepApi();
      let { status, resultData } = res;
      if (status === 'complete') {
        this.steps = resultData;
      }
    },
    // 文件下载
    downLoad(row) {
      const x = new XMLHttpRequest();
      x.open('GET', this.downLoadUrl + '/' + row.fileUrl, true);
      x.responseType = 'blob';
      x.onload = function(e) {
        const url = window.URL.createObjectURL(x.response);
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.download = row.fileOriginName;
        a.click();
        a.remove();
      };
      x.send();
    },
    // 编辑文件
    itemEdit(row) {
      this.visible = true;
      this.modelTitle = '编辑';
      this.modelType = 'edit';
      this.modalForm = row;
    },
    // 删除文件
    itemDelete(row) {
      this.$confirm({
        title: '确定要删除该条数据吗？',
        okText: '确定',
        cancelText: '取消',
        onOk: () => {
          this.deleteRecord(row);
        },
        onCancel: () => {}
      });
    },
    // 执行删除操作
    async deleteRecord(data) {
      let res = await deleteFile(data.id);
      let { status, errorMessage } = res;
      if (status === 'complete') {
        this.$message.success('删除成功');
        this.getList();
      } else {
        this.$message.success(errorMessage);
      }
    },
    // 分页变化
    changePage(currentPage, pageSize) {
      this.searchForm.currentPage = currentPage;
      this.searchForm.pageSize = pageSize;
      this.page.current = currentPage;
      this.page.size = pageSize;
      this.getList();
    },
    // 搜索
    handleSearch() {
      this.searchForm.currentPage = 1;
      this.page.current = 1;
      this.getList();
    },
    // 重置
    handleReset() {
      this.searchForm = {
        waterPlantId: '',
        projectPhase: '',
        fileName: '',
        rangeTime: [this.$moment().subtract(1, 'years'), this.$moment()],
        createUser: '',
        currentPage: 1,
        pageSize: 10,
        total: 0
      };
      this.page.current = 1;
      this.page.size = 10;
      this.getList();
    },
    // 获取文件列表
    async getList() {
      this.searchForm.projectPhase = this.currentStep;
      this.searchForm.startTime = this.searchForm.rangeTime[0].format('YYYY-MM-DD') + ' 00:00:00';
      this.searchForm.endTime = this.searchForm.rangeTime[1].format('YYYY-MM-DD') + ' 23:59:59';
      this.searchForm.page = this.page;
      this.loading = true;
      try {
        let res = await getPage(this.searchForm);
        this.tableData = res.resultData.records.map(item => {
          item.date = item.fileTime.split(' ')[0];
          return item;
        });
        this.searchForm.total = res.resultData.total;
        this.page.total = res.resultData.total;
      } catch (e) {
        console.log(e);
      } finally {
        this.loading = false;
      }
    },
    // 新增文件
    handleAdd() {
      this.visible = true;
      this.modelTitle = '新增';
      this.modelType = 'add';
      this.modalForm = {};
    }
  }
};
</script>

<style lang="less" scoped>
.file-manage-view {
  height: 100%;
}
.steps {
  width: 100%;
  display: flex;
  justify-content: flex-start;
  flex-flow: row wrap;
}
.pre-icon {
  width: 28px;
  height: 28px;
}
</style>
