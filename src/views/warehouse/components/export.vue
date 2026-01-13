<!--
 * @Description: 请输入....
 * @Author: huhaiou
 * @Date: 2022-03-23 09:30:37
 * @LastEditTime: 2022-08-26 13:21:06
 * @LastEditors: yuan wenyu
-->
<!-- 导出 -->
<template>
  <w-modal class="secondary-modal" :visible="model" :maskClosable="false" title="导出处理中" @cancel="model = false" :width="600">
    <div style="margin: 12px 0px">
      <w-progress class="ivu-mb" :percent="percent" :status="processStatus" />
      <w-alert v-if="status === 0" show-icon>
        <template #message>
          批量导出<strong>1000</strong>条数据，共在生成导出文件
        </template>
      </w-alert>
      <w-alert v-if="status === -1" type="error" show-icon>
        <template #message>
          导出失败，点击 <a href="javascript:;">重试</a> 或<a href="javascript:;" @click="model = false">关闭</a>
        </template>
      </w-alert>
      <w-alert v-if="status === 1" type="success" show-icon>
        <template #message>
          导出成功，点击 <a href="javascript:;" @click="model = false">关闭</a>
        </template>
      </w-alert>
    </div>
    <template v-slot:footer>
      <span></span>
    </template>
  </w-modal>
</template>

<script>
  export default {
    name: 'ExportModal',
    props: {
      value: {},
      status: {
        type: Number,
        default: 0
      },
      percent: {
        type: Number,
        default: 0
      }
    },
    computed: {
      processStatus() {
        if (this.status === -1) {
          return 'wrong'
        } else if (this.status === 1) {
          return 'success'
        } else {
          return 'normal'
        }
      },
      model: {
        get() {
          return this.value
        },
        set(val) {
          this.$emit('input', val)
        }
      }
    }
  }
</script>

<style>
</style>
