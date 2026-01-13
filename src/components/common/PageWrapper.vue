<template>
  <div :class="[systemCode, 'supply-h-full']" :data-wpg-theme="theme" >
    <slot />
  </div>
</template>
<script>
import { APP_PREFIX } from '@/constants'
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  data() {
    return {
      systemCode: APP_PREFIX,
    }
  },
  inject: ['state'],
  computed: {
    theme() {
      return this.state.theme;
    }
  }
})
</script>
