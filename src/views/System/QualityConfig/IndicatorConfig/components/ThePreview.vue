<template>
  <preview ref="preview" :showModel="true" title="检测方法" width="60%" footer>
    <template #extra>
      <div class="extra">
        <div class="extra-box wfc2">
          <span class="extra-label">检测方法名称：</span>
          <span class="wfc1 extra-value" :title="file && file.name">{{ file && file.name }}</span>
        </div>
        <div class="extra-box wfc2">
          <span class="extra-label"> 所属标准：</span>
          <span class="wfc1 extra-value" :title="file && file.standard">
            {{ file && file.standard }}</span
          >
        </div>
      </div>
    </template>
  </preview>
</template>

<script>
import preview from '@/components/VuePreview';
export default {
  name: 'ThePreview',
  components: {
    preview
  },
  data() {
    return {
      file: undefined
    };
  },
  methods: {
    openPreview(file) {
      this.file = file;
      if (file.fileList?.[0]) {
        this.$refs['preview'].getPreViewUrl(file.fileList[0].name, file.fileList[0].id);
      } else {
        //表格中打开 所传的file不一样 特殊处理
        this.$refs['preview'].getPreViewUrl(file.fileName, file.id);
      }
    }
  }
};
</script>

<style lang="less" scoped>
.extra {
  height: 54px;
  width: 100%;
  background: #f9fafb;
  border-radius: 4px;
  line-height: 54px;
  margin-bottom: 24px;
  padding: 0 24px;
  font-family: PingFangSC-Regular, sans-serif;
  font-weight: 400;
  &-box {
    text-align: left;
    display: inline-block;
    width: 50%;
  }
  &-label {
    display: inline-block;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  &-value {
    display: inline-block;
    width: 70%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
