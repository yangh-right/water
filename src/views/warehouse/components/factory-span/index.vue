<template>
  <span>{{ name }}</span>
</template>

<script>
  // import appService from '@/api/appService'
  // import * as _ from 'lodash'
  import { forEach, isArray, find, join } from 'lodash-es'

  export default {
    name: 'FactorySpan',
    props: {
      value: {
        type: [String, Number, Array],
        required: false
      },
      multipleSplitChar: {
        type: String,
        default: ','
      }
    },
    data() {
      return {
        name: '',
        items: []
      }
    },

    async created() {
      const factories = this.factories = this.$store.state.account.userorgInfo || []
      // const factories = await appService.getAllFactories()

      forEach(factories, (item) => {
        this.items.push(item)
      })
      if (this.value) {
        this.name = this.getDisplayText(this.value)
      }
    },
    watch: {
      value: {
        handler(val) {
          if (val) {
            this.name = this.getDisplayText(val)
          } else {
            this.name = ''
          }
        },
        immediate: true
      }
    },
    methods: {
      getDisplayText(value) {
        let text = ''
        if (value) {
          if (isArray(value)) {
            const textArray = []

            for (let i = 0; i < value.length; i++) {
              const item = find(this.items, function(o) { return o.id.toString() === value[i].toString() })
              if (item != null) {
                textArray.push(item.name)
              }
            }
            text = join(textArray, this.multipleSplitChar)
          } else {
            const item = find(this.items, function(x) { return x.id.toString() === value.toString() })
            text = item == null ? '' : item.name
          }
        }
        return text
      }
    }
  }
</script>
<style lang="less">
</style>
