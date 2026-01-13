<template>
  <div class="file-list">
    <div class="file__item" v-for="file in fileList" :key="file.uid">
        <w-icon type="paper-clip" class="paper-clip" />
          <div
            class="file-name"
            >
              <span :title="file.name" class="name" @click="downloadFile(file)">{{ file.name }}</span>
            </div
          >
        <w-icon v-if="!disabled" type="close" class="file-delete" @click="removeFile(file)" />
      </div>
  </div>
</template>

<script>
export default {
    name: 'nameList',
    props: {
        fileList: {
            type: Array,
            default: () => []
        },
        disabled: {
            type: Boolean,
            default: false
        },
        
    },
  data () {
    return {
    };
  },
  methods: {
    downloadFile(file) {
      this.$emit('downloadFile', file)
    },
    removeFile(file) {
      this.$emit('removeFile', file)
    },
  }
}

</script>
<style lang='less' scoped>
.file-list {
  width: 100%;
  .file__item {
    padding: 0 6px;
    width: 100%;
    height: 21px;
    display: flex;
    align-items: center;
    .paper-clip {
      font-size: 14px;
      margin-right: 6px;
    }
    .file-name {
 
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      color: var(--supply-color-primary-DEFAULT);
      text-overflow: ellipsis;
      height: 21px;
      .name {
        max-width: 100%;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        display: inline-block;
        position: relative;
        top: -12px;
        cursor: pointer;
      }
    }
    .file-delete {
      font-size: 14px;
      display: none;
    }
    &:hover {
      background-color: var(--supply-color-bg-card-dark);
      .file-delete {
        display: block;
      }
    }
  }
}
</style>