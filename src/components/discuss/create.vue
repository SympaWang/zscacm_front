<template>

    <div style="padding: 30px 0; float: left;">
        <el-button type="primary" @click="changeShow">发布帖子</el-button>
    </div>
    <div>
        <editor v-show="show"></editor>
    </div>
          

</template>
    
<script>
    
    import { reactive, ref } from 'vue';
    import { ElMessage } from 'element-plus';
    import editor from '../utils/editor.vue';
    import { addDiscuss } from "../../api/discuss";
    
    export default {
      data: function() {
        return{
            show: false,
        }
      },
    
    components: {
        editor
    },

    methods: {
        changeShow() {
            if(this.show == false) {
                this.show = true;
            } else {
                this.show = false;
            }
        },

        onSubmit(title, msg) {
            console.log(1)
            addDiscuss(this.$store.state.username, title, msg).then((res) => {
                console.log(res);

            })
            .catch((err) => {
                ElMessage.error('提交失败，请重试！');
                console.log(err)
            })
        }
    },

    created: function()  {

    }
    
    }
    
</script>