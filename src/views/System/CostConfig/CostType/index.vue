<template>
  <div class="full-view">
    <w-form-table-page>
      <template #form>
        <w-form-header
          :fields="fields"
          :model="searchForm"
          :layout="headerLayout"
          :title="null"
          :loading="loading"
          newLine
          :neddRetain="false"
          @search="handleSearch"
        >
          <template #footer>
            <w-button type="primary" icon="ic_add" @click="handleAdd(0)">新增成本类型</w-button>
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
        <div class="full-table-wrap">
          <w-info-table
            v-loading="loading"
            :columns="columns"
            :data-source="data"
            :model="searchForm"
            :page="searchForm"
            :scroll="{ x: 1200 }"
            :expandIcon="expandIcon"
            :expandedRowKeys="expandedRowKeys"
            @changePage="handlePageChange"
            @rowClick="rowClick"
            rowKey="id"
          >
            <template #unit="{ text, row }">
              <span v-if="!text"></span>
              <span
                v-else-if="row.reduceUnit"
                :title="`${row.reduceUnit} (1${row.reduceUnit}合${row.reduceNum}${row.unit})`"
                >{{ `${row.reduceUnit} (1${row.reduceUnit}合${row.reduceNum}${row.unit})` }}</span
              >
              <span v-else :title="text">{{ text }}</span>
            </template>
            <template #costSum="{ row }">
              <span v-if="row.parentCostPrice"></span>
              <span
                v-else-if="row.costPrice"
                :title="`${row.costPrice || ''} ${row.costUnit || ''}`"
              >
                {{ `${row.costPrice || ''} ${row.costUnit || ''}` }}
              </span>
              <span v-else></span>
            </template>
            <template #num="{ text, row }">
              <a
                :disabled="text === 0"
                :title="text"
                @click="
                  goto({
                    path: '/System/CostConfig/CostPoint',
                    query: { costTypeIds: filterCostTypeIds(row) }
                  })
                "
              >
                {{ text }}
              </a>
            </template>
            <template #action="{ text, row }">
              <a @click="handleDelete(row)">删除</a>
              <w-divider type="vertical"></w-divider>
              <a @click="handleEdit(text, row)">编辑</a>
              <span v-if="row.type === 0">
                <w-divider type="vertical"></w-divider>
                <a @click="handleAdd(1, row.name, row.id, row.unit, row.costPrice, row.costUnit)"
                  >添加子类</a
                >
              </span>
            </template>
          </w-info-table>
        </div>
      </template>
    </w-form-table-page>
    <AddType
      :title="addTitle"
      :type="addType"
      :visible.sync="addVisible"
      :outerForm="addForm"
      :outerList="nameList"
      @getList="getList"
    />
  </div>
</template>

<script>
import AddType from '../components/AddType.vue';
import { typeFields, typeColumns } from '../components/config';
import mixin from '../components/mixin';
export default {
  name: 'CostType',
  components: { AddType },
  mixins: [mixin],
  props: {},
  data() {
    return {
      // 头部
      fields: typeFields,
      searchForm: {
        nameLike: '',
        // 分页
        currentPage: 1,
        pageSize: 20,
        total: 0
      },
      // 表格
      columns: typeColumns,
      data: [],
      nameList: [],
      // 弹窗
      addType: 0,
      addTitle: '新增成本类型',
      addForm: {},
      addVisible: false,
      expandedRowKeys: []
    };
  },
  created() {
    this.fields[0].listeners = { pressEnter: this.handleSearch };
    this.getList();
  },
  methods: {
    handleReset() {
      this.searchForm = {
        nameLike: '',
        // 分页
        currentPage: 1,
        pageSize: 20
      };
      this.getList();
    },
    async getList() {
      let { currentPage, pageSize, nameLike } = this.searchForm;
      this.loading = true;
      let params = {
        ...this.searchForm,
        keyword: nameLike,
        page: {
          current: currentPage,
          size: pageSize
        }
      };
      const { resultData, count } = await this.$http.post('/costType/list', params);
      this.data = resultData.records;
      this.searchForm.total = resultData.total;
      // 获取名称/别名列表，用于新增/编辑时的名称校验
      const {
        resultData: { records: list }
      } = await this.$http.post('/costType/list', {
        pageFlag: false
      });
      this.nameList = [];
      list.forEach(item => {
        this.nameList.push({ name: item.name, otherName: item.otherName });
        if (item.children && item.children.length) {
          item.children.forEach(child => {
            this.nameList.push({ name: child.name, otherName: child.otherName });
          });
        }
      });
      this.loading = false;
    },
    handleAdd(type, parentName, parentId, parentUnit, parentCostPrice, parentCostUnit) {
      this.addType = type;
      this.addTitle = '新增成本类型';
      this.addForm =
        type === 0
          ? {}
          : { type, parentName, parentId, parentUnit, parentCostPrice, parentCostUnit };
      this.addVisible = true;
    },
    handleEdit(text, row) {
      this.addType = row.type;
      this.addTitle = '编辑成本类型';
      this.addForm = row;
      this.addVisible = true;
    },
    async handleDelete(row) {
      const { resultData: delFlag } = await this.$http.get(`/costType/getDeleteType?id=${row.id}`);
      // 0-可删，1-成本点关联，2-子类型
      if (delFlag === 0) {
        this.$confirm({
          title: '删除后无法找回，您确定要删除该成本类型吗？',
          okText: '确定删除',
          cancelText: '取消',
          onOk: async () => {
            await this.$http.delete(`/costType?entityId=${row.id}`);
            setTimeout(async () => {
              await this.getList();
            }, 200);
          },
          onCancel: () => {}
        });
      } else {
        this.$confirm({
          title:
            delFlag === 1
              ? '该成本类型下有关联成本点，无法删除'
              : '该成本类型下有子成本类型，无法删除',
          cancelButtonProps: { style: { display: 'none' } },
          okButtonProps: { style: { 'margin-left': 0 } },
          okText: '关闭',
          centered: true
        });
      }
    },
    filterCostTypeIds(row) {
      if (row.type === 1) return [row.id];
      else return [row.id, ...row.children.map(v => v.id)];
    },
    expandIcon(props) {
      if (props.record.type === 0 && props.record.children && props.record.children.length > 0) {
        if (props.expanded) {
          //有数据-展开时候图标
          return <w-icon class="wfc3" type="ic_arrow_drop_down" />;
        } else {
          //有数据-未展开时候图标
          return (
            <w-icon class="wfc3" style="transform: rotate(-90deg);" type="ic_arrow_drop_down" />
          );
        }
      }
      return <span>&nbsp;&nbsp;&nbsp;&nbsp;</span>;
    },
    rowClick(record) {
      if (record.type === 1) return;
      if (this.expandedRowKeys.includes(record.id)) {
        this.expandedRowKeys = this.expandedRowKeys.filter(id => id !== record.id);
      } else {
        this.expandedRowKeys.push(record.id);
      }
    }
  }
};
</script>
<style lang="less" scoped>
/deep/ .wpg-col-6 .wpg-form-item-label {
  overflow: visible;
}

/deep/ .wpg-col-18 .wpg-form-item-control {
  margin-left: 12px;
}

/deep/ .wpg-table-row-level-1 .wpgicon {
  display: none;
}
</style>
