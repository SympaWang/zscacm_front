<template>
    <div style="margin: 200px 300px; background-color: white;">
        <div style="padding: 40px 0; font-size: 40px;">
            修改密码
        </div>
        <div style="color: red;">{{info}}</div>
        <div style="padding: 40px 40px;">
            <el-form :model="form" label-width="120px">
            <el-form-item label="原密码">
                <el-input v-model="form.oldPassword" />
            </el-form-item>

            <el-form-item label="新密码">
                <el-input v-model="form.newPassword" show-password/>
            </el-form-item>
            <el-form-item label="重复输入新密码">
                <el-input v-model="checkPassword" show-password/>
            </el-form-item>
            </el-form>
            <el-button type="primary" @click="onSubmit">确定</el-button>
        </div>
    </div>
  </template>
  
  <script>
  import { reactive } from 'vue'
  import { changePassword } from "../../api/changePassword";
  import { ElMessage } from 'element-plus'

  export default {

    data: function() {
        return{
            form: reactive({
                oldPassword: '',
                newPassword: '',
            }),
            info: '',
            checkPassword: '',
        }

    },

    methods: {
        onSubmit() {
            
            if(this.form.newPassword != this.checkPassword) {
                this.info = "两次密码输入不一致！";
                return;
            }

            changePassword(this.$store.state.uid, this.form.oldPassword,
             this.form.newPassword).then((res) => {

                this.info = '';
                if(res.data.code != 200) {
                    this.info = '原密码错误!';
                } else {
                    localStorage.removeItem('userToken');
                    this.$store.commit('setLogin', 0);
                    this.$store.commit('setUsername', '');
                    this.$store.commit('setUserType', 2);

                    window.location.replace("http://localhost:5173");
                }

            })
            .catch((err) => {
                ElMessage.error('请求超时，请重试！');
                console.log(err)
            })

        }
    },


  }

  </script>