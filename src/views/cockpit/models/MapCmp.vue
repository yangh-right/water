<template>
  <div class="container">
    <!-- 标题区域，显示当前水厂名称 -->
    <div :class="[themeColor ? 'default-title' : 'dark-title', 'pump-title']">
      <!-- 水厂选择下拉菜单 -->
      <w-dropdown placement="bottomLeft" :trigger="['hover']">
        <div class="drop-name">{{ factoryName }}</div>
        <w-menu slot="overlay" :selectedKeys="[factoryId]" @click="changeSort">
          <w-menu-item v-for="item in factoryList" :key="item.id">{{
            item.stationName
          }}</w-menu-item>
        </w-menu>
      </w-dropdown>
    </div>
    <!-- 3D配置区域 -->
    <div class="configuration">
      <!-- 3D配置组件 -->
      <Configuration3D v-if="url3D" :graphIndex="url3D"></Configuration3D>
      <!-- 无配置时的默认显示 -->
      <div v-else class="no-config">
        <img class="no-img" src="@/assets/images/default/icon_nothing.png" />
      </div>
    </div>
    <!-- 底部表格区域 -->
    <div class="footer">
      <w-config-provider>
        <!-- 设备数据表格 -->
        <w-table
          :loading="loading"
          :columns="columns"
          :data-source="data"
          :scroll="{ x: 545, y: 102 }"
          :pagination="false"
          rowKey="id"
        >
        </w-table>
        <!-- 空状态显示 -->
        <template #renderEmpty>
          <w-empty id="ssmal" style="margin:auto" size="small"></w-empty>
        </template>
      </w-config-provider>
    </div>
  </div>
</template>

<script>
import uuid from '@/utils/uuid';
import { accessToken } from '@wpg/framework-vue';
import { GetSiteSvgBySiteCode, getPumpDetailGraph } from '@/api/configuration';
import { getMiddleRealData } from '@/api/cockpit.js';
import Configuration3D from '@/views/runMonitor/components/configuration3D.vue';
export default {
  name: 'MapCmp',
  components: {
    // 3D配置组件
    Configuration3D
  },
  props: {
    // 是否全屏
    isFull: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      factoryList: [], // 水厂列表
      svgList: [],
      factoryId: '', // 当前水厂ID
      factoryName: '', // 当前水厂名称
      url3D: '', // 3D配置URL
      svgId: '',
      columns: [], // 表格列配置
      baseTableData: [], // 基础表格数据
      conditionList: [],
      data: [], // 表格数据
      loading: false // 加载状态
    };
  },
  inject: ['state'],
  computed: {
    // 根据主题设置标题颜色
    themeColor() {
      if (this.state.theme !== 'dark') {
        return true;
      } else {
        return false;
      }
    }
  },
  watch: {},
  methods: {
    // 获取水厂列表
    async getFactoryList() {
      const { resultData, status } = await this.$http.post('waterPlantClient/getWaterPlants');
      if (status === 'complete') {
        this.factoryList = resultData;
        this.factoryId = this.factoryList[0].id;
        this.factoryName = this.factoryList[0].stationName;
        this.get3DUrl();
        this.initData(this.factoryId);
        this.$emit('handleChange', this.factoryId);
      }
    },
    // 切换水厂
    changeSort(e) {
      this.factoryList.forEach((item, index) => {
        if (item.id === e.key) {
          this.factoryId = item.id;
          this.factoryName = item.stationName;
        }
      });
      this.get3DUrl();
      this.initData(e.key);
      this.$emit('handleChange', e.key);
    },
    // 获取3D配置URL
    get3DUrl() {
      getPumpDetailGraph({
        stationIds: [this.factoryId],
        type: 'complete_flow'
      }).then(res => {
        let { status, resultData } = res;
        if (status === 'complete' && resultData?.length > 0) {
          const token = accessToken.get();
          let i = resultData[0]?.previewUrl.indexOf('/wpgEditor');
          this.url3D = resultData[0]?.previewUrl.slice(i);
        } else {
          this.url3D = '';
        }
      });
    },
    // 初始化数据，获取实时数据
    async initData(id) {
      this.loading = true;
      let { status, resultData } = await getMiddleRealData(id);
      if (status === 'complete') {
        this.baseTableData = resultData;
        this.dealData();
      }
      this.loading = false;
    },
    // 处理数据
    dealData() {
      let data = JSON.parse(JSON.stringify(this.baseTableData));
      let keys = Object.keys(this.baseTableData);
      if (keys.length === 0) return;
      this._dealTableData(data);
    },
    // 处理表格数据
    _dealTableData(data) {
      let arr = [];
      let baseColumns = [
        {
          title: '设备名称',
          align: 'center',
          dataIndex: 'deviceName'
        }
      ];
      let { deviceValues, pointNames } = data;
      // 处理表头数据
      pointNames.forEach(d => {
        let name = '';
        let unit = '';
        // 对单位特殊性处理
        if (d.indexOf('(') !== -1 && d.indexOf('()') !== -1) {
          let nameunit = d.split('(');
          name = nameunit[0];
          if (d.indexOf('()') !== -1) {
            unit = '--';
          } else {
            unit = nameunit[1].split(')')[0];
          }
        } else {
          name = d;
          unit = '--';
        }
        baseColumns.push({
          title: (
            <div>
              <span title={name} class="form-title">
                {name}
              </span>
              <br />
              <span class="form-unit">（{unit}）</span>
            </div>
          ),
          align: 'center',
          ellipsis: true,
          dataIndex: `${d}`,
          customHeaderCell: () => {
            return {
              style: {
                'min-width': '100px',
                'max-width': '200px'
              }
            };
          },
          customRender: (text, row, index) => {
            let _text = text || text == '0' ? text : '--';
            return _text;
          }
        });
      });
      this.columns = baseColumns;
      for (let key in deviceValues) {
        let obj = { id: uuid(), deviceName: key };
        deviceValues[key].forEach(item => {
          obj[item.deviceName] = item.value;
        });
        arr.push(obj);
      }
      this.data = arr;
    },
    // 设置列值
    setColValues(obj) {
      let { data, arr, keys } = obj;
      keys.forEach(key => {
        let obj = {};
        obj['deviceName'] = key;
        data[key].forEach(item => {
          let { pointName, realPv } = item;
          obj[pointName] = realPv;
        });
        arr.push(obj);
      });
    }
  },
  created() {
    this.getFactoryList();
  },
  mounted() {}
};
</script>

<style lang="less" scoped>
.container {
  height: 100%;
  background: var(--bgc4);
  position: relative;
  display: flex;
  flex-direction: column;
  .factory-box {
    width: 234px;
    height: 300px;
    background: red;
  }
  .no-config {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    height: 100%;
    .no-img {
      margin-bottom: 20px;
      height: 60%;
    }
  }

  .pump-title {
    width: 100%;
    line-height: 44px;
    font-family: PingFangSC-Medium, sans-serif;
    font-weight: 500;
    font-size: 20px;
    letter-spacing: 0;
    text-align: center;
    flex: 0 0 44px;
  }
  .default-title {
    color: #728dac;
    background: url('~@/assets/images/default/station_nam.png') no-repeat center center;
    background-size: 100% 100%;
  }
  .dark-title {
    color: #ffffff;
    background: url('~@/assets/images/dark/station_nam.png') no-repeat center center;
    background-size: 100% 100%;
  }
  .drop-name {
    width: 234px;
    margin: 0 auto;
    cursor: pointer;
  }
  .configuration {
    flex: 1;
  }
  .footer {
    flex: 0 0 134px;
    padding: 12px;
    box-sizing: border-box;

    .form-unit {
      color: var(--supply-color-third);
    }
  }
}
</style>
