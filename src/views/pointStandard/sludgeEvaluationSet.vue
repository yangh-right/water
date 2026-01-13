<template>
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
          <template #footer>
            <w-button icon="ic_autorenew" @click="handleReset">
              <span>重置</span>
            </w-button>
            <w-button type="primary" icon="ic_search" @click="handleSearch">
              <span>查询</span>
            </w-button>
            <!-- <w-button
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
            </w-button> -->
          </template>
        </w-form-header>
      </template>
      <template #table>
        <w-info-table
          style="height: 97%"
          :columns="columns"
          :data-source="dataSource"
          :page="{
            currentPage: 1,
            pageSize: 20,
            total: 100
          }"
          :loading="loading"
          :scroll="{ x: 1000 }"
          @handleEdit="handleEdit"
        >
          <template #indicatorOpt="{ text }">
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
import { headerFields, searchForm } from './models/options';
import configDetail from './models/addOrUpdataEvaluation.vue';
import { getSludgeHealthList, importPointStandard, exportPointStandard } from '@/api/pointStandard';
export default {
  name: 'sludgeEvaluationSet',
  components: { FactorySelect, configDetail, PaginationTable, portIn },
  data() {
    return {
      fields: [
        {
          label: '关键词',
          name: 'keyword',
          placeholder: '请输入监测量名称',
          type: 'input',
          show: true,
          span: 6
        }
      ],
      loading: false,
      layout: {
        colon: true, // 冒号
        span: 8,
        wrapperCol: { span: 18 },
        gutter: [12, 8] //栅格间隔[水平间距，垂直间距]
      },
      runTimeObj: 0,
      rowData: {},
      searchForm: {
        keyword: ''
      },
      columns: [
        {
          title: '序号',
          dataIndex: 'num',
          key: 'num',
          fixed: 'left',
          width: 80,
          customRender: (text, row, index) => {
            return index + 1;
          }
        },
        {
          title: '指标名称',
          dataIndex: 'indicator',
          key: 'indicator',
          width: 120,
          ellipsis: true
        },
        {
          title: '指标描述',
          dataIndex: 'indicatorMemo',
          key: 'indicatorMemo',
          width: 120,
          ellipsis: true
        },
        {
          title: '指标下限',
          dataIndex: 'indicatorMin',
          key: 'indicatorMin',
          width: 120,
          ellipsis: true
        },
        {
          title: '运算符',
          dataIndex: 'indicatorOpt',
          scopedSlots: { customRender: 'indicatorOpt' },
          width: 120,
          ellipsis: true
        },
        {
          title: '指标上限',
          dataIndex: 'indicatorMax',
          key: 'indicatorMax',
          width: 120,
          ellipsis: true
        },
        {
          title: '操作',
          width: 120,
          type: 'action',
          fixed: 'right',
          events: [
            {
              key: 'handleEdit',
              name: '编辑'
            }
          ]
        }
      ],
      dataSource: [],
      headerFields,
      operatorList: [], //字典-运算符
      operatorObj: [] //字典-运算
    };
  },
  computed: {
    ...mapState('dict', ['factory_standard', 'national_standard']),
    pumpOption() {
      return {
        title: `${this.factory_standard}维护导入`,
        download: exportPointStandard,
        upload: importPointStandard,
        name: `${this.factory_standard}维护模板`
      };
    }
  },
  created() {
    this.getOperator();
  },
  mounted() {
    this.handleSearch();
  },
  methods: {
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
      const { count, resultData } = await getSludgeHealthList(this.searchForm);
      this.dataSource = resultData;
      this.loading = false;
    },
    handleReset() {
      this.searchForm = cloneDeep(searchForm);
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
.model-config {
  width: 100%;
  height: 100%;
}
</style>
