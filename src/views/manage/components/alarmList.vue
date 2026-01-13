<template>
  <w-modal
    :visible="visible"
    title="报警列表"
    :width="748"
    :mask="true"
    :height="420"
    :footer="null"
    @cancel="visible = false"
  >
    <div class="card-inner">
      <w-table
        class="tableDevice"
        ref="wTable"
        :columns="columns"
        :data-source="dataList"
        :scroll="{ y: 290 }"
        :pagination="false"
        rowKey="id"
      >
        <!-- 自定义报警状态列显示 -->
        <template slot="alarmStatus" slot-scope="text, record">
          <span :class="['status', text == '0' ? '' : 'online']">
            {{ text == '0' ? '已结束' : '报警中' }}
          </span>
        </template>
      </w-table>
    </div>
  </w-modal>
</template>

<script>
import { getAlarmList } from '@/api/analysis';
export default {
  name: 'alarmList',
  components: {
    // 异步加载单位卡片组件
  },
  props: {
    // 水厂ID
    waterPlantId: {
      type: String,
      default: ''
    },
    runTimeDeviceIds: {
      type: Array,
      default: () => []
    },
    dateTime: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      visible: false,
      dataList: [], // 表格数据
      columns: [
        // 表格列配置
        {
          title: '报警名称',
          dataIndex: 'alarmName',
          width: 160
        },
        {
          title: '报警状态',
          dataIndex: 'alarmStatus',
          scopedSlots: { customRender: 'alarmStatus' }
        },
        {
          title: '报警等级',
          dataIndex: 'alarmLevel'
        },
        {
          title: '开始时间',
          dataIndex: 'startTime',
          width: 160
        }
      ]
    };
  },

  watch: {
    // 监听水厂ID变化
    waterPlantId: {
      handler(val) {
        if (val) {
          this.initData(); // 初始化数据
        }
      },
      immediate: true // 立即执行
    },
    dateTime: {
      handler(val) {
        if (val) {
          this.initData(); // 获取报警列表
        }
      }
    },
    runTimeDeviceIds: {
      handler(val) {
        if (val) {
          this.initData(); // 获取报警列表
        }
      }
    }
  },
  methods: {
    /**
     * 初始化数据，获取报警列表
     */
    async initData() {
      try {
        // 请求参数
        let params = {
          stationIds: [this.waterPlantId],
          pageSize: 999,
          startTime: this.$moment(this.dateTime)
            .subtract(1, 'days')
            .format('YYYY-MM-DD'),
          endTime: this.dateTime.format('YYYY-MM-DD'),
          industryDeviceIds: this.runTimeDeviceIds,
          orderBy: 'startTime'
        };

        // 获取报警列表数据
        let { status, resultData } = await getAlarmList(params);
        if (status === 'complete') {
          // 转换报警等级为中文
          let arr = ['一', '二', '三', '四'];
          this.dataList = resultData.records.map(item => {
            item.alarmLevel = arr[item.alarmLevel - 1] + '级';
            // 格式化开始时间
            item.startTime = this.$moment(item.startTime).format('MM-DD HH:mm:ss');
            return item;
          });
        }
      } catch (error) {
        console.error('报警列表:', error);
      }
    }
  }
};
</script>

<style lang="less" scoped>
.card-inner {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  .status {
    &.online {
      color: #f64357;
    }
  }
}
</style>
