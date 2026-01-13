<template>
  <div>
    <span>{{ name }}</span>
  </div>
</template>

<script>
  export default {
    name: 'GlobalUserSpan',
    props: {
      value: {
        type: [String, Array]
      },
    },
    data() {
      return {
        name: '',
        userOrgs: [],
        users: []
      }
    },

    watch: {
      value: {
        handler(val) {
          this.name = ''
          if(val) {
            this.userOrgs = this.$store.state.account.orgusertree || []
            this.findName(val, this.userOrgs)
          }
        },
        immediate: true
      }
    },

    methods: {
      findName(value, arr) {
        if(this.name) return
        let list = arr
        for(let i=0,len=list.length; i<len; i++) {
          let item = list[i]
          if(this.name) {
            break
          } else if(item.id == value || item.name == value) {
            this.name = item.name
            break
          } else if(item.children && item.children.length) {
            this.findName(value, item.children)
          }
        }
      }
    }
  }
</script>
