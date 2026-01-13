<!--
 * @Description:修改工单
 * @version:
 * @Author: liuct
 * @Date: 2021-11-11 19:40:16
 * @LastEditors: liuct
 * @LastEditTime: 2021-11-12 14:36:23
-->
<template>
  <div>
    <ticket-wpg
      v-if="type === 'wpg'"
      ref="wpg"
      :orderTemplateId="orderTemplateId"
      :typeDisabled="typeDisabled"
      :templateDisabled="templateDisabled"
      :templateType="templateType"
      :templateData="templateData"
      @update="update"
      @change="change"
      @createTicket="createTicket"
    ></ticket-wpg>
  </div>
</template>

<script>
import TicketWpg from './ticketWpg.vue';
export default {
  name: 'TicketDialog',
  components: {
    TicketWpg,
  },
  props: {
    //请求时不传type
    noType: {
      type: Boolean,
      default: false
    },
    templateType: {
      type: String,
      default: ''
    },
    orderTemplateId: {
      type: String,
      default: ''
    },
    //工单类型禁选
    typeDisabled: {
      type: Boolean,
      default: false
    },
    //工单模板禁选
    templateDisabled: {
      type: Boolean,
      default: false
    },
    templateData: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      visible: false,
      type: 'wpg'
    };
  },
  watch: {
    visible(val) {
      if (val) {
        if (this.type === 'wpg') {
          this.$refs.wpg && (this.$refs.wpg.visible = true);
        } else {
          // this.$refs.sangao && (this.$refs.sangao.visible = true);
        }
      }
    }
  },
  mounted() {
    // this.getTicketType();
  },
  methods: {
    getTicketType() {
      // getTicketType().then(res => {
      //   this.type = res.resultData;
      // });
    },
    update(flag) {
      this.visible = false;
      if (flag) {
        this.$emit('update');
      }
    },
    change(data) {
      this.$emit('change', data);
    },
    createTicket(data) {
      this.$emit('createTicket', data);
    }
  }
};
</script>
