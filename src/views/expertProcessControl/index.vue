<!--
 * @Description: 
 * @Author: JianYue
 * @Date: 2024-04-09 08:38:02
 * @LastEditTime: 2024-09-12 18:09:04
 * @LastEditors: yuan wenyu
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
      <!-- <w-button v-if="!stepData" class="supply-float-right" @click="back">返回</w-button> -->
      <return-control
        class="supply-float-right"
        style="margin-top: 7px; margin-right: 12px;"
        :keep="true"
        :is-drill-down="true"
      ></return-control>
    </div>
    <w-form-table-page v-if="visibleContent === 'detial'">
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
          <template class="supply-float-right" #action>
            <div class="supply-flex supply-justify-end">
              <w-button class="supply-mr-3" icon="ic_autorenew" @click="handleReset">
                <span>重置</span>
              </w-button>
              <w-button type="primary" icon="ic_search" @click="handleSearch">
                <span>查询</span>
              </w-button>
            </div>
          </template>
          <template #footer></template>
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
          @editControlDecision="editControlDecision"
          @changePage="handlePageChange"
        >
          <template #waterPlantId="{ text }">
            <span>{{ getFactory(text) }}</span>
          </template>
          <template #planList="{ text }">
            <a @click="showPlantList(text)">查看列表</a>
          </template>
          <!-- <template #id="{ row }">
            <a @click="showExpertProcessControlDecision(row)">查看列表</a>
          </template> -->
          <template #conditionDescStrList="{ row }">
            <span
              v-for="item in initConditionDescStrList(row)"
              v-html="item.label || item.value"
            ></span>
          </template>
          <!-- <template #conditionDesc="{ row }">
            <div v-for="item in initconditionDesc(row)">
              <div v-if="item.symbol">
                <span>{{ item.label }}</span>
                <span>{{ item.symbol }}</span>
                <span>{{ item.value }}</span>
              </div>
              <div v-else>
                <span>{{ item }}</span>
              </div>
            </div>
          </template> -->
        </w-info-table>
      </template>
    </w-form-table-page>
    <w-modal
      :title="false"
      :visible="planListVisible"
      width="975px"
      @cancel="closeModal"
      :footer="false"
    >
      <edit-plant
        :tableData="plantList"
        :modalColumns="planListColumns"
        :editPower="editPower"
      ></edit-plant>
    </w-modal>
    <edit-process-control
      v-if="visibleContent === 'controlDecision'"
      :tableData="decisionList"
      :devicePointList="devicePointList"
      @cancel="closeModal"
    ></edit-process-control>
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
    <config-detail
      ref="modelEdit"
      v-if="visibleContent === 'edit'"
      :run-time-obj="runTimeObj"
      :row-data="rowData"
      :structureLiat="structureLiat"
      :type="expert_decision_type"
      :devicePointList="devicePointList"
      @cancel="closeModal"
    ></config-detail>
  </div>
</template>

<script>
import { cloneDeep } from 'lodash';
import { exportFile } from '@/utils/util';
import PaginationTable from '@/components/PaginationTable/index.vue';
import FactorySelect from '@/components/factory-select/index.vue';
import editProcessControl from './models/editProcessControl.vue';
import {
  headerFields,
  columns,
  searchForm,
  planListColumns,
  expertProcessColumns
} from './models/options';
import configDetail from './models/addOrUpdataModel.vue';
import { sysDictListByCode } from '@/api/manage';
import {
  getExpertProcessControl,
  deleteExpertProcessControl,
  queryDevicePointByStationId,
  getExpertProcessControlDecisionByControlId,
  exportProcessControl,
  importProcessControl
} from '@/api/analysis';
import { deletePointStandard } from '@/api/pointStandard';
import editPlant from './models/editPlant.vue';
export default {
  name: 'expertProcessControl',
  components: { FactorySelect, configDetail, PaginationTable, editPlant, editProcessControl },
  data() {
    return {
      fields: cloneDeep(headerFields),
      loading: false,
      tabs: [],
      tabVal: 1,
      structureObj: {}, //构筑物
      structureLiat: [], //构筑物列表
      layout: {
        colon: true, // 冒号
        span: 8,
        labelCol: { span: 6 },
        wrapperCol: { span: 18 },
        gutter: [12, 8] //栅格间隔[水平间距，垂直间距]
      },
      page: { size: 20, current: 1, total: 0 },
      planListVisible: false,
      runTimeObj: 0,
      searchForm: cloneDeep(searchForm),
      columns,
      dataSource: [],
      headerFields,
      modelEditVisible: false, //新增编辑页面
      visibleContent: 'detial',
      planListData: [], //总调控措施列表
      rowData: {}, //行数据
      expert_decision_type: 1, //类型
      devicePointList: [], //设备监测量
      planListColumns, //总调控措施列表
      expertProcessColumns, //决策因素列表
      plantList: [], //措施列表
      decisionList: [], //决策因素列表数据
      editPower: false
    };
  },
  computed: {
    getFactory() {
      return val => {
        return this.$store.state.factoryMap[val]?.stationName || '--';
      };
    },
    initConditionDescStrList() {
      return row => {
        let conditionExpressionObj = JSON.parse(row.conditionExpressionValue);
        let result = row.conditionDescStrList.map(item => {
          let own = conditionExpressionObj[item.splitStr];
          let devicePointObj = this.devicePointList.find(devicePoint => own === devicePoint.value);
          return {
            ...item,
            value: own ? own : item.splitStr,
            label: devicePointObj ? devicePointObj.label : undefined
          };
        });
        return result;
      };
    }
  },
  mounted() {
    this.getDict(); //Tabs选项
    this.geiTStructureObj();
    this.getDevicePointList();
    this.$nextTick(() => {
      this.dataSource = [...this.dataSource];
    });
  },
  methods: {
    handleImport() {
      this.$refs.file.click();
    },
    async handleFile() {
      let file = this.$refs.file.files[0];
      let formData = new FormData();
      formData.append('file', file);
      let res = await importProcessControl(formData);
      if (res.status == 'complete') {
        this.$message.success('导入成功');
      } else {
        this.$message.error(res.errorMessage);
      }
      this.getDeviceList();
      document.getElementById('file').value = '';
    },
    handleExport() {
      const vo = this.searchForm;
      exportProcessControl(vo).then(res => {
        exportFile(res, '专家决策配置');
      });
    },
    initcConditionDescStrList(row) {
      return row.conditionDescStrList;
    },
    async getDevicePointList() {
      let { resultData, success } = await queryDevicePointByStationId(this.searchForm.waterPlantId);
      if (success) {
        this.devicePointList = resultData?.map(item => {
          return {
            label: `${item.deviceName}_${item.pointMemo}`,
            value: `${item.industryDeviceId}_${item.pointName}`
          };
        });
      }
    },

    initLabel(label) {
      const regex = /^(\d+)、(\d+)_/;
      let text = String(label);
      return text.replace(regex, '$1、');
    },
    //字典code
    async getDict() {
      let typeRet = await sysDictListByCode('expert_decision_type'); // Tabs选项
      this.tabs = typeRet.resultData.map(i => {
        return {
          name: i.dictName,
          value: Number(i.dictValue),
          code: i.dictCode,
          ...i
        };
      });
      let typeValue = Number(this.$route.query?.tab) || this.tabs[0].value;
      this.tabVal = typeValue;
      this.searchForm.type = typeValue;
      this.expert_decision_type = typeValue;
      this.handleSearch();
    }, //获取构筑物对象
    async geiTStructureObj() {
      // 需要传入污水厂Id才能请求地址
      if (this.searchForm.waterPlantId) {
        const res = await this.$http.get(
          `/place/getStructureByStationId?waterPlantId=${this.searchForm.waterPlantId}`
        );
        if (res.success) {
          this.structureLiat = res.resultData?.map(item => {
            this.structureObj[item.id] = item.name;
            return {
              id: item.id,
              name: item.name
            };
          });
        }
      }
    },

    changeTab(tab) {
      (this.searchForm = cloneDeep(searchForm)), (this.tabVal = tab);
      this.visibleContent = 'detial';
      this.searchForm.type = tab;
      this.expert_decision_type = tab;
      this.handleSearch();
    },
    //查看总的控制措施列表
    showPlantList(val) {
      this.planListVisible = true;
      this.editPower = false;
      this.plantList = val;
    },
    //查看决策因素详情列表
    async editControlDecision(row) {
      let params = {
        controlId: row.id
      };
      const { resultData } = await getExpertProcessControlDecisionByControlId(params);
      this.visibleContent = 'controlDecision';
      this.decisionList = resultData.map(item => {
        let planIdLists = item.planIds?.split(',').map(Number);
        return {
          ...item,
          planList: planIdLists
            ?.map(id => {
              // 查找对应 ID 的数据项
              const item = row.planList.find(item => item.id === id);
              // 设置 checked 属性
              const checked = item !== undefined;
              return { ...item, checked };
            })
            .concat(
              row.planList
                .filter(item => !planIdLists.includes(item.id))
                .map(item => ({ ...item, checked: false }))
            )
        };
      });
    },

    handleSearch() {
      this.searchForm.currentPage = 1;
      this.page.current = 1;
      this.getModelList();
    },
    async getModelList() {
      this.loading = true;
      let params = {
        ...this.searchForm,
        page: this.page
      };
      const { success, resultData } = await getExpertProcessControl(params);
      this.loading = false;
      if (success) {
        this.dataSource = resultData.records;
        this.searchForm.total = resultData.total;
      }

      // if (this.$route.query?.id) {
      //   let row = this.dataSource.find(item => item.id == this.$route.query?.id);
      //   this.handleEdit(row);
      // }
    },
    handleReset() {
      this.searchForm = cloneDeep(searchForm);
      this.searchForm.type = this.expert_decision_type;
      this.handleSearch();
    },
    async handleDelete(row) {
      this.$confirm({
        title: '提示',
        content: '您确定要删除吗',
        onOk: async () => {
          let res = await deleteExpertProcessControl(row.id);
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
      this.visibleContent = 'edit';
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
      this.visibleContent = 'detial';
      this.planListVisible = false;
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
