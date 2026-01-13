<!--
 * @Description:
 * @Author: liuct
 * @Date: 2021-06-10 14:25:45
 * @LastEditTime: 2022-08-16 14:38:25
 * @LastEditors: yuan wenyu
-->
<template>
  <div
    class="message"
    @click="
      $emit(
        'change',
        '/baseInfo/checkNotice',
        { id: item.id, rowType: type, flag: '查看' },
        item.readFlag
      )
    "
  >
    <p class="title fs12">
      <i
        :class="[
          item.noticeType == 0
            ? 'icon-ic_assignment_24px supply-text-danger'
            : item.noticeType == 1
            ? 'icon-ic_business supply-text-primary'
            : 'icon-ic_account_balance supply-text-success',
          item.readFlag == 1 ? 'light-color' : ''
        ]"
      ></i>
      <span :class="item.readFlag === 1 ? 'supply-text-invalid' : 'supply-text-secondary'">
        {{
          item.noticeType === '0' ? '资料变更' : item.noticeType === '1' ? '公司新闻' : '政策法规'
        }}
      </span>
      <span
        v-if="showCloseAllBtn"
        class="supply-float-right close-all hover:supply-text-primary-hover supply-text-third"
        @click.stop="$emit('closeAll')"
      >
        关闭全部
      </span>
    </p>
    <p :class="['content', item.readFlag === 1 ? 'supply-text-invalid' : 'supply-text-main']">
      <w-checkbox v-model="item.checked" @click.stop="">
        {{ item.title }}
      </w-checkbox>
    </p>
    <p
      :class="[
        'person fs12',
        item.readFlag === 1 ? 'supply-text-invalid' : 'supply-text-secondary'
      ]"
    >
      创建人：
      <span :class="item.readFlag === 1 ? 'supply-text-invalid' : 'supply-text-third'">
        {{ item.createBy || item.publishBy }}
      </span>
    </p>
    <p :class="item.readFlag === 1 ? 'supply-text-invalid' : 'supply-text-third'">
      {{ item.publishDate }}
    </p>
  </div>
</template>

<script>
export default {
  name: 'BulletinCon',
  props: {
    item: {
      type: Object,
      default: () => {},
      require: true
    },
    type: {
      type: String,
      default: '0'
    },
    showCloseAllBtn: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style scoped lang="less">
.fs12 {
  font-size: 12px;
}
.message {
  cursor: pointer;
  .title {
    i {
      font-size: 20px;
      position: relative;
      top: 3px;
      margin-right: 2px;
    }
    .close-all {
      margin: 2px 33px 0 0;
      cursor: pointer;
    }
  }
  .content {
    font-size: 14px;
    margin-top: 8px;
  }
  .person {
    margin: 8px 0 15px 0;
  }
}
</style>
