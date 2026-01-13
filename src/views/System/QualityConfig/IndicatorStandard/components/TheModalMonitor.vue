<template>
  <div>
    <TheModal
      title="选择监测量"
      :visible="visible"
      @submit="handleSubmit"
      :info="info"
      @cancel="handleCancel"
    >
      <template #content>
        <w-form-header
          :fields="fields"
          newLine
          :neddRetain="false"
          :title="null"
          :model="searchForm"
          :loading="loading"
          @search="handleSearch"
          @cancel="handleReset"
          :layout="{ colon: true }"
        >
        </w-form-header>
        <w-info-table
          :columns="columns"
          :data-source="dataList"
          style="height: 400px"
          :scroll="{ x: 800, y: 300 }"
          :loading="loading"
          :page="searchForm"
          @changePage="handlePageChange"
          rowKey="id"
        >
          <template #check="{ row }">
            <w-checkbox
              :checked="row.flag | checkedFilter"
              :disabled="disabledFilter(row)"
              @change="onChange($event, row)"
            ></w-checkbox>
          </template>
          <template #coding="{ row }">
            <span>{{ row.pointOtherName }}-{{ row.pointServiceNo }}</span>
          </template>
          <template #checkTitle>
            <div slot="title"><span>选择</span></div>
          </template>
        </w-info-table>
      </template>
    </TheModal>
  </div>
</template>

<script>
import TheModal from './TheModalCommon.vue';
import { getPointUnitApi } from '@/api/public';
import { monitorColums, modalMonitorField } from '../config';
export default {
  name: 'modalMonitor',
  components: {
    TheModal
  },
  props: {
    /* 模态框  */
    visible: {
      type: Boolean,
      default: false
    },
    info: {
      type: Object,
      default: () => {}
    },
    placeId: {
      type: String,
      default: undefined
    },
    type: {
      type: String,
      default: 'multi'
    },
    // 在已关联采样点的地方添加监测量时 所选的采样点
    samplingPoint: {
      type: Object,
      default: undefined
    }
  },
  data() {
    return {
      /* 模态框 */
      loading: false,
      /* 表格相关 */
      columns: monitorColums,
      dataList: [],

      /* 头部表单 */
      fields: modalMonitorField,
      searchForm: {
        keywords: undefined,
        pointTypeName: undefined,
        pageSize: 20,
        currentPage: 1,
        total: 0
      },
      page: { size: 10, pages: 1, total: 0 },
      /* 其他 */
      lastSelected: undefined,
      selected: undefined,
      postParams: { createList: [], deleteList: [] }
    };
  },
  watch: {
    visible: {
      handler(val) {
        //获取采样点列表
        if (val) {
          this.handleReset();
        }
      }
    }
  },
  filters: {
    checkedFilter(val) {
      return val === 1 || val === 2;
    }
  },
  created() {
    this.getPointType();
  },
  methods: {
    //获取监测量列表
    async getList() {
      try {
        this.loading = true;
        const res = await this.$http.post(`/controlStandard/getPoint`, {
          controlId: this.info?.id,
          delFlag: 0,
          pageFlag: true,
          orderBy: '',
          placeId: this.placeId,
          tenantId: '',
          ...this.searchForm,
          page: this.page
        });

        this.searchForm.total = res.resultData.total;
        this.page.total = res.resultData.total;
        this.dataList = res.resultData.records;
      } catch (error) {
        console.log(error);
        this.dataList = [];
      } finally {
        this.loading = false;
      }
    },
    handlePageChange(cur, size) {
      this.searchForm.currentPage = cur;
      this.searchForm.pageSize = size;
      this.page.pages = cur;
      this.page.size = size;
      this.getList();
    },
    //获取监测量类型
    async getPointType() {
      const { resultData } = await getPointUnitApi();
      this.fields[1].options = resultData.map(item => {
        return {
          label: item.dictName,
          value: item.dictName
        };
      });
      this.fields[1].options.unshift({
        label: '不限',
        value: ''
      });
    },
    onChange(e, row) {
      if (e.target.checked) {
        //单选模式
        if (this.selected && this.type === 'single') {
          //上次变为未选中
          this.selected.flag = 1;
          //本次变为为选中
          row.flag = 1;
          this.selected = row;
        } else if (!this.selected && this.type === 'single') {
          row.flag = 1;
          this.selected = row;
        } else {
          row.flag = 1;
          //没有 standardPointId 就添加
          if (!row.standardPointId) {
            this.postParams.createList.push({
              controlStandardId: this.info?.id,
              samplingPointId: row.samplingPointId,
              pointId: row.id
            });
          } else {
            //有standardPointId  但在删除列表里
            let i = this.postParams.deleteList.findIndex(item => item === row.standardPointId);
            if (i !== -1) {
              this.postParams.deleteList.splice(i, 1);
            }
          }
        }
      } else {
        row.flag = 0;
        //判断是否是已经勾选的
        if (row.standardPointId) {
          //不存在于deleteList中则添加
          if (!this.postParams.deleteList.find(item => item === row.standardPointId)) {
            this.postParams.deleteList.push(row.standardPointId);
          }
        } else {
          let i = this.postParams.createList.findIndex(
            item => item.samplingPointId === row.samplingPointId
          );
          this.postParams.createList.splice(i, 1);
        }
      }
    },
    handleSearch() {
      this.searchForm.currentPage = 1;
      this.getList();
    },
    async handleReset() {
      this.searchForm.currentPage = 1;
      this.searchForm.pageSize = 20;
      await this.getList();
    },
    async handleSubmit() {
      let api = '';
      if (this.type === 'multi') {
        api = '/controlStandard/addPoint';
      } else {
        api = '/controlStandard/addSamplingPointPoint';
        this.postParams = {
          id: this.samplingPoint.id,
          samplingPointId: this.samplingPoint.samplingPointId,
          controlStandardId: this.samplingPoint.controlStandardId,
          pointId: this.selected.id
        };
      }

      try {
        await this.$http.post(api, this.postParams);
        this.$message.success('操作成功');
        this.reset();
        this.$emit('update:visible', false);
      } catch (error) {
        console.log(error);
      }
    },
    handleCancel() {
      this.reset();
      this.$emit('update:visible', false);
    },
    reset() {
      this.searchForm.keywords = undefined;
      this.searchForm.pointTypeName = undefined;
      this.lastSelected = undefined;
      this.selected = undefined;
      this.postParams = { createList: [], deleteList: [] };
    },

    /* 表格操作 */
    //全选
    onAllChecked(e) {
      console.log(`checked = ${e.target.checked}`);
    },

    //其他
    //filter this指向有问题
    disabledFilter(row) {
      //单选模式下 选中的也禁用
      if (this.type === 'single' && row.standardPointId) {
        return row.flag === -1 || row.flag === 1 || row.flag === 2;
      } else {
        return row.flag === -1 || row.flag === 2;
      }
    }
  }
};
</script>

<style lang="less" scoped>
//解决field名称大于六个字显示不全的问题
/deep/.wpg-info-form .wpg-form-item.label-auto .wpg-form-item-label {
  flex-basis: 100px;
}
/deep/ .wpg-table-wrapper {
  height: calc(100% - 52px);
}
</style>
