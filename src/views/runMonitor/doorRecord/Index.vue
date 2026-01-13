<!--
 * @Description: 门禁管理
 * @Author: liuct
 * @Date: 2021-06-23 15:25:29
 * @LastEditTime: 2024-08-16 10:08:56
 * @LastEditors:  Do not edit
-->
<template>
  <div class="door-manage">
    <div class="manage-top">
      <!-- 搜素 -->
      <w-row>
        <w-form-model
          ref="formSearch"
          layout="inline"
          :model="formSearch"
          class="door-query-form"
          @submit="handleSubmit"
          @submit.native.prevent
        >
          <w-col class="supply-float-left">
            <w-form-model-item label="模糊查询" prop="keyword">
              <w-input
                v-model="formSearch.keyword"
                placeholder="输入关键字"
                class="supply-w-full"
              ></w-input>
            </w-form-model-item>
          </w-col>
          <w-col class="supply-float-left">
            <w-form-model-item label="操作时间" prop="date">
              <w-range-picker v-model="formSearch.date" :allowClear="false" style="width: 320px" />
            </w-form-model-item>
          </w-col>
          <w-col class="supply-float-right">
            <w-form-model-item>
              <w-button @click="exportFile" icon="upload"
                >Excel导出</w-button
              >
              <w-button class="supply-mx-3" icon="reload" @click="reset">重置</w-button>
              <w-button type="primary" icon="search" html-type="submit"
                >查询</w-button
              >
            </w-form-model-item>
          </w-col>
        </w-form-model>
      </w-row>
    </div>
    <div class="manage-body supply-bg-bg-card-DEFAULT">
      <div class="content-block">
        <!-- 门禁记录 -->
        <door-record ref="record" :params="recordParams"></door-record>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import DoorRecord from './doorRecord.vue';
export default {
  name: 'DoorManage',
  components: {
    DoorRecord,

  },
  data() {
    return {
      formSearch: {
        keyword: '',
        accStatus: 'all',
        date: [this.$moment().subtract(1, 'month'), this.$moment()]
      },
      recordParams: {
        keyword: '',
        endTime: '',
        startTime: ''
      }
    };
  },
  computed: {
    ...mapState('setting', ['searchKey'])
  },
  activated() {
    if (this.$route.query.name) {
      this.formSearch.keyword = this.$route.query.name;
      this.$nextTick(() => {
        this.handleSubmit();
      });
    }
  },
  mounted() {
    this.handleSubmit();
  },
  methods: {
    handleSubmit() {
        this.recordParams = {
          currentPage: 1,
          pageSize: 20,
          productCode: 'water_purification',
          keyword: this.formSearch.keyword,
          endTime: this.formSearch.date[1].endOf('day').format('YYYY-MM-DD HH:mm:ss'),
          startTime: this.formSearch.date[0].startOf('day').format('YYYY-MM-DD HH:mm:ss')
        };
        this.$refs.record.getRecordList();
    },
    reset() {
      this.$refs.formSearch.resetFields();
      this.handleSubmit();
    },
    exportFile() {
      this.$refs.record.exportFile();
    }
  }
};
</script>

<style lang="less" scoped>
.door-manage {
  height: 100%;
  .manage-top {
    padding: 4px 24px;
  margin-bottom: 10px;
  width: 100%;
  background: var(--supply-color-bg-card-DEFAULT);
  }
  .manage-body {
    height: calc(100% - 62px);
    border-radius: 4px;
    .manage-seach {
      padding: 12px;
      display: flex;
      flex-flow: wrap;
      .door-query-form {
        .wpg-form-item {
          margin-right: 12px;
          .screen-group {
            .wpg-radio-button-wrapper {
              width: auto !important;
            }
          }
        }
      }
      /deep/ .wpg-radio-button-wrapper {
        height: 36px;
        width: 60px;
        line-height: 36px;
        text-align: center;
      }
      /deep/ .tree-select-container {
        .wpg-select {
          position: relative;
          top: 1px;
        }
      }
    }
    .content-block {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
