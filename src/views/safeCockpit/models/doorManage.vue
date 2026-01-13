<!--
 * @Description: 门禁记录
 * @Author: liuct
 * @Date: 2021-06-23 15:28:41
 * @LastEditTime: 2024-05-07 11:31:52
 * @LastEditors:  Do not edit
-->
<template>
  <!-- 使用UnitCard组件作为容器 -->
  <unit-card :cardTitle="cardTitle">
    <div id="manageRecord" class="record-con">
      <w-config-provider>
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
  </unit-card>
</template>

<script>
const columns = [
  {
    title: '门禁名称',
    dataIndex: 'deviceName',
    key: 'deviceName',
    ellipsis: true,
    width: 120
  },
  {
    title: '操作动作',
    dataIndex: 'opName',
    key: 'opName',
    ellipsis: true,
    width: 120
  },
  {
    title: '结果',
    dataIndex: 'opResultName',
    key: 'opResultName',
    ellipsis: true,
    width: 70
  },
  {
    title: '操作时间',
    dataIndex: 'opTime',
    key: 'opTime',
    ellipsis: true,
    width: 160
  }
];
import { mapState } from 'vuex';
import { pageList } from '@/api/runMonitor';
export default {
  name: 'DoorManage',
  components: {
    UnitCard: () => import('@/components/CardBox/CockpitCard.vue')
  },
  props: {
    cardTitle: {
      type: String,
      default: ''
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
      return {
        currentPage: 1,
        pageSize: 20
      };
    }
  },
  mounted() {
    this.getRecordList();
  },
  methods: {
    async getRecordList() {
      this.$nextTick(async () => {
        this.data = [];
        this.total = 0;
        this.tableLoading = true;
        const params = {
          ...this.page,
          productCode: 'water_purification',
          startTime: this.$moment()
            .startOf('month')
            .format('YYYY-MM-DD 00:00:00'),
          endTime: this.$moment().format('YYYY-MM-DD 23:59:59')
        };
        const { resultData, count } = await pageList(params);
        this.tableLoading = false;
        this.data = resultData.map(item => {
          return {
            ...item,
            opTime: this.$moment(item.opTime).format('YYYY-MM-DD HH:mm')
          };
        });
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
  /deep/.wpg-table-wrapper {
    height: calc(100% - 52px) !important;
  }
  .pagination-con {
    height: 52px;
    padding: 12px 29px;
    text-align: right;
  }
}
</style>
