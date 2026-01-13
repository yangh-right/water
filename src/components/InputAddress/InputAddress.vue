<template>
  <div class="vc-input-address">
    <div v-if="readonly" class="vc-address-value">
      {{ location.address }} <a v-if="location.address" @click="showMap">查看位置</a>
    </div>
    <div v-else class="vc-address-point">
      <div class="vc-input-address">
        <w-input
          :placeholder="placeholder"
          v-model="location.address"
          :disabled="disabled"
          @change="handleInput"
          @click="clickInput"
        ></w-input>
        <!-- <i class="icon-ic_location_on supply-text-2xl supply-text-deviate" @click="showMap"></i> -->
        <w-icon type="ic_location_on" class="supply-text-2xl supply-text-deviate" @click="showMap" />
      </div>
    </div>

    <location-dialog
      :location="location"
      v-bind="$attrs"
      @change="handleUpdate"
      ref="locationDialog"
    />
  </div>
</template>

<script>
import LocationDialog from '@/components/location/dialog';

export default {
  name: 'VcInputAddress',

  components: {
    LocationDialog
  },

  props: {
    value: {
      type: [String, Object],
      default: ''
    },
    readonly: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    canInput: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: '请选择地址'
    }
  },

  data() {
    return {
      location: this.value
        ? this.handlerAddress(this.value)
        : {
            address: '',
            point: {}
          }
    };
  },

  computed: {
    interactive() {
      let disabled = this.readonly || this.disabled;
      return !disabled;
    }
  },

  watch: {
    value: {
      handler: function(val) {
        if (val) {
          this.location = this.handlerAddress(val);
        }
      }
    }
  },

  methods: {
    parseAddress(value) {
      let address = null;
      try {
        address = JSON.parse(value);
      } catch (error) {}

      return address;
    },

    showMap() {
      if (this.readonly || !this.disabled) {
        this.$refs.locationDialog && (this.$refs.locationDialog.visible = true);
      }
    },
    clickInput() {
      if (!this.canInput) {
        this.showMap()
      }
    },
    handleInput(text) {
      if (this.canInput) {
        let ret = this.location
        this.$emit('change', ret);
      }
    },
    handlerAddress(value) {
      let json;
      let address = '';
      let point = null;

      if (typeof value === 'string') {
        let val = this.parseAddress(value);
        if (val) {
          json = val;
        } else {
          address = value;
        }
      } else {
        json = value;
      }

      if (json) {
        address = json.address;
        point = {
          lat: json.point.lat,
          lng: json.point.lng
        };
      }

      return {
        address,
        point
      };
    },
    handleUpdate(latlng, address) {
      if (!latlng) return;
      this.location = {
        point: latlng,
        address
      };
      let ret = address ? this.location : null;
      this.$emit('change', ret);
      this.$emit('input', ret);
    }
  }
};
</script>

<style lang="less" scoped>
.vc-address-point {
  width: 100%;
}

.vc-input-address {
  padding: 1.5px 0 1.5px;
  display: flex;
  align-items: center;
  width: 100%;
  height: 42px;
  // line-height: 40px;

  i {
    margin-left: 10px;
    cursor: pointer;
  }
}

.vc-input-point {
  display: flex;
  width: 100%;
  margin-top: 20px;
  margin-right: -20px;
  margin-left: -20px;

  &-item {
    display: flex;
    flex: 1;
    margin: 0 20px;
  }

  &-label {
    width: 80px;
  }
}
</style>
