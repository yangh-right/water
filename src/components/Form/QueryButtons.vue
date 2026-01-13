<template>
  <w-col class="supply-my-1 supply-py-0.5 supply-text-right supply-ml-auto" :span="6">
		<slot></slot>
		<a v-if="showAdvanceFilter"  @click="toggle" class="supply-ml-2">
			{{ !showAll ? '展开' : '收起' }}
			<w-icon :type="!showAll ? 'ic_keyboard_arrow_down' : 'ic_keyboard_arrow_up'" />
		</a>
  </w-col>
</template>
<script lang="ts">
import { computed, defineComponent, onMounted, ref } from '@vue/composition-api'

export default defineComponent({
	setup(props, ctx) {
		const isModel = computed(() => {
			return ctx.parent?.$props.type === 'model'
		})

		const showAll = ref(false)
		// eslint-disable-next-line no-undef
		let queryItems: any[]|NodeListOf<Element> = []
		let len =  0
		let showAdvanceFilter = ref(false)
		function toggle() {
			showAll.value = !showAll.value
			queryItems.forEach((item, index) => {
				if (index > 2 && index < len)
				(item as any).style.display = showAll.value ? 'block' : 'none'
			})
		}
		onMounted(() => {
			queryItems = ctx.parent?.$el.querySelectorAll('.query-item') || []
			len = queryItems.length ?? 0
			showAdvanceFilter.value = len > 4
			if (showAdvanceFilter.value) {
			queryItems.forEach((item, index) => {
				if (index > 2 && index < len)
				(item as any).style.display = 'none'
			})
		}
		});

		return {
			isModel,
			toggle,
			showAdvanceFilter,
			showAll
		}
	},
})
</script>
<style lang="less">
.query-form-item {
	@apply supply-w-full;
	margin-right: 0!important;
}
</style>
