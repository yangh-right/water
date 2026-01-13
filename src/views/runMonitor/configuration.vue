<!--
 * @Author: liuct
 * @Date: 2020-12-31 13:59:58
 * @LastEditTime: 2023-05-09 15:38:28
 * @LastEditors: Do not edit
 * @Description: 污水厂组态
-->
<template>
  <div class="configuration-con">
    <div class="config-left wbgc-card">
      <device-tree :treeType="'station'" @onTreeChecked="onSelect" ref="device-tree"></device-tree>
    </div>
    <div class="config-right supply-bg-bg-card-DEFAULT">
      <!-- <div class="config-switch">
        <w-radio-group v-show="url3D" v-model="dimension">
          <w-radio :value="'2'">2.5D</w-radio>
          <w-radio :value="'3'">3D</w-radio>
        </w-radio-group>
      </div> -->
      <Configuration
        v-if="svgId && dimension === '2'"
        ref="Configuration"
        :svgId="svgId"
        :pumpId="pumpId"
        :svg-zoom="svgZoom"
        @element:click="handleElementClick"
        @resetZoom="svgZoom = 1.0"
        @showAlarm="showAlarm"
        @changeTime="
          val => {
            time = val;
          }
        "
      />
      <Configuration3D v-if="dimension === '3' && url3D" :graphIndex="url3D"></Configuration3D>
      <div class="no-config" v-if="(dimension === '2' && !svgId) || (dimension === '3' && !url3D)">
        <img class="no-img" src="@/assets/images/default/icon_nothing.png" />
        <!-- <div class="supply-text-primary supply-cursor-pointer">
          <span @click="$refs.addConfiguration.openModal()"><w-icon type="plus" />添加组态图</span>
        </div> -->
      </div>
      <!-- 报警 -->
      <div
        v-show="moreAlarm.length > 0 && dimension == '2' && svgId"
        :style="`right:${moreAlarmRight}px`"
        class="alarm-more data-card"
      >
        <div
          class="title"
          @click="
            drillDown({
              path: '/diagnosis/alarmCenter'
            })
          "
        >
          更多报警 <w-icon type="ic_chevron_right" class=" supply-text-lg"></w-icon>
        </div>
        <div class="alarm-list-block">
          <div
            v-for="(item, index) in moreAlarm"
            :key="index"
            :class="`alarm${item.alarmLevel} alarm-list-item`"
            :title="`${item.alarmName}(${item.locationName ? item.locationName : item.deviceName})`"
            @click="alarmModel(item)"
          >
            <div>{{ item.level }}</div>
            <span>{{
              `${item.alarmName}(${item.locationName ? item.locationName : item.deviceName})`
            }}</span>
          </div>
        </div>
      </div>
    </div>
    <!-- 下控 -->
    <w-modal
      title="参数下控"
      :visible="visible"
      :confirmLoading="loading"
      class="control-modal secondary-modal"
      width="480px"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <w-form-model ref="form" :model="form" :rules="rules" v-bind="layout">
        <w-form-model-item v-show="formValueVisible" label="下控监测量">
          {{ form.pointName }}
        </w-form-model-item>
        <w-form-model-item v-show="formValueVisible" label="当前值" prop="current">
          <w-input v-model="form.current" :addon-after="form.unit" />
        </w-form-model-item>
        <w-form-model-item v-show="formValueVisible" label="下控值" prop="value">
          <w-input-number
            v-model="form.value"
            style="width: 100%"
            placeholder="请输入下控值"
            :addon-after="form.unit"
          />
        </w-form-model-item>
        <w-form-model-item v-if="needCode" label="验证码" prop="code">
          <w-input v-model="form.code" placeholder="请输入验证码">
            <a
              v-if="messageTip === '发送验证码' || messageTip === '重新发送'"
              slot="addonAfter"
              @click="sendMessage"
            >
              {{ messageTip }}
            </a>
            <span v-else slot="addonAfter">{{ messageTip }}</span>
          </w-input>
          <div v-show="messageTip !== '发送验证码'" class="tips">
            已向手机号码
            <a href="">{{ phone.slice(0, 4) }}****{{ phone.slice(7, 11) }}</a>
            发送短信验证码
          </div>
        </w-form-model-item>
      </w-form-model>
    </w-modal>
    <!-- <DragModal
      ref="dragModal"
      :isDrag="type !== 'video'"
      :isTab="type === 'waterElect'"
      :title="title"
      :width="modalWidth"
      :height="568"
      @resize="drogModalResize"
    >
      <DetailData
        :type="type"
        :pumpId="pumpId"
        :pumpName="pumpName"
        :detailData="detailData"
        :tabId="tabId"
        :modalWidth.sync="modalWidth"
        :exportPumpName="exportPumpName"
        :exportPointName="exportPointName"
        @printCode="printCode"
        @close="$refs.dragModal.visible = false"
        @getPumpHouseScoreVO="getPumpHouseScoreVO"
      >
      </DetailData>
    </DragModal> -->
  </div>
</template>

<script>
// import DragModal from '@/components/DragModal/index.vue';
// import DetailData from './pumpDetail/model/detailData.vue';
import DeviceTree from './components/deviceTree';
import Configuration from '@/views/InspectConfigure/Configuration.vue';
import Configuration3D from './components/configuration3D.vue';
import { GetSiteSvgBySiteCode, getPumpDetailGraph } from '@/api/configuration';
import { getSysParamByCode } from '@/api';
import {
  getUserInfoByToken,
  getCode,
  checkCode,
  remoteCtrl,
  getPumpHouseScoreVO
} from '@/api/runMonitor';
export default {
  name: 'Configuration',
  components: {
    DeviceTree,
    Configuration,
    Configuration3D
    // DragModal,
    // DetailData
  },
  data() {
    return {
      pumpId: '',
      checkedKey: [],
      pageSiteId: '',
      svgZoom: 1.0,
      svgId: '',
      dimension: '3',
      url3D: '',
      modalWidth: 1024,
      loading: false,
      showReturnButton: true,
      rateInfo: {
        score: '',
        rank: ''
      },
      time: '--',
      phone: '',
      messageTip: '发送验证码',
      formValueVisible: true, // 下控弹窗用于显示值的表单项是否显示
      visible: false, // 下控弹窗是否显示
      layout: {
        labelCol: { span: 4 },
        wrapperCol: { span: 20 }
      },
      form: {
        current: '',
        value: '',
        code: '',
        unit: '',
        pointName: '',
        deviceId: '',
        pointId: ''
      },
      rules: {
        value: [{ required: true, message: '下控值不能为空' }],
        code: [{ required: true, message: '验证码不能为空' }]
      },
      // graphIndex: '', //改用计算属性
      title: '', // 弹出层title
      type: '', // 弹出层类型
      exportPumpName: '', // 导出泵房名称
      exportPointName: '', // 组态监测量导出
      pumpName: '',
      pumpStatus: '1', // 泵房状态,0-离线,1-在线,2-报警
      isFullScreen: false,
      detailData: null,
      moreAlarm: [],
      timer: null,
      qrCode: '',
      qrCodeVisible: false,
      moreAlarmRight: 18,
      tabId: '',
      needCode: false
    };
  },
  mounted() {
    this.getIsOrNoCode();
    this.getPhone();
  },
  methods: {
    onSelect(data) {
      this.pumpId = data[0];
      if (!data[0]) {
        this.$message.info('所选配置下无污水厂');
        return false;
      } else {
        // this.getSvgByPumpId();
        this.svgId = data[0];
        this.get3DUrl();
      }
    },
    // 根据污水厂id获取组态
    getSvgByPumpId() {
      GetSiteSvgBySiteCode(`${this.pumpId}/plant_info_svg`).then(res => {
        let { status, resultData } = res;
        if (status === 'complete') {
          this.pumpName = resultData.pumpName;
          this.svgId = resultData.id;
        } else {
          this.svgId = '';
        }
      });
    },
    get3DUrl() {
      getPumpDetailGraph({
        svgIds: [this.svgId]
      }).then(res => {
        let { status, resultData } = res;
        if (status === 'complete') {
          this.url3D = resultData?.[0]?.previewUrl;
        } else {
          this.url3D = '';
        }
        this.dimension = '3';
      });
    },
    handleOk() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.loading = true;
          if (this.needCode) {
            this.confirmCheckCode();
          } else {
            this.confirmControl();
          }
        } else {
          this.loading = false;
        }
      });
    },
    // 远程控制
    async remoteCtrl(params) {
      await new Promise((resolve, reject) => {
        remoteCtrl(params)
          .then(res => {
            if (res.status === 'complete' && res.resultData) {
              if (res.resultData.ret !== -1) {
                this.$message.success('下控成功');
                this.visible = false;
              } else {
                this.$message.warning(res.resultData.msg || '下控失败');
              }
            }
            resolve();
          })
          .finally(() => {
            this.loading = false;
          });
      }).catch(() => console.log('errors!'));
    },
    // 确认验证码
    confirmCheckCode() {
      let params = {
        code: this.form.code,
        phone: this.phone
      };
      checkCode(params).then(res => {
        if (res.status === 'complete') {
          // 验证验证码是否正确如果正确则调用下控接口否则提示
          this.$confirm({
            title: '提示',
            content: '确认进行下控操作? ',
            onOk: () => {
              let params = {
                industryDeviceId: this.form.deviceId,
                // values: { CumulativeFlow: '1.0' }
                values: {}
              };
              params.values[this.form.pointId] = this.form.value;
              return this.remoteCtrl(params);
            }
          });
        } else {
          this.loading = false;
        }
      });
    },
    // 确认是否下控
    confirmControl() {
      this.$confirm({
        title: '提示',
        content: '确认进行下控操作? ',
        onOk: () => {
          let params = {
            industryDeviceId: this.form.deviceId,
            // values: { CumulativeFlow: '1.0' }
            values: {}
          };
          params.values[this.form.pointId] = this.form.value;
          return this.remoteCtrl(params);
        }
      });
    },
    handleCancel() {
      this.form.value = '';
      this.form.code = '';
      this.form.deviceId = '';
      this.form.pointId = '';
      this.$refs.form.resetFields();
      this.messageTip = '发送验证码';
      this.visible = false;
      setTimeout(() => {
        this.formValueVisible = true;
      }, 1000);
    },
    showAlarm(alarmList) {
      this.moreAlarm = alarmList
        .sort((a, b) => {
          return a.alarmLevel - b.alarmLevel;
        })
        .map(v => {
          const level =
            v.alarmLevel === 1 ? 'Ⅰ' : v.alarmLevel === 2 ? 'Ⅱ' : v.alarmLevel === 3 ? 'Ⅲ' : 'Ⅳ';
          return { ...v, level };
        });
    },
    alarmModel(record) {
      const item = { name: '报警详情', code: 'alarm', checked: true };
      this.detailData = {
        alarmId: record.alarmHandlerDataId,
        typeCode: record.typeCode
      };
      this.showDetailData(item);
    },
    // 弹窗全屏事件，展示隐藏返回按钮，fix：弹窗关闭按钮和返回按钮重叠
    drogModalResize(isFullScreen) {
      this.showReturnButton = !isFullScreen;
    },
    printCode(src) {
      this.qrCode = src;
      this.qrCodeVisible = true;
      this.$refs.dragModal.visible = false;
    },
    getPumpHouseScoreVO() {
      getPumpHouseScoreVO(this.pumpId).then(res => {
        const { resultData } = res;
        if (!resultData) {
          return;
        }
        const num =
          resultData.forAllRank !== 0 && resultData.allTotal !== 0
            ? 100 - ((resultData.forAllRank / resultData.allTotal) * 100).toFixed()
            : 0;
        this.rateInfo = {
          score: resultData.pumpHouseScore,
          rank: num
        };
      });
    },
    // 展示详情数据
    showDetailData(item) {
      this.$refs.dragModal.visible = item.checked;
      if (!item.checked) {
        return;
      }
      this.title = item.name;
      this.type = item.code;
      this.exportPumpName = item.pumpName || this.pumpName;
      this.exportPointName = item.pointName || undefined;
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
    // 判断下控是否显示验证码
    getIsOrNoCode() {
      getSysParamByCode('control_phone_verification').then(res => {
        if (res.status === 'complete') {
          this.needCode = res.resultData === 'true' ? true : false;
        }
      });
    },
    // 设置下控参数弹窗里表单值
    setControlFormValue(attribute) {
      this.formValueVisible = true;
      this.form.pointName = attribute.codeElementObj.relationPoint;
      this.form.pointId = attribute.codeElementObj.codeId;
      this.form.unit = attribute?.codeElementObj?.pointUnit || '--';
      this.form.current = attribute?.codeElementObj?.pointValue || '--'; // svgElementAttribute.value;
      this.form.deviceId = attribute.deviceId;
    },
    handleElementClick(element, svgElementAttribute, type) {
      // 图片下控弹窗只显示验证码，只下控布尔值参数
      if (svgElementAttribute.svgElementType === 'img' && type === 'imgControl') {
        this.setControlFormValue(svgElementAttribute);
        this.form.value = Number(this.form.current) === 0 ? 1 : 0; // 当前值只有是0时才会下控1
        if (this.needCode) {
          this.formValueVisible = false;
          this.visible = true;
        } else {
          this.confirmControl();
        }
        return;
      }
      if (svgElementAttribute.callEventTypeValue) {
        if (type === 'control') {
          this.setControlFormValue(svgElementAttribute);
          this.visible = true;
          return;
        }
        const obj = {
          alarm: {
            item: { name: '报警详情', code: 'alarm', checked: true },
            data: {
              alarmId: svgElementAttribute.alarmId
            }
          },
          point: {
            item: {
              name: `${svgElementAttribute.codeElementObj.relationPoint}-监测量数据`,
              code: 'point',
              checked: true,
              pointName: svgElementAttribute.codeElementObj.relationPoint,
              pumpName: this.pumpName
            },
            data: {
              deviceIds: svgElementAttribute.deviceId ? [svgElementAttribute.deviceId] : '',
              pointIds: svgElementAttribute.codeElementObj.codeId
                ? [svgElementAttribute.codeElementObj.codeId]
                : '',
              type: 'single'
            }
          },
          video: {
            item: { name: `视频${svgElementAttribute.videoName}`, code: 'video', checked: true },
            data: {
              videoCode: svgElementAttribute.videoCode,
              videoName: svgElementAttribute.videoName,
              videoType: svgElementAttribute.videoType
            }
          }
        };
        this.detailData = obj[svgElementAttribute.callEventTypeValue].data;
        this.showDetailData(obj[svgElementAttribute.callEventTypeValue].item);
      }
    },
    sendMessage(text) {
      clearInterval(this.timer);
      const message = '重新发送';
      let countdown = 60;
      getCode({ phone: this.phone }).then(res => {
        if (res.status === 'complete') {
          this.timer = setInterval(() => {
            if (countdown === 0) {
              clearInterval(this.timer);
            }
            this.messageTip = countdown === 0 ? message : `${message}(${countdown}s)`;
            countdown--;
          }, 1000);
        }
      });
    }
  }
};
</script>

<style lang="less" scoped>
.configuration-con {
  display: flex;
  height: 100%;
  .config-left {
    width: 220px;
    height: 100%;
    padding: 12px;
    box-sizing: border-box;
    border-radius: 4px;
    background-color: var(--supply-color-bg-card-DEFAULT);
    margin-right: 12px;
  }
  .config-right {
    flex: 1;
    overflow: auto;
    position: relative;
    .alarm-more {
      font-size: 14px;

      position: absolute;
      z-index: 10;
      right: 18px;
      bottom: 12px;

      width: 236px;
      height: 170px;
      .title {
        display: flex;
        align-items: center;

        margin-bottom: 16px;
        padding: 16px 0 0 16px;

        cursor: pointer;
      }
      .alarm-list-block {
        overflow: auto;
        height: 70px;
        padding: 0 16px;
        .alarm-list-item {
          line-height: 32px;

          display: flex;
          align-items: center;

          width: 100%;
          height: 32px;
          margin-bottom: 6px;

          cursor: pointer;

          color: #fff;
          div {
            line-height: 24px;

            width: 24px;
            height: 24px;
            margin: auto 8px;

            text-align: center;

            border-radius: 55%;
          }
          span {
            overflow: hidden;
            flex: 1;

            white-space: nowrap;
            text-overflow: ellipsis;
          }
          &.alarm1 {
            background: #ff5568;
            > div {
              background: #ff5568;
            }
          }
          &.alarm2 {
            background: #ff922b;
            > div {
              background: #ff922b;
            }
          }
          &.alarm3 {
            background: #ffbf00;
            > div {
              background: #ffbf00;
            }
          }
          &.alarm4 {
            background: #9c73fb;
            > div {
              background: #9c73fb;
            }
          }
        }
      }
    }
    .data-card {
      font-size: 14px;
      margin-right: 10px;
      padding: 9px 16px;
      cursor: pointer;
      color: var(--supply-text-main);
      background-color: rgba(var(--supply-rgb-color-bg-DEFAULT), 0.5);
      backdrop-filter: blur(6px);
    }
    .config-switch {
      position: absolute;
      left: 15px;
      top: 10px;
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
  }
}
</style>
