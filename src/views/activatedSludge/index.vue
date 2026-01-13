<template>
  <!-- 仪表管理 -->
  <div class="model-config">
    <w-form-table-page>
      <template #form>
        <w-form-header
          :title="null"
          newLine
          :neddRetain="false"
          :fields="fields"
          :model="searchForm"
          :layout="layout"
          :loading="loading"
        >
          <template #waterPlantId>
            <FactorySelect
              v-model.trim="searchForm.waterPlantId"
              :showAll="false"
              :autoSelect="true"
              @change="handleSearch"
            ></FactorySelect>
          </template>
          <template #footer>
            <w-button type="primary" icon="ic_add" @click="handleAdd">
              <span>新增数据</span>
            </w-button>
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
          style="height: 100%"
          show-index
          :columns="columns"
          :data-source="dataSource"
          :page="searchForm"
          :loading="loading"
          :scroll="{ x: 1000 }"
          @handleEdit="handleEdit"
          @handleDelete="handleDelete"
          @changePage="handlePageChange"
        >
          <template #placeId="{ text }">
            <span>{{ structureObj[text] }}</span>
          </template>
          <template #imageUrl="{ text }">
            <img class="file-item" :src="text" @click="handlePreview(text)" />
          </template>
        </w-info-table>
      </template>
    </w-form-table-page>
    <config-detail
      ref="modelEdit"
      :run-time-obj="runTimeObj"
      :row-data="rowData"
      :structureList="structureList"
      @cancel="closeModal"
    ></config-detail>
    <w-modal
      :visible="imgVisible"
      width="600px"
      :footeeleteDevicer="null"
      :footer="null"
      @cancel="imgVisible = false"
    >
      <img style="width: 100%" :src="previewImgUrl" />
    </w-modal>
  </div>
</template>

<script>
import { cloneDeep } from 'lodash';
import FactorySelect from '@/components/factory-select/index.vue';
import serverConfig from '@/config/server.config';
import { headerFields, columns, searchForm } from './models/options';
import configDetail from './models/configModel.vue';
import { getActivatedSludge, deleteActivatedSludge } from '@/api/reportRecord';
export default {
  name: 'ModelConfig',
  components: { FactorySelect, configDetail },
  data() {
    return {
      fields: cloneDeep(headerFields),
      loading: false,
      layout: {
        colon: true, // 冒号
        span: 8,
        wrapperCol: { span: 18 },
        gutter: [12, 8] //栅格间隔[水平间距，垂直间距]
      },
      runTimeObj: 0,
      rowData: {},
      page: { size: 20, current: 1, total: 0 },
      searchForm: cloneDeep(searchForm),
      columns,
      dataSource: [],
      headerFields,
      structureList: [], //构筑物数组
      structureObj: {}, //构筑物对象
      imgVisible: false, //是否放大图片
      previewImgUrl: ''
    };
  },
  computed: {},
  mounted() {
    this.searchForm.rangeTime = [
      this.$moment()
        .subtract(1, 'month')
        .format('YYYY-MM-DD 00:00:00'),
      this.$moment().format('YYYY-MM-DD 23:59:59')
    ];
    this.handleSearch();
    this.getOptions();
  },
  methods: {
    //获取构筑物列表
    async getOptions() {
      //获取构筑物列表
      try {
        let { resultData } = await this.$http.post(`/activatedSludge/getActivatedSludgePlaceList`, {
          currentPage: 1,
          delFlag: 0,
          ids: [],
          orderBy: '',
          pageFlag: false,
          pageSize: 10,
          tenantId: '',
          waterPlantIds: [],
          name: '',
          nameLike: '',
          coding: '',
          waterPlantId: this.searchForm.waterPlantId
        });

        this.structureList = resultData.map(item => {
          this.structureObj[item.id] = item.name;
          return {
            ...item,
            value: item.id,
            label: item.name
          };
        });
        this.fields[1].options = this.structureList;
      } catch (error) {
        console.log(error);
      }
    },
    handleSearch() {
      this.searchForm.currentPage = 1;
      this.page.current = 1;
      this.getModelList();
    },
    //放大图片
    handlePreview(src) {
      this.imgVisible = true;
      this.previewImgUrl = src;
    },
    async getModelList() {
      this.loading = true;
      let params = {
        ...this.searchForm,
        collectionTimeStart: this.searchForm.rangeTime[0],
        collectionTimeEnd: this.searchForm.rangeTime[1],
        page: this.page
      };
      const { resultData } = await getActivatedSludge(params);
      this.dataSource = resultData.records?.map(item => {
        item['imageUrl'] = serverConfig.IMG_BASE_URL + item.imageUrl;
        return item;
      });
      this.searchForm.total = resultData.total;
      this.loading = false;
    },
    handleReset() {
      this.searchForm = cloneDeep(searchForm);
      this.searchForm.rangeTime = [
        this.$moment()
          .subtract(1, 'month')
          .format('YYYY-MM-DD 00:00:00'),
        this.$moment().format('YYYY-MM-DD 23:59:59')
      ];
      this.handleSearch();
    },
    handleAdd() {
      this.runTimeObj = 0;
      this.$nextTick(() => {
        if (this.$refs.modelEdit) {
          this.$refs.modelEdit.visible = true;
        }
      });
    },
    async handleDelete(row) {
      this.$confirm({
        title: '提示',
        content: '您确定要删除吗',
        onOk: async () => {
          let res = await deleteActivatedSludge(row.id);
          if (res.status === 'complete') {
            this.$message.success('删除成功');
            this.handleSearch();
          }
        }
      });
    },
    handleEdit(row) {
      this.runTimeObj = 1;
      this.rowData = row;
      this.$nextTick(() => {
        if (this.$refs.modelEdit) {
          this.$refs.modelEdit.visible = true;
        }
      });
    },
    // 页码change
    handlePageChange(current, pageSize) {
      this.searchForm.currentPage = current;
      this.searchForm.pageSize = pageSize;
      this.page.current = current;
      this.page.size = pageSize;
      this.getModelList();
    },
    closeModal(flag) {
      flag && this.handleSearch();
    }
  }
};
</script>

<style lang="less" scoped>
/deep/.table-warp {
  padding-top: 0px;
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
