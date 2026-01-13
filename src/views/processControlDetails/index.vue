<!--
 * @Description:
 * @Author: JianYue
 * @Date: 2024-08-19 09:28:21
 * @LastEditTime: 2024-09-03 10:54:06
 * @LastEditors:  Do not edit
-->
<template>
  <div
    v-scroll="handleScroll"
    :class="{ processControl: true, dark: state.theme === 'dark' }"
    id="processControl"
  >
    <div class="title">
      <img src="@/assets/images/modules/processControlDetails/title-wing-left.png" />
      建立了模型算法支撑下的全流程稳定生产控制能力
      <img src="@/assets/images/modules/processControlDetails/title-wing-right.png" />
    </div>
    <div :class="{ menuContent: true, dark: state.theme === 'dark' }">
      <div v-for="(item, index) in menuList" :key="index" class="menu">
        <div :class="{ menuItem: true, dark: state.theme === 'dark' }">
          {{ item }}
        </div>
        <img src="@/assets/images/modules/processControlDetails/menu-link.png" />
      </div>
    </div>
    <div :class="{ content: true, dark: state.theme === 'dark' }">
      <div class="content-item">
        <div v-for="(obj, i) in contenList" :key="i" class="content-item-bg" :style="obj.bg">
          <!-- <div v-for="(item, index) in obj.topTitleList">{{ item.title }}</div> -->
          <div
            v-for="(item, index) in obj.child"
            :key="index"
            class="content-item-child"
            :style="item.style"
          >
            <div
              :class="[...item.classList, 'content-title']"
              :id="item.id"
              :style="item.titleStyle"
            >
              <span>{{ item.name }}</span>
            </div>
            <div
              v-if="item.squareStyle"
              class="square"
              :style="item.squareStyle"
              :id="item.squareStyle.id"
            ></div>
            <!-- <div v-if="item.linkStyle" class="link" :style="item.linkStyle"></div>
            <div v-if="item.arrowStyle" class="arrow" :style="item.arrowStyle"></div> -->
          </div>
        </div>
      </div>
      <div class="content-item-detial">
        <div
          v-for="(item, index) in detialList"
          :key="index"
          :style="item.style"
          :id="item.id"
          class="detial-item"
        >
          <div class="detial-title" :style="item.titleStyle">
            <p style="opacity: 1;">{{ item.title }}</p>
          </div>
          <div class="detial-content">
            <div v-for="(list, i) in item.content" :key="i">{{ list }}</div>
          </div>
        </div>
      </div>
    </div>
    <div :class="{ processControlbottom: true, dark: state.theme === 'dark' }">
      <div :span="4" v-for="(item, index) in modeTypeList" :key="index" class="mode-item">
        <span>{{ item }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import LeaderLine from 'leader-line';
import { contenListLight, contenListDark, detialListLight, detialListDark } from './dataSources';

export default {
  name: 'processControl',
  inject: ['state'],
  data() {
    return {
      modeTypeList: ['大数据AI模型', '图像识别算法', '机理模型', '经验模型'],
      menuList: ['实时预测', '仿真模拟', '动态预警', '方案预演', '优化决策'],
      lineList: [],
      timer: null
    };
  },
  computed: {
    contenList() {
      return this.state.theme === 'dark' ? contenListDark : contenListLight;
    },
    detialList() {
      return this.state.theme === 'dark' ? detialListDark : detialListLight;
    }
  },
  directives: {
    // 定义scroll指令
    scroll: {
      inserted(el, binding) {
        el.addEventListener('scroll', () => {
          const scrollTop = el.scrollTop;
          binding.value(scrollTop);
        });
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.timer = setTimeout(() => {
        LeaderLine.positionByWindowResize = false;
        this.handleLine();
      }, 500);
    });
  },
  methods: {
    handleScroll() {
      this.lineList.forEach(item => {
        item.position();
      });
    },
    // 线路从左到右排列
    handleLine() {
      this.lineList = [];

      let dashedLine1 = new LeaderLine(
        LeaderLine.pointAnchor(document.querySelector('#dashedStart1'), {
          x: 8
        }),
        LeaderLine.pointAnchor(document.querySelector('#purStart2'), {
          x: 0
        }),
        {
          color: '#e37500',
          startSocket: 'right',
          endSocket: 'left',
          size: 2,
          dash: true
        }
      );
      let dashedLine2 = new LeaderLine(
        LeaderLine.pointAnchor(document.querySelector('#dashedStart2')),
        LeaderLine.pointAnchor(document.querySelector('#purStart3'), {
          x: 0
        }),
        {
          color: '#5859eb',
          startSocket: 'right',
          endSocket: 'left',
          size: 2,
          dash: true
        }
      );
      let dashedLine3 = new LeaderLine(
        LeaderLine.pointAnchor(document.querySelector('#dashedStart3')),
        LeaderLine.pointAnchor(document.querySelector('#purStart4'), {
          x: 0
        }),
        {
          color: '#5859eb',
          startSocket: 'right',
          endSocket: 'left',
          size: 2,
          dash: true
        }
      );
      let dashedLine4 = new LeaderLine(
        LeaderLine.pointAnchor(document.querySelector('#dashedStart4')),
        LeaderLine.pointAnchor(document.querySelector('#purStart5'), {
          x: 0
        }),
        {
          color: '#5859eb',
          startSocket: 'right',
          endSocket: 'left',
          size: 2,
          dash: true
        }
      );
      let dashedLine5 = new LeaderLine(
        LeaderLine.pointAnchor(document.querySelector('#dashedStart5')),
        LeaderLine.pointAnchor(document.querySelector('#purStart6'), {
          x: 0
        }),
        {
          color: '#225ae8',
          startSocket: 'right',
          endSocket: 'left',
          size: 2,
          dash: true
        }
      );
      let dashedLine6 = new LeaderLine(
        LeaderLine.pointAnchor(document.querySelector('#dashedStart6')),
        LeaderLine.pointAnchor(document.querySelector('#purStart7'), {
          x: 0
        }),
        {
          color: '#00b21c',
          startSocket: 'right',
          endSocket: 'left',
          size: 2,
          dash: true
        }
      );
      let dashedLine7 = new LeaderLine(
        LeaderLine.pointAnchor(document.querySelector('#dashedStart7')),
        LeaderLine.pointAnchor(document.querySelector('#purStart8'), {
          x: 0
        }),
        {
          color: '#00b21c',
          startSocket: 'right',
          endSocket: 'left',
          size: 2,
          dash: true
        }
      );
      let dashedLine8 = new LeaderLine(
        LeaderLine.pointAnchor(document.querySelector('#dashedStart8'), {
          x: 10
        }),
        LeaderLine.pointAnchor(document.querySelector('#purStart9'), {
          x: 0
        }),
        {
          color: '#00b21c',
          startSocket: 'right',
          endSocket: 'left',
          size: 2,
          dash: true
        }
      );

      let leaderLine1 = new LeaderLine(
        LeaderLine.pointAnchor(document.querySelector('#purStart3'), {
          y: 130
        }),
        LeaderLine.pointAnchor(document.querySelector('#purEnd2'), {
          x: 95,
          y: 0
        }),
        {
          outline: true,
          outlineColor: '#8384FC',
          size: 7,
          outlineSize: 0.2,
          color: '#8384FC',
          dash: { len: 6, gap: 4 },
          path: 'grid',
          endSocket: 'top',
          startSocket: 'bottom',
          endPlug: 'arrow3'
        }
      );

      let leaderLine2 = new LeaderLine(
        document.querySelector('#purStart4'),
        LeaderLine.pointAnchor(document.querySelector('#purEnd1'), {
          x: 92,
          y: 0
        }),
        {
          outline: true,
          outlineColor: '#8384FC',
          size: 7,
          outlineSize: 0.2,
          color: '#8384FC',
          dash: { len: 6, gap: 4 },
          path: 'grid',
          endSocket: 'top',
          startSocket: 'bottom',
          endPlug: 'arrow3'
        }
      );

      let leaderLine3 = new LeaderLine(
        LeaderLine.pointAnchor(document.querySelector('#purStart4'), {
          x: 118.5,
          y: 130
        }),
        LeaderLine.pointAnchor(document.querySelector('#purEnd3'), {
          x: 180,
          y: 0
        }),
        {
          outline: true,
          outlineColor: '#8384FC',
          size: 7,
          outlineSize: 0.2,
          color: '#8384FC',
          dash: { len: 6, gap: 4 },
          path: 'grid',
          endSocket: 'top',
          startSocket: 'bottom',
          endPlug: 'arrow3'
        }
      );

      let leaderLine4 = new LeaderLine(
        LeaderLine.pointAnchor(document.querySelector('#purStart5'), {
          x: 30,
          y: 104
        }),
        LeaderLine.pointAnchor(document.querySelector('#purEnd4'), {
          x: 149.5,
          y: 0
        }),
        {
          outline: true,
          outlineColor: '#618FF4',
          size: 7,
          outlineSize: 0.2,
          color: '#618FF4',
          dash: { len: 6, gap: 4 },
          path: 'grid',
          endSocket: 'top',
          startSocket: 'bottom',
          endPlug: 'arrow3'
        }
      );

      let leaderLine5 = new LeaderLine(
        LeaderLine.pointAnchor(document.querySelector('#purStart5'), {
          x: 172.5,
          y: 104
        }),
        document.querySelector('#purEnd5'),
        {
          outline: true,
          outlineColor: '#618FF4',
          size: 7,
          outlineSize: 0.2,
          color: '#618FF4',
          dash: { len: 6, gap: 4 },
          path: 'grid',
          endSocket: 'top',
          startSocket: 'bottom',
          endPlug: 'arrow3'
        }
      );

      let leaderLine6 = new LeaderLine(
        LeaderLine.pointAnchor(document.querySelector('#purStart5'), {
          x: 270,
          y: 104
        }),
        LeaderLine.pointAnchor(document.querySelector('#purEnd2'), {
          x: 95,
          y: 0
        }),
        {
          outline: true,
          outlineColor: '#618FF4',
          size: 7,
          outlineSize: 0.2,
          color: '#618FF4',
          dash: { len: 6, gap: 4 },
          path: 'grid',
          endSocket: 'top',
          startSocket: 'bottom',
          endPlug: 'arrow3'
        }
      );

      let leaderLine7 = new LeaderLine(
        document.querySelector('#purStart6'),
        document.querySelector('#purEnd6'),
        {
          outline: true,
          outlineColor: '#00B21C',
          size: 7,
          outlineSize: 0.2,
          color: '#00B21C',
          dash: { len: 6, gap: 4 },
          path: 'grid',
          endSocket: 'top',
          startSocket: 'bottom',
          endPlug: 'arrow3'
        }
      );

      let leaderLine8 = new LeaderLine(
        LeaderLine.pointAnchor(document.querySelector('#purStart7'), {
          x: 43,
          y: 104
        }),
        LeaderLine.pointAnchor(document.querySelector('#purEnd7'), {
          x: 111.5,
          y: 0
        }),
        {
          outline: true,
          outlineColor: '#00B21C',
          size: 7,
          outlineSize: 0.2,
          color: '#00B21C',
          dash: { len: 6, gap: 4 },
          path: 'grid',
          endSocket: 'top',
          startSocket: 'bottom',
          endPlug: 'arrow3'
        }
      );

      let leaderLine9 = new LeaderLine(
        LeaderLine.pointAnchor(document.querySelector('#purStart9'), {
          x: 31,
          y: 104
        }),
        document.querySelector('#purEnd8'),
        {
          outline: true,
          outlineColor: '#8384FC',
          size: 7,
          outlineSize: 0.2,
          color: '#8384FC',
          dash: { len: 6, gap: 4 },
          path: 'grid',
          endSocket: 'top',
          startSocket: 'bottom',
          endPlug: 'arrow3'
        }
      );
      // 加入数组
      this.lineList.push(leaderLine1);
      this.lineList.push(leaderLine2);
      this.lineList.push(leaderLine3);
      this.lineList.push(leaderLine4);
      this.lineList.push(leaderLine5);
      this.lineList.push(leaderLine6);
      this.lineList.push(leaderLine7);
      this.lineList.push(leaderLine8);
      this.lineList.push(leaderLine9);
      this.lineList.push(dashedLine1);
      this.lineList.push(dashedLine2);
      this.lineList.push(dashedLine3);
      this.lineList.push(dashedLine4);
      this.lineList.push(dashedLine5);
      this.lineList.push(dashedLine6);
      this.lineList.push(dashedLine7);
      this.lineList.push(dashedLine8);
    }
  },
  activated() {
    this.lineList.forEach(item => {
      item.show();
    });
  },
  beforeRouteLeave(to, from, next) {
    if (this.timer) clearTimeout(this.timer);
    // 清除线段
    this.lineList.forEach(item => {
      item.hide();
    });
    next();
  }
};
</script>

<style lang="less" scoped>
.orange-bg-light {
  background-image: linear-gradient(140deg, #e27200 0%, #f2af00 100%);
  box-shadow: 0 10px 10px 1px #ea8e575e;
}
.orange-bg-dark {
  background-image: linear-gradient(134deg, #9d4e00 0%, #a87a00 100%);
  box-shadow: 0 10px 10px 1px #6c33105e;
}
.purple-bg-light {
  background-image: linear-gradient(154deg, #5859eb 5%, #6d29d9 95%);
}
.purple-bg-dark {
  background-image: linear-gradient(154deg, #3d3ea4 5%, #4c1c97 95%);
  box-shadow: 0 10px 10px 1px #2524885e;
}
.blue-bg-light {
  background-image: linear-gradient(135deg, #1c52da 0%, #60c9ff 100%);
}
.blue-bg-dark {
  background-image: linear-gradient(-46deg, #4088b0 0%, #133998 100%);
  box-shadow: 0 10px 10px 1px #12338266;
}
.green-bg-light {
  background-image: linear-gradient(154deg, #00b21c 7%, #97be12 95%);
}
.green-bg-dark {
  background-image: linear-gradient(154deg, #007c13 7%, #69840c 95%);
  box-shadow: 0 10px 10px 1px #146b045e;
}
.processControl {
  height: 100%;
  width: 100%;
  background: var(--supply-color-bg-card-DEFAULT);
  overflow: scroll;
  &.dark {
    background: #12161d;
  }
  .title {
    height: 73px;
    width: 100%;
    padding: 20px 0;
    font-family: PingFangSC-Medium, sans-serif;
    font-weight: 500;
    font-size: 24px;
    color: #3e82f7;
    letter-spacing: 0;
    text-align: center;
  }
  .menuContent {
    height: 80px;
    margin: 0 30px;
    border: 1px dashed #9cbee5;
    border-radius: 4px;
    display: flex;
    padding: 0 12px;
    align-items: center;
    justify-content: space-between;
    &.dark {
      border: 1px dashed #0e4bb7;
      border-radius: 4px;
    }
    .menu {
      width: 20%;
      display: flex;
      align-items: center;
      .menuItem {
        width: calc(100% - 55px);
        height: 42px;
        line-height: 42px;
        background: url('~@/assets/images/modules/processControlDetails/menu-frame-light.png')
          no-repeat;
        background-size: 100% 100%;
        font-family: PingFangSC-Medium, sans-serif;
        font-weight: 500;
        font-size: 18px;
        color: #4285f4;
        letter-spacing: 0;
        text-align: center;
      }
      .menuItem {
        &.dark {
          background: url('~@/assets/images/modules/processControlDetails/menu-frame-dark.png')
            no-repeat;
          background-size: 100% 100%;
        }
      }
      img {
        width: 37px;
        height: 37px;
        margin: 0 8px;
      }
    }

    .menu:last-child {
      width: calc(20% - 55px);
      .menuItem {
        width: 100%;
        height: 42px;
        line-height: 42px;
        background-size: 100% 100%;
        font-family: PingFangSC-Medium, sans-serif;
        font-weight: 500;
        font-size: 18px;
        color: #4285f4;
        letter-spacing: 0;
        text-align: center;
      }
      img {
        display: none;
      }
    }
  }
  .content {
    height: 524px;
    margin: 18px 30px;
    padding: 20px;
    border: 1px dashed #9cbee5;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    &.dark {
      border: 1px dashed #0e4bb7;
      border-radius: 4px;
    }
    .content-item {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .content-item-bg {
        height: 178px;
        display: flex;
        align-items: center;
        justify-content: space-around;
        .content-item-child {
          height: 104px;
          display: flex;
          align-items: center;
        }
        .content-title {
          height: 104px;
          border-radius: 2px;
          font-family: PingFangSC-Medium, sans-serif;
          font-weight: 500;
          font-size: 18px;
          letter-spacing: 8px;
          color: #fff;
          word-wrap: break-word;
          text-align: center; /*水平居中*/
        }
        .square {
          width: 8px;
          height: 8px;
        }
        .arrow {
          width: 8px;
          height: 8px;
          border-top: 2px;
          border-right: 2px;
          transform: rotate(45deg);
        }
        .link {
          width: 800px;
          height: 1px;
        }
      }
    }
    .content-item-detial {
      width: 100%;
      height: 194px;
      border-radius: 3px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .detial-item {
        width: 184px;
        height: 194px;
        border-radius: 3px;
        .detial-title {
          width: 100%;
          height: 48px;
          line-height: 48px;
          font-family: PingFangSC-Medium, sans-serif;
          font-weight: 500;
          font-size: 18px;
          letter-spacing: 0;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .detial-content {
          padding: 12px 14px;
          height: 146px;
          font-family: PingFangSC-Regular, sans-serif;
          font-weight: 400;
          font-size: 16px;
          color: #666666;
          letter-spacing: 0;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
  }
  .processControlbottom {
    height: 80px;
    margin: 0 30px;
    border: 1px dashed #9cbee5;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    &.dark {
      border: 1px dashed #0e4bb7;
      border-radius: 4px;
    }
    .mode-item {
      width: 370px;
      height: 42px;
      margin: 0 20px;
      border: 2px solid #3e82f7;
      border-radius: 4px;
      line-height: 42px;
      text-align: center;
      font-family: PingFangSC-Medium, sans-serif;
      font-weight: 500;
      font-size: 18px;
      color: #3e82f7;
      letter-spacing: 0;
    }
  }
}
</style>
