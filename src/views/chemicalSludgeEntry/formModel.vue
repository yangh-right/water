<!--
 * @Description:
 * @Author: JianYue
 * @Date: 2024-04-10 11:10:07
 * @LastEditTime: 2024-07-26 10:41:18
 * @LastEditors:  Do not edit
-->
<template>
  <div class="model-config">
    <w-form-table-page>
      <template #form>
        <w-form-model
          :labelCol="layout.labelCol"
          :wrapperCol="layout.wrapperCol"
          class="supply-w-full"
        >
          <w-row :gutter="8">
            <w-col v-bind="grid">
              <w-form-model-item name="waterPlantId" label="选择污水厂">
                <FactorySelect
                  v-model.trim="searchForm.waterPlantId"
                  :showAll="false"
                  :autoSelect="true"
                  @change="handleSearch"
                ></FactorySelect>
              </w-form-model-item>
            </w-col>
            <w-col v-if="type === '1'" :span="4">
              <w-form-model-item name="placeId" label="构筑物名称">
                <w-select v-model="searchForm.placeId" :options="structureList" />
              </w-form-model-item>
            </w-col>
            <w-col :span="6">
              <w-form-model-item name="rangeTime" label="选择日期">
                <w-range-picker
                  v-model="searchForm.rangeTime"
                  :placeholder="['开始日期', '结束日期']"
                />
              </w-form-model-item>
            </w-col>
            <w-col class="supply-float-right" :span="8">
              <w-form-model-item class="supply-float-right" :wrapperCol="{ flex: 1 }">
                <!-- <w-button
                  type="primary"
                  v-if="type === '1'"
                  class="supply-mr-3"
                  icon="ic_add"
                  :loading="loading"
                  @click="openSupplierEdit"
                >
                  <span>监测量配置</span>
                </w-button> -->
                <w-button class="supply-mr-3" type="primary" icon="ic_add" @click="handleAdd">
                  <span>新增数据</span>
                </w-button>
                <w-button class="supply-mr-3" icon="reload" @click="handleReset">
                  <span>重置</span>
                </w-button>
                <w-button type="primary" icon="ic_search" @click="handleSearch">
                  <span>查询</span>
                </w-button>
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
          :scroll="{ x: 1000 }"
          @handleEdit="handleEdit"
          @handleDelete="handleDelete"
          @changePage="handlePageChange"
        >
          <template #internalRefluxRatio="{ text }">
            <span>{{ text }}%</span>
          </template>
          <template #externalRefluxRatio="{ text }">
            <span>{{ text }}%</span>
          </template>
        </w-info-table>
      </template>
    </w-form-table-page>
    <config-modal
      ref="modelEdit"
      :type="type"
      :structureList="structureList"
      :run-time-obj="runTimeObj"
      :row-data="rowData"
      @cancel="closeModal"
    ></config-modal>
    <DragModal
      ref="dragModal"
      :isDrag="false"
      :isShowFullBtn="false"
      title="监测量配置"
      :width="748"
      :mask="true"
      :height="483"
    >
      <Edit @changeList="changeList"></Edit>
    </DragModal>
  </div>
</template>

<script>
import { cloneDeep } from 'lodash';
import DragModal from '@/components/DragModal/index.vue';
import FactorySelect from '@/components/factory-select/index.vue';
import { sludgeAnalyseColumns, medicineAnalyseColumns, searchForm } from './models/options';
import configModal from './models/configModal.vue';
import Edit from './models/Edit.vue';
import { getDataList, deleteDataList } from '@/api/reportRecord';
export default {
  name: 'ModelConfig',
  components: { FactorySelect, configModal, DragModal, Edit },
  props: {
    //1.加药 2.排泥
    type: {
      type: String,
      default: '1'
    }
  },

  data() {
    return {
      loading: false,
      grid: {
        xl: 5,
        lg: 6,
        md: 12,
        sm: 24,
        xs: 24
      },
      layout: {
        colon: true, // 冒号
        span: 8,
        wrapperCol: { span: 18 },
        labelCol: { span: 6 },
        gutter: [12, 8] //栅格间隔[水平间距，垂直间距]
      },
      runTimeObj: 0,
      rowData: {},
      page: { size: 20, current: 1, total: 0 },
      searchForm: cloneDeep(searchForm),
      dataSource: [],
      structureList: [], //构筑物列表
      initWaterPlantId: ''
    };
  },
  computed: {
    columns() {
      return this.type === '2' ? sludgeAnalyseColumns : medicineAnalyseColumns;
    }
  },
  mounted() {
    this.getOptions();
  },
  activated() {
    this.searchForm.rangeTime = [this.$moment().subtract(1, 'month'), this.$moment()];
    this.searchForm.type = this.type;
    this.initWaterPlantId = this.searchForm.waterPlantId;
    this.handleSearch();
  },
  methods: {
    //获取构筑物列表
    async getOptions() {
      //获取构筑物列表
      try {
        let { resultData: structureList } = await this.$http.post(`/place/list`, {
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

        this.structureList = structureList.records.map(item => {
          return {
            ...item,
            value: item.id,
            label: item.name
          };
        });
      } catch (error) {
        console.log(error);
      }
    },
    handleSearch() {
      this.searchForm.currentPage = 1;
      this.page.current = 1;
      this.getModelList();
    },
    handleSearchTable() {},
    async getModelList() {
      this.loading = true;
      let params = {
        ...this.searchForm,
        startDateTime: this.searchForm.rangeTime[0],
        endDateTime: this.searchForm.rangeTime[1],
        page: this.page
      };
      const { resultData } = await getDataList(params);
      this.dataSource = resultData.records;
      this.searchForm.total = resultData.total;
      this.loading = false;
    },
    handleReset() {
      this.searchForm = cloneDeep(searchForm);
      this.searchForm.type = this.type;
      this.searchForm.rangeTime = [this.$moment().subtract(1, 'month'), this.$moment()];
      this.searchForm.waterPlantId = this.initWaterPlantId;
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
          let res = await deleteDataList(row.id);
          if (res.status === 'complete') {
            this.$message.success('删除成功');
            this.handleSearch();
          }
        }
      });
    },
    handleEdit(row) {
      this.modalState = true;
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
    },
    //新增配置
    openSupplierEdit() {
      this.$refs.dragModal.visible = true;
    },
    changeList(list) {
      if (list) {
        this.supplierDic = list.filter(item => !item.delFlag);
      } else {
        this.getSupplierList();
      }
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
}
/deep/.form-warp {
  padding: 5px 20px;
  background: var(--supply-color-bg-card-DEFAULT);
}
.wpg-form-item {
  margin-bottom: 0 !important;
}
</style>
