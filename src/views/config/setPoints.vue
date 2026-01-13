<!--
 * @Description: 监测量配置
 * @Author: limz
 * @Date: 2021-06-18 15:02:10
 * @LastEditTime: 2023-05-17 10:54:51
 * @LastEditors: Do not edit
-->
<template>
  <w-row class="rule-wrapper">
    <w-col :span="24" class="handle-title supply-bg-bg-card-DEFAULT">
      <w-col :span="4" class="title-text">
        <span class="tag"></span>
        <span class="supply-text-lg supply-text-main title">
          {{ pointData.current === 'page' ? '监测量配置' : '能耗监测量配置' }}
        </span>
      </w-col>
    </w-col>
    <w-col :span="24" class="rule-content">
      <div class="content-box">
        <div class="info supply-bg-bg-card-DEFAULT">
          <div class="title supply-text-base supply-text-main">属性信息</div>
          <w-row class="info-list">
            <w-col v-for="d in pointData.data" :key="d.label" :span="24">
              <w-col class="supply-text-secondary" :span="8">{{ d.label }}：</w-col>
              <w-col class="supply-text-main supply-truncate" :span="16" :title="d.value">{{
                d.value
              }}</w-col>
            </w-col>
          </w-row>
        </div>
        <div class="set supply-bg-bg-card-DEFAULT">
          <div class="title supply-text-base supply-text-main">批量设置</div>
          <div class="search-box">
            <div class="search-item compo-factory">
              <span>选择污水厂：</span>
              <factory-select
                v-model="waterPlantId"
                autoSelect
                :showAll="!autoSelect"
              ></factory-select>
            </div>
            <div class="search-item">
              <span>模糊查询：</span>
              <w-input
                v-model.trim="keyWord"
                :placeholder="`请输入设备名称`"
                :maxLength="50"
                allowClear
                @keyup.enter="filterTable"
              />
            </div>
            <div class="search-item supply-ml-5">
              <w-button type="primary" class="btn-item" icon="search" @click="filterTable"
                >查询</w-button
              >
              <w-button icon="reload" @click="reset">重置</w-button>
            </div>
          </div>
          <div ref="setTable">
            <w-config-provider>
              <template v-if="data.length <= 0" #renderEmpty>
                <w-empty
                  :size="'small'"
                  :style="{
                    maxHeight: `${$refs.setTable ? $refs.setTable.clientHeight - 120 : 100}px`
                  }"
                ></w-empty>
              </template>
              <w-table
                rowKey="id"
                :loading="loading"
                :columns="columns"
                :data-source="filterTableData"
                :pagination="{ total: filterTableData.length, pageSize: 10 }"
                :scroll="scroll"
              >
                <span slot="customTitle">
                  <w-checkbox :checked="isCheckedAll" @change="onChangeAll">
                    <span class="supply-text-xs th-check">监测量</span>
                  </w-checkbox>
                </span>
                <template slot="points" slot-scope="text, record">
                  <w-checkbox
                    v-for="p in record.points"
                    :key="p.id"
                    :value="p.pointName"
                    :checked="p.checked"
                    @change="onCheck($event.target.checked, p)"
                  >
                    {{ p.name }}
                  </w-checkbox>
                </template>
              </w-table>
            </w-config-provider>
          </div>
          <div class="info-btns">
            <div class="btns">
              <w-button class="btn-item" @click="back">取消</w-button>
              <w-button type="primary" @click="save">保存</w-button>
            </div>
          </div>
        </div>
      </div>
    </w-col>
  </w-row>
</template>

<script lang="ts">
// import Vue from 'vue';
import FactorySelect from '@/components/factory-select/index.vue';
import { mapState } from 'vuex';
import {
  deviceRelsAndTree, // 监测量树1
  energyDeviceRelsAndTree, // 监测量树2
  applyPointConfig, // 保存1
  applyEnergyPointConfig, // 保存2
  sysDictListByCode,
  energyDeviceByPump, // 通过污水厂id获取监测量树
  applyEnergyPumpConfig // 保存指定污水厂id所选的监测量
} from '@/api/manage';
import { defineComponent } from '@vue/composition-api';

const columns = [
  {
    title: '污水厂名称',
    dataIndex: 'pName',
    ellipsis: true,
    width: 280
  },
  {
    title: '设备名称',
    dataIndex: 'gName',
    ellipsis: true,
    width: 280
  },
  {
    dataIndex: 'points',
    slots: { title: 'customTitle' },
    scopedSlots: { customRender: 'points' }
  }
];

export default defineComponent<{ pointData: any }, any>({
  name: 'SetPoints',
  data() {
    return {
      loading: false,
      area: [],
      areaList: [],
      waterPlantId: '',
      keyword: '',
      // columns,
      data: [],
      scroll: { y: '400px' },
      setId: '',
      deviceRels: [], // 接口 - 已选的污水厂设备及监测量
      selectedPoints: [], // 当前已选的污水厂设备及监测量
      isCheckedAll: false, // 全选
      pointTotal: 0, // 可选监测量总数
      selectDev: '',
      keyWord: '',
      first: false,
      pumpId: '', // 污水厂id
      currentPumpId: '' // 跳转传参的pumpId
    };
  },
  components: {
    FactorySelect
  },
  computed: {
    ...mapState('page', ['pointData']),
    ...mapState('configure', ['textReplace']),
    filterTableData() {
      let arr: any[] = [];
      let pointTotal: number = 0;
      let pumps: any[] = []; // 污水厂个数
      console.log('yyyy', this.data);
      this.data.forEach((dev: any) => {
        if (!dev.hide) {
          if (!this.currentPumpId) {
            arr.push(dev);
          } else if (dev.pumpId === this.currentPumpId) {
            arr.push(dev);
          }
          pointTotal += dev.points.length;
          if (pumps.findIndex((pId: any) => pId === dev.pumpId) < 0) pumps.push(dev.pumpId);
        }
      });
      if (this.pointData.valueType === '1') {
        this.pointTotal = this.pointData.type === '0' ? pointTotal : arr.length;
      } else {
        this.pointTotal = pointTotal;
      }
      if (this.first) {
        this.first = false;
        this.selectedPoints = this.deviceRels;
        this.isCheckedAll = this.selectedPoints.length === this.pointTotal;
      }
      return arr;
    },
    autoSelect() {
      return this.$store.state.factoryList?.length === 1;
    },
    columns() {
      columns.forEach(item => {
        if (item.title?.includes('泵站')) {
          item.title = item.title.replace('泵站', this.textReplace);
        }
      });
      if (this.pumpId && this.pointData?.current === 'energy') {
        // 从污水厂配置页面-能耗监测量(带有污水厂) 隐藏污水厂名称列
        return columns.slice(1);
      }

      return columns;
    }
  },
  watch: {
    selectedPoints(val) {
      let that: any = this;
      that.data = this.data.map((dev: any) => {
        return {
          ...dev,
          points: dev.points.map((point: any) => {
            let idx: number = val.findIndex(
              (rel: any, i: number) => rel.deviceId === dev.id && rel.pointName === point.pointName
            );
            return {
              ...point,
              checked: idx > -1
            };
          })
        };
      });
    }
  },
  activated() {
    this.reset();
    let { id, pumpId } = this.$route.query;
    Object.assign(this, {
      setId: id,
      pumpId
    });
    let pId = sessionStorage.getItem('pump_id');
    if (pId) this.currentPumpId = pId;
    this.query();
  },
  mounted() {
    let table: any = this.$refs.setTable;
    this.scroll.y = `${table.clientHeight - 100}px`;
  },
  methods: {
    /* 全选 */
    onChangeAll(e: any) {
      this.isCheckedAll = e.target.checked;
      if (e.target.checked) {
        this.filterData();
      } else {
        if (this.filterTableData.length === this.data.length) {
          this.selectedPoints = [];
        } else {
          // 筛选条件下, 只能清空筛选数据中的监测量
          this.filterTableData.forEach((dev: any) => {
            dev.points.forEach((p: any) => {
              let si: number = this.selectedPoints.findIndex(
                (point: any) =>
                  point.pumpHouseId === p.pumpHouseId &&
                  point.deviceId === p.deviceId &&
                  point.pointName === p.pointName
              );
              if (si > -1) this.selectedPoints.splice(si, 1);
            });
          });
        }
      }
    },
    /* 全选处理 */
    filterData() {
      let that: any = this;
      let selectArr: any[] = [...this.selectedPoints];
      // 全选
      this.filterTableData.forEach((dev: any) => {
        if (that.pointData.valueType === '1') {
          dev.points.forEach((p: any) => {
            let idx: number = selectArr.findIndex((rel: any) => {
              if (that.pointData.type === '0') {
                // 污水厂 点击勾选, 默认勾选当前污水厂的第一个设备的第一个监测量, 单值: valueType === '1'
                return rel.pumpHouseId === p.parentId;
              } else {
                // 设备: 点击勾选, 默认勾选当前设备的第一个监测量
                return rel.pumpHouseId === p.parentId && rel.deviceId === p.id;
              }
            });
            if (idx <= -1) {
              // 当前污水厂/设备没有监测量勾选
              selectArr.push({
                pointId: p.id,
                deviceId: p.deviceId,
                pointName: p.pointName,
                pumpHouseId: p.pumpHouseId
              });
            }
          });
        } else {
          // 多值
          dev.points.forEach((p: any) => {
            let sIdx: number = selectArr.findIndex(
              (s: any) =>
                s.deviceId === p.deviceId &&
                s.pumpHouseId === p.pumpHouseId &&
                s.pointName === p.pointName
            );

            if (sIdx < 0)
              selectArr.push({
                pointId: p.id,
                deviceId: p.deviceId,
                pointName: p.pointName,
                pumpHouseId: p.pumpHouseId
              });
          });
        }
      });
      that.selectedPoints = Array.from(new Set(selectArr));
    },
    /* 单选 */
    onCheck(checked: boolean, record: any) {
      if (!checked) {
        if (this.isCheckedAll) this.isCheckedAll = false;
        let idx: number = this.selectedPoints.findIndex(
          (point: any) =>
            point.pumpHouseId === record.pumpHouseId &&
            point.deviceId === record.deviceId &&
            point.pointName === record.pointName
        );
        if (idx > -1) this.selectedPoints.splice(idx, 1);
      } else {
        if (this.pointData.valueType === '1') {
          let idx: number = this.selectedPoints.findIndex((point: any) => {
            if (this.pointData.type === '0') {
              return point.pointId === record.id;
            } else {
              return point.pointId === record.id && point.deviceId === record.deviceId;
            }
          });
          if (idx > -1) this.selectedPoints.splice(idx, 1);
        }
        let that: any = this;
        that.selectedPoints.push({
          pointId: record.id,
          deviceId: record.deviceId,
          pointName: record.pointName,
          pumpHouseId: record.pumpHouseId
        });
      }
      this.isCheckedAll = this.selectedPoints.length === this.pointTotal;
    },
    filterTable() {
      this.loading = true;
      let tableData: any[] = [...this.data];
      tableData = tableData.map((dev: any) => {
        let flag: boolean = !this.keyWord && !this.waterPlantId;
        if (this.keyWord && this.waterPlantId) {
          flag = dev.gName.indexOf(this.keyWord) > -1 && dev.pumpId === this.waterPlantId;
        } else if (this.keyWord) {
          flag = dev.gName.indexOf(this.keyWord) > -1;
        } else if (this.waterPlantId) {
          flag = dev.pumpId === this.waterPlantId;
        }
        return {
          ...dev,
          hide: !flag
        };
      });
      Object.assign(this, {
        data: tableData
      });
      setTimeout(() => {
        this.loading = false;
      }, 200);
    },
    /* 取消 */
    back() {
      this.goto({
        path: this.pumpId ? '/manage/pumpConfig' : '/config/superviseSet'
      });
      this.pumpId = '';
    },
    /* 搜索tag */
    filterTag(val, treeNode) {
      return treeNode.data.props.title.includes(val);
    },
    /* 查询监测量 */
    async query() {
      this.loading = true;
      // 三种类型 1. 从监测量配置页面-监测量 2.从监测量配置页面-能耗监测 3.污水厂配置页面-能耗监测量(带有污水厂)
      let res: any =
        this.pointData.current === 'page'
          ? await deviceRelsAndTree(this.setId)
          : this.pumpId
          ? await energyDeviceByPump(this.setId, this.pumpId)
          : await energyDeviceRelsAndTree(this.setId);
      this.loading = false;
      let {
        status,
        resultData: { deviceRels, treeNodes }
      } = res;
      if (status === 'complete') {
        this.deviceRels = deviceRels;
        this.dealData([...treeNodes], [...deviceRels]);
      }
    },
    dealData(data: Object[], deviceRels: any[]) {
      let _data = [...data];
      let arr: any[] = [];
      _data.forEach((pump: any) => {
        let pName = pump.name;
        pump.children.forEach((device: any) => {
          // 构筑物
          let gName = device.name;
          let { id, data, name, children, parentId } = device;
          arr.push({
            id,
            name,
            parentId,
            pumpId: pump.id,
            pName,
            gName,
            data,
            hide: false,
            points: children.map((c: any) => {
              return {
                id: c.id,
                pointName: c.data,
                name: c.name,
                deviceId: id,
                pumpHouseId: pump.id
              };
            })
          });
        });
      });
      Object.assign(this, { data: arr });
      this.first = true;
    },
    /* 保存 */
    async save() {
      this.$confirm({
        title: '提示',
        content: '确定要保存吗？',
        onOk: async () => {
          let params: any = {
            deviceRelList: this.selectedPoints,
            id: this.setId,
            type: this.pointData.type // 0污水厂 1设备
          };
          if (params.type === '1') params.location = this.selectDev;
          console.log('save', params);
          let res: any =
            this.pointData.current === 'page'
              ? await applyPointConfig(params)
              : this.pumpId
              ? await applyEnergyPumpConfig(params)
              : await applyEnergyPointConfig(params);
          if (res.status === 'complete') {
            this.$message.success('保存成功');
            this.back();
          }
        }
      });
    },
    reset() {
      this.selectDev = '';
      this.keyWord = '';
      this.filterTable();
    }
  }
});
</script>
<style lang="less" scoped>
.rule-wrapper {
  width: 100%;
  height: 100%;

  .pad {
    padding: 0 8px;
  }

  .handle-title {
    height: 60px;
    margin-bottom: 12px;
    padding: 0 30px;
    border-radius: 4px;

    .title-text {
      display: flex;
      align-items: center;
      height: 100%;

      .tag {
        display: block;
        width: 4px;
        height: 26px;
        margin-right: 12px;
        // background: #33ac2e;
        background: var(--supply-color-primary-DEFAULT);
      }
    }
  }

  .rule-content {
    position: relative;
    height: calc(100% - 60px - 12px);
    border-radius: 4px;

    .spin {
      position: absolute;
      top: 0;
      left: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.2);
    }

    .content-box {
      display: flex;
      height: 100%;

      > div {
        height: 100%;
        padding: 12px 20px;
        border-radius: 4px;
      }

      .info {
        width: 336px;
        margin-right: 12px;

        .title {
          margin-bottom: 16px;
        }

        .info-list {
          height: calc(100% - 40px);
          overflow: auto;

          .wpg-col {
            margin-bottom: 12px;
          }
        }
      }

      .set {
        flex: 1;

        .btn-item {
          margin-right: 10px;
        }

        .search-box {
          margin: 16px 0 12px;

          .search-item {
            display: inline-block;

            /deep/.wpg-input-affix-wrapper {
              width: auto !important;
              display: inline-block;
            }

            .wpg-select,
            .wpg-input {
              width: 192px;
              margin-right: 20px;
            }
          }
        }

        .wpg-table-wrapper {
          height: calc(100vh - 375px);
          position: relative;

          .th-check {
            color: #6281a3;
          }

          .wpg-checkbox-wrapper + .wpg-checkbox-wrapper {
            margin: 0 8px 0 0 !important;
          }
          // /deep/.wpg-table-pagination {
          //   bottom: 0;
          //   display: flex !important;
          //   justify-content: flex-end;
          //   padding: 8px 20px;
          //   position: absolute;
          //   right: 0;
          //   width: 100%;
          //   z-index: 2;
          // }
        }

        .select-more,
        .btns {
          text-align: right;
          margin-left: 10px;
        }
      }
    }
  }
  .info-btns {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-top: 20px;
  }
}
</style>
<style lang="less">
.wpg-select-dropdown.points-dropdown {
  max-height: 300px !important;
}
</style>
