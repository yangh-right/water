// 跳转外业工单系统
export const outWork = {
    detail(id) { // 详情页面
      const path = encodeURIComponent(`${this.$route.fullPath}`)
      return `/outwork/work-manage/detail?id=${id ?? ''}&fromPath=${path}`
    }
}