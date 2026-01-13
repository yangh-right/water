<template>
    <div>
        <w-modal
            class="secondary-modal"
            title="添加至方案库"
            :visible="visible"
            :width="610"
            destroyOnClose
            ok-text='下一步'
            @ok="handleOk"
            @cancel="handleCancel"
        >
            <custom-form ref="form" :options="options" @submit="handleSubmit"/>
        </w-modal>
    </div>
</template>

<script>
import customForm from '@/components/CustomForm';
import {
    queryPlanLibrary as apiQueryPlanLibrary
} from '@/api';
import { createNamespacedHelpers } from 'vuex';
const { mapActions } = createNamespacedHelpers('busi/library');

const _customData = {
    genOptions(self) {
        const _option = {
            id: Date.now(),
            layout: {
                gutter: 24,
                span: 24,
                labelCol: {span: 6},
                wrapperCol: {span: 17}
            },
            list: [{
                fieldType: 'treeSelect',
                fieldName: 'DirectoryLocation',
                label: '请选择目录位置',
                placeholder: '请选择',
                rules: [{required: true, message: '请选择目录位置'}],
                options: self.programList,
                attrs: {
                    replaceFields: {value: 'key'}
                }
            }]
        };
        return _option;
    }

};

export default {
    name: "programDialog",
    components: {
        customForm
    },
    props: {
        info: {
            type: Object,
            default: null
        }
    },
    data() {
        return {
            options: _customData.genOptions(this),
            visible: false,
            programList: []
        };
    },
    watch: {
        visible(val) {
            if (val) {
                this.getProgramListl();
            }
        }
    },
    methods: {
        ...mapActions([
            'setLibraryDetail'
        ]),
        // 获取目录列表
        async getProgramListl() {
            this.programList = await apiQueryPlanLibrary({});
            this.options = _customData.genOptions(this);
        },
        // 确认
        handleOk() {
            this.$refs.form.submit();
        },
        // 取消
        handleCancel() {
            this.$refs.form.reset();
            this.visible = false;
        },
        // 获取表单数据
        handleSubmit(data) {
            this.handleCancel();
            this.setLibraryDetail({catalogId: data.DirectoryLocation, ...this.info});
            this.drillDown({path: '/planLibrary'});
            // this.goto({path: '/planLibrary', query: {catalogId: data.DirectoryLocation, ...this.info}});
        }
    }
};
</script>

<style scoped lang="less">

</style>
