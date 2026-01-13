<template>
  <div class="full-view">
    <w-form-table-page>
      <template #form>
        <w-form-model
          :labelCol="layout.labelCol"
          :wrapperCol="layout.wrapperCol"
          :model="searchForm"
          class="supply-w-full"
        >
          <w-row :gutter="8">
            <w-col :span="6">
              <w-form-model-item name="waterPlantId" label="选择污水厂">
                <FactorySelect
                  v-model.trim="searchForm.waterPlantId"
                  :showAll="true"
                  :autoSelect="true"
                  @change="handleSearch"
                ></FactorySelect>
              </w-form-model-item>
            </w-col>
            <w-col :span="6">
              <w-form-model-item name="keyword" label="构筑物名称">
                <w-input v-model="searchForm.keyword" placeholder="请输入" allowClear />
              </w-form-model-item>
            </w-col>
            <w-col class="supply-float-right" :span="6">
              <w-form-model-item class="supply-float-right" :wrapperCol="{ flex: 1 }">
                <w-button
                  class="supply-mr-3"
                  type="primary"
                  icon="ic_add"
                  @click="addStructure('addStructure')"
                  >新增构筑物</w-button
                >
                <w-button class="supply-mr-3" icon="ic_autorenew" @click="handleReset">
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
        <div class="content-title wfc2">
          共有<span style="color: #4285f4">{{ count }}</span
          >个构筑物
        </div>
        <w-info-table
          :columns="columns"
          class="tableWidth"
          :data-source="tableData"
          :loading="tableLoading"
          :page="searchForm"
          :expandIconColumnIndex="1"
          :expandIcon="expandIcon"
          :scroll="{ x: 1240 }"
          @changePage="handlePageChange"
          :rowKey="rowKey"
        >
          <template #type="{ text, row }">
            <span>{{ typeMap[text] }}</span>
          </template>
          <template #line="{ text, row }">
            <span>{{ lineMap[text] }}</span>
          </template>
          <template #processingType="{ text, row }">
            <span>{{ processMap[text] }}</span>
          </template>
          <template #operation="{ row }">
            <template>
              <w-button type="link" size="small" @click.stop="handleEdit(row)">编辑</w-button>
              <w-divider type="vertical" />
              <!-- <w-button type="link" size="small" @click.stop="handleSet(row)">配置</w-button>
              <w-divider type="vertical" /> -->
              <w-button type="link" size="small" @click.stop="handleDelete(row)">删除</w-button>
            </template>
          </template>
          <template #num="{ text, row }">
            <w-button type="link" size="small" @click.stop="handleJump(row)" v-if="text">
              {{ text }}
            </w-button>
            <span class="wfc-invalid" v-else>
              {{ text || 0 }}
            </span>
          </template>
        </w-info-table>
      </template>
    </w-form-table-page>

    <ModalStructure
      :processList="processList"
      :type.sync="type"
      :structure="seletedStructure"
      :waterPlantId="searchForm.waterPlantId"
      :title="modalTitle"
      @submit="handleSubmit"
      @cancel="handleCancel"
    ></ModalStructure>
    <ModalPool
      :type.sync="type"
      :pool="seletedPool"
      :title="modalTitle"
      :waterPlantId="seletedPool.waterPlantId"
      @submit="handleSubmit"
      @cancel="handleCancel"
    ></ModalPool>
    <ModalSet
      ref="modelSet"
      :structure="setStructure"
      title="模型关系配置"
      @submit="handleSubmit"
      @cancel="handleCancel"
    ></ModalSet>
  </div>
</template>
<script>
import { mapState } from 'vuex';
import FactorySelect from '@/components/factory-select/index';
import ModalStructure from './components/TheModalStructure.vue';
import ModalPool from './components/TheModalPool.vue';
import ModalSet from './components/TheModalSet.vue';
import { columnsData, operationRequestDict } from './config';
import { sysDictListByCode } from '@/api/manage';

export default {
  name: 'structureConfig',
  components: {
    FactorySelect,
    ModalStructure,
    ModalPool,
    ModalSet
  },
  data() {
    return {
      loading: false,
      typeMap: {
        0: '构筑物',
        1: '水池'
      },
      processList: [],
      processMap: {},
      lineMap: {},
      tableData: [],
      count: 0,
      columns: columnsData,
      operation: undefined,
      layout: {
        colon: true,
        labelAuto: true,
        labelCol: { span: 6 },
        wrapperCol: { span: 18 }
      },
      initTableDataList: [],
      steps: [], //构筑物顺序改变记录
      searchForm: { waterPlantId: undefined, pageSize: 20, currentPage: 1, total: 0 },
      page: { size: 20, current: 1, total: 0 },
      tableLoading: false,
      type: undefined,
      seletedStructure: undefined,
      setStructure: undefined,
      seletedPool: {},
      expandedRowKeys: []
    };
  },
  computed: {
    ...mapState('dict', ['line_list']),
    modalTitle() {
      let dic = {
        addPool: '添加水池',
        editPool: '编辑水池',
        editStructure: '编辑构筑物',
        addStructure: '新增构筑物'
      };
      return dic[this.type];
    }
  },
  watch: {
    line_list: {
      handler(val) {
        this.lineMap = {
          '-1': '无线路'
        };
        val?.forEach(item => {
          this.lineMap[item.dictValue] = item.dictName;
        });
      }
    },
    'searchForm.waterPlantId': {
      handler(val) {
        if (!val) return;
        this.handleSearch();
      },
      immediate: true
    }
  },
  created() {
    this.sysDictListByCode('processing_type', 'process');
    this.sysDictListByCode('purification_line', 'line');
  },
  filters: {
    changeLocation(val) {
      let str = '';
      if (val?.length) str = val.map(item => item.name).join('，');
      return str;
    }
  },
  methods: {
    async sysDictListByCode(code, data, callback) {
      const res = await sysDictListByCode(code);
      this[data + 'List'] = res.resultData;
      res.resultData?.forEach(item => {
        this[data + 'Map'][item.dictValue] = item.dictName;
      });
      if (data === 'line') {
        this.$store.commit('dict/SET_LINE_TYPE', this.lineList || []);
      }
    },
    //点击查询时
    async handleSearch() {
      this.searchForm.currentPage = 1;
      this.page.current = 1;
      await this.getStructureList();
    },
    //点击重置
    handleReset() {
      this.searchForm.currentPage = 1;
      this.page.current = 1;
      this.searchForm.keyword = '';
      this.getStructureList();
    },
    //获取构筑物列表
    async getStructureList() {
      this.loading = true;
      this.tableData = [];
      try {
        this.tableLoading = true;
        const res = await this.$http.post('/place/list', {
          ids: [],
          pids: [],
          orderBy: '',
          tenantId: '',
          coding: '',
          delFlag: 0,
          pageFlag: true,
          ...this.searchForm,
          page: this.page
        });
        this.loading = false;
        //处理表格数据
        this.tableData = this.processTableData(res.resultData.records);
        this.searchForm.total = res.resultData.total;
        this.page.total = res.resultData.total;
        this.count = res.resultData.total;
      } catch (error) {
        console.log(error);
        this.count = 0;
      } finally {
        this.tableLoading = false;
      }
    },
    //分页
    handlePageChange(cur, size) {
      this.searchForm.currentPage = cur;
      this.searchForm.pageSize = size;
      this.page.current = cur;
      this.page.size = size;
      this.getStructureList();
    },
    //对后端返回的列表处理 1. 添加构筑物序号一栏 2. 构筑物名称和编码整合
    processTableData(tableData) {
      this.expandedRowKeys = [];
      if (tableData && tableData.length) {
        tableData.forEach((item, i) => {
          item.key = i + 1 + (this.searchForm.currentPage - 1) * this.searchForm.pageSize;
          // this.expandedRowKeys.push(item.key);
          if (item.children?.length) {
            //跳转用到id
            item.locationsId = item.locations.map(item => item.id).join(',');
          }

          item?.children?.forEach(ele => {
            //水池
            ele.pool = ele.name;
            ele.name = '';
            //处理位置
            ele.locationsId = ele.locations.map(item => item.id).join(',');
            // ele.locations = ele.locations.map((item) => item.name).join("，");
          });
        });
      }
      return tableData;
    },
    //添加构筑物
    addStructure(type) {
      this.type = type;
      this.seletedStructure = null;
    },
    //添加池
    addPool(data) {
      this.seletedPool = data;
      this.type = 'addPool';
    },
    //删除
    handleDelete(data) {
      //判断是构筑物 还是水池
      if (data.name) {
        this.seletedStructure = data;
        if (data && data.num) {
          this.$confirm({
            title: '该构筑物下有关联设备无法删除',
            cancelButtonProps: { style: { display: 'none' } },
            okButtonProps: { style: { 'margin-left': 0 } },
            okText: '关闭',
            centered: true
          });
        } else {
          this.$confirm({
            title: '您确定要删除该构筑物吗?',
            centered: true,
            onOk: () => {
              this.deleteStructureOrPool('place', data);
            }
          });
        }
      } else {
        this.seletedPool = data;
        if (data && data.num) {
          this.$confirm({
            title: '该水池下有关联设备，无法删除',
            cancelButtonProps: { style: { display: 'none' } },
            okButtonProps: { style: { 'margin-left': 0 } },
            okText: '关闭',
            centered: true
          });
        } else if (data && !data.num && data.locations && data.locations.length) {
          this.$confirm({
            title: '删除后下属位置也会被删除且无法找回，您确定要删除该水池吗?',
            okText: '确定删除',
            cancelText: '取消',
            centered: true,
            onOk: () => {
              this.deleteStructureOrPool('place', data);
            }
          });
        } else {
          this.$confirm({
            title: '您确定删除该水池吗',
            okText: '确定删除',
            cancelText: '取消',
            centered: true,
            onOk: () => {
              this.deleteStructureOrPool('place', data);
            }
          });
        }
      }
    },
    async deleteStructureOrPool(type, data) {
      try {
        let res = await this.$http.delete(`/${type}?entityId=${data.id}`);
        if (res.status === 'complete') {
          this.getStructureList();
          this.$message.success('删除成功');
        }
      } catch (error) {
        console.log(error);
      }
    },
    handleSet(data) {
      this.setStructure = data;
      this.$refs.modelSet.showModal = true;
    },
    //编辑
    handleEdit(data) {
      //判断是构筑物 还是水池
      if (data.name) {
        this.type = 'editStructure';
        this.seletedStructure = data;
      } else {
        this.type = 'editPool';
        this.seletedPool = data;
      }
    },
    // 提交模态框
    async handleSubmit(params, type, flag) {
      let url = operationRequestDict[type].url;
      let method = operationRequestDict[type].method;
      if (type === 'addStructure' || type === 'editStructure') {
        params = { ...params };
      } else if (type === 'addPool' || type === 'editPool') {
        params = { ...params, pid: params.placeId, path: params.placeId };
      }
      try {
        await this.$http[method](url, params);
        this.getStructureList();
        if (flag) this.$message.success('操作成功');
        this.type = '';
      } catch (error) {
        console.log(error);
      }
    },
    //取消模态框
    handleCancel() {
      this.getStructureList();
    },
    //导入
    handleImport() {
      console.log('导入构筑物设施');
    },
    //下载模板
    handleDownload() {
      console.log('下载模板');
    },
    //设备跳转
    handleJump(row) {
      this.goto({
        path: '/Comprehensive/Device',
        query: {
          placeId: row.id
        }
      });
    },
    rowKey(record) {
      if (record?.children?.length) {
        return record.key;
      } else {
        return record.id;
      }
    },
    rowClick(record) {
      //点击的行已经展开
      let i = this.expandedRowKeys.indexOf(record.key);
      if (i !== -1) {
        this.expandedRowKeys.splice(i, 1);
      } else {
        this.expandedRowKeys.push(record.key);
      }
    },
    expandIcon(props) {
      if (props.record.children && props.record.children.length > 0) {
        if (props.expanded) {
          //有数据-展开时候图标
          return (
            <w-icon
              class="wfc3"
              type="ic_arrow_drop_down"
              style="position:absolute;left:-5px;top:11px;font-size:20px"
            />
          );
        } else {
          //有数据-未展开时候图标
          return (
            <w-icon
              class="wfc3"
              style="font-size:20px;transform: rotate(-90deg);position:absolute;left:-1px;top:11px"
              type="ic_arrow_drop_down"
            />
          );
        }
      }
    }
  }
};
</script>
<style lang="less" scoped>
/deep/.wpg-form-header .wpg-info-form .wpg-form-item {
  margin-bottom: 0;
}
.wpg-info-form-footer .reset + button {
  margin-left: 24px !important;
}
/deep/.wpg-form {
  padding: 5px 20px;
  background: var(--supply-color-bg-card-DEFAULT);
}
.wpg-form-item {
  margin-bottom: 0 !important;
}
.content {
  &-title {
    padding: 4px 24px 16px 24px;
    &-count {
      color: #8f40ff;
      font-family: PingFangSC-Regular, sans-serif;
      font-weight: Regular;
    }
  }
}
.tableWidth {
  height: calc(100% - 41px);
}

/deep/ .wpg-table-thead > tr > th:first-child {
  padding-left: 24px;
}
/deep/ .wpg-table-tbody > tr > td {
  position: relative;
}
/deep/ .wpg-table-tbody > tr > td:first-child {
  padding-left: 24px;
}
/deep/ .wpg-btn-sm {
  padding: 0;
}
</style>
