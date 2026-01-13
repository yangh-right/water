export default {
    data() {
        return {
            popupVisible: false
        }
    },
    mounted() {
        this.$root.Bus.$on('map-controller-popup', this.handlePopupClose);
    },
    beforeDestroy() {
        this.$root.Bus.$off('map-controller-popup', this.handlePopupClose);
    },
    methods: {
        // 弹窗关闭
        handlePopupClose(name) {
            if (name !== this.$options.name) {
                this.popupVisible = false;
            }
        },
        // 弹窗状态切换
        handlePopupSwitch() {
            this.popupVisible = !this.popupVisible;
            // 分发事件
            this.popupVisible && this.$root.Bus.$emit('map-controller-popup', this.$options.name);
        }
    }
};
