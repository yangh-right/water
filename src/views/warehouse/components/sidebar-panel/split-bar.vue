<template>
  <div :class="classes" v-on="$listeners">
    <div :class="barConClasses">
      <i :class="`${prefix}-bar`" v-once v-for="i in 8" :key="`trigger-${i}`"></i>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Trigger',
    props: {
      mode: {
        type: String,
        default: 'vertical'

      }
    },
    data() {
      return {
        prefix: 'ivu-split-trigger',
        initOffset: 0
      }
    },
    computed: {
      isVertical() {
        return this.mode === 'vertical'
      },
      classes() {
        return [
          this.prefix,
          this.isVertical ? `${this.prefix}-vertical` : `${this.prefix}-horizontal`
        ]
      },
      barConClasses() {
        return [
          `${this.prefix}-bar-con`,
          this.isVertical ? 'vertical' : 'horizontal'
        ]
      }
    },
    methods: {
      handleMousedown() {
        console.log(`split-bar handleMousedown`)
      }
    }
  }
</script>
