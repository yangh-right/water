/**
 * @version: 1.0.1
 * @Author: kk
 * @Date: 2021-10-20 17:05:32
 * @LastEditors: kk
 * @LastEditTime: 2021-11-03 20:06:30
 * @Description: 简易模块
 * @Update: 更新内容
 */
<script>
    export default {
        name: 'SimpleModule',
        functional: true, // 无状态组件
        props: {
            title: {
              type: String,
              default: ''
            },
            extraText: {
              type: String,
              default: ''
            }
        },
        render(h, context) {
            // 插槽
            const slots = context.slots();
            // 传递props
            const { title, extraText } = context.props;
            // 标题
            const titleText = title ? [h('div', {
              attrs: { class: 'simple-module-header-title' }
            }, title)] : ''

            const headerLeft = h('div', {
              attrs: { class: 'simple-module-header-left' }
            }, titleText || slots.title || '')

            const headerRight = h('div', {
              attrs: { class: 'simple-module-header-right' }
            }, slots.extra || extraText || '')

            // 头部header
            const header = h('div', {
              attrs: { class: 'simple-module-header' }
            }, [headerLeft, headerRight])
            // 自定义内容content
            const content = h('div', {
              attrs: { class: 'simple-module-content' }
            }, slots.default || '')

            return h('div', {
              attrs: { class: 'simple-module-box' }
            }, [header, content])
        }
    }
</script>

<style lang="less" scoped>
  @import "~@wpg/design-vue/lib/style/color/wpg-colors.less";
  .simple-module-box{
    width: 100%;
    height: 100%;
    background-color: @wpg-based-color-1;
    padding: 0 12px;
    box-sizing: border-box;
    overflow: hidden;
    .simple-module-header{
      width: 100%;
      height: 46px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      &-left{
        flex: auto;
        height: 100%;
        display: flex;
        align-items: center;
        overflow: hidden;
        &::before{
          content: '';
          flex: none;
          width: 4px;
          height: 14px;
          background-color: @wpg-auxiliary-5;
          margin-right: 8px;
        }
        .simple-module-header-title{
          flex: auto;
          color: #6281A3;
          font-size: 16px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
      &-right{
        flex: none;
        width: auto;
        height: 100%;
        font-size: 14px;
        color: #999999;
        margin-left: 10px;
        display: flex;
        align-items: center;
        overflow: hidden;
      }
    }
    .simple-module-content{
      width: 100%;
      height: calc(100% - 46px);
    }
  }
</style>