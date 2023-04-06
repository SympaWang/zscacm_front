<template>

      <div style="padding: 50px 0; width: 100%">
        <div style="padding: 10px 0;">
        请选择年级
        <el-select v-model="grade" class="m-2" placeholder="Select" size="large">
            <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
            />
    </el-select>
    <el-button type="primary" @click="getUser">查询</el-button>

    </div>

    <div style="padding: 10px 0; float: left;">
    <el-button type="primary" @click="addList()">添加用户</el-button>

    </div>
    <div>
        <el-table :data="users" style="width: 100%" @sort-change="sortChange">
            <el-table-column label="用户信息" >
                <el-table-column prop="username" label="姓名" width="200" />
                <el-table-column prop="pyName" label="姓名拼音" width="150"/>
                <el-table-column prop="grade" label="年级" width="150"/>
                <el-table-column prop="studentNum" label="学号" width="220"/>
                <el-table-column prop="lgid" label="洛谷id" width="150"/>
                <el-table-column prop="handle" label="cf用户名" width="150"/>
                <el-table-column prop="vjName" label="VJ账号" width="220"/>
                <el-table-column prop="email" label="邮箱" width="200"/>
                <el-table-column prop="phone" label="手机号" width="150"/>
                <el-table-column label="操作">
                    <template v-slot="scope">
                        <el-button text @click="fixlist(scope.row)">
                            修改
                        </el-button>
                    </template>
                </el-table-column>
            </el-table-column>
        </el-table>
    </div>
      </div>

      <el-dialog
        v-model="addVisible"
        title="添加用户"
        width="30%"
        :before-close="handleClose"
    >
        <el-form  v-for="addForm in addForm" :key="addForm" :model="addForm" label-width="120px">
            <el-form-item label="姓名">
                <el-input v-model="addform.username" />
            </el-form-item>
            <el-form-item label="姓名拼音">
                <el-input v-model="addform.pyName" />
            </el-form-item>
            <el-form-item label="年级">
                <el-select v-model="addform.grade" class="m-2" placeholder="Select" size="large">
                    <el-option
                    v-for="item in options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                    />
                </el-select>
            </el-form-item>
            <el-form-item label="学号">
                <el-input v-model="form.studentNum" />
            </el-form-item>
            <el-divider></el-divider>
        </el-form>
        <template #footer>
        <span class="dialog-footer">
            <el-button @click="add()">+</el-button>
            <el-button @click="reduce" :disabled="flag">-</el-button>
            <el-button @click="resetForm()">重置</el-button>
            <el-button @click="addVisible = false">取消</el-button>
            <el-button type="primary" @click="updateUser()">
            确定
            </el-button>
        </span>
        </template>
    </el-dialog>
      
      <el-dialog
        v-model="dialogVisible"
        title="修改信息"
        width="30%"
        :before-close="handleClose"
    >
        <el-form :model="form" label-width="120px">
            <el-form-item label="姓名">
                <el-input v-model="form.username" />
            </el-form-item>
            <el-form-item label="姓名拼音">
                <el-input v-model="form.pyName" />
            </el-form-item>
            <el-form-item label="年级">
                <el-select v-model="form.grade" class="m-2" placeholder="Select" size="large">
                    <el-option
                    v-for="item in options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                    />
                </el-select>
            </el-form-item>
            <el-form-item label="学号">
                <el-input v-model="form.studentNum" />
            </el-form-item>
            <el-form-item label="洛谷id">
                <el-input v-model="form.lgid" />
            </el-form-item>
            <el-form-item label="cf用户名">
                <el-input v-model="form.handle" />
            </el-form-item>
            <el-form-item label="VJ账号">
                <el-input v-model="form.vjName" />
            </el-form-item>
            <el-form-item label="邮箱">
                <el-input v-model="form.email" />
            </el-form-item>
            <el-form-item label="手机号">
                <el-input v-model="form.phone" />
            </el-form-item>
            <el-form-item label="用户权限" v-if="this.$store.state.userType==0">
                <el-select v-model="form.userType" class="m-2" placeholder="Select" size="large">
                    <el-option
                    v-for="item in userType"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                    />
                </el-select>
            </el-form-item>
        </el-form>
        <template #footer>
        <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="updateUser()">
            确定
            </el-button>
        </span>
        </template>
    </el-dialog>
</template>


<script>

import { getUserDetailList, updateUserDetail } from '../../api/manage';
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';

export default {
  data: function() {
    return{
      contests: null,
      users: null,
      loading: 0,
      grade: null,
      dialogVisible: false,
      addVisible: false,
      flag: true,
      addForm: [
        {
          username: '',
          pyName: '',
          grade: '',
        }
      ],
      options:[
        {
        value: '全部',
        label: '',
        },
        {
        value: '2019',
        label: '2019',
        },
        {
            value: '2020',
            label: '2020',
        },
        {
            value: '2021',
            label: '2021',
        },
        {
            value: '2022',
            label: '2022',
        },
        ],
        userType: [
            {
                value: 0,
                label: '超级管理员',
            },
            {
                value: 1,
                label: '管理员',
            },
            {
                value: 2,
                label: '队员',
            },
        ],
        form: {
            id: '',
            username: '',
            pyName: '',
            grade: '',
            studentNum: '',
            lgid: '',
            handle: '',
            vjName: '',
            email: '',
            phone: '',
            userType: '',
        },
    }
  },

  methods: {

    getUser() {
        getUserDetailList().then((res) => {
        console.log(res)
        this.users = res.data.data
        this.users.forEach(user => {

            if(user.userType == 0) user.userType = '超级管理员';
            if(user.userType == 1) user.userType = '管理员';
            if(user.userType == 2) user.userType = '队员';

        });
        })
        .catch((err) => {
        ElMessage.error('请求超时，请重试！');
        console.log(err)
        })
    },
    fixlist(row){
        this.dialogVisible = true
        this.form = row
    },
    addList() {
        this.addVisible = true
    },
    add() {
      var user = { username: '', pyName: '', grade: '' }
      this.addForm.push(user)
      this.flags()
    },
    reduce() {
      this.addForm.length = this.addForm.length - 1
      this.flags()
    },
    flags() {
      if (this.addForm.length < 2) {
        this.flag = true
      } else {
      	//先赋值为true再赋为false, 不然会没反应
        this.flag = true
        this.flag = false
      }
    },
    resetForm() {
      this.addForm = [{}]
    },

    updateUser() {
        this.dialogVisible = false;

        console.log(this.form)
        if(this.form.userType == "超级管理员") this.form.userType = 0;
        if(this.form.userType == '管理员') this.form.userType = 1;
        if(this.form.userType == '队员') this.form.userType = 2;
        
        updateUserDetail(this.form).then((res) => {
            console.log(res)
        })
        .catch((err) => {
        ElMessage.error('请求超时，请重试！');
        console.log(err)
        })
    }


  },

  created: function()  {

    this.getUser();

  }

}

</script>