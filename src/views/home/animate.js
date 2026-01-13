export class LatLngsAnimate {
  speed = 0.00001
  ratio = 1
  pathIndex = 0 // 分段path index
  index = 0     // 当前path 点的index

  isPause = false
  isRunning = false
  constructor({
    latLngs, onUpdate, onCompleted
  }) {
    /* [
     *   [[y1, x1], [y2, x2]],
     *   [...],
     *   [...]
     * ]
     */
    // console.log(latLngs)
    this.latLngs = latLngs;
    this.onUpdate = onUpdate;
    this.onCompleted = onCompleted;
  }

  get velocity() {
    return this.speed * this.ratio;
  }

  get lastPoint() {
    const lastPath = this.latLngs[this.latLngs.length - 1];
    const lastPoint = lastPath?.[lastPath.length - 1];
    return lastPoint;
  }

  tick() {
    requestAnimationFrame(() => {
      if (!this.isRunning) {
        return;
      }
      if (this.isPause) {
        this.tick();
        return;
      }

      const x = this.velocity * Math.cos(this.slope);
      const y = this.velocity * Math.sin(this.slope);
      let latLng = [this.current[0] + y, this.current[1] + x];
      // 如果重合了
      if (Math.abs(this.next[0] - this.prev[0]) <= Number.EPSILON) {
        this.current = [...this.next];
        this.onUpdate(this.current);
        this.index++;
        this.nextPoint();
        // 如果超出了下个点
      } else if ((latLng[0] - this.prev[0]) / (this.next[0] - this.prev[0]) >= 1) {
        latLng = [...this.next];
        this.current = [...latLng];
        this.onUpdate(latLng);
        this.index++;
        this.nextPoint();
      } else {
        this.current = [...latLng];
        this.onUpdate(latLng);
        // 否则下一帧
        this.tick();
      }
    });
  }

  nextPoint() {
    this.current = this.currentPath[this.index];
    this.prev = this.currentPath[this.index];
    this.next = this.currentPath[this.index + 1];
    this.onUpdate(this.prev);
    if (this.next) {
      const dy = this.next[0] - this.prev[0];
      const dx = this.next[1] - this.prev[1];

      // 获取角度
      this.slope = Math.atan(dy / dx) || Math.PI / 2;
      // 点在第二象限
      if (dx < 0 && dy > 0) {
        this.slope += Math.PI;
        // 第三象限
      } else if (dx < 0 && dy < 0) {
        this.slope -= Math.PI;
      }
      // 开始画帧数
      this.isRunning = true;
      this.tick();
    } else {
      this.isRunning = false;
      this.nextPath();
    }
  }

  start() {
    this.pathIndex = 0;
    this.beginPath();
  }

  stop() {
    this.isRunning = false;
  }

  nextPath() {
    if (!this.isRunning) {
      this.pathIndex++;
      if (this.pathIndex >= this.latLngs.length) {
        if (this.lastPoint) {
          this.onUpdate(this.lastPoint);
        }
        return;
      }
      this.beginPath();
    } else {
      this.isRunning = false;
      // 如果在播放，则暂停下一下一帧开始下一个路径
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.pathIndex++;
          if (this.pathIndex >= this.latLngs.length) {
            if (this.lastPoint) {
              this.onUpdate(this.lastPoint);
            }
            return;
          }
          this.beginPath();
        });
      });
    }
  }

  prevPath() {
    if (!this.isRunning) {
      this.pathIndex--;
      if (this.pathIndex < 0) this.pathIndex = 0;
      this.beginPath();
    } else {
      this.isRunning = false;
      // 如果在播放，则暂停下一下一帧开始上一个路径
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.pathIndex--;
          if (this.pathIndex < 0) this.pathIndex = 0;
          this.beginPath();
        });
      });
    }
  }

  beginPath() {
    this.currentPath = this.latLngs[this.pathIndex];
    if (this.currentPath) {
      this.index = 0;
      this.nextPoint();
    } else {
      this.onCompleted();
    }
  }

  pause() {
    this.isPause = true;
  }

  resume() {
    this.isPause = false;
  }

  setRatio(ratio) {
    this.ratio = ratio;
  }
}
