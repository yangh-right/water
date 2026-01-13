<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2024-09-05 18:38:32
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2024-09-05 20:45:54
 * @Description: 
-->
<template>
  <div class="img-wrapper" @click.stop="openImgModal">
    <img v-if="imgUrl" :src="imgUrl" class="choose-value-img" />
    <img-modal ref="imgModal" @select="selectImg"></img-modal>
  </div>
</template>

<script>
import imgModal from './imgModal';
export default {
  components: { imgModal },
  props: {
    value: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      imgUrl: ''
    };
  },

  computed: {},
  watch: {
    value: {
      handler(val) {
        this.imgUrl = val || '';
      },
      immediate: true
    }
  },
  mounted() {},

  methods: {
    openImgModal() {
      if (this.disabled) return;
      this.$refs.imgModal.visible = true;
    },
    selectImg(imgUrl) {
      this.imgUrl = imgUrl;
      this.$emit('input', this.imgUrl);
    }
  }
};
</script>
<style lang="less" scoped>
.img-wrapper {
  cursor: pointer;
  display: inline-block;
  width: 50px;
  height: 50px;
  border: 1px #ccc dotted;
  .choose-value-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    vertical-align: middle;
  }
}
</style>
