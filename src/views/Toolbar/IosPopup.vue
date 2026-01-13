<template>
  <w-modal
    title="IOS下载"
    :visible="showIosPopup"
    class="modal-ios secondary-modal"
    @cancel="setShowIosPopup(false)"
  >
    <template slot="footer">
      <w-button key="back" @click="setShowIosPopup(false)">
        取消
      </w-button>
      <w-button
        v-if="!isShowIcon"
        key="submit"
        type="primary"
        :loading="loading"
        @click="getIOSCode"
      >
        提交
      </w-button>
    </template>
    <div v-if="isShowIcon" class="img-wrapper">
      <img :src="iosIcon" alt="" />
      <p class="wfc2">提示: 一个二维码仅能下载一次</p>
    </div>
    <w-form v-else :form="iosForm">
      <w-form-item
        label="申请原因"
        v-bind="{
          labelCol: { span: 8 },
          wrapperCol: { span: 16 }
        }"
      >
        <w-textarea
          v-decorator="[
            'downloadReason',
            {
              rules: [
                {
                  required: true,
                  message: '请输入申请原因'
                }
              ]
            }
          ]"
          :auto-size="{ minRows: 3, maxRows: 6 }"
        />
      </w-form-item>
    </w-form>
  </w-modal>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import { getiosLink } from '@/api/index';
import serverConfig from '@/config/server.config';

export default {
  name: 'IosPopup',
  data() {
    return {
      isShowIcon: false,
      loading: false,
      iosIcon: '',
      iosForm: this.$form.createForm(this)
    };
  },
  computed: {
    ...mapState('configure', ['showIosPopup'])
  },
  watch: {
    showIosPopup(val) {
      if (!val) {
        this.iosIcon = '';
        this.isShowIcon = false;
        this.iosForm = this.$form.createForm(this);
      }
      this.setHideVideo(val); // 打开或关闭顶部通知弹窗时隐藏或显示视频插件内容
    }
  },
  methods: {
    ...mapMutations('configure', ['setShowIosPopup']),
    ...mapMutations('video', ['setHideVideo']),
    getIOSCode() {
      this.iosForm.validateFields((err, values) => {
        if (!err) {
          this.loading = true;
          getiosLink(values).then(res => {
            let { status, resultData } = res;
            this.loading = false;
            if (status === 'complete') {
              this.isShowIcon = true;
              this.iosIcon = serverConfig.IMG_BASE_URL + resultData;
            } else {
              this.isShowIcon = false;
            }
          });
        }
      });
    }
  }
};
</script>

<style lang="less" scoped>
.img-wrapper {
  width: 200px;
  margin: 0 auto;
  img {
    width: 100%;
  }
}
</style>
