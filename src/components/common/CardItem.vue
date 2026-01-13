<!--
 * @Description: 波浪效果组件
 * @Author: xh
 * @Date: 2021-07-14 15:59:56
 * @LastEditTime: 2022-03-16 10:01:55
 * @LastEditors: huhaiou
-->
<template>
  <div class="card-canvas">
    <!-- slot为组件所显示的数据，不传不显示 -->
    <img
      class="card-bg"
      :src="$require(`@/assets/images/modules/pumpDetail/{{theme}}/tankBg.png`)"
      alt=""
    />
    <slot></slot>
    <div class="max" v-if="max">
      <span>{{ max + ' m' }}</span>
    </div>
    <div class="min" v-if="min">
      <span>{{ min + ' m' }}</span>
    </div>
    <canvas ref="canvas" :width="containerWidth" :height="containerHeight"></canvas>
    <canvas
      class="bubble-con"
      ref="pop"
      :width="containerWidth"
      :height="containerHeight * level + waveHeight[0]"
    ></canvas>
  </div>
</template>

<script>
import { assetsRequire } from '@/core/mixins';

export default {
  name: 'CardItem',
  mixins: [assetsRequire],
  data() {
    return {
      a: this.containerWidth / 2, //水箱底部与顶部椭圆长半轴
      b: this.containerHeight * 0.0875, //水箱底部与顶部椭圆短半轴
      Bubbles: [], //气泡数据
      canvas: null,
      ctx: null,
      xOffset: 0
    };
  },
  props: {
    // 是否有气泡
    isBubble: {
      type: Boolean,
      default: false
    },
    // 气泡再次生成的时间间隔（单位ms）
    bubbleInterval: {
      type: Number,
      default: 500
    },
    // 气泡初速度
    bubbleInitSpeed: {
      type: Number,
      default: 1
    },
    // 气泡加速度
    bubbleSpeed: {
      type: Number,
      default: 0.1
    },
    // 气泡最小半径与最大半径
    bubbleRadius: {
      type: Array,
      default: () => [3, 7]
    },
    // 气泡区域宽度占水箱宽度的比例
    bubbleScale: {
      type: Number,
      default: 0.5
    },
    // 初始气泡数
    particles: {
      type: Number,
      default: 5
    },
    // 两个波浪颜色， 0为深色，1为浅色
    color: {
      type: Array,
      default: ['#F64357', '#FFBBC3']
    },
    // 水位百分比数值 0-1
    level: {
      type: Number | Function,
      default: 0
    },
    // 容器宽度
    containerWidth: {
      type: Number,
      default: 0
    },
    // 容器高度
    containerHeight: {
      type: Number,
      default: 0
    },
    // 波浪动画速度
    speed: {
      type: Number,
      default: 0.05
    },
    // 波浪宽度
    waveWidth: {
      type: Array,
      default: [0.05, 0.1]
    },
    // 波浪高度
    waveHeight: {
      type: Array,
      default: [3, 5]
    },
    max: {
      type: Number
    },
    min: {
      type: Number
    }
  },
  watch: {
    level(n) {
      if (this.level) {
        this.initData();
      }
    }
  },
  mounted() {
    this.canvas = this.$refs.canvas;
    this.bubbleCvs = this.$refs.pop;
    // 获取画布
    this.ctx = this.canvas.getContext('2d');
    this.bubbleCtx = this.bubbleCvs.getContext('2d');
    if (this.level) {
      this.initData();
    }
    // requestAnimationFrame(this.draw);
  },
  methods: {
    initData() {
      const x = (this.containerWidth * this.bubbleScale) / this.particles;
      const offsetLeft = (this.containerWidth * (1 - this.bubbleScale)) / 2;
      const bubblesList = [];
      for (let i = 0; i < this.particles; i++) {
        bubblesList.push({
          x: i * x + offsetLeft,
          y: this.containerHeight * this.level * (2 * Math.random() - 1),
          r: this.bubbleRadius[0],
          speed: this.bubbleInitSpeed * (3 / 5 + ((2 * Math.random() - 1) * 2) / 5)
        });
        this.Bubbles = bubblesList;
      }
      requestAnimationFrame(this.draw);
    },
    // 绘制曲线
    drawSin() {
      let { a, b } = this;
      // 0:深色面 1:浅色面
      for (let i = 1; i >= 0; i--) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.color[i];
        this.ctx.fillStyle = this.color[i];
        // 绘制三角函数曲线各点
        for (let x = 0; x < this.containerWidth; x++) {
          // y公式：（波浪高度*三角函数计算的系数+偏移量）- （容器高度*（水位百分比-曲线默认在容器高度0.5为位置））
          const y =
            this.waveHeight[i] * Math.sin(x * this.waveWidth[i] + this.xOffset) -
            this.containerHeight * (this.level - 0.5);

          this.ctx.lineTo(
            x,
            Math.max(
              Math.min(
                this.getOvalY(x, a, b, a, this.containerHeight - b),

                this.containerHeight / 2 + y
              ),
              this.getOvalY(x, a, b, a, false) -
                Math.sqrt((1 - Math.pow(x - a, 2) / (a * a)) * b * b) +
                b
            )
          );
        }

        for (let x = this.containerWidth; x >= 0; x--) {
          const y = this.getOvalY(x, a, b, a, this.containerHeight - b);
          this.ctx.lineTo(x, y);
        }
        this.ctx.fill();
        this.ctx.stroke();
      }
    },
    // 绘制气泡
    drawBubble() {
      let height = this.containerHeight * this.level + this.waveHeight[0];
      let ctx = this.bubbleCtx;
      for (let i = 0; i < this.Bubbles.length; i++) {
        let b = this.Bubbles[i];
        if (false) {
          b.r =
            this.bubbleRadius[0] * this.level +
            (1 - b.y / height) * this.level * (this.bubbleRadius[1] - this.bubbleRadius[0]);
          b.x += (Math.random() * b.speed * (b.r * (2 * Math.random() - 1))) / 4;
        } else {
          b.r =
            this.bubbleRadius[0] +
            (1 - b.y / height) * this.level * (this.bubbleRadius[1] - this.bubbleRadius[0]);
          b.x += (b.r * (2 * Math.random() - 1)) / 4;
        }
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r > 0 ? b.r : 0, 0, 2 * Math.PI);

        b.alpha = 0.5 * (b.y / height);
        b.speed += this.bubbleSpeed;

        ctx.strokeStyle = 'rgba(255, 255, 255, .5)';
        ctx.stroke();
        ctx.fillStyle = 'hsla(203, 75%, 69%,' + b.alpha + ')';
        ctx.fill();
        b.y -= b.speed;
        if (b.y < 0) {
          const x = (this.containerWidth * this.bubbleScale) / this.particles;
          const offsetLeft = (this.containerWidth * (1 - this.bubbleScale)) / 2;
          b.x = i * x + offsetLeft;
          if (!b.timeOut) {
            b.timeOut = setTimeout(() => {
              b.y = this.getOvalY(b.x, this.a, this.b, this.a, height - this.b - 2);
              b.timeOut = null;
            }, (1 - this.level) * this.bubbleInterval);
          }
          // if (this.level > Math.random()) {
          //   b.y = this.getOvalY(b.x, this.a, this.b, this.a, height - this.b - 2);
          // }
          b.speed = this.bubbleInitSpeed * (3 / 5 + ((2 * Math.random() - 1) * 2) / 5);
        }
      }
    },
    draw() {
      // 清除上次曲线
      this.ctx.clearRect(0, 0, this.containerWidth, this.containerHeight);
      this.bubbleCtx.clearRect(
        0,
        0,
        this.containerWidth,
        this.containerHeight * this.level + this.waveHeight[0]
      );
      // 曲线绘制
      if (this.level) {
        this.drawSin();
        this.xOffset += this.speed;
        if (this.isBubble) {
          this.drawBubble();
        }
      }
      requestAnimationFrame(this.draw);
    },
    /**
     * @description: 根据x计算椭圆的y
     * @param {Number} x
     * @param {Number} a x对应的半轴
     * @param {Number} b y对应的半轴
     * @param {Number} x0 中心点x坐标
     * @param {Number} y0 中心点y坐标
     * @param {Boolean} isBig 是否计算的是x坐标对应的较大的y坐标
     * @return:
     */
    getOvalY(x, a, b, x0, y0, isBig = true) {
      const aqrtRes = Math.sqrt((1 - Math.pow(x - x0, 2) / (a * a)) * b * b);
      if (isBig) {
        return aqrtRes + y0;
      } else {
        return -aqrtRes + y0;
      }
    }
  }
};
</script>

<style lang="less" scoped>
.card-canvas {
  /* padding: 10px 2px 10px 2px; */
  width: 100%;
  height: 100%;
  border-top: 0 !important;
  position: relative;
  .card-bg {
    position: absolute;
    width: 100%;
    height: 100%;
  }
  .max,
  .min {
    position: absolute;
    left: 0;
    width: 100%;
    color: #fab005;
    z-index: 1;
    text-align: left;
    line-height: 12px;
    span {
      font-size: 12px;
      transform: scale(0.75);
    }
    &.max {
      top: 6px;
      border-top: 1px dashed #fab005;
    }
    &.min {
      bottom: 6px;
      border-bottom: 1px dashed #fab005;
    }
  }
  .bubble-con {
    position: absolute;
    bottom: 0;
    left: 0;
  }
  .day-num {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
  }
}
</style>
