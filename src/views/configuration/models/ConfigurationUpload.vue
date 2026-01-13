<template>
  <ImgCropper
    field="file"
    :width="102"
    :height="44"
    :url="uploadUrl"
    :headers="headers"
    :WHVerification="WidthHeightVerification"
    :tipMassage="tipMassage"
    :value="isShow"
    :isTailoring="isTailoring"
    img-format="png"
    @cropSuccess="cropSuccess"
    @cropUploadFail="cropUploadFail"
    @cropUploadSuccess="cropUploadSuccess"
    @cropUploadClose="cropUploadClose"
  ></ImgCropper>
</template>

<script>
import ImgCropper from '../components/ImgCropper/ImgCropper';
import serverConfig from '@/config/server.config';
import storage from '@/utils/storage';
import { accessToken } from "@wpg/framework-vue";
export default {
  name: 'PictureUpload',
  components: {
    ImgCropper
  },
  props: {
    showImg: {
      type: Boolean,
      default: false
    },
    isTailoring: {
      type: Boolean,
      default: false
    },
    WHVerification: {
      type: Boolean,
      default: false
    },
    tipMassages: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      isShow: false,
      tipMassage: this.tipMassages,
      WidthHeightVerification: this.WHVerification,
      uploadUrl: `${serverConfig.API_BASE_URL}/fileManage/uploadByBucket`,
      headers: {},
      imgDataUrl: '' // the datebase64 url of created image
    };
  },
  watch: {
    showImg(newData, oldData) {
      this.isShow = newData;
    }
  },
  created() {
    const token = `Bearer ${accessToken.get()}`;
    this.headers = { Authorization: token };
  },
  methods: {
    /**
     * 读流成功
     * @param imgDataUrl
     * @param field
     */
    cropSuccess(imgDataUrl, field) {
      this.imgDataUrl = imgDataUrl;
    },

    /**
     * 上传失败
     * @param status
     * @param field
     */
    cropUploadFail(status, field) {
      this.$message.error('上传失败！');
    },
    /**
     * 取消上传
     * @param status
     * @param field
     */
    cropUploadClose(status, field) {
      this.$message.error('未上传文件！');
      this.$emit('cancelResult');
    },
    /**
     * 上传成功
     * @param jsonData
     * @param field
     */
    cropUploadSuccess(jsonData, field) {
      this.isShow = false;
      this.$emit('getResult', jsonData.resultData.url);
    },

    /**
     * 显示读流弹窗
     */
    toggleShow() {
      this.isShow = !this.isShow;
    }
  }
};
</script>

<style></style>
