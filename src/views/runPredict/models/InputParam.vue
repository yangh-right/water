<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2023-06-08 13:55:47
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2023-06-28 14:31:58
 * @Description: 
-->
<template>
  <w-form-model ref="form" :rules="rules" :model="form" class="cycle">
    <div class="cycle__item supply-mb-2" v-for="(item, index) in cycleList" :key="'time' + item">
      <div
        class="supply-relative cycle__item--con supply-flex supply-justify-center supply-items-center "
      >
        <div class="form-wrap supply-w-full">
          <w-form-model-item
            :wrapperCol="{ span: 14 }"
            :labelCol="{ span: 10 }"
            label="分组名称"
            class="supply-whitespace-nowrap"
            :rules="rules['name' + item]"
            :key="'name' + item"
            :prop="'name' + item"
          >
            <w-input v-model="form['name' + item]" />
          </w-form-model-item>

          <w-form-model-item
            :labelCol="{ span: 10 }"
            :wrapperCol="{ span: 14 }"
            label="分组监测量"
            class="supply-whitespace-nowrap"
            :rules="rules['points' + item]"
            :key="'points' + item"
            :prop="'points' + item"
          >
            <point-select :rawPoints="pointsList" v-model="form['points' + item]"> </point-select>
          </w-form-model-item>
        </div>
        <span class="cycle__item--action supply-ml-4 supply-whitespace-nowrap supply-absolute">
          <w-button
            v-if="cycleList.length !== 1"
            @click="delCycle(item)"
            icon="ic_delete"
            class="supply-cursor-pointer action__del"
          ></w-button>
          <w-button
            @click="addCycle(item)"
            :class="[
              `supply-ml-2 supply-cursor-pointer action__add`,
              cycleList.length - 1 === index ? 'supply-visible' : 'supply-invisible'
            ]"
            icon="plus"
          ></w-button>
        </span>
      </div>
    </div>
  </w-form-model>
</template>

<script>
import pointSelect from './pointSelect';

const fieldList = ['name', 'points'];
export default {
  name: 'InputParam',
  components: {
    pointSelect
  },
  props: {
    value: {
      type: [Array, String],
      default: () => []
    },
    pointsList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      cycleList: [],
      form: {},
      rules: {}
    };
  },

  computed: {},
  watch: {
    value: {
      handler(val) {
        this.cycleList =
          val?.map((item, i) => {
            this.setForm(i, [item.name ?? '', item?.points ?? []]);
            return i;
          }) || [];
        if (!this.cycleList.length) {
          this.cycleList = [0];
          this.setForm(0, ['', []]);
        }
      },
      immediate: true,
      deep: true
    },
    cycleList: {
      handler(val) {
        let rules = {};

        this.cycleList.map(i => {
          rules['name' + i] = [{ required: true, message: '请输入分组名称', trigger: 'blur' }];
          rules['points' + i] = [{ required: true, message: '请选择监测量' }];
        });
        this.rules = rules;
      },
      immediate: true,
      deep: true
    }
  },
  mounted() {},

  methods: {
    setForm(i, val, isDel = false) {
      if (!isDel) {
        fieldList.forEach((item, index) => {
          this.$set(this.form, item + i, val[index]);
        });
      } else {
        fieldList.forEach((item, index) => {
          delete this.form[item + i];
        });
      }
    },
    checkOutput(rule, value, callback) {
      if (value?.length) {
        callback();
      } else {
        callback(new Error('请选择监测量'));
      }
    },
    addCycle(i) {
      this.cycleList.push(i + 1);
      this.setForm(i + 1, ['', []]);
    },
    delCycle(i) {
      this.cycleList.splice(i, 1);
      this.setForm(i, [], true);
    },
    updateCycleList() {},
    handlerFrom() {
      return new Promise((resolve, reject) => {
        this.$refs.form.validate(async valid => {
          if (valid) {
            let dataList = [];
            this.cycleList.forEach(item => {
              dataList.push({ name: this.form['name' + item], points: this.form['points' + item] });
            });
            this.$emit('input', dataList);
            resolve(dataList);
          } else {
            reject(false);
            return false;
          }
        });
      });
    }
  }
};
</script>
<style lang="less" scoped>
/deep/ .wpg-form-item {
  margin-bottom: 0;
}
.cycle__item {
  &--action {
    right: 15px;
  }
  /deep/ .action__del {
    border: none;
    box-shadow: none;
    .wpgicon {
      /* font-size: 22px; */
    }
  }
  /deep/ .action__add {
    position: relative;
    top: 2px;
    width: 24px;
    height: 24px;
    & > .wpgicon {
      line-height: 24px;
    }
  }
}
</style>
