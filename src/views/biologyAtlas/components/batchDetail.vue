<!--
 * @Author: wangyr
 * @Date: 2023-05-26 09:16:54
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-05-30 21:50:12
 * @Description:
-->
<template>
  <div class="batchDetail">
    <div class="batchDetail-head">
      <div class="head-l">
        <div class="text"><h3>整体统计</h3></div>
        <overallControl :statData="statData"></overallControl>
      </div>
      <div class="head-c">
        <div class="item">
          <div class="item-title">
            批次名称：
          </div>
          <div class="item-value">
            {{ batchDetailObj.batchName }}
          </div>
        </div>
        <div class="item">
          <div class="item-title">
            图片数量：
          </div>
          <div class="item-value">
            {{
              (batchDetailObj.microorganismBatchFileList &&
                batchDetailObj.microorganismBatchFileList.length) ||
                0
            }}张
          </div>
        </div>
        <div class="item">
          <div class="item-title">
            取样位置：
          </div>
          <div class="item-value">{{ batchDetailObj.sampleLocationText }}</div>
        </div>
        <div class="item">
          <div class="item-title">
            虫体种类：
          </div>
          <div class="item-value">{{ batchDetailObj.kindCount }}种</div>
        </div>
        <div class="item">
          <div class="item-title">
            取样时间：
          </div>
          <div class="item-value">{{ batchDetailObj.sampleTime }}</div>
        </div>
        <div class="item">
          <div class="item-title">
            虫体数量：
          </div>
          <div class="item-value">{{ batchDetailObj.quantity }}个</div>
        </div>
      </div>
      <div class="head-r">
        <w-button @click="goBack">返回</w-button>
      </div>
    </div>
    <div class="batchDetail-central">
      <div class="central-l">
        <div
          class="magnify-img"
          :style="{
            backgroundImage: `url(${imgObj.url})`
          }"
        ></div>
        <div class="img-list">
          <img-slider
            :imgList="imgList"
            :editPermission="false"
            :pumpCheckStatus="0"
            @checkedImg="checkedImg"
          />
        </div>
      </div>
      <div class="central-r">
        <div class="central-r-t">
          <div class="text"><h3>统计结果</h3></div>
          <div class="species">
            <div
              class="speciesItem"
              v-for="(item, index) of imgObj.list"
              :key="item.id"
              :class="index === speciesItem.index ? 'speciesItems' : ''"
              @click="speciesClick(item, index)"
            >
              <div
                class="img"
                :style="{
                  backgroundImage: `url(${getFileAccessUrl(item.atlasFileId, previewBaseUrl)})`
                }"
              ></div>
              <span>{{ item.atlasName }}</span>
              <div class="percentage">
                {{ item.accuracyRate ? item.accuracyRate + '%' : '' + '%' }}
              </div>
            </div>
          </div>
          <div class="speciesText">
            <div
              class="img"
              :style="{
                backgroundImage: `url(${speciesItem.url})`
              }"
            ></div>
            <div class="text-box">
              <span>形态特点：</span>
              <div class="textContent">
                {{ speciesItem.text }}
              </div>
            </div>
          </div>
        </div>
        <div class="central-r-b">
          <Bar-chart
            ref="pieChart"
            class="pieChart"
            :darkTheme="'light'"
            :defaultHighlight="true"
            :option="option"
          ></Bar-chart>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import overallControl from './overallControl';
import ImgSlider from './ImgSlider';
import serverConfig from '@/config/server.config';
import { atlasTrend } from '@/api/biologyAtlas';
import moment from 'moment';
export default {
  name: 'BiologyAtlas',
  components: {
    overallControl,
    ImgSlider,
    BarChart: () => import('@/components/chart/BarChart.vue')
  },
  props: {
    batchDetailObj: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      statData: [],
      imgList: [],
      previewBaseUrl: serverConfig.PUBLIC_API_BASE_URL + '/userCenterApi/FileManager/download/',
      imgObj: {
        url: '',
        list: ''
      },
      biologyList: [],
      option: {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            data: [],
            axisTick: {
              alignWithLabel: true
            }
          }
        ],
        yAxis: [
          {
            name: '个',
            type: 'value'
          }
        ],
        series: [
          {
            type: 'bar',
            barWidth: 20, //柱图宽度
            data: [],
            itemStyle: {
              normal: {
                barBorderRadius: [10, 10, 0, 0]
              }
            }
          }
        ]
      },
      speciesItem: {
        index: 0,
        text: '',
        url: ''
      }
    };
  },
  watch: {
    batchDetailObj(val) {
      if (val) {
        console.log(val);
        this.statData = val.statData;
        this.imgList = val.microorganismBatchFileList;
        if (this.imgList.length > 0) {
          this.imgObj = {
            url: this.getFileAccessUrl(this.imgList[0].fileId, this.previewBaseUrl),
            list: this.imgList[0].microorganismBatchFileResultList
          };
          if (this.imgList[0].microorganismBatchFileResultList.length > 0) {
            this.speciesItem = {
              index: 0,
              text: this.imgList[0].microorganismBatchFileResultList[0].trait,
              url: this.getFileAccessUrl(
                this.imgList[0].microorganismBatchFileResultList[0].atlasFileId,
                this.previewBaseUrl
              )
            };
            this.getAtlasTrend(this.imgList[0].microorganismBatchFileResultList[0].atlasId);
          }
        }
      }
    }
  },
  methods: {
    goBack() {
      this.$emit('goBack');
    },
    checkedImg(row) {
      console.log(row);
      this.imgUrl = row.url;
      this.imgObj = {
        url: row.url,
        list: row.microorganismBatchFileResultList
      };
      if (row.microorganismBatchFileResultList.length > 0) {
        this.speciesItem = {
          index: 0,
          text: row.microorganismBatchFileResultList[0].trait,
          url: this.getFileAccessUrl(
            row.microorganismBatchFileResultList[0].atlasFileId,
            this.previewBaseUrl
          )
        };
        this.getAtlasTrend(row.microorganismBatchFileResultList[0].atlasId);
      } else {
        this.speciesItem = {
          index: 0,
          text: '',
          url: ''
        };
        this.option = {
          ...this.option,
            xAxis: [
          {
            type: 'category',
            data: [],
            axisTick: {
              alignWithLabel: true
            }
          }
        ],
        series: [
          {
            type: 'bar',
            barWidth: 20, //柱图宽度
            data: [],
            itemStyle: {
              normal: {
                barBorderRadius: [10, 10, 0, 0]
              }
            }
          }
        ]
        };
      }
    },
    getFileAccessUrl(uniqueId, previewBaseUrl, subStr = serverConfig.PUBLIC_API_BASE_URL) {
      if (uniqueId?.startsWith(subStr) || uniqueId?.startsWith('http')) {
        return uniqueId;
      } else {
        return previewBaseUrl + uniqueId;
      }
    },
    speciesClick(row, index) {
      this.speciesItem = {
        index: index,
        text: row.trait,
        url: this.getFileAccessUrl(row.atlasFileId, this.previewBaseUrl)
      };
      this.getAtlasTrend(row.atlasId);
    },
    getAtlasTrend(id) {
      let params = {
        atlasId: id,
        endTime: moment().format('YYYY-MM-DD'),
        sampleLocation: this.batchDetailObj.sampleLocation,
        startTime: moment()
          .subtract(1, 'month')
          .format('YYYY-MM-DD'),
        waterPlantId: this.batchDetailObj.waterPlantId
      };
      atlasTrend(params).then(res => {
        if (res.status === 'complete') {
          let xData = [];
          let yData = [];
          res.resultData.forEach(item => {
            xData.push(item.dateTime);
            yData.push(item.count);
          });
          this.option = {
            ...this.option,
            xAxis: [
              {
                type: 'category',
                data: xData,
                axisTick: {
                  alignWithLabel: true
                }
              }
            ],
            series: [
              {
                type: 'bar',
                barWidth: 20, //柱图宽度
                data: yData,
                itemStyle: {
                  normal: {
                    barBorderRadius: [10, 10, 0, 0]
                  }
                }
              }
            ]
          };
          console.log(res);
        }
      });
    }
  }
};
</script>

<style lang="less" scoped>
.batchDetail {
  width: 100%;
  height: 100%;
  .batchDetail-head {
    width: 100%;
    height: 185px;
    background-color: var(--supply-color-bg-card-DEFAULT);
    border-radius: 4px;
    display: flex;
    .head-l {
      width: 25%;
      height: 100%;
      padding: 10px;
    }
    .head-c {
      width: 65%;
      height: 100%;
      display: flex;
      flex-wrap: wrap;
      padding-top: 20px;
      .item {
        display: flex;

        width: 50%;
        .item-title {
          width: 75px;
          text-align: right;
          color: #999999;
        }
        .item-value {
          width: calc(100% - 75px);
        }
      }
    }
    .head-r {
      padding-top: 20px;
      padding-right: 10px;
      width: 10%;
      display: flex;
      justify-content: flex-end;
    }
  }
  .batchDetail-central {
    margin-top: 12px;
    width: 100%;
    height: calc(100% - 200px);
    display: flex;
    justify-content: space-between;
    .central-l {
      width: 49.6%;
      height: 100%;

      .magnify-img {
        width: 100%;
        height: calc(100% - 164px);
        margin-bottom: 12px;
        background-size: 100% 100%;
        background-position: center;
        background-repeat: no-repeat;
      }
      .img-list {
        background-color: var(--supply-color-bg-card-DEFAULT);
      }
    }
    .central-r {
      padding: 16px;
      width: 49.6%;
      height: 100%;
      background-color: var(--supply-color-bg-card-DEFAULT);
      .central-r-t,
      .central-r-b {
        width: 100%;
        height: 50%;
      }
      .central-r-t {
        .species {
          margin-top: 16px;
          width: 100%;
          height: 110px;
          display: flex;
          overflow-x: auto;
          .speciesItems {
            border: 1px solid var(--supply-color-online-border) !important;
            .percentage {
              background-color: var(--supply-color-online-border) !important;
              color: #ffffff !important;
            }
          }
          .speciesItem {
                 cursor: pointer;
            width: 86px;
            height: 100px;
            border: 1px solid var(--supply-color-border-DEFAULT);
            border-radius: 4px;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding-top: 10px;
            justify-content: space-between;
            margin-right: 10px;
            overflow: hidden;
            .img {
              width: 32px;
              height: 32px;
              border: 1px solid var(--supply-color-border-DEFAULT);
              background-size: 32px 32px;
              background-position: center;
              background-repeat: no-repeat;
            }
            .percentage {
              width: 86px;
              height: 28px;
              // background-color: var(--supply-color-online-border);
              display: flex;
              align-items: center;
              justify-content: center;
              //  color: var(--supply-color-primary-DEFAULT);
              background-color: #f2f6fc;
            }
          }
        }
        .speciesText {
          width: 100%;
          height: 114px;
          background: #f2f6fc;
          border: 1px solid var(--supply-color-border-DEFAULT);
          padding: 12px;
          display: flex;
          .img {
            width: 84px;
            height: 84px;
            border: 1px solid var(--supply-color-border-DEFAULT);
            margin-right: 12px;
            background-size: 84px 84px;
            background-position: center;
            background-repeat: no-repeat;
          }
          .text-box {
            width: calc(100% - 96px);
            height: 100%;
            .textContent {
              margin-top: 6px;
              width: 100%;
              height: 54px;
              overflow-y: auto;
              word-break: break-word;
            }
          }
        }
      }
    }
  }
}
.text {
  height: 24px;
  width: 100%;
  color: var(--supply-color-main);
}
</style>
