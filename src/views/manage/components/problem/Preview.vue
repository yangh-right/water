<template>
  <div
    class="preview"
    :title="name"
    :style="{
      backgroundImage: type !== 'file' || acceptList.includes(suffix) ? `url(${url})` : ''
    }"
  >
    <div v-if="videoTypeList.includes(suffix)" class="video">
      <video controls width="202" height="120" :src="url" alt="">
        <track
          v-if="subtitleUrl"
          kind="subtitles"
          :src="subtitleUrl"
          :label="subtitleLabel"
          :srclang="subtitleLang"
          default
        />
        <track
          v-if="descriptionUrl"
          kind="descriptions"
          :src="descriptionUrl"
          :label="descriptionLabel"
          :srclang="descriptionLang"
        />
      </video>
    </div>
    <div v-if="type === 'file'" class="file">
      <img
        :src="
          require('@/assets/images/default/cockpit/file-' +
            (fileTypeList.includes(suffix) ? suffix : 'text') +
            '.png')
        "
        alt=""
      />
      <p>{{ name }}</p>
    </div>
    <div
      class="preview-picture"
      v-if="!(type === 'file' && !canEdit) && !videoTypeList.includes(suffix)"
    >
      <w-icon
        v-if="type !== 'file'"
        type="ic_zoom_in"
        class="action supply-text-3xl"
        @click="showPicture"
      />
      <w-icon v-if="canEdit" type="ic_delete" class="action supply-text-3xl" @click="remove" />
    </div>
    <w-modal centered class="secondary-modal" v-model="show" :footer="null">
      <img class="image" :src="url" :alt="url" />
    </w-modal>
  </div>
</template>
<script>
import Vue from 'vue';

export default Vue.extend({
  props: {
    type: {
      type: String
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
    },
    subtitleUrl: {
      type: String,
      default: ''
    },
    subtitleLabel: {
      type: String,
      default: 'English'
    },
    subtitleLang: {
      type: String,
      default: 'en'
    },
    descriptionUrl: {
      type: String,
      default: ''
    },
    descriptionLabel: {
      type: String,
      default: 'Description'
    },
    descriptionLang: {
      type: String,
      default: 'en'
    }
  },
  data() {
    return {
      show: false,
      acceptList: ['png', 'jpg', 'jpeg', 'bmp', 'gif'],
      videoTypeList: ['avi', 'wmv', 'mpeg', 'mp4'],
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
      ]
    };
  },
  methods: {
    showPicture() {
      this.show = true;
    },
    remove() {
      this.$emit('remove');
    }
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
    width: 202px;
    height: 120px;
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
  .video {
    width: 100%;
    height: 100%;
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
