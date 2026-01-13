import Vue from 'vue';

Vue.directive('wpg-drag', {
  bind(el, binding) {
    let data = {
      id: Math.random(),
      el: el,
      isDown: false,
      nodePosition: {
        top: 0,
        left: 0
      },
      mousePosition: {
        x: 0,
        y: 0
      },
      offset: {
        x: 0,
        y: 0
      }
    };

    const handleMouseDown = e => {
      e.stopPropagation();
      if (data.isDown) return;
      const { clientX, clientY } = e;
      data.isDown = true;
      data.mousePosition = {
        x: clientX,
        y: clientY
      };
      const style = window.getComputedStyle(data.el);
      // 校验node元素定位
      if (style.position === 'static') {
        data.el.style.position = 'relative';
      }
      data.nodePosition = {
        top: parseFloat(style.top),
        left: parseFloat(style.left)
      };
      document.body.addEventListener('mousemove', handleMouseMove, false);
      document.body.addEventListener('mouseup', handleMouseUp, false);
    };
    const handleMouseMove = e => {
      e.stopPropagation();
      if (data.isDown) {
        const { clientX, clientY } = e;
        const { x, y } = data.mousePosition;
        const { top, left } = data.nodePosition;
        data.offset = {
          x: clientX - x,
          y: clientY - y
        };
        data.el.style.top = top + data.offset.y + 'px';
        data.el.style.left = left + data.offset.x + 'px';
      }
    };
    const handleMouseUp = e => {
      if (data.isDown) {
        // 之前累计偏移量
        let oldOffset = data.el.getAttribute('data-offset');
        oldOffset = oldOffset ? JSON.parse(oldOffset) : null;
        // 最新偏移量
        const offset = {
          x: (oldOffset ? oldOffset.x : 0) + data.offset.x,
          y: (oldOffset ? oldOffset.y : 0) + data.offset.y
        };

        data.isDown = false;
        data.el.setAttribute('data-offset', JSON.stringify(offset));

        document.body.removeEventListener('mousemove', handleMouseMove, false);
        document.body.removeEventListener('mouseup', handleMouseUp, false);
      }
    };

    el._wpgDrag = { handleMouseDown };
    if (binding.value) {
      el.addEventListener('mousedown', handleMouseDown, false);
    }
  },
  update(el, binding) {
    const { value, oldValue } = binding;
    if (!oldValue && value) {
      el.addEventListener('mousedown', el._wpgDrag.handleMouseDown, false);
    } else if (oldValue && !value) {
      el.removeEventListener('mousedown', el._wpgDrag.handleMouseDown, false);
    }
  },
  unbind(el) {
    if (el._wpgDrag) {
      el.removeEventListener('mousedown', el._wpgDrag.handleMouseDown, false);
    }
  }
});
