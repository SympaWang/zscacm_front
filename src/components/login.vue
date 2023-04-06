<template>
    <div style="margin: 200px 300px; background-color: white;">
        <div style="padding: 40px 0; font-size: 40px;">
            登录
        </div>
        <div style="color: red;">{{info}}</div>
        <div style="padding: 40px 40px;">
            <el-form :model="form" label-width="120px">
            <el-form-item label="用户名">
                <el-input v-model="form.name" />
            </el-form-item>

            <el-form-item label="密码">
                <el-input v-model="form.password" show-password/>
            </el-form-item>
            </el-form>
            <el-button type="primary" @click="onSubmit">登录</el-button>
            <el-button type="info">忘记密码？</el-button>
        </div>
    </div>
  </template>
  
  <script>
  import { reactive } from 'vue'
  import { login } from "../api/login";
  import { ElMessage } from 'element-plus'

  export default {

    data: function() {
        return{
            form: reactive({
            name: '',
            password: '',
            }),
            info: '',
        }

    },

    methods: {
        onSubmit() {
            var user = reactive({
                username: this.form.name,
                password: this.form.password
            })
            
            login(user).then((res) => {
                this.info = '';
                if(res.data.data.token == undefined) {
                    this.info = '用户名或密码错误！';
                } else {
                    localStorage.setItem('userToken', res.data.data.token);
                    console.log(localStorage.getItem('userToken'));
                    this.$store.commit('setLogin', 1);
                    this.$store.commit('setUid', res.data.data.uid);
                    this.$store.commit('setUsername', this.form.name);
                    this.$store.commit('setUserType', res.data.data.userType);
                    console.log(res.data.data.userType);
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