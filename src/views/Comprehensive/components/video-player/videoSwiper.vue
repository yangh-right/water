<!--  -->
<template>
  <div class="video-swiper">
    <w-empty v-if="!videoList.length"></w-empty>
    <template v-else>
      <swiper ref="mySwiper" :options="swiperOptions" v-loading="loading">
        <swiper-slide v-for="(video, index) in videoList" :key="index">
          <div
            class="htVideoList"
            @mouseover="onClickSwiper(false)"
            @mouseleave="onClickSwiper(true)"
          >
            <div
              class="htVideo"
              v-for="(v, i) in video"
              :key="`${index}-${i}`"
              @click="gotoVideoDetail(v)"
            >
              <HtVideo
                :videoId="v.videoId"
                :videoType="v.videoType"
                :key="`${index}-${i}`"
              ></HtVideo>
              <div class="name">{{ v.videoName }}</div>
            </div>
          </div>
        </swiper-slide>
      </swiper>
      <div class="swiper-button-prev">
        <w-icon type="ic_chevron_left_more"></w-icon>
      </div>
      <div class="swiper-button-next">
        <w-icon type="ic_chevron_right_more"></w-icon>
      </div>
    </template>
  </div>
</template>

<script>
import HtVideo from './index.vue';

export default {
  name: 'VideoSwiper',
  props: {
    videoList: Array,
    loading: Boolean,
    slidesPerView: {
      type: Number,
      default: 1
    }
  },
  components: { HtVideo },
  data() {
    return {
      swiperOptions: {
        slidesPerView: this.slidesPerView, //显示个数
        touchAngle: 10,
        autoplay: {
          delay: 3000,
          stopOnLastSlide: false,
          disableOnInteraction: false
        },
        navigation: {
          nextEl: '.swiper-button-next', // 下一张
          prevEl: '.swiper-button-prev' // 上一张
        }
      }
    };
  },
  methods: {
    gotoVideoDetail(val) {
      this.$emit('toDetail', val);
    },
    onClickSwiper(flag) {
      if (flag) this.$refs.mySwiper.$swiper.autoplay.start();
      else this.$refs.mySwiper.$swiper.autoplay.stop();
    }
  }
};
</script>
<style lang="less" scoped>
.video-swiper {
  height: 100%;

  /deep/ .swiper-container {
    height: 100%;
  }

  .htVideoList {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: space-between;

    .htVideo {
      width: calc(50% - 4px);
      // flex: 1;
      border-radius: 6px;
      position: relative;
      height: 100%;
      overflow: hidden;

      .name {
        position: absolute;
        left: 0;
        bottom: 0;
        width: 100%;
        overflow: hidden;
        height: 30px;
        text-align: center;
        line-height: 30px;
        color: #fff;
        background: rgba(38, 46, 57, 0.6);
        font-family: PingFangSC-Regular, sans-serif;
        font-weight: 400;
        font-size: 12px;
        letter-spacing: 0;
      }
    }
  }

  .swiper-button-prev,
  .swiper-button-next {
    top: 57%;
    background: #4285f4;
    width: 20px;
    height: 25px;
    border-radius: 4px;
    color: #fff;
  }

  .swiper-button-next:after,
  .swiper-button-prev:after {
    display: none;
  }

  .swiper-button-prev {
    left: 0px;
  }

  .swiper-button-next {
    right: 0px;
  }

  .swiper-button-disabled {
    background: #748bb2;
    opacity: 0.8;
  }
}
</style>
