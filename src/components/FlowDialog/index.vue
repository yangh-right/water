<!--
 * @Author: wangyr
 * @Date: 2022-10-25 09:56:36
 * @LastEditors: Do not edit
 * @LastEditTime: 2022-10-25 10:13:01
 * @Description:
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
    TicketWpg
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
