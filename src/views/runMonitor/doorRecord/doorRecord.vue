<!--
 * @Description: 门禁记录
 * @Author: liuct
 * @Date: 2021-06-23 15:28:41
 * @LastEditTime: 2024-05-07 11:31:52
 * @LastEditors:  Do not edit
-->
<template>
  <div id="manageRecord" class="record-con">
    <w-config-provider>
      <!-- <w-empty v-if="data.length <= 0"></w-empty> -->
      <div class="manage-record">
        <w-table
          :loading="tableLoading"
          :columns="columns"
          :data-source="data"
          :pagination="false"
          :scroll="scroll"
        ></w-table>
        <!-- 分页 -->
        <w-pagination
          :current="page.currentPage"
          :total="total"
          :page-size="pageSize"
          class="pagination-con"
          @change="changePage"
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
    defaultChecked: true,
    customRender: (text, row, index) => {
      return index + 1;
    }
  },
  {
    title: '污水厂名称',
    dataIndex: 'stationName',
    key: 'stationName',
    ellipsis: true,
    width: 100
  },
  {
    title: '门禁名称',
    dataIndex: 'deviceName',
    key: 'deviceName',
    ellipsis: true,
    width: 150
  },
  {
    title: '门禁品牌',
    dataIndex: 'deviceTypeName',
    key: 'deviceTypeName',
    ellipsis: true,
    width: 120
  },
  {
    title: '操作用户',
    dataIndex: 'personName',
    key: 'personName',
    ellipsis: true,
    width: 80
  },
  {
    title: '操作动作',
    dataIndex: 'opName',
    key: 'opName',
    ellipsis: true,
    width: 120
  },
  {
    title: '操作结果',
    dataIndex: 'opResultName',
    key: 'opResultName',
    ellipsis: true,
    width: 100
  },
  {
    title: '操作时间',
    dataIndex: 'opTime',
    key: 'opTime',
    ellipsis: true,
    width: 180
  }
];
import { pageList, exportAccess } from '@/api/runMonitor';
import { exportFile } from '@/utils/util';
import { mapState } from 'vuex';
export default {
  name: 'DoorRecord',
  props: {
    params: {
      type: Object,
      default: () => {
        return {
          keyword: '',
          endTime: '',
          startTime: '',
          currentPage: 1,
          pageSize: 20,
          productCode: 'water_purification'
        };
      }
    }
  },
  data() {
    return {
      data: [],
      pageSize: 20,
      total: 0,
      tableLoading: false,
      scroll: { y: 0 }
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
    },
    page() {
      return this.params;
    }
  },
  methods: {
    async getRecordList() {
      this.$nextTick(async () => {
        this.data = [];
        this.total = 0;
        this.tableLoading = true;
        //this.globalLoading.show({ domId: 'manageRecord' });
        const params = {
          ...this.page
        };
        const { resultData, count } = await pageList(params);
        this.tableLoading = false;
        //this.globalLoading.hide({ domId: 'manageRecord' });
        this.data = resultData;
        this.total = count;
        this.useEffect();
      });
    },
    changePage(page, pageSize) {
      this.page.currentPage = page;
      this.getRecordList();
    },
    useEffect() {
      this.$nextTick(() => {
        if (!document.querySelector('.manage-record')) {
          return;
        }
        const boxHeight = document.querySelector('.manage-record').clientHeight;
        const headerHeight = document.querySelector('.wpg-table-thead').offsetHeight;
        const pagenationHeight = 52;
        this.scroll = {
          y: boxHeight - headerHeight - pagenationHeight
        };
      });
    },
    exportFile() {
      const params = {
        ...this.page
      };
      exportAccess(params)
        .then(res => {
          exportFile(res, '门禁记录');
        })
        .catch(mes => {});
    }
  }
};
</script>

<style lang="less" scoped>
.record-con {
  width: 100%;
  height: 100%;
  overflow: hidden;
  .manage-record {
    height: 100%;
  }
  .pagination-con {
    height: 52px;
    padding: 12px 29px;
    text-align: right;
  }
}
</style>
