/*
 * @Description: 添加搜索地址控件
 * @Author: zhangtianwen
 * @LastEditTime: 2020-08-06 16:05:15
 */
export default function(){
    return class SearchControl extends BMap.Control {
        constructor({ anchor, width,height } = { anchor:BMAP_ANCHOR_TOP_LEFT, width:10,height:10}) {
            super();
            this.defaultAnchor = anchor;
            this.defaultOffset = new BMap.Size(width, height);
        }
        initialize(map) {
            const div = document.createElement('div');
            div.classList.add('search-box');
            div.insertAdjacentHTML('beforeend',`<input id="search" class="ant-input"/>`);
            map.getContainer().appendChild(div);
            return div;
        }
    }
} 