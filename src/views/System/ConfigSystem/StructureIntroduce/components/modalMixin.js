import { addStructureIntroduce, editStructureIntroduce } from '@/api/optimization';

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
    async addStructure() {
      let params = { ...this.form };
      const { status } = await addStructureIntroduce(params);
      if (status === 'complete') {
        this.$message.success('添加成功');
        this.$emit('submit');
      }
    },
    async editStructure() {
      let params = { ...this.form };
      const { status, resultData } = await editStructureIntroduce(params);
      if (status === 'complete') {
        this.$message.success('编辑成功');
        this.$emit('submit');
      }
    },
    async handleSubmit() {
      this.$refs['form'].validate(async validate => {
        console.log('validate', this.type);
        if (!validate) {
          this.$message.error('请填写正确的信息');
        } else {
          if (this.type.includes('edit')) {
            this.confirmLoading = true;
            try {
              await this.editStructure();
            } catch (error) {
              console.log(error);
            } finally {
              this.confirmLoading = false;
            }
          } else {
            await this.addStructure();
          }
        }
      });
    },
    handleCancel() {
      this.$emit('update:type', '');
      this.$emit('cancel');
    }
  }
};
