<template>
  <div
    class="preview"
    :title="name"
    :style="{
      backgroundImage: type !== 'file' ? `url(${url})` : ''
    }"
  >
    <div v-if="type === 'file'" class="file">
      <img :src="require('@/assets/images/default/cockpit/file-' + (fileTypeList.includes(suffix)?suffix:'text') + '.png')" alt="" />
      <p>{{ name }}</p>
    </div>
    <div class="preview-picture">
      <w-icon v-if="type !== 'file'" type="ic_zoom_in" class="action supply-text-3xl supply-mx-1"  @click="showPicture"/>
      <w-icon v-if="canEdit" type="ic_delete" class="action supply-text-2xl supply-mx-1" @click="remove" />
      <w-icon type="ic_file_download" class="action supply-text-3xl supply-mx-1" @click="downloadFile" />
      <!-- <i v-if="canEdit" class="action supply-text-3xl icon-ic_delete" @click="remove"></i> -->
    </div>
    <div class="supply-hidden" v-if="type === 'image'" ref="imgPreview" v-viewer="viewOption">
      <img class="image" :src="url" :alt="url" />
    </div>
  </div>
</template>
<script>
import Vue from 'vue';
import { directive as viewer } from "v-viewer"
import 'viewerjs/dist/viewer.css'
import { exportUrlFile } from "@/utils/util";
export default Vue.extend({
  directives: {
    viewer: viewer(),
  },
  props: {
    type: {
      type: String,
      default: 'image'
    },
    url: {
      type: String,
      required: true
    },
    suffix: {
      type: String
    },
    name: {
      type: String
    },
    canEdit: {
      type: Boolean
    }
  },
  data() {
    return {
      fileTypeList: [
        'docx',
        'doc',
        'word',
        'excel',
        'xls',
        'xlsx',
        'text',
        'txt',
        'image',
        'pdf',
        'zip'
      ],
      viewOption: Object.freeze({
        toolbar: {
          zoomIn: 1,
          zoomOut: 1,
          oneToOne: 1,
          rotateLeft: 1,
          rotateRight: 1,
          flipHorizontal: 1,
          flipVertical: 1,
        },
        title: false,
        navbar: false
      })
    };
  },
  methods: {
    showPicture() {
      const viewer = this.$refs.imgPreview?.$viewer
      viewer?.show()
    },
    remove() {
      this.$confirm({
        title: '提示',
        content: '确认进行删除操作? ',
        onOk: () => {
          this.$emit('remove');
        }
      });
    },
    downloadFile() {
      exportUrlFile(this.url, this.name);
    },
  }
});
</script>
<style lang="less" scoped>
.preview {
  position: relative;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  .file {
    width: 100%;
    height: 100%;
    display: flex;
    flex-flow: column;
    align-items: center;
    justify-content: center;
    p {
      text-align: center;
      width: 100%;
      padding: 0 5px;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }
  .preview-picture {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    opacity: 0;
    color: white;
    transition: opacity 0.6s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  &:hover {
    .preview-picture {
      opacity: 1;
    }
  }
  .action {
    cursor: pointer;
  }
}
.image {
  width: 100%;
}
</style>
