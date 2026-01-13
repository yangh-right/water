<template>
  <w-modal v-model="showPersonal" title="人员信息" width="560px">
    <div class="container" v-loading="loading">
      <div class="header">
        <div class="photo"><img :src="urlSrc" /></div>
        <div class="name wfc1">{{ userInfo.userName | filterName }}</div>
      </div>
      <div class="content">
        <w-row class="content-row">
          <w-col :span="12" class="item">
            <label>污水厂名称:</label>
            <span class="wfc1" :title="getName(userInfo.stationVOS, 'stationName')">{{
              getName(userInfo.stationVOS, 'stationName')
            }}</span>
          </w-col>
          <w-col :span="12" class="item">
            <label>岗位:</label>
            <span class="wfc1">{{ getName(userInfo.jobs, 'dictName') }}</span>
          </w-col>
        </w-row>
        <w-row>
          <w-col :span="12" class="item">
            <label>手机号码:</label>
            <span class="wfc1">{{ userInfo.phone }}</span>
          </w-col>
        </w-row>
      </div>
    </div>
    <div slot="footer">
      <w-button @click="showPersonal = false">关闭</w-button>
    </div>
  </w-modal>
</template>
<script>
import { mapState } from 'vuex';
import serverConfig from '@/config/server.config';
export default {
  name: 'PersonalInfo',
  props: {
    userID: String
  },
  data() {
    return {
      modalPerson: {},
      userInfo: {},
      loading: false,
      urlSrc: '',
      showPersonal: false
    };
  },
  computed: {
    ...mapState(['factoryList']),
    getName() {
      return function(stationVOS, type) {
        let name =
          stationVOS &&
          stationVOS.map(a => {
            return a[type];
          });
        name = name && name.join(',');
        return name || '';
      };
    }
  },
  filters: {
    filterName(val) {
      if (val) {
        let str = val;
        if (val.includes('（')) str = val.substring(0, val.lastIndexOf('（'));
        return str;
      }
      return '';
    }
  },
  watch: {
    showPersonal: {
      handler(val) {
        if (val && this.userID) {
          this.getUserInfo();
        }
      }
    }
  },
  methods: {
    async getUserInfo() {
      try {
        this.loading = true;
        const { resultData } = await this.$http('sewageCommonTicketApi/ticketOutWork/getUserInfo', {
          params: { userId: this.userID }
        });
        this.userInfo = resultData;
        this.urlSrc = resultData.photo
          ? serverConfig.PUBLIC_API_BASE_URL + '/userCenterApi/FileManager?url=' + resultData.photo
          : require('@/assets/images/default/device/user.png');
      } catch (error) {
        console.log('error', error);
      } finally {
        this.loading = false;
      }
    },
    show() {
      this.showPersonal = true;
    },
    hide() {
      this.showPersonal = false;
    }
  }
};
</script>
<style lang="less" scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.header {
  text-align: center;
  margin-right: 10px;
  .photo {
    width: 80px;
    height: 80px;
    img {
      width: 100%;
      height: auto;
      border-radius: 40px;
    }
  }
  .name {
    margin-top: 10px;
    font-family: PingFangSC-Medium, sans-serif;
    font-weight: 500;
    font-size: 16px;
    letter-spacing: 0;
  }
}
.content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  margin-top: 40px;
  .content-row {
    margin-bottom: 16px;
  }
  .item {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 225px;
    label {
      width: 86px;
      display: inline-block;
      text-align: right;
      padding-right: 8px;
    }
    span {
      white-space: nowrap;
    }
    &.work {
      label {
        width: 40px;
      }
    }
  }
}
</style>
