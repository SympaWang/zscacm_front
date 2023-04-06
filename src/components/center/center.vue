<template>

    <div style="padding: 40px 0;">
        <div style="padding: 10px 0;">
            我的信息
            <a @click="check=false"  v-if="check==true">编辑</a>
        </div>
        <el-form :model="user" label-width="120px">

            <el-form-item value="username" label="姓名">
                <el-input v-model="user.username" :disabled="check"/>
            </el-form-item>

            <el-form-item value="studentNum" label="学号">
                <el-input v-model="user.studentNum"  :disabled="check"/>
            </el-form-item>

            <el-form-item value="pyName" label="姓名拼音(全部小写)">
                <el-input v-model="user.pyName"  :disabled="check"/>
            </el-form-item>

            <el-form-item value="lgid" label="洛谷id">
                <el-input v-model="user.lgid"  :disabled="check"/>
            </el-form-item>

            <el-form-item value="vjName" label="VJ用户名">
                <el-input v-model="user.vjName"  :disabled="check"/>
            </el-form-item>

            <el-form-item value="handle" label="cf用户名">
                <el-input v-model="user.handle"  :disabled="check"/>
            </el-form-item>

            <el-form-item value="email" label="邮箱">
                <el-input v-model="user.email"  :disabled="check"/>
            </el-form-item>

            <el-form-item value="phone" label="电话">
                <el-input v-model="user.phone"  :disabled="check"/>
            </el-form-item>

            <el-form-item v-if="check==false">
                <el-button type="primary" @click="onSubmit">保存</el-button>
            </el-form-item>

            </el-form>
    </div>
          
    </template>
    
    <script>
    
    import { reactive, ref } from 'vue';
    import { ElMessage } from 'element-plus';
    import { getUserDetail, updateUserDetail } from '../../api/center';
    
    export default {
      data: function() {
        return{
            user: '',
            check: true,
        }
      },
    
      methods: {
    
        onSubmit() {
            this.check = true;
            updateUserDetail(this.user).then((res) => {
                

            })
            .catch((err) => {

            })
        }
      },
    
      created: function()  {

        getUserDetail(this.$store.state.uid).then((res) => {
                console.log(res);
                this.user = res.data.data;
            })
            .catch((err) => {
            })

      }
    
    }
    
    </script>
    
    <style>
    
    
    </style>