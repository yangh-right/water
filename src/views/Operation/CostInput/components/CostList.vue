<template>
  <div class="full-view">
    <w-form-table-page>
      <template #form>
        <w-form-header
          :fields="fields"
          :model="searchForm"
          :layout="extraLayout"
          :title="null"
          :loading="loading"
          newLine
          :neddRetain="false"
        >
          <template #waterPlantId>
            <factory-select
              autoSelect
              v-model="searchForm.waterPlantId"
              @change="getList"
            ></factory-select>
          </template>
          <template #footer>
            <w-button type="primary" icon="ic_add" @click="handleAdd">录入成本</w-button>
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
          v-loading="loading"
          showIndex
          :columns="columns"
          :data-source="data"
          :model="searchForm"
          :page="searchForm"
          :scroll="{ x: 1200 }"
          @changePage="handlePageChange"
        >
          <template #waterPlantId="{ text }">
            {{ factoryName(text) }}
          </template>
          <template #type="{ text }">
            <span :style="text === 1 ? 'color:red' : ''">{{
              text === 1 ? '成本金额' : '成本消耗'
            }}</span>
          </template>
          <template #num="{ text, row }">
            <span v-if="text">
              {{ `${text} ${row.numUnit}` }}
            </span>
            <span v-else></span>
          </template>
          <template #cost="{ text, row }">
            <span v-if="text">
              {{ `${text} ${row.costUnit}` }}
            </span>
            <span v-else></span>
          </template>
          <template #action="{ text, row }">
            <a @click="handleDelete(row)">删除</a>
            <w-divider type="vertical"></w-divider>
            <a @click="handleEdit(text, row)">编辑</a>
          </template>
        </w-info-table>
      </template>
    </w-form-table-page>
    <InputModal
      :title="title"
      :visible.sync="visible"
      :typeId="outerTypeId"
      :isEdit="isEdit"
      :waterPlantId="searchForm.waterPlantId"
      :outerForm="form"
      @getList="getList"
    />
  </div>
</template>

<script>
import FactorySelect from '@/components/factory-select';
import InputModal from '@/views/Operation/CostInput/components/InputModal';
import { costFields, costColumns } from './config';
import mixin from '@/views/System/CostConfig/components/mixin';
export default {
  name: 'CostList',
  inject: ['state'],
  components: { FactorySelect, InputModal },
  mixins: [mixin],
  props: {
    title: {
      type: String,
      default: ''
    },
    outerTypeId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      fields: costFields,
      columns: costColumns,
      data: [],
      searchForm: {
        waterPlantId: undefined,
        costTypeIdList: [],
        costPlaceNameLike: '',
        // 分页
        currentPage: 1,
        pageSize: 20,
        total: 0
      },
      // 弹窗
      form: {},
      visible: false,
      isEdit: false
    };
  },
  created() {
    this.getInit();
  },
  methods: {
    async getInit() {
      this.fields[2].listeners = { pressEnter: this.handleSearch };
      await this.getOptions();
      await this.getList();
    },
    async handleReset() {
      this.searchForm.costTypeIdList = [];
      this.searchForm.costPlaceNameLike = '';
      this.searchForm.currentPage = 1;
      this.searchForm.pageSize = 20;
      await this.getList();
    },
    // 获取搜索头部的成本类型筛查树
    async getOptions() {
      const { resultData } = await this.$http.get(`/costType/list?parentId=${this.outerTypeId}`);

      this.fields[1].attrs.treeData = [
        {
          name: '不限',
          id: '',
          children: resultData
        }
      ];
    },
    async getList() {
      this.loading = true;
      let { currentPage, pageSize, nameLike, waterPlantId } = this.searchForm;

      const { resultData, count, status } = await this.$http.post('/costEntry/list', {
        ...this.searchForm,
        keyword: nameLike,
        page: {
          current: currentPage,
          size: pageSize
        },
        waterPlantIds: [waterPlantId],
        costTypeId: this.outerTypeId,
        costTypeIdList:
          this.searchForm.costTypeIdList.length === 1 && this.searchForm.costTypeIdList[0] === ''
            ? []
            : this.searchForm.costTypeIdList
      });
      if (status === 'complete') {
        this.data = resultData.records;
        this.searchForm.total = resultData.total;
      }
      this.loading = false;
    },
    handleAdd() {
      this.form = {};
      this.visible = true;
      this.isEdit = false;
    },
    handleEdit(text, row) {
      this.form = row;
      this.visible = true;
      this.isEdit = true;
    },
    handleDelete(row) {
      this.$confirm({
        title: '删除后无法找回，您确定要删除该成本记录吗？',
        okText: '确定删除',
        cancelText: '取消',
        onOk: async () => {
          await this.$http.delete(`/costEntry?entityId=${row.id}`);
          setTimeout(async () => {
            await this.getList();
          }, 200);
        },
        onCancel: () => {}
      });
    },
    factoryName(text) {
      if (typeof text === 'object') return text;
      let factoryList = text ? text.split(',') : [];
      let resText = '';
      factoryList.forEach(
        (item, index) =>
          (resText +=
            this.$store.state.factoryList.filter(v => v.id === item)[0]?.stationName +
            (index === factoryList.length - 1 ? '' : ','))
      );
      return resText;
    }
  }
};
</script>
<style lang="less" scoped></style>
