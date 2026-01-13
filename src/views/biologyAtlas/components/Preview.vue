<template>
  <div
    class="preview"
    :title="name"
    :style="{
      backgroundImage: type !== 'file' ? `url(${url})` : ''
    }"
  >
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

    <w-modal v-model="show" :footer="null">
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
    }
  },
  data() {
    return {
      show: false,
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
  background-size: 150px 100px;
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
