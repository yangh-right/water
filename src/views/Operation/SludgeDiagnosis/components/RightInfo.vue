<template>
  <div class="content-right">
    <div class="right-top">
      <span class="title">设备监控</span>
      <w-button type="link" @click="showMore"> 更多 </w-button>
    </div>
    <div class="right-cont">
      <div class="cont-filter">
        <div class="form-item">
          <div class="form-label">选择时间:</div>
          <w-date-picker
            class="select-item"
            style="width: 202px"
            v-model="picTime"
            format="YYYY-MM-DD HH:00"
            :show-time="{ format: 'HH' }"
            placeholder="请选择时间"
            :disabled-date="disabledDate"
            :disabled-time="disabledDateTime"
            @ok="picTimeChange"
          />
        </div>
      </div>
      <div class="pic-box">
        <div class="pic-div">
          <img
            v-if="imgArr.length > 0"
            class="main-pic"
            @click="showBigPic"
            :src="chooseImg"
            alt=""
            :title="imgTitle"
          />
          <w-empty v-else style="width:260px;margin:auto" description="暂无数据"></w-empty>
        </div>
        <div class="btn left-btn" @click="handleImage('left')">
          <w-icon type="ic_chevron_left" class="ic-btn" />
        </div>
        <div class="btn right-btn" @click="handleImage('right')">
          <w-icon type="ic_chevron_right" class="ic-btn" />
        </div>
        <w-spin :spinning="imgLoading" class="chart-spin"></w-spin>
      </div>
      <div class="bottom-box">
        <div class="item-center">
          <img src="@/assets/images/default/sludge_cabinet.png" alt="" />
        </div>
        <div class="item-footer">
          污泥检测柜设备尺寸为650X510X1200mm（长x宽x高），主要用于检测好氧池1末端的污泥性能。
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import moment from 'moment';
import serverConfig from '@/config/server.config';
import { remoteCtrl } from '@/api/runMonitor';
import {
  getActivatedSludgeDeviceData,
  getSludgeImageList,
  getOneDevice
} from '@/api/deviceManagement';
import { isThisISOWeek } from 'date-fns';
import returnControl from '@/components/returnControl';
export default {
  name: 'RightInfo',
  props: {
    deviceId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      picTime: this.$moment(),
      pool: 'code1',
      poolsOptions: [
        {
          label: '1#池',
          value: 'code1'
        },
        {
          label: '2#池',
          value: 'code2'
        },
        {
          label: '3#池',
          value: 'code3'
        }
      ],
      pointsArr: [],
      industryDeviceId: undefined,
      imgLoading: false,
      imgArr: [],
      currentIndex: 0,
      chooseImg: '',
      imgTitle: ''
    };
  },
  watch: {
    deviceId(val) {
      if (val) {
        this.init(val);
      } else {
        this.pointsArr = [];
        this.chooseImg = '';
        this.imgTitle = '';
      }
    }
  },
  methods: {
    init(deviceId) {
      this.getIndustryDeviceId(deviceId);
      this.deviceData();
      this.picTimeChange();
    },
    async getIndustryDeviceId(deviceId) {
      const res = await getOneDevice({
        deviceId: deviceId
      });
      if (!res.resultData || !res.resultData.industryDeviceId) {
        return;
      }
      this.industryDeviceId = res.resultData.industryDeviceId;
    },
    async deviceData() {
      const { status, resultData } = await getActivatedSludgeDeviceData(this.deviceId);
      if (status === 'complete') {
        resultData?.forEach(item => {
          item['setValue'] = !!item.pointValue;
        });
        this.pointsArr = resultData;
      }
    },
    showMore() {
      let startPic = this.$moment(this.picTime)
        .subtract(2, 'h')
        .format('YYYY-MM-DD HH:00');
      let endPic = this.picTime.format('YYYY-MM-DD HH:00');
      this.drillDown({
        path: '/Operation/SludgeDiagnosis/DeviceMonitor',
        query: { deviceId: this.industryDeviceId, startPic, endPic }
      });
    },
    // 监控图片
    async picTimeChange(options = {}) {
      this.imgLoading = true;
      this.currentIndex = 0;
      this.imgArr = [];
      let startPic = this.$moment(this.picTime)
        .subtract(2, 'h')
        .format('YYYY-MM-DD HH:00');
      let endPic = this.picTime.format('YYYY-MM-DD HH:00');
      // let minute = dateTime.slice(-1); // 时间向下取整 5倍率
      // let time = minute >= 5 ? dateTime.slice(0, -1) + '5' : dateTime.slice(0, -1) + '0';
      if (this.industryDeviceId === undefined) {
        await this.getIndustryDeviceId(this.deviceId);
      }
      let params = {
        industryDeviceId: this.industryDeviceId,
        collectionTimeStart: startPic,
        collectionTimeEnd: endPic
      };
      params = Object.assign({}, params, options);
      const { status, resultData } = await getSludgeImageList(params);
      if (status === 'complete' && Array.isArray(resultData) && resultData.length > 0) {
        resultData.forEach(item => {
          item['imageUrl'] = serverConfig.IMG_BASE_URL + item.imageUrl;
        });
        this.imgArr = resultData;
        this.chooseImg = this.imgArr[0].imageUrl;
        this.imgTitle = this.imgArr[0].pointName;
      } else {
        this.chooseImg = '';
        this.imgTitle = '';
      }
      this.imgLoading = false;
    },
    handleImage(direction) {
      if (this.imgArr.length > 0) {
        if (direction === 'left') {
          this.currentIndex = this.currentIndex - 1;
          if (this.currentIndex < 0) {
            this.currentIndex = this.imgArr.length - 1;
          }
        } else {
          this.currentIndex = this.currentIndex + 1;
          if (this.currentIndex >= this.imgArr.length) {
            this.currentIndex = 0;
          }
        }
        this.chooseImg = this.imgArr[this.currentIndex].imageUrl;
        this.imgTitle = this.imgArr[this.currentIndex].pointName;
      }
      // let param = {
      //   direction
      // };
      // // 加减时间
      // this.picTime =
      //   direction === 'left' ? this.picTime.subtract(5, 'm') : this.picTime.add(5, 'm');
      // this.picTimeChange(param);
    },
    poolChange() {},
    showBigPic() {
      this.$emit('showPic', this.chooseImg);
    },
    // 下控
    confirm(record, value, key = 'setValue', isRatio = true) {
      if (!record[key]) {
        this.$message.warn('该处未配置监测量');
        return;
      }
      if (value === '') {
        this.$message.warn('请先输入监测量');
        return;
      }
      let pointValue = value;
      if (isRatio) {
        // let realDataParam = key === 'setValue' ? 'pointValueRealData' : key + 'ValueRealData';
        // pointValue = Number(pointValue) / record[realDataParam].ratio;
        // if (!pointValue) {
        //   this.$message.warn('监测量值无效');
        //   return;
        // }
        // pointValue = pointValue.toFixed(record[realDataParam].truncateNum);
      }
      this.controlParam = {
        industryDeviceId: this.deviceId,
        values: { [record[key]]: Number(pointValue) }
      };
      if (!this.isCodeControl) {
        this.$confirm({
          zIndex: 1031,
          title: '提示',
          content: '确认进行此操作? ',
          onOk: () => {
            // this.$emit('changeLoading', true);
            remoteCtrl(this.controlParam)
              .then(res => {
                let { status, resultData } = res;
                if (status === 'complete') {
                  if (resultData.ret === -1) {
                    this.$message.error(resultData.msg);
                  } else {
                    this.$message.success(resultData.msg);
                    // this.updateData();
                  }
                }
              })
              .finally(() => {
                this.loading = false;
                // this.$emit('changeLoading', false);
              });
          }
        });
      } else {
        this.visible = true;
      }
    },
    /**
     * 选择日期不超过今天
     * @param {*} current
     */
    disabledDate(current) {
      return current && current > moment().endOf('day');
    },
    // 禁选时间
    disabledDateTime(date) {
      // 选中的时间
      const choosetime = moment(date).format('HH-mm-ss');
      const chooseday = parseInt(
        moment(date)
          .format('YYYY-MM-DD')
          .split('-')[2]
      );
      const chooseh = parseInt(choosetime.split('-')[0]);
      const choosem = parseInt(choosetime.split('-')[1]);
      // 当前时间
      const nowtime = moment().format('HH-mm-ss');
      const day = parseInt(
        moment()
          .format('YYYY-MM-DD')
          .split('-')[2]
      );
      const h = parseInt(nowtime.split('-')[0]);
      const m = parseInt(nowtime.split('-')[1]);
      const s = parseInt(nowtime.split('-')[2]);
      return {
        disabledHours: () => this.rangeHours(0, 24, h, chooseday, day),
        disabledMinutes: () => this.rangeMinutes(0, 60, m, chooseday, day, chooseh, h)
      };
    },
    rangeHours(start, end, value, chooseday, day) {
      const result = [];
      if (chooseday === day) {
        for (let i = start; i < end; i++) {
          if (i > value) {
            result.push(i);
          }
        }
      }
      return result;
    },
    rangeMinutes(start, end, value, chooseday, day, chooseh, h) {
      const result = [];
      if (chooseday === day && chooseh === h) {
        for (let i = start; i < end; i++) {
          if (i > value) {
            result.push(i);
          }
        }
      }
      return result;
    }
  }
};
</script>
<style lang="less" scoped>
@import '@/styles/switch.less';
.content-right {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border-radius: 4px;
  background: var(--supply-color-bg-card-DEFAULT);
  .right-top {
    width: 100%;
    background-color: var(--supply-color-bg-card-DEFAULT);
    padding: 12px;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .title {
      font-weight: 500;
    }
  }
  .right-cont {
    width: 100%;
    background-color: var(--supply-color-bg-card-DEFAULT);
    padding: 12px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;

    .cont-filter {
      width: 100%;
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      .form-item {
        width: calc(50% - -6px);
        display: flex;
        justify-content: space-between;
        align-items: center;

        .form-label {
          width: 70px;
          height: 20px;
          font-family: PingFangSC-Regular, sans-serif;
          font-weight: 400;
          font-size: 14px;
          color: var(--supply-color-secondary);
          letter-spacing: 0;
        }
      }
      .select-item {
        margin: 0 12px;
      }
    }
    .pic-box {
      width: 100%;
      height: 260px;
      position: relative;
      display: flex;
      justify-content: center;
      margin-bottom: 12px;
      .chart-spin {
        position: absolute;
        left: 50%;
        top: 50%;
        z-index: 10;
        transform: translate(-50%, -50%);
      }
      .pic-div {
        width: 100%;
        height: 100%;
        display: flex;
        overflow: hidden;
        cursor: pointer;
        .main-pic {
          height: auto;
          width: 100%;
        }
      }
      .btn {
        width: 32px;
        height: 32px;
        background: #ffffff26;
        border-radius: 50%;
        position: absolute;
        top: 50%;
        margin-top: -16px;
        text-align: center;
        cursor: pointer;
        &.left-btn {
          left: 12px;
        }
        &.right-btn {
          right: 12px;
        }
        .ic-btn {
          font-size: 22px;
          color: #fff;
          margin-top: 5px;
        }
      }
    }
    .bottom-box {
      width: 100%;
      flex: 1;
      display: flex;
      flex-direction: column;
      .item-center {
        height: 338px;
        display: flex;
        align-items: center;
        justify-content: center;
        img {
          height: 100%;
        }
      }
    }
  }
}
</style>
