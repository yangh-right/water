<!--
 * @Author: wangyr
 * @Date: 2023-08-05 14:48:40
 * @LastEditors: Do not edit
 * @LastEditTime: 2024-05-15 09:17:39
 * @Description:
-->
<!--
 * @Description:
 * @version:
 * @Author: fengtaotao
 * @Date: 2023-05-23 14:29:38
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-08-07 08:44:19
-->
<template>
  <div class="content">
    <div class="content-header">
      <div class="content-title">{{ title }}</div>
      <div class="form">
        <div class="form-item">
          <w-tree-select
            v-model="deviceId"
            :treeData="treeData"
            style="width: 160px"
            :maxTagCount="1"
            placeholder="请选择设备"
            treeNodeFilterProp="title"
            :replaceFields="{
              title: 'name',
              key: 'id',
              value: 'id'
            }"
            :getPopupContainer="node => node.parentNode"
            :dropdown-style="{
              maxHeight: '180px',
              overflow: 'auto'
            }"
            @change="deviceChange"
          ></w-tree-select>
        </div>
      </div>
    </div>
    <w-spin :spinning="loading" class="spin">
      <div v-if="treeData.length > 0" class="iframe-img">
        <isc-video
          v-if="playUrl"
          :playUrl="playUrl"
          :videoId="deviceId"
          :timeout="1 * 1000"
        ></isc-video>
      </div>
      <w-empty v-else class="empty"></w-empty>
    </w-spin>
  </div>
</template>
<script>
import IscVideo from '@/components/IscVideo';
import { getHlsUrlByVideoNo } from '@/api/public';
import { getLocationVideoTree } from '@/api/optimization';
export default {
  name: 'VideoHls',
  components: {
    IscVideo
  },
  props: {
    title: {
      type: String,
      default: ''
    },
    waterPlantId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      deviceId: undefined,
      treeData: [],
      loading: false,
      playUrl: null
    };
  },
  watch: {
    waterPlantId: {
      immediate: true,
      handler(val) {
        if (val) {
          this.getUrlVideo();
        }
      }
    }
  },
  created() {},
  methods: {
    async getUrlVideo() {
      this.loading = true;
      let { resultData, status } = await getLocationVideoTree(this.waterPlantId);
      this.loading = false;
      if (status === 'complete') {
        if (resultData.length) {
          this.treeData = resultData;
          console.log(this.treeData);
          let devParent = this.treeData.find(item => item.children.length > 0);
          if (devParent) {
            this.deviceId = devParent.children[0].id;
            this.getPreviewUrlById(this.deviceId);
          }
        } else {
          this.treeData = [];
        }
      }
    },
    async getPreviewUrlById(deviceId) {
      try {
        //  获取ISC视频设备hls流
        this.loading = true;
        let params = {
          videoId: deviceId,
          protocal: 'ws'
        };
        const { resultData } = await getHlsUrlByVideoNo(params);
        this.loading = false;
        if (resultData) {
          if (resultData) {
            this.playUrl = resultData;
          } else {
            this.$message.error('获取视频流地址失败');
          }
        }
      } catch (e) {
        this.loading = false;
      }
    },
    deviceChange(val) {
      this.getPreviewUrlById(val);
    }
  }
};
</script>

<style lang="less" scoped>
.content {
  position: relative;
  width: calc(33.3% - 8px);
  background: var(--supply-color-bg-card-DEFAULT);
  border-radius: 4px;
  &-header {
    width: 100%;
    padding: 15px 12px;
    display: inline-flex;
    justify-content: space-between;
    align-items: center;
    height: 40px;
  }
  &-title {
    height: 40px;
    padding: 8px 12px;
    font-weight: 600;
    font-size: 16px;
    color: var(--supply-color-main);
    letter-spacing: 0;
  }
  .form {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .form-item {
    margin-top: 10px;
    margin-left: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .spin {
    height: calc(100% - 64px);
    .iframe-img {
      height: 100%;
      padding: 0 12px;
      box-sizing: border-box;
      margin-top: 8px;
    }
    /deep/.wpg-spin-container {
      height: 100%;
    }
    .contentFrame {
      width: 100%;
      height: 100%;
      padding: 6px;
    }
    .empty {
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
}
</style>
