// 动态组件手动销毁
export default {
    props: {
        layer: {
            type: Object,
            default: null
        }
    },
    mounted() {
        (function () {
            if (this.layer) {
                this.layer.once('remove', this.$destroy.bind(this));
            } else {
                console.warn('图层不存在，请检查确认');
            }
        }).apply(this);
    },
}
