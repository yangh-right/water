<!--
 * @Author: liuct
 * @Date: 2020-12-31 13:59:58
 * @LastEditTime: 2024-07-26 16:15:05
 * @LastEditors:  Do not edit
 * @Description:
-->
<template>
  <div class="control-log">
    <w-row class="log-header wbgc-card">
      <w-form-model
        ref="formSearch"
        layout="inline"
        :model="formSearch"
        @submit="handleSubmit"
        @submit.native.prevent
      >
        <w-col class="fl">
          <w-form-model-item>
            <region-or-org-select
              ref="regionOrOrg"
              :item="{ isShowType: true, type: type, ids: stationList }"
              @selectChange="handleOrgChange"
              @typeChange="handleTypeChange"
              @initLoaded="refresh"
            />
          </w-form-model-item>
        </w-col>
        <w-col v-if="isShowMore" class="fl">
          <w-form-model-item label="选择时间" prop="date">
            <w-range-picker
              v-model="formSearch.date"
              :disabled-date="disabledDate"
              :allowClear="false"
              format="YYYY-MM-DD"
            />
          </w-form-model-item>
        </w-col>
        <w-col class="fl">
          <w-form-model-item label="模糊查询" prop="keyWord">
            <w-input v-model="formSearch.keyWord" placeholder="请输入关键字"></w-input>
          </w-form-model-item>
        </w-col>
        <w-col class="fr">
          <i
            v-if="fullWidth < 1525"
            :class="[`icon-ic_expand_${isShowMore ? 'less' : 'more'}`, 'wfc-theme arrow-icon']"
            @click="isShowMore = !isShowMore"
          ></i>
        </w-col>
        <w-col class="fr">
          <w-form-model-item>
            <w-button v-if="isShowMore" icon="reload" @click="reset" class="supply-mr-3"
              >重置</w-button
            >
            <w-button type="primary" icon="search" html-type="submit">查询</w-button>
            <return-control :is-drill-down="true" class="supply-ml-3"></return-control>
          </w-form-model-item>
        </w-col>
      </w-form-model>
    </w-row>
    <w-config-provider>
      <template v-if="data.length <= 0" #renderEmpty>
        <w-empty></w-empty>
      </template>
      <div v-if="logBodyShow" id="logBody" class="log-body">
        <w-table
          :columns="columns"
          :data-source="data"
          :pagination="false"
          :scroll="{ y: 'calc(100vh - 290px)' }"
          :rowKey="record => record.operTime"
        >
        </w-table>
        <w-pagination
          v-show="total > 0"
          class="pagination"
          show-size-changer
          :current="params.currentPage"
          :total="total"
          :pageSize="params.pageSize"
          @change="change"
          @showSizeChange="onShowSizeChange"
        />
      </div>
    </w-config-provider>
  </div>
</template>

<script>
const columns = [
  {
    title: '序号',
    dataIndex: 'num',
    key: 'num',
    width: 80,
    customRender: (text, row, index) => {
      return index + 1;
    }
  },
  {
    title: '设备ID',
    dataIndex: 'industryDeviceId',
    key: 'industryDeviceId',
    ellipsis: true
  },
  {
    title: '污水厂名称',
    dataIndex: 'stationName',
    key: 'stationName',
    ellipsis: true
  },
  {
    title: '设备名称',
    dataIndex: 'industryName',
    key: 'industryName',
    ellipsis: true
  },
  {
    title: '下控监测量',
    dataIndex: 'pointName',
    key: 'pointName',
    ellipsis: true,
    customRender: (text, row) => {
      return `${row.pointMemo}(${text})`;
    }
  },
  {
    title: '下控值',
    dataIndex: 'pointValue',
    width: 100,
    key: 'pointValue',
    ellipsis: true,
    customRender: (text, row) => {
      let res = JSON.parse(row.reqJson).values
        ? JSON.parse(row.reqJson).values[row.pointName]
        : '--';
      return res === null ? '--' : res + '';
    }
  },
  {
    title: '执行人',
    dataIndex: 'operName',
    key: 'operName',
    ellipsis: true
  },
  {
    title: '下控IP地址',
    dataIndex: 'ipAddr',
    key: 'ipAddr',
    ellipsis: true
  },
  {
    title: '下控结果',
    dataIndex: 'ret',
    ellipsis: true,
    customRender: text => {
      return text === '0' ? '成功' : '失败';
    }
  },
  {
    title: '下控结果详细',
    dataIndex: 'feedBack',
    ellipsis: true,
    customRender: (text, row, index) => {
      let reg = /\((.+?)\)/i;
      let downInfo = {};
      text
        .match(reg)[1]
        .split(',')
        .map(item => (downInfo[item.split('=')[0].trim()] = item.split('=')[1]));
      return downInfo.msg || '';
    }
  },
  {
    title: '下控时间',
    dataIndex: 'operTime',
    key: 'operTime',
    width: 180,
    ellipsis: true
  }
];
import moment from 'moment';
import RegionOrOrgSelect from '@/components/SelectRegionOrOrg';
import { ctrlLogPage } from '@/api/runMonitor';
import { mapState } from 'vuex';
export default {
  name: 'ControlLog',
  components: {
    RegionOrOrgSelect
  },
  data() {
    return {
      formSearch: {
        keyWord: '',
        date: [moment().subtract('days', 6), moment()]
      },
      data: [],
      total: 0,
      type: 'region',
      params: {
        currentPage: 1,
        pageSize: 20,
        keyWord: '',
        startTime: moment()
          .subtract('days', 6)
          .format('YYYY-MM-DD 00:00:00'),
        endTime: moment().format('YYYY-MM-DD 23:59:59'),
        productCode: 'water_purification'
      },
      stationList: [],
      fullWidth: document.documentElement.clientWidth,
      isShowMore: true,
      logBodyShow: false
    };
  },
  computed: {
    ...mapState('configure', ['textReplace']),
    columns() {
      return columns.map(item => {
        if (item.title.includes('泵站')) {
          item.title = item.title.replace('泵站', this.textReplace);
        }
        return item;
      });
    }
  },
  watch: {
    fullWidth(val) {
      this.isShowMore = val >= 1525;
    }
  },
  mounted() {
    this.getListData();
    this.isShowMore = this.fullWidth >= 1525;
    window.onresize = () => {
      return (() => {
        this.fullWidth = document.documentElement.clientWidth;
      })();
    };
  },
  methods: {
    // 查询组织/区域类型改变
    handleTypeChange(value) {
      this.type = value;
    },
    // 查询组织/区域范围改变
    handleOrgChange(value) {
      this.$set(this, 'stationList', value);
    },
    // 初始化数据/重置
    reset() {
      this.params.keyWord = '';
      this.$set(this.params, 'currentPage', 1);
      this.type = 'region';
      this.$refs.regionOrOrg.refresh(); // 区域组织选择重置
      this.$refs.formSearch.resetFields();
      this.refresh();
    },
    refresh() {
      this.handleSubmit();
    },
    handleSubmit() {
      this.params.keyWord = this.formSearch.keyWord;
      this.params.currentPage = 1;
      if (this.formSearch.date.length > 0) {
        this.params.startTime = this.formSearch.date[0].format('YYYY-MM-DD 00:00:00');
        this.params.endTime = this.formSearch.date[1].format('YYYY-MM-DD 23:59:59');
      } else {
        this.params.startTime = '';
        this.params.endTime = '';
      }
      if (this.type === 'org') {
        this.params.orgList = this.stationList;
      } else {
        this.params.areaList = this.stationList;
      }
      this.getListData();
    },
    /* 禁止选择日期 */
    disabledDate(current) {
      return current && current > this.$moment().endOf('day');
    },
    async getListData() {
      this.logBodyShow = false;
      // this.$loading.show({ domId: 'logBody' });
      this.params.pageFlag = true;
      await ctrlLogPage(this.params).then(res => {
        this.logBodyShow = true;
        // this.$loading.hide({ domId: 'logBody' });
        let { status, resultData, errorMessage, count } = res;
        if (status === 'complete') {
          this.data = resultData;
          this.total = count;
        }
      });
    },
    change(page, pageSize) {
      this.params.currentPage = page;
      this.params.pageSize = pageSize;
      this.getListData();
    },
    onShowSizeChange(page, pageSize) {
      this.params.currentPage = 1;
      this.params.pageSize = pageSize;
      this.getListData();
    }
  }
};
</script>

<style lang="less" scoped>
.fl {
  float: left;
}
.fr {
  float: right;
}
.control-log {
  height: 100%;
  padding: 0px !important;
  .log-header {
    background-color: var(--supply-color-bg-card-DEFAULT);
    padding: 8px 12px;
    border-radius: 4px;
    margin-bottom: 12px;
    /deep/ .ant-radio-button-wrapper {
      height: 36px;
      width: 76px;
      line-height: 36px;
      text-align: center;
    }

    .arrow-icon {
      position: relative;
      top: 5px;
      margin-left: 10px;
      font-size: 26px;
      cursor: pointer;
    }
    // /deep/ .tree-select-container {
    //     .ant-select {
    //     width: 162px !important;
    //     position: relative;
    //     top: 1px;
    //     }
    // }
    .btn-item {
      margin-left: 10px;
    }
  }
  .log-body {
    background-color: var(--supply-color-bg-card-DEFAULT);
    border-radius: 4px;
    height: calc(100% - 70px);
    position: relative;
    .pagination {
      width: 100%;
      text-align: right;
      padding: 12px;
      position: absolute;
      bottom: 0;
    }
  }
}
</style>
