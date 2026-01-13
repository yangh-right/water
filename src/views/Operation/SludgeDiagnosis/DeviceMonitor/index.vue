<template>
  <div class="device-page">
    <w-detail-header pageTitle="活性污泥照片" backBtnText="返回" @handleBack="goBack" />
    <div class="page-content">
      <w-row class="manage-seach">
        <w-form-model
          ref="formSearch"
          layout="inline"
          :model="formSearch"
          class="door-query-form"
          @submit="handleSubmit"
          @submit.native.prevent
        >
          <w-col class="supply-float-left">
            <w-form-model-item label="时间段" prop="picTime">
              <w-range-picker
                v-model="formSearch.picTime"
                style="width: 386px"
                :disabled-date="disabledDate"
                :disabled-time="disabledDateTime"
                :show-time="{ format: 'HH' }"
                format="YYYY-MM-DD HH:00"
              />
            </w-form-model-item>
          </w-col>
          <w-col class="supply-float-left">
            <w-form-model-item label="指标" prop="indicatorName">
              <w-select
                v-model="formSearch.indicatorName"
                style="width: 202px"
                placeholder="选择指标"
              >
                <w-select-option v-for="item in pointList" :key="item.value" :value="item.value">
                  {{ item.label }}
                </w-select-option>
              </w-select>
            </w-form-model-item>
          </w-col>
          <w-col class="supply-float-right">
            <w-form-model-item>
              <w-button class="btn-item" type="primary" icon="search" html-type="submit"
                >查询</w-button
              >
              <w-button class="btn-item supply-mr-1" icon="reload" @click="reset">重置</w-button>
            </w-form-model-item>
          </w-col>
        </w-form-model>
      </w-row>
      <div class="pic-box">
        <div class="pic-list">
          <template v-if="picList.length > 0">
            <div class="pic-item" v-for="item in picList" :key="item.id">
              <img :src="item.imageUrl" :title="item.indicatorName" class="img" />
              <div class="pic-info">{{ item.collectionTime }}</div>
              <w-spin :spinning="imgLoading" class="chart-spin"></w-spin>
            </div>
          </template>
          <w-empty v-else style="width:260px;margin:auto" description="暂无数据"></w-empty>
        </div>
        <div class="page-box">
          <w-pagination
            class="page"
            :current="page.current"
            :page-size="page.size"
            :total="total"
            show-less-items
            @change="changePage"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import moment from 'moment';
import serverConfig from '@/config/server.config';
import { getSludgeImageList } from '@/api/deviceManagement';
export default {
  name: 'DeviceMonitor',
  inject: ['closeTab'],
  data() {
    return {
      formSearch: {
        picTime: [moment().subtract(1, 'd'), moment()],
        pointName: undefined
      },
      pointList: [
        {
          label: 'SV5',
          value: 'SV5'
        },
        {
          label: 'SV10',
          value: 'SV10'
        },
        {
          label: 'SV30',
          value: 'SV30'
        }
      ],
      deviceId: '',
      picList: [],
      imgLoading: false,
      page: {
        size: 6,
        current: 1
      },
      total: 0
    };
  },
  created() {
    let { deviceId, startPic, endPic } = this.$route.query;
    if (deviceId) {
      this.deviceId = deviceId;
      this.formSearch.picTime[0] = this.$moment(startPic);
      this.formSearch.picTime[1] = this.$moment(endPic);
      this.getImageList();
    }
  },
  methods: {
    // 监控图片
    async getImageList(options = {}) {
      this.imgLoading = true;
      let startTime = this.formSearch.picTime[0].format('YYYY-MM-DD HH:00');
      let endTime = this.formSearch.picTime[1].format('YYYY-MM-DD HH:00');
      // let startMinute = startTime.slice(-1); // 时间向下取整 5倍率
      // let startPic = startMinute >= 5 ? startTime.slice(0, -1) + '5' : startTime.slice(0, -1) + '0';
      // let endMinute = endTime.slice(-1); // 时间向下取整 5倍率
      // let endPic = endMinute >= 5 ? endTime.slice(0, -1) + '5' : endTime.slice(0, -1) + '0';

      let params = {
        industryDeviceId: this.deviceId,
        indicatorName: this.formSearch.indicatorName,
        collectionTimeStart: startTime,
        collectionTimeEnd: endTime
      };
      params = Object.assign({}, params, options);
      const { status, resultData } = await getSludgeImageList(params);
      if (status === 'complete' && resultData.length > 0) {
        let data = resultData;
        data.forEach(item => {
          item['imageUrl'] = serverConfig.IMG_BASE_URL + item.imageUrl;
        });
        this.total = data.length;
        const maxPage = Math.ceil(this.total / this.page.size) || 1;
        if (this.page.current < 1) this.page.current = 1;
        if (this.page.current > maxPage) this.page.current = maxPage;
        const startIndex = (this.page.current - 1) * this.page.size; 
        const endIndex = startIndex + this.page.size;       
        this.picList = data.slice(startIndex, endIndex);
      } else {
        this.page = {
          size: 6,
          current: 1
        };
        this.picList = [];
      }
      this.imgLoading = false;
    },
    goBack() {
      this.closeTab(this.$route.path);
    },
    changePage(current) {
      this.page.current = current;
      this.getImageList();
    },
    handleSubmit() {
      this.page.current = 1;
      this.getImageList();
    },
    reset() {
      this.$refs.formSearch.resetFields();
      this.handleSubmit();
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
.device-page {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  .manage-seach {
    padding: 12px;
    display: flex;
    flex-flow: wrap;
    border-radius: 4px;
    background: var(--supply-color-bg-card-DEFAULT);
    .door-query-form {
      width: 100%;
      .wpg-form-item {
        margin-right: 12px;
        .screen-group {
          .wpg-radio-button-wrapper {
            width: auto !important;
          }
        }
        .btn-item {
          margin-left: 12px;
        }
      }
    }
    /deep/ .tree-select-container {
      .wpg-select {
        position: relative;
        top: 1px;
      }
    }
  }
  .page-content {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  .pic-box {
    flex: 1;
    width: 100%;
    margin-top: 12px;
    background-color: var(--supply-color-bg-card-DEFAULT);
    border-radius: 4px;
    padding: 16px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    .pic-list {
      flex: 1;
      display: flex;
      flex-wrap: wrap;
      .pic-item {
        width: calc(33% - 24px);
        margin-right: 12px;
        margin-bottom: 12px;
        display: flex;
        flex-direction: column;
        position: relative;

        .chart-spin {
          position: absolute;
          left: 50%;
          top: 50%;
          z-index: 10;
          transform: translate(-50%, -50%);
          margin-top: -24px;
        }
        &:nth-of-type(3n) {
          margin-right: 0;
        }
        .img {
          width: auto;
          height: 250px;
        }
        .pic-info {
          width: 100%;
          margin-top: 10px;
        }
      }
    }
    .page-box {
      width: 100%;
      display: flex;
      flex-direction: row-reverse;
      .page {
        width: 300px;
      }
    }
  }
}
</style>
