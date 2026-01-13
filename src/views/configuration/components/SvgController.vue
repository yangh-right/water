<!-- 组态按钮 -->
<template>
    <div class="svg">
        <div ref="svg"
            class="svg-container swiper-container"
            :style="{margin: list.length<5? 0: '0 20px'}">
            <div v-show="list.length>5" ref="svgPrev" class="svg-prev"><w-icon type="ic_chevron_left" class=""></w-icon></div>
            <div class="svg-wrapper swiper-wrapper" :class="list.length<=5&&'spe-wrapper'">
                <w-button v-for="item in list"
                          :key="item.id"
                          class="swiper-slide"
                          :class="svg===item.id&&'check'"
                          :title="item.svgName"
                          @click="handleCheck(item)"
                >{{ item.svgName }}
                </w-button>
            </div>
            <div v-show="list.length>5" ref="svgNext" class="svg-next"><w-icon type="ic_chevron_right" class=""></w-icon></div>
        </div>
    </div>
</template>

<script>
import Swiper from 'swiper';
import ResizeObserver from 'resize-observer-polyfill';
import { debounce } from '@/utils/js/tool/tools';

export default {
    name: 'SvgController',
    props: {
        list: {
            type: Array,
            default: () => ([])
        }
    },
    data() {
        return {
            svg: '',   // 当前选中的svg
            swiper: null   // swiper实例
        };
    },
    watch: {
        list(v) {
            this.svg = v?.[0]?.id;
            this.initSwiper();
        }
    },
    mounted() {
        // this.initSwiper();
    },
    methods: {
        /**
         * swiper初始化
         */
        initSwiper() {
            const swiper = new Swiper(this.$refs.svg, {
                slidesPerView: 'auto',
                freeMode: true,
                freeModeSticky: true,
                navigation: {
                    nextEl: this.$refs.svgNext,
                    prevEl: this.$refs.svgPrev
                }
            });
            this.swiper = swiper;
            // 监听尺寸变化
            const _mapResizeObserver = new ResizeObserver(debounce(swiper.update.bind(swiper), 100));
            _mapResizeObserver.observe(this.$refs.svg);
            this.$once('hook:beforeDestroy', _mapResizeObserver.disconnect.bind(_mapResizeObserver));
        },
        handleCheck(item) {
            this.svg = item.id;
            this.$emit('update', item);
        }
    }
};
</script>

<style scoped lang="less">
.svg {
    height: 36px;
    border-radius: 4px;
    overflow: hidden;

    &-container {
        height: 100%;
        margin: 0 20px;
        overflow: hidden;
    }

    &-wrapper {
        display: flex;
        align-items: center;
        height: 100%;
        .ant-radio-group {
            white-space: nowrap;
        }

        button {
            flex: none;
            min-width: 64px;
            padding: 0 7px;
            font-size: 12px;
            height: 100%;
            border-radius: 0;
            &:not(:last-of-type) {
                border-right: 0;
            }

            &.check,
            &:focus,&:hover {
                border-right: 1px solid;
                // border-color: var(--fc-main);
                & + .ant-btn {
                    border-left: 0;
                }
            }

            /deep/ &.ant-btn>span {
                max-width: 100px;
                text-overflow: ellipsis;
                white-space: nowrap;
                overflow: hidden;
                vertical-align: bottom;
            }
        }
    }
    .spe-wrapper {
        button:first-of-type{
            border-top-left-radius: 4px;
            border-bottom-left-radius: 4px;
        }
        button:last-of-type {
            border-top-right-radius: 4px;
            border-bottom-right-radius: 4px;
        }
    }

    &-prev, &-next {
        position: absolute;
        top: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 100%;
        font-size: 20px;
        cursor: pointer;
        z-index: 2;
        border: 1px solid ;

        &.swiper-button-disabled {
            color: #ccc;
            cursor: not-allowed;
        }
    }

    &-prev {
        left: 0;
        border-top-left-radius: 4px;
        border-bottom-left-radius: 4px;
    }

    &-next {
        right: 0;
        border-top-right-radius: 4px;
        border-bottom-right-radius: 4px;
    }
}
</style>
