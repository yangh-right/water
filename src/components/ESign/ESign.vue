<template>
  <div class="e-sign">
    <div v-if="readonly" class="e-sign-img">
      <img v-if="img" :src="img" alt="" />
    </div>
    <div v-else class="e-sign-box">
      <sign-canvas ref="SignCanvas" v-model="img" class="sign-canvas" @confirm="handleConfirm" />

      <div class="stp-box">
        <w-button type="dashed" class="stp-button" @click="handleClear">
          <w-icon type="close" /> 清空
        </w-button>
      </div>
    </div>
  </div>
</template>

<script>
import SignCanvas from './SignCanvas';
import serverConfig from '@/config/server.config';

const getFileAccessHttpUrl = (avatar, subStr) => {
  if (!subStr) subStr = 'http';
  if (avatar && avatar.startsWith(subStr)) {
    return avatar;
  } else if (avatar && avatar.startsWith('data:image')) {
    return avatar;
  } else {
    return serverConfig.IMG_BASE_URL + avatar;
  }
};

export default {
  name: 'ESign',

  components: {
    SignCanvas
  },

  props: {
    value: {
      required: false,
      type: [String],
      default: ''
    },
    readonly: {
      type: Boolean,
      default: false
    },
    options: {
      // 配置项
      required: false,
      type: [Object],
      default: () => null
    }
  },

  data() {
    return {
      img: this.value ? getFileAccessHttpUrl(this.value) : ''
    };
  },

  watch: {
    value(val) {
      this.img = val ? getFileAccessHttpUrl(this.value) : '';
    }
  },

  methods: {
    handleClear() {
      this.$refs.SignCanvas.canvasClear();
    },

    handleConfirm() {
      this.$emit('input', this.img);
    }
  }
};
</script>

<style lang="less" scoped>
.e-sign-img {
  height: 200px;
  text-align: center;

  img {
    width: auto;
    height: 100%;
  }
}

.e-sign-box {
  width: 100%;
  // padding: 20px 10px;
  overflow: hidden;

  .stp-box {
    text-align: left;
  }
}
</style>
