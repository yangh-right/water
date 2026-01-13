<!--
 * @Description:
 * @Author: JianYue
 * @Date: 2024-09-13 11:34:50
 * @LastEditTime: 2024-10-23 14:09:41
 * @LastEditors: wangyr
-->
<template>
  <div class="data-overview supply-flex supply-flex-col">
    <div class="data-overview-tap supply-bg-bg-card-DEFAULT supply-flex-none">
      <span
        v-if="buttonCodes['realTime']"
        :class="tabVal === 'realTime' ? 'active' : ''"
        @click="changeTab('realTime')"
        >实时数据</span
      >
      <span
        v-if="buttonCodes['forecast']"
        :class="tabVal === 'forecast' ? 'active' : ''"
        @click="changeTab('forecast')"
        >预测数据</span
      >
      <span
        v-if="buttonCodes['dataCorrection']"
        :class="tabVal === 'dataCorrection' ? 'active' : ''"
        @click="changeTab('dataCorrection')"
        >数据修正</span
      >
      <div class="search">
        <w-button class="supply-mr-3" type="primary" @click="devicePointSet"
          >监测量卡片配置</w-button
        >
        选择污水厂：
        <FactorySelect
          style="width:220px"
          autoSelect
          v-model="waterPlantId"
          @input="initData"
        ></FactorySelect>
        <return-control :keep="true" :is-drill-down="true" class="supply-ml-3"></return-control>
      </div>
    </div>
    <div
      class="data-overview-body supply-flex-1 supply-overflow-hidden supply-flex supply-flex-col"
    >
      <div class="data-overview-card">
        <w-spin :spinning="spinning">
          <div id="cardCom" class="card-content supply-bg-bg-card-DEFAULT">
            <div v-for="(item, index) in deviceData" :key="item.uid" style="width: calc(100% / 5);">
              <data-card
                :deviceInfor="item"
                :tabVal="tabVal"
                @handleSetting="handleSetting"
                @showDetail="showDetailData"
                @changePointLimit="changePointLimit"
              ></data-card>
            </div>
          </div>
          <!-- <empty v-if="!spinning && deviceData.length === 0" class="supply-bg-bg-card-DEFAULT" /> -->
        </w-spin>
      </div>
    </div>
    <!-- 历史数据 -->
    <DragModal
      ref="dragModal"
      :isDrag="true"
      :title="title"
      :isDraggable="false"
      :mask="true"
      :maskClosable="true"
      :isShowFullBtn="false"
      :width="modalWidth"
      :height="568"
      @close="closeModal"
    >
      <data-com
        :pumpId="pumpId"
        :pumpName="pumpName"
        :detailData="detailData"
        :modalWidth.sync="modalWidth"
        :exportPumpName="exportPumpName"
        :exportPointName="exportPointName"
        @close="$refs.dragModal.visible = false"
      >
      </data-com>
    </DragModal>

    <!-- 关联监测量 -->
    <relevance-info
      ref="infoModal"
      :item="{
        isShowSearch: true,
        isCheckAll: true,
        tabs: ['标准监测量', '非标监测量'],
        id: pointGroupId,
        title: '关联监测量',
        draggable: true,
        columns: [
          {
            title: '监测量',
            width: 60,
            dataIndex: 'pointName',
            ellipsis: true
          },
          {
            title: '监测量名称',
            dataIndex: 'pointMemo',
            ellipsis: true
          }
        ]
      }"
      @change="numChange"
    ></relevance-info>

    <!-- 编辑监测量 -->
    <edit-dialog :visible.sync="editDialogVisible" :form-data="editRow" @update="updateEditList" />

    <!-- 分时段照明配置 -->
    <DragModal
      ref="LightSet"
      :isDrag="false"
      :isShowFullBtn="false"
      title="监测量卡片配置"
      :width="848"
      :mask="true"
      :height="583"
    >
      <LightSet :waterPlantId="waterPlantId" @changeList="changeList"></LightSet>
    </DragModal>

    <!-- 单设备测试展示配置 -->
    <PointSet
      ref="PointSet"
      :waterPlantId="waterPlantId"
      :deviceInfor="devicePointsInfo"
      @selectChange="changePointList"
    ></PointSet>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import uuid from '@/utils/uuid';
import storage from '@/utils/storage';
import Sortable from 'sortablejs';
import dataCom from './components/dataCom.vue';
import dataCard from './components/dataCard.vue';
import LightSet from './components/lightSet.vue';
import PointSet from './components/pointSet.vue';
import DragModal from '@/components/DragModal/index.vue';
import FactorySelect from '@/components/factory-select/index.vue';
import {
  queryDeviceData,
  queryDeviceConfigs,
  getCorrectDeviceRealTimeData,
  queryMultiDeviceData,
  addOrUpdateDeviceConfig
} from '@/api/dataBoard';
import { listPointGroup } from '@/api/manage';
export default {
  name: 'data-overview',
  components: {
    dataCard,
    dataCom,
    PointSet,
    LightSet,
    DragModal,
    FactorySelect,
    relevanceInfo: () => import('./components/relevanceInfo.vue'),
    Empty: () => import('@/components/empty.vue'),
    EditDialog: () => import('@/views/runMonitor/components/jclEditParamsDialog.vue')
  },

  data() {
    return {
      tabs: [
        {
          label: '实时数据',
          value: 'realTime'
        },
        {
          label: '预测数据',
          value: 'forecast'
        },
        {
          label: '数据修正',
          value: 'dataCorrection'
        }
      ],
      tabVal: 'realTime',
      formSearch: {
        keyword: ''
      },
      zzyDevices: [],
      deviceData: [],
      devicePointsInfo: {},
      detailData: null,
      modalWidth: 1024,
      pumpId: '',
      pumpName: '',
      title: '', // 弹出层title
      exportPumpName: '', // 导出泵房名称
      exportPointName: '', // 组态监测量导出
      pointGroupId: '', //监测量数据看板id
      waterPlantId: '',
      editRow: null,
      editDialogVisible: false,
      spinning: false, //页面加载
      timer: null // 定时器
    };
  },
  watch: {
    tabVal: {
      handler(val) {
        if (val === 'dataCorrection') {
          this.initData();
        }
      }
    }
  },
  computed: {
    ...mapState('setting', ['buttonCodes']),
    powerBtns() {
      return this.tabs.filter(item => !!this.buttonCodes[item.value]);
    }
  },
  mounted() {
    this.getPointGroupId();
    // 添加定时器，每15秒请求一次数据
    this.timer = setInterval(() => {
      this.initData(false);
    }, 15000);
    this.initData(true);
    this.changeSort();
  },
  beforeDestroy() {
    // 组件销毁前清除定时器
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },
  methods: {
    changeSort() {
      const dom = document.querySelector('#cardCom');
      Sortable.create(dom, {
        animation: 150,
        filter: '.add-plate',
        chosenClass: '', // 被选中项的css 类名
        dragClass: 'sortable-chosen', // 正在被拖拽中的css类名
        onUpdate: evt => {
          // 根据索引找到展示的模块名称
          let newIndexValue = this.deviceData[evt.newIndex].deviceName;
          let oldIndexValue = this.deviceData[evt.oldIndex].deviceName;
          // // 根据拖动的模块名称找到总模块的拖动索引
          let index1 = this.deviceData.findIndex(item => item.deviceName === newIndexValue);
          let index2 = this.deviceData.findIndex(item => item.deviceName === oldIndexValue);
          // 交换两个模块的sort值
          [this.deviceData[index1].sort, this.deviceData[index2].sort] = [
            this.deviceData[index2].sort,
            this.deviceData[index1].sort
          ];
          let str = JSON.stringify(this.deviceData);
          storage.set('dataOverview', str);
        }
      });
    },
    changePointList() {
      this.initData();
    },
    handleSetting(deviceData) {
      this.devicePointsInfo = deviceData;
      this.$refs.PointSet.visible = true;
    },
    devicePointSet() {
      this.$refs.LightSet.visible = true;
    },
    changeList(list) {
      this.initData();
    },
    initData(showLoading = true) {
      if (showLoading) this.spinning = true;
      let params = {
        waterPlantId: this.waterPlantId,
        keyword: this.formSearch.keyword
      };
      if (this.tabVal === 'dataCorrection') {
        params['statusOrder'] = false;
      }
      Promise.all([
        queryDeviceData(params),
        queryDeviceConfigs(params),
        queryMultiDeviceData(params)
      ])
        .then(result => {
          let deviceConfigs = result[1].resultData.configList ?? [];
          let singleDeviceData = result[0].resultData.map(item => {
            let config = deviceConfigs.find(v => v.industryDeviceId === item.deviceId);
            let deviceDataList = item.deviceDataList.map(point => {
              let isShow = true;
              if (config && !config.pointNameList.includes(point.pointName)) {
                isShow = false;
              }
              return {
                ...point,
                isFlicker:
                  (point.minValue || point.minValue == '0') &&
                  (point.maxValue || point.maxValue == '0') &&
                  (point.realPv < point.minValue || point.realPv > point.maxValue),
                isShow
              };
            });
            return {
              ...item,
              uid: uuid(),
              isSet: true,
              deviceDataList
            };
          });
          let multiDeviceData = result[2].resultData.map(item => {
            let deviceDataList = item.deviceDataList.map(point => {
              return {
                ...point,
                isFlicker:
                  (point.minValue || point.minValue == '0') &&
                  (point.maxValue || point.maxValue == '0') &&
                  (point.realPv < point.minValue || point.realPv > point.maxValue),
                pointMemoAlias: `${point.industryDeviceName}_${point.pointMemoAlias}`
              };
            });
            return {
              ...item,
              uid: uuid(),
              deviceDataList,
              isSet: false,
              deviceName: item.name
            };
          });

          let originDevicesData = [...multiDeviceData, ...singleDeviceData];
          this.deviceData = this.handleSortData(originDevicesData);
        })
        .finally(() => {
          if (showLoading) this.spinning = false;
        });
    },
    handleSortData(data) {
      // 1. 获取并解析缓存数据
      const storageData = JSON.parse(storage.get('dataOverview') || '[]');
      // 2. 无缓存时直接处理新增数据
      if (storageData.length === 0) {
        return this.addSortIndex(data);
      }
      // 3. 确保storageData已按sort字段排序 ✅ 修复排序问题
      const sortedStorageData = [...storageData].sort((a, b) => a.sort - b.sort);

      // 4. 使用Map优化查找性能（O(1)复杂度）
      const storageMap = new Map(sortedStorageData.map(item => [item.deviceName, item]));

      // 5. 分离新增数据（storage中不存在的项）
      const newData = data.filter(item => !storageMap.has(item.deviceName));
      // 6. 合并数据：新增数据在前，已存数据在后 ✅ 满足新增项置顶
      const mergedData = [...newData, ...sortedStorageData];
      // 7. 重新生成排序索引
      return this.addSortIndex(mergedData);
    },
    addSortIndex(list) {
      return list.map((item, index) => {
        return {
          ...item,
          sort: index
        };
      });
    },
    // 获取监测量数据看板id
    async getCorrectDeviceRealTimeData(deviceId, deviceData) {
      let params = {
        deviceType: 'INDUSTRY_DEVICE',
        period: '1',
        productCode: 'water_purification',
        hasOfflineData: true,
        displayType: [],
        devicePoints: [
          {
            deviceId,
            points: []
          }
        ]
      };
      let { status, resultData } = await getCorrectDeviceRealTimeData(params);
      if (status === 'complete') {
        let mappings = {
          NH3_cor: 'NH3N',
          NO3_cor: 'NO3'
        };
        deviceData.zzyDeviceData = resultData;
        deviceData?.deviceDataList?.forEach(item => {
          let zzyDeviceObj = deviceData.zzyDeviceData.find(
            v => mappings[v.pointName] === item.pointName
          );
          item['isZzyDevice'] = !!zzyDeviceObj ? true : false;
          item['zzyPv'] = !!zzyDeviceObj
            ? parseFloat(zzyDeviceObj.pointValue.toFixed(2))
            : undefined;
        });
      }
    },

    closeModal() {
      this.detailData = null;
      this.$refs.dragModal.visible = false;
    },
    // 展示详情数据
    showDetailData(item, deviceDataInfo) {
      this.detailData = {
        deviceIds: [deviceDataInfo.deviceId ?? item.industryDeviceId],
        pointIds: [item.pointName],
        type: 'single'
      };

      this.title = `${deviceDataInfo.deviceName}-${item.pointMemoAlias}监测量数据`;
      this.exportPumpName = deviceDataInfo.deviceName;
      this.exportPointName = item.pointMemoAlias;

      this.$refs.dragModal.visible = true;
    },
    changePointLimit(item, deviceDataInfo) {
      this.editRow = {
        ...item,
        ...deviceDataInfo
      };
      this.editDialogVisible = true;
    },
    updateEditList(values) {
      this.editRow = null;
      this.editDialogVisible = false;
    },
    //配置完成页面刷新
    numChange(status) {
      if (status) this.goSearch();
    },
    //查询
    async goSearch() {
      this.spinning = true;
      let params = {
        keyword: this.formSearch.keyword
      };
      await queryDeviceData(params).then(res => {
        this.deviceData = res.resultData;
      });
      this.spinning = false;
    },
    // 切换tab
    changeTab(tab) {
      this.tabVal = tab;
    },
    // 配置
    setting() {
      if (this.$refs.infoModal) {
        this.$refs.infoModal['visible'] = true;
      }
    },
    // 获配置数据看板的监测量id
    async getPointGroupId() {
      let params = {
        type: '',
        keyWord: '',
        nameCode: 'data_board_page',
        page: { current: 1, size: 15 }
      };
      let { status, resultData } = await listPointGroup(params);
      if (status === 'complete' && resultData) {
        this.pointGroupId = resultData.records[0]?.id || '';
      }
    }
  }
};
</script>

<style scoped lang="less">
.data-overview {
  height: 100%;
  &-tap {
    height: 50px;
    border-radius: 4px;
    margin-bottom: 12px;
    position: relative;
    span {
      display: inline-block;
      height: 100%;
      width: 140px;
      font-size: 14px;
      color: #999999;
      text-align: center;
      font-weight: 400;
      line-height: 48px;
      cursor: pointer;
      &.active {
        color: var(--supply-color-primary-DEFAULT);
        border-bottom: 2px solid var(--supply-color-primary-DEFAULT);
      }
    }
    .search {
      position: absolute;
      right: 24px;
      top: 7px;
    }
  }
  &-body {
    background: var(--supply-rgb-color-bg-card-DEFAULT);
    .manage-seach {
      padding: 12px;
      border-radius: 4px;
    }
    .delete-link {
      margin-right: 12px;
    }
    .pagination-con {
      text-align: right;
      padding: 12px 20px;
    }
    .data-overview-card {
      height: 100%;
      position: relative;
      /deep/ .wpg-spin-container {
        height: 100%;
      }
      /deep/.wpg-spin-nested-loading,
      /deep/.wpg-spin-container {
        height: 100%;
      }
      .wpg-spin {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
      }
      .card-content {
        height: 100%;
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        padding: 12px 8px 12px 20px;
        overflow-y: scroll;
      }
    }
  }
}
</style>
