<!--
 * @Author: wangyr
 * @Date: 2025-03-07 13:22:20
 * @LastEditors: wangyr
 * @LastEditTime: 2025-03-07 13:33:31
 * @Description:
-->
<template>
  <div class="content-spin">
    <div class="table-block">
      <w-table
        :data-source="sortedItems"
        :columns="columns"
        :loading="loading"
        :scroll="scroll"
        :pagination="false"
        :highlight-current-row="true"
      >
        <template slot="online" slot-scope="text, record, index">
          <div :class="[record.online ? 'online' : 'off', 'person-box']">
            <div class="person-ico"></div>
            <div class="person-status">{{ record.online ? '在线' : '离线' }}</div>
          </div>
        </template>
        <template slot="action" slot-scope="text, record, index">
          <a @click="viewTrajectory(record)" class="person-line">查看轨迹</a>
        </template>
      </w-table>
    </div>
  </div>
</template>

<script>
import { personLocationCard } from '@/api/realTimePositioning.js';
export default {
  name: 'PersonnelWrist',
  props: {
    title: {
      type: String,
      default: ''
    },
    tokenLogin: {
      type: String,
      default: ''
    },
    stationData: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      loading: false,
      scroll: {
        x: 0,
        y: 740
      },
      columns: [
        {
          dataIndex: 'entityName',
          title: '姓名',
          align: 'center',
          width: 120
        },
        {
          dataIndex: 'online',
          title: '在线状态',
          align: 'center',
          width: 100,
          scopedSlots: { customRender: 'online' }
        },
        {
          dataIndex: 'action',
          title: '操作',
          align: 'center',
          width: 120,
          scopedSlots: { customRender: 'action' }
        }
      ],
      tableData: []
    };
  },
  computed: {
    sortedItems() {
      return this.tableData.slice().sort((a, b) => {
        return a.entityName.localeCompare(b.entityName, 'zh-Hans-CN', { sensitivity: 'accent' });
      });
    }
  },
  watch: {
    // tokenLogin: {
    //   handler(newVal) {
    //     if (newVal) {
    //       this.initData();
    //     }
    //   },
    //   immediate: true
    // },
    stationData: {
      handler(newVal) {
        if (newVal.length > 0) {
          this.handleData(newVal);
        }
      },
      immediate: true
    }
  },
  methods: {
    handleData(data) {
      this.tableData = data.map(item => ({
        ...item
      }));
    },
    async initData() {
      try {
        const { success, resultData, message } = await personLocationCard(this.tokenLogin);
        if (success && resultData?.data) {
          // 过滤掉没有eamEntity的数据，并确保数据结构完整
          this.tableData = resultData.data
            .filter(item => item?.eamEntity?.entityName)
            .map(item => ({
              ...item,
              entityName: item.eamEntity.entityName, // 确保entityName存在
              online: !!item.online, // 确保online是布尔值
              lastUpdateTime: item.lastUpdateTime || '-'
            }));
        } else {
          this.tableData = [];
        }
      } catch (error) {
        console.error('获取人员定位卡数据出错:', error);
      }
    },
    viewTrajectory(data) {
      if (!data?.entityId) {
        this.$message.warning('无效的人员数据');
        return;
      }
      this.$emit('viewTrajectory', data);
    }
  }
};
</script>

<style lang="less" scoped>
.content-spin {
  width: 100%;
  height: 100%;
  position: relative;

  .table-block {
    width: 100%;
    height: 100%;
    padding-top: 6px;
    box-sizing: border-box;
    div {
      font-weight: 400;
      font-size: 14px;
      color: #b2dfff;
      letter-spacing: 0;
    }
    .person-box {
      flex: 1;
      text-align: center;
      display: flex;
      justify-content: center;
      align-items: center;
      .person-ico {
        width: 14px;
        height: 14px;
        margin-right: 4px;
      }
      .person-status {
        font-family: PingFangSC-Medium, sans-serif;
        font-weight: 500;
        font-size: 14px;
        letter-spacing: 0;
      }
      &.off {
        .person-ico {
          background: url('~@/assets/images/default/hz/person_off.png') no-repeat;
          background-size: 100% 100%;
        }
        .person-status {
          color: #bdc3c6;
        }
      }
      &.online {
        .person-ico {
          background: url('~@/assets/images/default/hz/person_online.png') no-repeat;
          background-size: 100% 100%;
        }
        .person-status {
          color: #17e91d;
        }
      }
    }
    .person-line {
      flex: 1;
      text-align: center;
      cursor: pointer;
    }
  }
  /deep/.wpg-table-wrapper {
    height: 100%;

    .wpg-spin-nested-loading,
    .wpg-spin-container,
    .wpg-table,
    .wpg-table-content,
    .wpg-table-scroll {
      height: 100%;
    }

    .wpg-table {
      &-thead tr > th,
      &-tbody tr > td {
        padding-left: 20px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }

    .wpg-table-tbody {
      tr {
        cursor: pointer;

        & > td.wpg-table-selection-column span {
          display: none;
        }

        &.wpg-table-row-selected {
          background: #eaf1fb;
        }
      }
    }
  }
  /deep/.wpg-table-placeholder {
    height: 95%;
  }
}
</style>
