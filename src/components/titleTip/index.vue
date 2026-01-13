<template>
  <div class="titleTip">
    <span>{{ title }}</span>
    <w-tooltip>
      <template #title>
        <div class="tooltip">
          <p v-if="tipTitle" class="tooltip-title wfc1">{{ tipTitle }}</p>
          <ul v-if="Array.isArray(tipDesc)" class="tooltip-list wfc2">
            <li v-for="(text, idx) in tipDesc" :key="idx" class="tooltip-item">{{ text }}</li>
          </ul>
          <p v-else class="tooltip-content wfc2">{{ tipDesc }}</p>
        </div>
      </template>
      <w-icon type="ic_info_outline" />
    </w-tooltip>
  </div>
</template>

<script>
import { isPlainObject } from 'lodash-es';

export default {
  name: 'TitleTip',
  inheritAttrs: false,
  props: {
    title: String,
    tip: [String, Array, Object],
  },
  computed: {
    tipTitle() {
      const tip = this.tip;
      return isPlainObject(tip) ? tip.title : null;
    },
    tipDesc() {
      const tip = this.tip;
      return isPlainObject(tip) ? tip.desc : tip;
    },
  },
};
</script>

<style lang="less" scoped>
.titleTip {
  display: inline-block;
  white-space: nowrap;

  span {
    margin-right: 4px;
  }

  .wpgicon {
    font-size: 14px;
  }
}

.tooltip {
  padding: 6px 2px;
  font-size: 12px;

  // &-title {
  //   display: flex;
  //   align-items: center;

  //   &::before {
  //     width: 6px;
  //     height: 6px;
  //     margin-right: 4px;
  //     margin-left: -10px;
  //     content: '';
  //     background-color: #71a3f8;
  //     border-radius: 50%;
  //   }
  // }

  &-content,
  &-list {
    margin-top: 4px;
    line-height: 1.5;
  }
}
</style>
