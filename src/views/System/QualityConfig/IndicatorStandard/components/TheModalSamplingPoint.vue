<template>
  <div>
    <TheModal
      title="选择采样点"
      :visible="visible"
      @submit="handleSubmit"
      :info="info"
      @cancel="handleCancel"
    >
      <template #content>
        <w-info-table
          :columns="columns"
          :data-source="dataList"
          style="height: 400px"
          :scroll="{ y: 300 }"
          :page="searchForm"
          :loading="loading"
          rowKey="samplingPointId"
          @changePage="handlePageChange"
        >
          <template #check="{ row }">
            <w-checkbox
              :checked="row.flag | checkedFilter"
              :disabled="row.flag | disabledFilter"
              @change="onChange($event, row)"
            >
            </w-checkbox>
          </template>
        </w-info-table>
      </template>
    </TheModal>
  </div>
</template>

<script>
import TheModal from './TheModalCommon.vue';
import { samplingColums } from '../config';
export default {
  name: 'modalSampling',
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
    }
  },

  data() {
    return {
      /* 表格相关 */
      columns: samplingColums,
      dataList: [],
      searchForm: {
        pageSize: 10,
        currentPage: 1,
        total: 0
      },
      page: { size: 10, pages: 1, total: 0 },
      checkedList: [], //选中的采样点
      loading: false,
      postParams: { createList: [], deleteList: [] }
    };
  },
  watch: {
    visible: {
      handler(val) {
        //获取采样点列表
        if (val) {
          this.getList();
        }
      }
    }
  },
  filters: {
    checkedFilter(val) {
      return val === 0;
    },
    disabledFilter(val) {
      return val === -1;
    }
  },
  methods: {
    //获取采样点列表
    async getList() {
      try {
        this.loading = true;
        const res = await this.$http.post(`/controlStandard/getSamplingPointPage`, {
          controlStandardId: this.info.id,
          structureIdList: [this.info.placeId],
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
    /* 表格操作 */
    handlePageChange(cur, size) {
      this.searchForm.currentPage = cur;
      this.searchForm.pageSize = size;
      this.page.pages = cur;
      this.page.size = size;
      this.getList();
    },
    onChange(e, row) {
      if (e.target.checked) {
        row.flag = 0;
        if (!row.id) {
          this.postParams.createList.push({
            controlStandardId: this.info?.id,
            samplingPointId: row.samplingPointId,
            pointId: row.pointId
          });
        } else {
          //id  但在删除列表里
          let i = this.postParams.deleteList.findIndex(item => item === row.id);
          if (i !== -1) {
            this.postParams.deleteList.splice(i, 1);
          }
        }
      } else {
        row.flag = 1;
        if (row.id) {
          //不存在于deleteList中则添加
          if (!this.postParams.deleteList.find(item => item === row.id)) {
            this.postParams.deleteList.push(row.id);
          }
        } else {
          let i = this.postParams.createList.findIndex(
            item => item.samplingPointId === row.samplingPointId
          );
          this.postParams.createList.splice(i, 1);
        }
      }
    },
    async handleSubmit() {
      try {
        await this.$http.post(`/controlStandard/addSamplingPoint`, this.postParams);
        this.$message.success('操作成功');
        this.postParams = { createList: [], deleteList: [] };
        this.$emit('update:visible', false);
      } catch (error) {
        console.log(error);
      }
    },
    handleCancel() {
      this.postParams = { createList: [], deleteList: [] };
      this.$emit('update:visible', false);
    }
  }
};
</script>

<style lang="less" scoped>
/deep/ .wpg-table-wrapper {
  height: calc(100% - 44px);
}
</style>
