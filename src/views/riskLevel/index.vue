<!--
 * @Description:
 * @version:
 * @Author: fengtaotao
 * @Date: 2023-07-01 14:43:48
 * @LastEditors:  Do not edit
 * @LastEditTime: 2024-07-25 17:21:17
-->

<template>
  <div class="page">
    <div class="search-box">
      <span>关联水厂：</span>
      <FactorySelect
        v-model.trim="searchForm.waterPlantId"
        :showAll="false"
        :autoSelect="true"
        @change="handleSearch"
      ></FactorySelect>
    </div>
    <div class="iframe-view">
      <biology-flow :waterPlantId="searchForm.waterPlantId"></biology-flow>
    </div>
    <div class="table">
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
              <w-button class="mr_12" @click="handleExport"><w-icon type="export" />导出</w-button>
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
            style="height: 97%"
            :columns="columns"
            :data-source="dataSource"
            :page="searchForm"
            :loading="loading"
            :scroll="{ x: 1000 }"
            @changePage="handlePageChange"
          >
            <template #riskLevel="{ text }">
              <span>{{ riskLevelObj[text] || '--' }}</span>
            </template>
          </w-info-table>
        </template>
      </w-form-table-page>
    </div>
  </div>
</template>

<script>
import { cloneDeep } from 'lodash';
import { exportFile } from '@/utils/util';
import { getPlaceRiskAlarmPage, exportPlaceRiskAlarmPage } from '@/api/riskManagement';
import { sysDictListByCode } from '@/api/manage.js';
import { headerFields, columns, searchForm } from './components/options';
export default {
  name: 'riskLevel',
  components: {
    FactorySelect: () => import('@/components/factory-select/index.vue'),
    BiologyFlow: () => import('./components/BiologyFlow')
  },
  mixins: [],
  data() {
    return {
      layout: {
        span: 6,
        labelCol: { span: 8 },
        wrapperCol: { span: 16 },
        gutter: [0] //栅格间隔[水平间距，垂直间距]
      },
      fields: cloneDeep(headerFields),
      headerFields,
      searchForm: cloneDeep(searchForm),
      columns,
      loading: false,
      dataSource: [],
      page: { size: 20, current: 1, total: 0 },
      riskLevelObj: {}, //风险等级对象
      allpIds: [] //构筑物的所有选项
    };
  },
  mounted() {
    this.searchForm.rangeTime = [
      this.$moment()
        .subtract(1, 'month')
        .format('YYYY-MM-DD 00:00:00'),
      this.$moment().format('YYYY-MM-DD 23:59:59')
    ];
    Promise.all([this.getOptions(), this.getRiskLevel()]).then(() => {
      this.handleSearch();
    });
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
        let children = structureList.records.map(item => {
          this.allpIds.push(item.id);
          return {
            ...item,
            value: item.id,
            key: item.id,
            title: item.name
          };
        });
        this.fields[0].attrs.treeData = [
          {
            key: 'allCheck',
            title: '全选',
            value: 'allCheck',
            children
          }
        ];
      } catch (error) {
        console.log(error);
      }
    },
    //获取风险等级列表
    async getRiskLevel() {
      let { success, resultData } = await sysDictListByCode('risk_level');
      if (success) {
        resultData?.forEach(item => {
          this.riskLevelObj[item.dictValue] = item.dictName;
        });
      }
    },
    handleSearch() {
      this.searchForm.currentPage = 1;
      this.page.current = 1;
      this.getModelList();
    },
    async getModelList() {
      this.loading = true;
      // 全选假如构筑物id
      if (this.searchForm.placeId.includes('allCheck')) {
        this.searchForm.placeId = ['allCheck', ...this.allpIds];
      }
      let params = {
        ...this.searchForm,
        startTime: this.searchForm.rangeTime[0],
        endTime: this.searchForm.rangeTime[1],
        page: this.page
      };
      const { success, resultData } = await getPlaceRiskAlarmPage(params);
      if (success) {
        this.dataSource = resultData?.records;
        this.searchForm.total = resultData.total;
      }
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
    handlePageChange(cur, size) {
      this.searchForm.currentPage = cur;
      this.searchForm.pageSize = size;
      this.page.pages = cur;
      this.page.size = size;
      this.getModelList();
    },
    /* 导出 */
    handleExport() {
      const vo = {
        ...this.searchForm,
        templateFlag: false,
        page: this.page
      };
      exportPlaceRiskAlarmPage(vo).then(res => {
        exportFile(res, '风险等级');
      });
    }
  }
};
</script>

<style lang="less" scoped>
.page {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  /deep/.form-header {
    height: 50px !important;
  }
  /deep/.wpg-form-table-warp .form-warp {
    margin-bottom: 0px !important;
  }
  /deep/.wpg-form-header {
    padding: 4px 24px !important;
  }
}
.search-box {
  padding: 4px 24px;
  margin-bottom: 10px;
  width: 100%;
  background: var(--supply-color-bg-card-DEFAULT);
}
.iframe-view {
  margin-bottom: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: calc(50% - 52px);
  background: var(--supply-color-bg-card-DEFAULT);
  position: relative;
}
.table {
  width: 100%;
  height: calc(50% - 12px);
}
</style>
