<template>
    <w-modal class="secondary-modal" v-model="visible" :title="option.title" :footer="null">
        <w-upload-dragger
            :file-list="fileList"
            :before-upload="beforeUpload"
            :multiple="false"
            name="file"
        >
            <p class="wpg-upload-drag-icon">
                <w-icon type="inbox" />
            </p>
            <p class="wpg-upload-text">点击或拖拽文件到此区域上传</p>
            <p class="wpg-upload-hint">每次只能进行单个文件的上传</p>
        </w-upload-dragger>
        <div class="foot">
            <a @click="exportTemp">下载导入模板</a>
            <w-button :disabled="fileList.length<1" style="float: right;" type="primary" @click="uploadFile">上传</w-button>
        </div>
        <w-spin class="loading" v-if="loading" tip="上传中...">
        </w-spin>
    </w-modal>
</template>

<script>
import { exportFile } from '@/utils/util';
export default {
    name:'portinDialog',
    props:{
        option:{
            type:Object,
            require:true
        }
    },
    data(){
        return {
            fileList:[],
            visible:false,
            loading:false
        }
    },
    watch:{
        visible(val){
            if(val){
                this.fileList = [];
            }
        }
    },
    methods:{
        uploadFile(){
            this.loading = true
            let file = this.fileList[0];
            let formData = new FormData();
            formData.append('file', file);
            this.option.upload(formData).then(res => {
                this.loading = false;
                this.visible = false;
                if(res.type !== 'text/xml'){
                  const fileReader = new FileReader();
                  fileReader.readAsText(res,'utf-8');
                  let _this = this;
                  fileReader.onload = function(){
                  let result = JSON.parse(fileReader.result)
                  if(result.status === 'complete') {
                    _this.$message.success('导入成功');
                    _this.$emit('importSuccess');
                  } else{
                    _this.$message.error('导入错误');
                    exportFile(res, '错误信息','txt');
                  }
                }
                }else{
                    this.$message.error('导入错误');
                    exportFile(res, '错误信息','txt');
                }
            });
        },
        beforeUpload(file,fileList) {
            this.fileList = fileList;
            return false;
        },
        exportTemp(){
            let vo ={
                templateFlag:true
            }
            this.option.download(vo).then(res => {
                exportFile(res, this.option.name);
            });
        }
    }
}
</script>

<style lang="less" scoped>
.foot{
    padding: 14px 0;
    a{
        font-size: 14px;
    }
}
.loading{
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 2;
}
</style>
