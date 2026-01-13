<template>
  <div @click="isPointSelectOpen = false" class="page-wrapper">
    <div class="supply-relative table-box">
      <w-button class="supply-self-end supply-mb-2" type="primary" @click="toAddSupplier">
        新增监测量配置
      </w-button>
      <s-table
        :showPagination="false"
        :page-size="10"
        :scroll="{ x: 740 }"
        ref="table"
        style="max-height:450px"
        class="supply-bg-bg-card-component"
        row-key="id"
        :columns="columns"
        :data="getSupplierList"
        :rowClassName="(record, index) => (index === deletingRow ? 'deleting-row' : '')"
      >
        <template slot="name" slot-scope="text, record">
          <w-input
            v-if="record.isAdd || record.isEdit"
            v-model="record.name"
            placeholder="请输入名称"
          ></w-input>
          <span v-else>{{ text }}</span>
        </template>
        <template slot="modelPointName" slot-scope="text, record">
          <virtual-select
            v-if="record.isAdd || record.isEdit"
            v-model="record.modelPointIds"
            :options="renderedOptions"
            placeholder="请选择监测量"
            :style="{ width: '100%' }"
            mode="multiple"
            :virtual-scroll="true"
            :visible-item-count="50"
            :maxTagTextLength="10"
            maxTagPlaceholder="..."
            :maxTagCount="1"
            @change="handleSelect"
          ></virtual-select>
          </w-select>

          <span v-else>{{ text }}</span>
        </template>

        <template slot="action" slot-scope="text, record, index">
          <a v-show="record.isAdd || record.isEdit" @click="historyAdd(record)">保存</a>
          <w-divider v-show="record.isAdd || record.isEdit" type="vertical" />
          <a v-show="record.isAdd || record.isEdit" @click="handleCancel(record)">取消</a>
          <a v-show="!record.isAdd && !record.isEdit" @click="editPoint(record)">修改</a>
          <w-divider v-show="!record.isAdd && !record.isEdit" type="vertical" />
          <a v-show="!record.isAdd && !record.isEdit" @click="deleteSupplier(record.code, index)"
            >删除</a
          >
        </template>
      </s-table>
    </div>
  </div>
</template>
<script>
import VirtualSelect from '@/components/VirtualSelect/index.vue';
import {
  queryDeviceData,
  queryMultiDeviceData,
  addOrUpdateDeviceConfigs,
  deleteDeviceConfigs
} from '@/api/dataBoard.js';

const LOAD_NUM = 100;
export default {
  name: 'lightSet',
  components: { VirtualSelect },
  props: {
    waterPlantId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      ifAddPoints: 0,
      isPointSelectOpen: false,
      isEdit: false,
      renderedOptions: [], //渲染的回路开关
      personList: [],
      filterDataList: [],
      devicePointArr: [],
      columns: [
        {
          title: '面板名称',
          dataIndex: 'name',
          width: 180,
          scopedSlots: { customRender: 'name' }
        },
        {
          title: '设备监测量',
          dataIndex: 'modelPointName',
          scopedSlots: { customRender: 'modelPointName' }
        },
        {
          title: '操作',
          key: 'action',
          dataIndex: 'action',
          width: 120,
          defaultChecked: true,
          scopedSlots: { customRender: 'action' }
        }
      ],
      deletingRow: -1
    };
  },
  watch: {
    waterPlantId: {
      immediate: true,
      handler(val) {
        if (val) {
          this.getForecastCodeList(val);
        }
      }
    },
    params(n) {
      if (JSON.stringify(n) !== '{}') {
        if (this.$refs.table) this.$refs.table.refresh(true);
      }
    }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.refresh(false, false);
    });
  },
  mounted() {},
  methods: {
    /* 所有设备监测量 */
    getForecastCodeList(val) {
      let params = {
        waterPlantId: val
      };
      queryDeviceData(params).then(res => {
        if (res.status === 'complete') {
          let tempArr = [];
          this.devicePointArr = res.resultData;
          res.resultData.forEach(item => {
            let deviceList = item.deviceDataList.map(point => {
              return {
                ...item,
                ...point,
                label: item.deviceName + '_' + point.pointMemoAlias,
                value: item.deviceId + '_' + point.pointName,
                key: item.deviceId + '_' + point.pointName
              };
            });
            tempArr.push(...deviceList);
          });
          this.pointsList = tempArr;
          this.renderedOptions = tempArr;
        }
      });
    },
    // 被选中时调用，参数为选中项的 value (或 key) 值
    handleSelect(val) {
      console.log('111',val);
    },
    handleCancel(record) {
      let tempArr = [];
      let chooseDevices = this.devicePointArr.filter(item => {
        return record.modelPointIds.some(model => model.indexOf(item.deviceId) > -1);
      });
      let configList = chooseDevices.forEach(item => {
        item.deviceDataList.forEach(point => {
          if (record.modelPointIds.includes(`${item.deviceId}_${point.pointName}`)) {
            tempArr.push(`${item.deviceName}_${point.pointMemoAlias}`);
          }
        });
      });
      record.modelPointName = tempArr.join(',');
      record.isAdd = false;
      record.isEdit = false;
      this.isEdit = false;
    },
    //修改
    editPoint(record) {
      record.isEdit = true;
      this.isPointSelectOpen = false;
      this.isEdit = record.code;
      this.modelPointName = record.modelPointName;
      this.entryType = record.entryType;
    },
    //新增
    toAddSupplier() {
      if (this.ifAddPoints === 2) {
        this.$message.error('已新增一空白组合，请填选并保存');
      } else {
        this.ifAddPoints = 1;
        this.isEdit = 'addPoint';
        this.modelPointName = [];
        if (this.$refs.table) this.$refs.table.loadData(true);
      }
    },
    //保存
    async historyAdd(record) {
      if (!record.name) {
        this.$message.error('面板名称不能为空');
      } else if (!record.modelPointIds.length) {
        this.$message.error('请选择设备监测量');
      } else {
        if (record.id === 'addPoint') {
          this.addModelRelation(record);
        } else {
          this.editSupplier(record);
        }
      }
    },
    async addModelRelation(record) {
      this.isEdit = false;
      this.isPointSelectOpen = false;
      let chooseDevices = this.devicePointArr.filter(item => {
        return record.modelPointIds.some(model => model.indexOf(item.deviceId) > -1);
      });
      let configList = chooseDevices.map(item => {
        let pointList = item.deviceDataList.filter(point =>
          record.modelPointIds.includes(`${item.deviceId}_${point.pointName}`)
        );
        return {
          ...item,
          pointNameList: pointList,
          industryDeviceId: item.deviceId,
          pointNames: pointList.map(item => item.pointName).join(',')
        };
      });
      let param = {
        name: record.name,
        configList
      };
      await addOrUpdateDeviceConfigs(param);
      if (this.$refs.table) this.$refs.table.loadData(true);
    },
    async getSupplierList() {
      if (this.ifAddPoints === 1) {
        let tableData = [
          {
            name: '',
            createBy: '',
            modelPointName: '',
            modelPointIds: [],
            isAdd: true,
            isEdit: false,
            code: ''
          },
          ...this.tableData
        ];
        this.ifAddPoints = 2;
        return { records: tableData, current: 1, size: 1000 };
      } else {
        let params = {
          waterPlantId: this.waterPlantId
        };
        return await queryMultiDeviceData(params).then(res => {
          this.isEdit = false;
          let tableData = res.resultData.map((p, i) => {
            let devicePointList = p.deviceDataList;
            let modelPointIds = devicePointList.map(v => `${v.industryDeviceId}_${v.pointName}`);
            let modelPointName = devicePointList
              .map(v => `${v.industryDeviceName}_${v.pointMemoAlias}`)
              .join(',');
            return {
              ...p,
              isAdd: false,
              isEdit: false,
              modelPointName,
              modelPointIds
            };
          });
          this.tableData = tableData;
          this.ifAddPoints = 0;
          this.$emit('changeList', tableData || []);
          return { records: [...tableData], current: 1, size: 1000 };
        });
      }
    },
    async editSupplier(record) {
      let chooseDevices = this.devicePointArr.filter(item => {
        return record.modelPointIds.some(model => model.indexOf(item.deviceId) > -1);
      });
      let configList = chooseDevices.map(item => {
        let pointList = item.deviceDataList.filter(point =>
          record.modelPointIds.includes(`${item.deviceId}_${point.pointName}`)
        );
        return {
          ...item,
          pointNameList: pointList,
          industryDeviceId: item.deviceId,
          pointNames: pointList.map(item => item.pointName).join(',')
        };
      });

      await addOrUpdateDeviceConfigs({
        ...record,
        configList
      });
      if (this.$refs.table) this.$refs.table.loadData(true);
    },
    async deleteSupplier(id, index) {
      this.deletingRow = index;
      this.$confirm({
        title: '提示',
        content: '确定要删除吗？',
        onOk: async () => {
          if (!!id) {
            let composeList = await deleteDeviceConfigs(id);
          } else {
            this.ifAddPoints = 0;
          }
          if (this.$refs.table) this.$refs.table.loadData(true);
          this.deletingRow = -1;
        },
        onCancel: () => {
          this.deletingRow = -1;
        }
      });
    }
  }
};
</script>
<style lang="less" scoped>
.compose-content {
  overflow: hidden;
  display: flex;
  max-height: 298px;
  max-width: 266px;
  min-width: 100%;
  flex-direction: column;
  position: absolute;
  right: 0;
  box-shadow: 0 0 15px #a9a9a9;
  background-color: var(--supply-color-bg-select-DEFAULT);
  /deep/ .point-con {
    .point-Multi {
      max-height: 298px;
    }
  }
}
.page-wrapper {
  width: 100%;
  height: 100%;
  /* padding: 8px 20px 20px; */
  display: flex;
  .table-box {
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 0 30px;
    /* align-items: center; */
    height: 100%;
    .point-compose__select {
    }
    /deep/ .wpg-pagination {
      display: none;
    }
    /deep/ .table-page-search-wrapper {
      padding: 0;
    }
    /deep/ .table-page-list-wrapper {
      margin-top: 0;
    }
    /deep/ .wpg-table-placeholder {
      padding: unset;
    }
  }

  .point-select {
    border: 1px solid #dce0df;
    border-radius: 1px;
    width: 206px;
    background-color: var(--supply-color-bg-select-DEFAULT);
  }
}
</style>
