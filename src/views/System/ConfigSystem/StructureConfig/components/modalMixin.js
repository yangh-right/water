export default {
  data() {
    return {
      confirmLoading: false
    };
  },
  methods: {
    restForm() {
      this.locationNew = [];
    },
    async addLocation() {
      //处理存在空的location
      let location = this.locationNew.filter(element => {
        return element.name !== '';
      });
      if (!location.length) {
        return true;
      }
      try {
        for (let index = 0; index < location.length; index++) {
          const element = location[index];
          await this.postLocation(element, index);
        }
        this.$message.success('添加位置成功');
        return false;
      } catch (error) {
        console.log(error);
      }
    },
    //后端要求：多个创建时，中间需要有间隔时间
    async postLocation(element, index) {
      let that = this;
      return new Promise(function(resolve, reject) {
        setTimeout(() => {
          try {
            that.$http.post('/place/createLocations', [
              {
                name: element.name,
                waterPlantId: that.specialParams.waterPlantId,
                path: that.specialParams.placeId || that.specialParams.path,
                pid: that.specialParams.placeId || that.specialParams.pid,
                type: that.specialParams.type
              }
            ]);
            resolve();
          } catch (error) {
            reject(error);
          }
        }, index * 1000);
      });
    },
    async deleteLocation(i, type) {
      //判断是否时时删除 手动新增的 还是 原本就有的
      if (type) {
        try {
          let { resultData } = await this.$http.get(
            `/place/deleteFlag?entityId=${this.location[i].id}`
          );
          // 可以删除
          if (resultData) {
            this.$confirm({
              title: '确定删除该位置吗?',
              okText: '确定删除',
              cancelText: '取消',
              onOk: async () => {
                try {
                  await this.$http.delete(`/place?entityId=${this.location[i].id}`);
                  this.location.splice(i, 1);
                  this.$message.success('删除位置成功');
                } catch (error) {
                  console.log(error);
                }
              }
            });
          } else {
            //不能删除
            this.$confirm({
              title: '该位置有关联设备无法删除',
              okText: '关闭',
              cancelButtonProps: { style: { display: 'none' } },
              okButtonProps: { style: { 'margin-left': 0 } },
              onOk: () => {}
            });
          }
        } catch (error) {
          console.log(error);
        }
      } else {
        this.locationNew.splice(i, 1);
      }
    },
    async editLocation() {
      for (let index = 0; index < this.location.length; index++) {
        const element = this.location[index];
        try {
          await this.$http.put('/place/createFacility', {
            id: element.id,
            name: element.name,
            waterPlantId: this.specialParams.waterPlantId,
            path: this.specialParams.placeId || this.specialParams.path,
            pid: this.specialParams.placeId || this.specialParams.pid,
            type: this.specialParams.type
          });
        } catch (error) {
          console.log(error);
        }
      }
    },
    async handleSubmit() {
      this.$refs['form'].validate(async validate => {
        if (!validate) {
          this.$message.error('请填写正确的信息');
        } else {
          let flag = true; //如果没有对水池进行新增的话，为true，否则为false
          if (this.type.includes('edit')) {
            this.confirmLoading = true;
            try {
              flag = await this.addLocation();
              await this.editLocation();
            } catch (error) {
              console.log(error);
            } finally {
              this.confirmLoading = false;
              this.form.locations = [];
            }
          } else {
            //处理存在空的location
            let location = this.locationNew.filter(element => element);
            this.form.locations = location;
          }
          if (this.form.processingType !== 'biochemical_treatment') {
            this.form.line = 0;
          }
          this.$emit('submit', this.form, this.type, flag);
        }
      });
    },
    handleCancel() {
      this.$emit('update:type', '');
      this.$emit('cancel');
    }
  }
};
