<!--
 * @Author: wangyr
 * @Date: 2023-03-27 09:48:05
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-03-28 12:46:49
 * @Description:
-->
<template>
  <div class="monitoring">
    <div class="monitoring-box">
      <div class="monitoring-l">
        <div class="configuration-box">
          <iframe
            ref="iframe"
            class="supply-h-full supply-w-full"
            title="项目"
            :src="graphIndex"
          ></iframe>
        </div>
        <div class="statistics">
          <div class="statistics-title">
            <div class="statistics-img">
              <img src="./images/headline.png" alt="" />
            </div>
            <div class="projectNum" style="padding-top: 15px;">
              项目数量：<img src="./images/projectNum.png" alt="" />
            </div>
            <div class="projectNum">覆盖地区：<img src="./images/regionNum.png" alt="" /></div>
            <div class="text-b">
              此数据统计截止到2022年12月
            </div>
          </div>
        </div>
      </div>
      <div class="monitoring-r" @mouseenter="mouseover" @mouseleave="mouseout" v-cloak>
        <div class="videoContent">
          <div
            class="video-box"
            v-for="item of videoList"
            :key="item.id"
            @click="cutVideoName(item)"
          >
            <div class="video-title">
              {{ item.videoName }}
            </div>
            <div class="videoFlow" @mouseenter="mouseoverSon" @mouseleave="mouseoutSon">
              <videoFlow v-if="item" :item="item" :key="item.id"></videoFlow>
              <!-- <videos v-if="videoList[0]" :item="videoList[0]" ></videos> -->
            </div>
          </div>
        </div>
        <div class="video-bottom">
          <div style="background: #000316;">
            <div class="bottom">
              <img src="./images/left.png" alt="" />
              <span class="text" @click="goTo(goToObj)">{{ goToObj.bottomText }}</span>
              <img src="./images/right.png" alt="" />
            </div>
          </div>
        </div>
        <div class="left" v-show="pagingFlag">
          <div class="left-t">
            <img class="LeftTurn" src="./images/LeftTurn.png" alt="" @click="LeftTurn" />
          </div>
          <div class="left-b"></div>
          <!-- <div class="left-b">

          </div> -->
        </div>
        <div class="right" v-show="pagingFlag">
          <div class="right-t">
            <img class="turnRight" src="./images/turnRight.png" alt="" @click="turnRight" />
          </div>
          <div class="right-b"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getList, getGraphUrlMap, originalLogin } from '@/api/onSiteSupervision';
import { VUE_APP_HOST } from '@/constants';
import { accessToken } from '@wpg/framework-vue';
import videoFlow from './videoFlow';
export default {
  name: 'monitoring',
  components: {
    videoFlow
  },
  data() {
    return {
      isLoad: false,
      svgZoom: 1.0,
      graphIndex: '',
      pagingFlag: false,
      list: [1, 2, 3, 4],
      videoList: [],
      videoListSylloge: [],
      page: 1,
      goToObj: {
        bottomText: '',
        url: '',
        id: ''
      }
    };
  },
  computed: {
    useGraphPlatform() {
      return true;
    }
  },
  mounted() {
    this.getList();
    this.getGraphUrlMap();
  },
  methods: {
    mouseover(e) {
      this.pagingFlag = true;
    },
    mouseout(e) {
      this.pagingFlag = false;
    },
    mouseoverSon() {
      this.pagingFlag = false;
    },
    mouseoutSon() {
      this.pagingFlag = true;
    },
    cutVideoName(item) {
      this.goToObj = {
        bottomText: item.videoName,
        url: item.url,
        id: item.id
      };
    },
    goTo(obj) {
      if (obj.url) {
        originalLogin(obj.id).then(res => {
          if (res.status === 'complete') {
            let url = obj.url + '?token=' + res.resultData.resultData.token;
            window.open(url, '_blank ');
          }
        });
      }
    },
    LeftTurn() {
      if (this.page > 1) {
        this.videoList = [];
        this.page -= 1;
        let vm = this;
        this.$nextTick(() => {
          vm.videoList = vm.videoListSylloge[vm.page - 1];
          vm.goToObj = {
            bottomText: vm.videoList[0].videoName,
            url: vm.videoList[0].url,
            id: vm.videoList[0].id
          };
        });
      } else {
        this.$message.warning('当前已在第一页！');
      }
    },
    turnRight() {
      if (this.page < this.videoListSylloge.length) {
        this.videoList = [];
        this.page += 1;
        let vm = this;
        this.$nextTick(() => {
          vm.videoList = vm.videoListSylloge[vm.page - 1];
          vm.goToObj = {
            bottomText: vm.videoList[0].videoName,
            url: vm.videoList[0].url,
            id: vm.videoList[0].id
          };
        });
      } else {
        this.$message.warning('当前已在最后一页！');
      }
    },
    getList() {
      this.videoList = [];
      getList().then(res => {
        if (res.status === 'complete') {
          this.videoListSylloge = this.disposeList(res.resultData);
          console.log(this.videoListSylloge);
          this.page = 1;
          this.videoList = this.videoListSylloge[this.page - 1];
          this.goToObj = {
            bottomText: this.videoList[0].videoName,
            url: this.videoList[0].url,
            id: this.videoList[0].id
          };
          // this.page =  this.videoList.length;
        }
      });
    },
    disposeList(data) {
      let result = [];
      let chunk = 4; //每3个分一组

      for (let i = 0, j = data.length; i < j; i += chunk) {
        result.push(data.slice(i, i + chunk));
      }
      console.log(result);
      return result;
    },
    getGraphUrlMap() {
      getGraphUrlMap().then(res => {
        const token = accessToken.get();
        this.graphIndex = `${process.env?.NODE_ENV === 'development' ? VUE_APP_HOST : ''}${
          res.resultData
        }&token=${token}&parent=${window.origin}`;
      });
    }
  }
};
</script>

<style lang="less" scoped>
[v-cloak] {
  display: none;
}
.monitoring {
  width: 100%;
  height: 100%;
  padding: 12px;
  .monitoring-box {
    width: 100%;
    height: 100%;
    display: flex;
    padding-right: 30px;
    background: #000316;
    .monitoring-l {
      height: 100%;
      width: 669px;
      position: relative;
      .configuration-box {
        width: 100%;
        height: 100%;
      }
      .statistics {
        width: 600px;
        height: 290px;
        position: absolute;
        bottom: 0;
        left: 0;
        padding: 20px;
        background-image: linear-gradient(180deg, #081943c7 0%, #0308169c 100%);
        .statistics-title {
          padding: 6px 0 0 40px;
          width: 555.4px;
          height: 65px;
          margin-bottom: 40px;
          background-image: url(./images/headlineB.png);
          background-repeat: no-repeat;
          .statistics-img {
            width: 422px;
          }
        }
        .projectNum {
          width: 100%;
          height: 55px;
          margin-top: 16px;
          display: flex;
          align-items: center;
          font-size: 28px;
          color: #e9f0ff;
        }
        .text-b {
          font-weight: 400;
          margin-top: 20px;
          font-size: 20px;
          color: #979ba5;
        }
      }
    }
    .monitoring-r {
      height: 100%;
      width: calc(100% - 669px);

      position: relative;
      .videoContent {
        width: 100%;
        height: calc(100% - 160px);
        margin-top: 60px;
        display: flex;
        flex-wrap: wrap;

        .video-box {
          margin-right: 15px;
          width: 48%;
          height: 49%;
          .video-title {
            width: 386.33px;
            height: 38px;
            margin-bottom: 10px;
            padding-left: 47px;
            font-size: 24px;
            color: #c3ddff;
            cursor: pointer;
            background-image: url(./images/headlineI.png);
          }
          .videoFlow {
            width: 100%;
            height: calc(100% - 45px);
          }
        }
      }
      .video-bottom {
        margin-top: 15px;
        width: 100%;
        padding: 2px 0;
        height: 60px;
        background-image: linear-gradient(to right, #101f4900 0%, #5bc5f1 50%, #101e4900 100%);
        .bottom {
          width: 100%;
          background-image: linear-gradient(90deg, #101f4900 0%, #101f49 51%, #101e4900 100%);
          height: 56px;
          z-index: 10;
          display: flex;
          justify-content: center;
          align-items: center;
          .text {
            font-size: 24px;
            font-weight: bolder;
            color: #c3ddff;
            letter-spacing: 1.2px;
            text-shadow: 0 2px 4px #49a2d76b;
            cursor: pointer;
            background-image: linear-gradient(to top, #5bc5f1, white); /* 线性渐变背景，方向向上 */
            -webkit-background-clip: text; /* 背景被裁剪成文字的前景色 */
            -webkit-text-fill-color: transparent; /* 文字填充颜色变透明 */
          }
        }
        // border-top: 2px solid linear-gradient(90deg, #101f4900 0%, #5BC5F1 50%, #101e4900 100%);
      }
      .left {
        width: 73px;
        height: calc(100% - 200px);
        position: absolute;
        left: 0;
        top: 77px;
        overflow: hidden;
        .left-t {
          width: 73px;
          height: 50%;
          background-image: linear-gradient(90deg, #04102dc7 0%, #030816bd 100%);
          border-radius: 0 100% 0 0;
          margin-left: -10px;
          position: relative;
          .LeftTurn {
            position: absolute;
            bottom: -35px;
            cursor: pointer;
          }
        }
        .left-b {
          width: 73px;
          margin-left: -10px;
          height: 50%;
          background-image: linear-gradient(90deg, #04102dc7 0%, #030816bd 100%);
          border-radius: 0 0 100% 0;
        }
      }
      .right {
        width: 73px;
        height: calc(100% - 200px);
        position: absolute;
        right: 0;
        top: 77px;
        overflow: hidden;
        padding-left: 10px;
        .right-t {
          width: 73px;
          height: 50%;
          background-image: linear-gradient(90deg, #030816bd 100%, #04102dc7 0%);
          border-radius: 100% 0 0 0;
          margin-right: -10px;
          position: relative;
          .turnRight {
            position: absolute;
            bottom: -35px;
            cursor: pointer;
          }
        }
        .right-b {
          width: 73px;
          margin-right: -10px;
          height: 50%;
          background-image: linear-gradient(90deg, #030816bd 100%, #04102dc7 0%);
          border-radius: 0 0 0 100%;
        }
      }
    }
  }
}
</style>
