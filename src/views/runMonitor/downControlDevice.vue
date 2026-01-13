<template>
  <div class="leakage-container">
    <div class="lt-tree">
      <device-tree
        :isReturnObj="true"
        :treeType="'device'"
        @onTreeChecked="onSelect"
        ref="device-tree"
      ></device-tree>
    </div>
    <div class="rg-content">
      <div class="content-top">
        <div class="top-left" ref="topLeft">
          <div class="table-header">
            <div class="btn-wrapper">
              <span class="rg-title">
                实时数据
              </span>
              <div class="fot-item">
                <div class="fot-label">监测量</div>
                <w-input
                  v-model="pointName"
                  style="width:200px"
                  placeholder="监测量/监测量名称"
                  allowClear
                  @change="handleSearch"
                ></w-input>
              </div>
              <div class="fot-item">
                <div class="fot-label">刷新时间(s)</div>
                <w-input-number
                  v-model="delayTime"
                  style="width:84px"
                  :min="0"
                  :max="999999999"
                  :precision="0"
                  :step="1"
                  placeholder="刷新时间(s)"
                  allowClear
                  @keyup.enter="setTimer"
                >
                </w-input-number>
              </div>
              <div class="fot-item">
                <div class="fot-label">停止刷新</div>
                <w-switch v-model="activeFlag" />
              </div>
            </div>
          </div>
          <div class="dev-info">
            <div class="table-warp">
              <w-table
                class="left-table"
                :columns="columns"
                :data-source="tableData"
                :pagination="false"
                :loading="loading"
                :rowKey="record => record.pointName"
                :scroll="{ y: scrollY }"
                :rowClassName="rowClassName"
              >
                <template slot="pointValue" slot-scope="text, record, index">
                  <span
                    v-if="
                      record.dataType === 'bool' &&
                        [0, 5].includes(record.displayType) &&
                        [0, 1].includes(text)
                    "
                  >
                    <w-icon
                      :type="record.displayType === 5 ? 'warning' : 'play-circle'"
                      theme="filled"
                      :style="{
                        color:
                          text === 0 ? '#334766' : record.displayType === 5 ? '#ff0000' : '#3FD747',
                        fontSize: '14px'
                      }"
                    ></w-icon>
                  </span>
                  <span v-else :class="{ 'point-alarm': isAlarm(record) }">{{
                    text == null ? '--' : text
                  }}</span>
                </template>
              </w-table>
            </div>
          </div>
        </div>
        <div class="top-right">
          <div class="right-header">
            <div class="btn-wrapper">
              <span class="rg-title">
                实时监控
              </span>
              <div class="fot-item">
                <div class="fot-label">选择监控</div>
                <a-select v-model="videoId" style="width: 240px">
                  <a-select-option
                    v-for="(item, index) of videoDetailList"
                    :key="index"
                    :value="item.videoId"
                  >
                    {{ item.videoName }}
                  </a-select-option>
                </a-select>
              </div>
            </div>
          </div>
          <div class="videoHIS">
            <h5-flow
              ref="h5Flow"
              v-if="videoDetailList.length"
              :videoNo="videoId"
              :playType="'1'"
              :queryTime="queryTime"
            ></h5-flow>
            <w-empty v-else class="empty"></w-empty>
          </div>
        </div>
      </div>

      <div class="content-bottom">
        <div class="bottom-header">
          <div class="btn-wrapper">
            <span class="rg-title">
              远程下控
            </span>
            <div class="fot-item">
              <w-button @click="goTo">下控日志</w-button>
            </div>
          </div>
        </div>
        <div class="bottom-content" v-if="downControlList.length">
          <div class="content-i" v-for="(item, index) of downControlList" :key="index">
            <div class="name">
              {{ item.pointGroupName }}
            </div>
            <div class="pointItem" v-for="(it, i) of item.data" :key="i">
              <div class="item" v-if="it.dataType === 'bool'">
                <span
                  >{{ it.pointMemo }}：<span v-if="!it.flag">{{ it.pointValue ? '开' : '关' }}</span
                  ><w-switch v-model="it.value" v-else
                /></span>
                <span>
                  <w-button v-if="!it.flag" size="small" @click="downControl(it, index, i)">
                    控
                  </w-button>
                  <w-button v-if="it.flag" size="small" @click="cancelDownControl(it, index, i)">
                    取消
                  </w-button>
                  <w-button
                    v-if="it.flag"
                    size="small"
                    type="primary"
                    style="margin-left: 6px;"
                    @click="oKDownControl(it, index, i)"
                  >
                    确定
                  </w-button>
                </span>
              </div>
              <div class="item" v-else>
                <span
                  >{{ it.pointMemo }}：<span v-if="!it.flag"
                    >{{ it.pointValue }}{{ it.pointUnit }}</span
                  ><w-input-number
                    v-model="it.value"
                    v-else
                    size="small"
                    :min="0"
                    :max="100000"
                    style="width: 80px;"
                /></span>
                <span>
                  <w-button v-if="!it.flag" size="small" @click="downControl(it, index, i)">
                    控
                  </w-button>
                  <w-button v-if="it.flag" size="small" @click="cancelDownControl(it, index, i)">
                    取消
                  </w-button>
                  <w-button
                    v-if="it.flag"
                    size="small"
                    style="margin-left: 6px;"
                    type="primary"
                    @click="oKDownControl(it, index, i)"
                  >
                    确定
                  </w-button>
                </span>
              </div>
            </div>
          </div>
        </div>
        <w-empty v-else class="empty"></w-empty>
      </div>
    </div>
    <!-- 短信验证弹框 -->
    <w-modal v-if="setMessageShow" v-model="setMessageShow" title="远程下控" :footer="false">
      <div class="form-wrapper">
        <w-form
          :form="uForm"
          :label-col="{ span: 7 }"
          :wrapper-col="{ span: 17 }"
          class="query-form"
          @submit="confirmCode"
        >
          <w-form-item>
            请输入 {{ phone.slice(0, 4) }}****{{ phone.slice(7, 11) }} 收到的验证码
          </w-form-item>
          <w-form-item label="请输入验证码">
            <w-input-search
              v-decorator.trim="[
                'code',
                {
                  rules: [
                    {
                      required: true,
                      message: '请输入'
                    }
                  ]
                }
              ]"
              class="msg-input"
              autocomplete="off"
              @search="getShortMsg"
            >
              <w-button slot="enterButton">
                <span class="supply-text-primary supply-text-xs">获取验证码</span>
              </w-button>
            </w-input-search>
          </w-form-item>
          <w-form-item :wrapper-col="{ span: 24 }">
            <w-button
              class="supply-float-right"
              style="margin-left: 5px"
              @click="setMessageShow = false"
              >取消</w-button
            >
            <w-button class="supply-float-right" type="primary" html-type="submit">确认</w-button>
          </w-form-item>
        </w-form>
      </div>
    </w-modal>
  </div>
</template>

<script>
import moment from 'moment';
import config from '@/config/setting.config';
import debounce from 'lodash.debounce';
import { getDeviceRealTimeData } from '@/api/analysis';
import DeviceTree from '@/components/Tree/deviceTree';
import { getSysParamByCode } from '@/api/index';
import {
  remoteCtrl, // 监测量下控
  getUserInfoByToken, // 查手机号
  getCode, // 验证码
  checkCode
} from '@/api/runMonitor';
import { getOneDevice, getDownPointGroup } from '@/api/deviceManagement';
import h5Flow from './components/H5Back.vue';
import { t } from '@/locale/useLocale';
let columns = [
  {
    title: '监测量名称',
    ellipsis: true,
    dataIndex: 'pointMemo',
    customRender: (val, row) => {
      return row['pointMemo'];
    }
  },
  {
    title: '当前值',
    ellipsis: true,
    dataIndex: 'pointValue',
    width: 100,
    scopedSlots: { customRender: 'pointValue' }
  },
  {
    title: '单位',
    ellipsis: true,
    width: 100,
    dataIndex: 'pointUnit'
  },
  {
    title: '更新时间',
    ellipsis: true,
    dataIndex: 'timestamp',
    width: 160
  }
];
export default {
  name: 'deviceStatus',
  components: {
    DeviceTree,
    h5Flow
  },
  data() {
    this.handleSearch = debounce(this.getDevicePoints, 500);
    return {
      uForm: this.$form.createForm(this, { name: 'getForm' }),
      phone: '',
      setMessageShow: false,
      setting: {
        playSite: '1' // 1手动播放 2循环播放
      },
      videoId: null,
      queryTime: [moment().subtract(2, 'day'), moment()],
      scrollY: 510,
      showSearch: true,
      itemData: {},
      selectDev: [], // 单选树设备ids
      loading: false,
      columns,
      tableData: [],
      copyTableData: [],
      activePoint: {}, // 默认监测量
      activeDeviceTimer: null,
      pageSiteId: '',
      pointName: '',
      delayTime: 2,
      activeFlag: false,
      videoDetailList: [],
      downControlList: [],
      downControlObj: null
    };
  },
  computed: {},
  watch: {
    delayTime: {
      handler(val) {
        if (!this.activeFlag) {
          if (this.activeDeviceTimer) {
            clearInterval(this.activeDeviceTimer);
          }
          this.activeDeviceTimer = setInterval(() => {
            this.getTableData();
          }, val * 1000);
        }
      }
    },
    activeFlag: {
      handler(val) {
        if (val) {
          if (this.activeDeviceTimer) {
            clearInterval(this.activeDeviceTimer);
            this.activeDeviceTimer = null;
          }
        } else {
          // 表格监测量数据查询
          this.activeDeviceTimer = setInterval(() => {
            this.getTableData();
          }, this.delayTime * 1000);
        }
      }
    }
  },
  activated() {
    if (this.videoDetailList.length > 0) {
      this.$refs.h5Flow.showPreview();
    }
  },
  mounted() {
    this.getPhone();
    this.updateTableHeight();
    window.addEventListener('resize', this.updateTableHeight);
  },
  methods: {
    updateTableHeight() {
      this.scrollY = this.$refs.topLeft.offsetHeight - 110;
      // 更新其他相关状态或触发相应逻辑
    },
    async onSelect(data) {
      console.log(data);
      // 重置当前数据图表
      this.pointName = '';
      this.videoDetailList = [];
      this.videoId = null;
      this.itemData = data.itemData;
      this.selectDev = data.selectedKeys;
      this.getDeviceDetail(this.itemData.data.id);
      this.getDownPointGroup(this.itemData.id);
      this.getTableData();
      // 每隔2s获取一次设备监测量;
      if (!this.activeFlag) {
        if (this.activeDeviceTimer) {
          clearInterval(this.activeDeviceTimer);
        }
        this.activeDeviceTimer = setInterval(() => {
          this.getTableData();
        }, this.delayTime * 1000);
      }
    },
    async getDeviceDetail(id) {
      let params = {
        deviceId: id
      };
      const { resultData } = await getOneDevice(params);
      if (resultData && resultData.videoDetailList.length > 0) {
        this.videoDetailList = resultData.videoDetailList;
        this.videoId = resultData.videoDetailList[0].videoId;
      } else {
        this.videoDetailList = [];
        this.videoId = null;
      }
    },
    async getDownPointGroup(id) {
      const { resultData } = await getDownPointGroup(id);
      this.downControlList = resultData.map((item, index) => {
        if (item.data.length > 0) {
          item.data = item.data.map((it, i) => {
            return {
              ...it,
              flag: false,
              value: it.dataType === 'bool' ? (it.pointValue ? true : false) : it.pointValue
            };
          });
        }
        return item;
      });
    },
    downControl(row, rowIndex, i) {
      this.downControlList.forEach((item, index) => {
        if (index === rowIndex) {
          item.data[i].flag = true;
        }
      });
    },
    cancelDownControl(row, rowIndex, i) {
      this.downControlList.forEach((item, index) => {
        if (index === rowIndex) {
          item.data[i].flag = false;
          item.data[i].value =
            item.data[i].dataType === 'bool'
              ? item.data[i].pointValue
                ? true
                : false
              : item.data[i].pointValue;
        }
      });
    },
    oKDownControl(row, rowIndex, i) {
      console.log('oKDownControl', row, rowIndex, i);
      this.downControlObj = row;
      getSysParamByCode('verificationControl').then(res => {
        if (res.resultData === 'true') {
          this.setMessageShow = true;
        } else {
          this.setMessageShow = false;
          this.downControlSubmit(row);
        }
      });
    },
    /* 询问是否提交下控操作 */
    downControlSubmit(row) {
      let vm = this;
      this.$confirm({
        title: '提示',
        content: '确认进行此操作? ',
        onOk: () => {
          let params = {
            industryDeviceId: row.deviceId,
            values: {}
          };
          params.values[row.pointCode] = row.dataType === 'bool' ? (row.value ? 1 : 0) : row.value;
          remoteCtrl(params).then(res => {
            let { status } = res;
            if (status === 'complete') {
              vm.$message.success('下控成功');
              vm.getDownPointGroup(row.deviceId);
            }
          });
        }
      });
    },
    confirmCode(e) {
      e.preventDefault();
      this.uForm.validateFields((err, values) => {
        if (!err) {
          let params = {
            code: values.code,
            phone: this.phone
          };
          checkCode(params).then(res => {
            if (res.status === 'complete') {
              this.setMessageShow = false;
              this.$message.success('验证成功');
              this.downControlSubmit(this.downControlObj);
            }
          });
        }
      });
    },
    getPhone() {
      getUserInfoByToken().then(res => {
        let {
          status,
          resultData: { phone }
        } = res;
        if (status === 'complete') {
          this.phone = phone;
        }
      });
    },
    /* 获取短信验证码 */
    getShortMsg() {
      getCode({ phone: this.phone }).then(res => {
        if (res.status === 'complete') this.$message.success('发送成功');
      });
    },
    isAlarm(record) {
      const pv =
        record?.pointValue || typeof record?.pointValue === 'number' ? record.pointValue : '--';
      const max =
        record?.maxValue || typeof record?.maxValue === 'number' ? record.maxValue : undefined;
      const min =
        record?.minValue || typeof record?.minValue === 'number' ? record.minValue : undefined;
      return (
        pv !== '--' &&
        (Number(pv) > Number(max) || Number(pv) < Number(min)) &&
        record.dataType !== 'bool'
      );
    },
    // 获取设备监测量数据
    async getTableData() {
      let params = {
        devicePoints: [
          {
            deviceId: this.selectDev.join(','),
            points: []
          }
        ],
        deviceType: 'INDUSTRY_DEVICE',
        productCode: config.productCode
      };

      let res = await getDeviceRealTimeData(params);
      if (res.status === 'complete') {
        this.copyTableData = [...res.resultData];
        if (this.copyTableData.length <= 0) {
          this.tips = '请选择设备或者监测量！';
        }
        this.getDevicePoints();
      }
    },
    getDevicePoints() {
      let val = this.pointName.trim();
      if (!!val) {
        this.tableData = this.copyTableData.filter(item => {
          return (item['pointMemo'] + item['pointName']).indexOf(val) > -1;
        });
      } else {
        this.tableData = this.copyTableData;
      }
    },
    rowClassName(record, index) {
      return record.pointName === this.activePoint.pointName ? 'blue' : '';
    },
    goTo() {
      this.drillDown({
        path: '/runMonitor/controlLog'
      });
    }
  },
  deactivated() {},
  beforeDestroy() {
    window.removeEventListener('resize', this.updateTableHeight);
    // 清除定时器
    if (this.activeDeviceTimer) {
      clearInterval(this.activeDeviceTimer);
    }
  }
};
</script>

<style lang="less" scoped>
@import '@/styles/switch.less';
.leakage-container {
  display: flex;
  height: 100%;
  justify-content: space-between;
  .lt-tree {
    width: 220px;
    height: 100%;
    padding: 12px;
    box-sizing: border-box;
    border-radius: 4px;
    background-color: var(--supply-color-bg-card-DEFAULT);
  }
  .rg-content {
    position: relative;
    width: calc(100% - 232px);
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    // background-color: var(--supply-color-bg-card-DEFAULT);
    .content-top {
      width: 100%;
      height: 74%;
      display: flex;
      justify-content: space-between;
      .top-left {
        padding: 12px;
        border-radius: 4px;
        background-color: var(--supply-color-bg-card-DEFAULT);
        width: 49.7%;
        height: 100%;
        .table-header {
          width: 100%;
          overflow-x: auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--supply-color-bg-card-DEFAULT);
          margin-bottom: 12px;
          border-radius: 4px;
          .rg-title {
            color: var(--supply-color-primary-DEFAULT);
            padding: 4px 10px 0px 0px;
            font-size: 16px;
            font-weight: 400;
          }
          .btn-wrapper {
            display: flex;
            justify-content: flex-end;

            .fot-item {
              display: flex;
              justify-content: flex-start;
              align-items: center;
              margin-right: 12px;

              .fot-label {
                margin-right: 6px;
              }
            }
          }
        }
        .dev-info {
          width: 100%;
          height: calc(100% - 92px);
          display: flex;
          justify-content: space-between;
          flex-direction: row;
        }
        .table-warp {
          width: 100%;
          border-radius: 4px;
          background: var(--supply-color-bg-card-DEFAULT);
          @-webkit-keyframes point_alarm {
            0% {
              color: #ff0000;
            }
            100% {
              color: rgba(255, 0, 0, 0.3);
            }
          }
          @keyframes point_alarm {
            0% {
              color: #ff0000;
            }
            100% {
              color: rgba(255, 0, 0, 0.3);
            }
          }
          .point-alarm {
            -webkit-animation: point_alarm 1s ease-in infinite;
            animation: point_alarm 1s ease-in infinite;
          }
          /deep/.wpg-table-tbody .blue {
            background-color: var(--supply-color-bg-DEFAULT) !important;
          }
          /deep/.wpg-table-placeholder {
            padding: 25% 16px !important;
          }
        }
      }
      .top-right {
        padding: 12px;
        border-radius: 4px;
        background-color: var(--supply-color-bg-card-DEFAULT);
        width: 49.7%;
        height: 100%;
        .right-header {
          width: 100%;
          overflow-x: auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--supply-color-bg-card-DEFAULT);
          margin-bottom: 12px;
          border-radius: 4px;
          .rg-title {
            color: var(--supply-color-primary-DEFAULT);
            padding: 4px 10px 0px 0px;
            font-size: 16px;
            font-weight: 400;
          }
          .btn-wrapper {
            display: flex;
            justify-content: space-between;
            width: 100%;

            .fot-item {
              display: flex;
              justify-content: flex-start;
              align-items: center;
              margin-right: 12px;

              .fot-label {
                margin-right: 6px;
              }
            }
          }
        }
        .videoHIS {
          width: 100%;
          height: calc(100% - 50px);
          display: flex;
          justify-content: center;
          align-content: center;
          /deep/.wpg-empty {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-content: center;
          }
        }
      }
    }
    .content-bottom {
      width: 100%;
      padding: 12px;
      height: 25%;
      border-radius: 4px;
      background-color: var(--supply-color-bg-card-DEFAULT);
      .bottom-header {
        width: 100%;
        overflow-x: auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: var(--supply-color-bg-card-DEFAULT);
        margin-bottom: 12px;
        border-radius: 4px;
        .rg-title {
          color: var(--supply-color-primary-DEFAULT);
          padding: 4px 10px 0px 0px;
          font-size: 16px;
          font-weight: 400;
        }
        .btn-wrapper {
          display: flex;
          width: 100%;
          justify-content: space-between;

          .fot-item {
            display: flex;
            justify-content: flex-start;
            align-items: center;
            margin-right: 12px;

            .fot-label {
              margin-right: 6px;
            }
          }
        }
      }
      .bottom-content {
        width: 100%;
        display: flex;
        overflow-x: auto;
        .content-i {
          width: 340px;
          height: 140px;
          border-radius: 4px;
          margin-right: 12px;
          // background: #f3f6f8;
          background: var(--supply-color-table-interval);
          padding: 10px;
          .name {
            width: 100%;
            display: flex;
            align-content: center;
            justify-content: space-between;
            .switch {
              display: flex;
              align-content: center;
            }
          }
          .pointItem {
            width: 100%;
            margin-top: 10px;
            .item {
              width: 100%;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
          }
        }
      }
    }
  }
}
</style>
