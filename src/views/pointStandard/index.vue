<!--
 * @Description: 
 * @Author: JianYue
 * @Date: 2024-04-09 08:38:02
 * @LastEditTime: 2024-07-25 16:42:23
 * @LastEditors:  Do not edit
-->
<template>
  <div class="supervise-set supply-flex supply-flex-col">
    <div
      class="supervise-set-tap supply-bg-bg-card-DEFAULT supply-flex-none supply-overflow-hidden"
    >
      <span
        v-for="tab in tabs"
        :key="tab.value"
        :class="tabVal === tab.value ? 'active' : ''"
        @click="changeTab(tab.value)"
      >
        {{ tab.name }}
      </span>
      <return-control
        class="supply-float-right"
        style="margin-top: 7px; margin-right: 12px;"
        :keep="true"
        :is-drill-down="true"
      ></return-control>
    </div>
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
              :showAll="true"
              :autoSelect="true"
              @change="handleSearch"
            ></FactorySelect>
          </template>
          <template #footer>
            <w-button
              class="mr_12"
              @click="
                $refs.portIn.visible = true;
                importType = 'pump';
              "
              ><w-icon type="import" />导入</w-button
            >
            <w-button class="mr_12" @click="handleExport"><w-icon type="export" />导出</w-button>
            <w-button type="primary" icon="ic_add" @click="handleAdd">
              <span>新增数据</span>
            </w-button>
            <w-button icon="ic_autorenew" @click="handleReset">
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
          style="height: 97%"
          :columns="columns"
          :data-source="dataSource"
          :page="searchForm"
          :loading="loading"
          :scroll="{ x: 1000 }"
          @handleEdit="handleEdit"
          @handleDelete="handleDelete"
        >
          <template #type="{ text }">
            <span>{{ typeObj[text] }}</span>
          </template>
          <template #warnOpt="{ text }">
            <span>{{ operatorObj[text] }}</span>
          </template>
        </w-info-table>
      </template>
    </w-form-table-page>
    <config-detail
      ref="modelEdit"
      :run-time-obj="runTimeObj"
      :operatorList="operatorList"
      :row-data="rowData"
      :tabVal="tabVal"
      @cancel="closeModal"
    ></config-detail>
    <port-in ref="portIn" :option="pumpOption" @importSuccess="handleSearch"></port-in>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { cloneDeep } from 'lodash';
import { exportFile } from '@/utils/util';
import PaginationTable from '@/components/PaginationTable/index.vue';
import FactorySelect from '@/components/factory-select/index.vue';
import portIn from '@/components/portinDialog/index.vue';
import { columns, searchForm } from './models/options';
import configDetail from './models/addOrUpdataModel.vue';
import {
  getPointStandard,
  deletePointStandard,
  importPointStandard,
  exportPointStandard
} from '@/api/pointStandard';
export default {
  name: 'pointStandard',
  components: { FactorySelect, configDetail, PaginationTable, portIn },
  data() {
    return {
      loading: false,
      tabVal: 1,
      layout: {
        colon: true, // 冒号
        span: 8,
        wrapperCol: { span: 18 },
        gutter: [12, 8] //栅格间隔[水平间距，垂直间距]
      },
      runTimeObj: 0,
      rowData: {},
      searchForm: cloneDeep(searchForm),
      dataSource: [],
      operatorList: [], //字典-运算符
      operatorObj: [] //字典-运算符
    };
  },
  computed: {
    ...mapState('dict', ['factory_standard', 'national_standard']),
    tabs() {
      return [
        {
          name: `${this.factory_standard}${this.national_standard}`,
          value: 1
        },
        {
          name: '过程出口',
          value: 2
        }
      ];
    },
    typeObj() {
      return {
        1: this.factory_standard,
        2: this.national_standard,
        3: '过程',
        4: '出口'
      };
    },
    pumpOption() {
      return {
        title: `${this.factory_standard}维护导入`,
        download: exportPointStandard,
        upload: importPointStandard,
        name: `${this.factory_standard}维护模板`
      };
    },
    fields() {
      let typeOptions =
        this.tabVal == '1'
          ? [
              {
                label: '全部',
                value: ''
              },
              {
                label: this.factory_standard,
                value: 1
              },
              {
                label: this.national_standard,
                value: 2
              }
            ]
          : [
              {
                label: '全部',
                value: ''
              },
              {
                label: '过程',
                value: 3
              },
              {
                label: '出口',
                value: 4
              }
            ];

      return [
        {
          label: '选择污水厂',
          name: 'waterPlantId',
          type: 'select',
          show: true,
          span: 8
        },
        {
          label: '类型',
          name: 'type',
          type: 'select',
          placeholder: '请选择类型',
          options: typeOptions,
          show: true,
          span: 8
        },
        {
          label: '关键词',
          name: 'keyword',
          placeholder: '请输入监测量名称',
          type: 'input',
          show: true,
          span: 8
        }
      ];
    },
    columns() {
      return columns({
        factory_standard: this.factory_standard,
        national_standard: this.national_standard
      });
    }
  },
  mounted() {
    this.getOperator();
    this.handleSearch();
  },
  methods: {
    changeTab(tab) {
      (this.searchForm = cloneDeep(searchForm)), (this.tabVal = tab);
      this.searchForm.typelist = tab === 1 ? [1, 2] : [3, 4];
      this.handleSearch();
    },
    //字典-运算符
    async getOperator() {
      let { status, resultData } = await this.$http.get(
        `/sysDict/sysDictListByCode/standard_operator`
      );
      if (status) {
        this.operatorList = resultData?.map(item => {
          this.operatorObj[item.dictCode] = item.dictName;
          return {
            label: item.dictName,
            value: item.dictCode
          };
        });
      }
    },
    async handleSearch() {
      this.loading = true;
      const { count, resultData } = await getPointStandard(this.searchForm);
      this.dataSource = resultData;
      this.loading = false;
    },
    handleReset() {
      this.searchForm = cloneDeep(searchForm);
      this.searchForm.typelist = this.tabVal === 1 ? [1, 2] : [3, 4];
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
          let res = await deletePointStandard(row.id);
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
    /* 导出 */
    handleExport() {
      const vo = {
        ...this.searchForm,
        templateFlag: false,
        page: this.page
      };
      exportPointStandard(vo).then(res => {
        exportFile(res, `${this.factory_standard}维护资料`);
      });
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
.supervise-set {
  height: 100%;
  &-tap {
    height: 50px;
    border-radius: 4px;
    margin-bottom: 12px;
    span {
      display: inline-block;
      height: 100%;
      width: 140px;
      font-size: 14px;
      color: #999999;
      text-align: center;
      font-weight: 400;
      line-height: 48px;
      cursor: pointer;
      &.active {
        color: var(--supply-color-primary-DEFAULT);
        border-bottom: 2px solid var(--supply-color-primary-DEFAULT);
      }
    }
    .ant-btn {
      height: 28px;
      margin-top: 10px;
      margin-right: 30px;
    }
  }
}
</style>
