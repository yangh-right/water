<template>
  <div style="overflow:hidden">
    <!--工具条-->
    <w-col :span="24" class="toolbar">
      <w-form layout="inline" :model="filters">
        <w-form-item>
          <w-input
            v-model="filters.keyword"
            size="small"
            placeholder="名称/中文名"
            @keyup.enter.native="search"
            ><w-icon slot="prefix" type="search" @click="search"
          /></w-input>
        </w-form-item>
        <w-form-item style="display: none;">
          <w-input size="small"></w-input
          ><!--防止回车自动提交表单刷新页面-->
        </w-form-item>
        <w-form-item>
          <w-button type="primary" size="small" icon="search" @click="search">查询</w-button>
        </w-form-item>
        <w-form-item>
          <w-button type="primary" size="small" icon="sync" @click="handleClear">刷新</w-button>
        </w-form-item>
        <w-form-item>
          <w-button v-if="isHighlight" type="primary" size="small" @click="setCurrent">
            取消选中行
          </w-button>
        </w-form-item>
      </w-form>
    </w-col>

    <!--列表-->
    <w-table
      ref="relatedTable"
      class="center-table related-table"
      :dataSource="listData"
      :loading="listLoading"
      :columns="columns"
      :pagination="isPagination"
      :rowKey="record => record.id"
      :customRow="rowClick"
      :rowClassName="setRowClassName"
      style="width: 100%;"
      @onChange="selsChange"
      @change="handleCurrentChange"
    >
      <span slot="order" slot-scope="text, record, index">{{ index + 1 }}</span>
    </w-table>
    <w-col :span="24" class="dialog-table-footer">
      <w-button @click.native="handleCancle" style="margin-right: 10px;">取消</w-button>
      <w-button type="primary" :loading="submitLoading" @click.native="handleSubmit">确定</w-button>
    </w-col>
  </div>
</template>

<script>
import {
  getPointLists,
  getVirtualSiteServicePage,
  queryPointByDeviceIds
} from '@/api/configuration';
const addPointNum = 10;
export default {
  name: 'Point',
  props: {
    realCode: {
      type: String,
      default: ''
    },
    deviceId: {
      type: String,
      default: ''
    },
    waterPlantId: {
      type: String,
      default: ''
    },
    optionsDeviceValue: {
      type: String,
      default: ''
    },
    element: {
      type: Object,
      default: {}
    },
    optionsDevice: {
      type: Array,
      default: () => {}
    }
  },
  data() {
    return {
      /** ******** 关联员工界面 **********/
      condition: {
        total: 0,
        current: 1, // 当前页码
        size: 5, // 显示多少条
        keywords: '' // 关键字搜索
      },
      listData: [], // 列表数据
      callback: '', // 确认时调用的方法
      columns: [
        // 部门列表列及对应接口字段
        {
          title: '序号', // 列名
          width: 60,
          key: '1',
          scopedSlots: { customRender: 'order' }
        },
        {
          title: '代码',
          dataIndex: 'pointCode',
          key: '2'
        },
        {
          title: '名称',
          dataIndex: 'pointName',
          key: '3'
        },
        {
          title: '中文名',
          dataIndex: 'pointMemo',
          key: '4'
        }
      ],
      filters: {
        keyword: ''
      },
      pagination: {
        total: 0,
        current: 1,
        pageSize: 10
      },

      sels: {}, // 列表选中行

      isHighlight: false, // 是否高亮标志

      listLoading: false,
      submitLoading: false,

      rowId: '',
      row: null,
      rowClick: record => ({
        // 事件
        on: {
          click: () => {
            // 点击改行时要做的事情
            // ......
            this.rowId = record.id;
            this.row = record;
            this.isHighlight = true;
          }
        }
      }),
      sourceData: []
    };
  },
  computed: {
    isPagination() {
      return this.waterPlantId ? true : this.pagination;
    }
  },

  mounted() {
    this.getRelatedList();
  },

  methods: {
    search() {
      if (this.waterPlantId) {
        this.listData = this.filters.keyword
          ? this.sourceData.filter(v => v.pointMemo.includes(this.filters.keyword))
          : this.sourceData;
      } else {
        this.getList(1);
      }
    },
    // 更新获取关联列表的条件
    refreshCondition(val) {
      this.condition.current = val.current;
      this.condition.size = val.size;
      this.condition.keyword = val.keyword;
      this.getRelatedList();
    },
    // 获取关联的列表
    getRelatedList: function() {
      if (this.waterPlantId) {
        this.realPoint();
      } else {
        this.getPointList();
      }
    },
    realPoint() {
      queryPointByDeviceIds([this.waterPlantId]).then(res => {
        this.dealPointData(res.resultData);
      });
    },
    dealPointData(data) {
      data.forEach(dev => {
        if (dev.deviceId === this.deviceId) {
          dev.pointInfoList.forEach((p, i) => {
            p.id = p.pointName;
          });
          this.sourceData = dev.pointInfoList;
          this.listData = dev.pointInfoList;
        }
      });
    },
    // 大点表所有监测量
    getPointList() {
      const params = {
        currentPage: this.pagination.current,
        keyWord: this.condition.keyword,
        pageSize: this.pagination.size
      };
      this.listLoading = true;

      getPointLists(params).then(res => {
        const { count, resultData } = res;
        this.pagination.total = count;
        this.listData = resultData;
        this.listLoading = false;
      });
    },

    getSitePointList() {
      let params = {
        current: this.condition.current,
        size: this.condition.size,
        condition: {
          waterPlantId: this.waterPlantId,
          realCode: this.realCode || this.optionsDeviceValue,
          keyword: this.condition.keyword
        }
      };

      this.listLoading = true;

      getVirtualSiteServicePage(params)
        .then(res => {
          if (res.status === 'complete' && res.resultData) {
            this.condition.total = res.resultData.total;
            this.pagination.total = res.resultData.total;
            this.listData = res.resultData.records;
          }
          this.listLoading = false;
        })
        .catch(() => {
          this.$message.error('系统异常,请重试!');
          this.listLoading = false;
        });
    },

    handleCancle() {
      this.$emit('cancle', false);
    },
    getResult(val) {
      this.$emit('getResult', val);
    },

    handleCurrentChange(page) {
      this.pagination.current = page.current;
      this.pagination.pageSize = page.pageSize;
      this.getList(page.current);
    },

    handleSizeChange(current, size) {
      this.pagination.pageSize = size;
      setTimeout(() => {
        this.getList(1);
      }, 1);
    },

    selsChange(sels) {
      if (sessionStorage.getItem('noChangeSels') && sels.length === 0) {
        sessionStorage.setItem('noChangeSels', '');
      } else {
        let pages = 'page' + this.pagination.current;
        this.sels[pages] = sels;
      }
    },

    handleClear() {
      this.filters.keyword = '';
      this.search();
    },

    getList(pageIndex) {
      this.pagination.current = pageIndex ? pageIndex : this.pagination.current;
      let condition = {
        current: this.pagination.current,
        size: this.pagination.pageSize,
        keyword: this.filters.keyword
      };
      this.refreshCondition(condition);
    },

    setRowClassName(record) {
      return record.id === this.rowId ? 'clickRowStyle supply-text-primary' : '';
    },

    setCurrent(row) {
      // if (!row) {
      this.isHighlight = false;
      this.rowId = '';
      this.row = null;
      // } // 取消当前行时，改变高亮标志
    },
    handleSubmit() {
      let codes = this.element.codeElementObj.codeId.split(',') || [];
      if (codes.length == addPointNum) {
        this.$message.info(`最多选择${addPointNum}个监测量`);
        return;
      }
      // 单选把选中值传回父组件
      if (this.row == null) {
        this.$confirm({
          title: '确定不关联任何的点表数据吗?',
          content: '',
          okText: '删除',
          cancelText: '取消',
          onOk: () => {
            this.$emit('getResult', '');
          },
          onCancel: () => {
            this.getList();
          }
        });
      } else this.$emit('getResult', this.row);
    }
  }
};
</script>

<style lang="less" scoped>
.center-table {
  overflow: auto;
}

.related-table {
  table {
    tbody {
      tr {
        &.current-row td {
          color: #409eff;
          background-color: #ecf5ff !important;
        }
      }
    }
  }
}

.center-table {
  position: relative;
  -ms-flex: 1;
  flex: 1;
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  overflow: auto;
  color: #606266;
  font-size: 14px;
}

.dialog-table-footer {
  margin-top: 20px;
  text-align: right;
  .ant-btn {
    margin-left: 12px;
  }
}
</style>
