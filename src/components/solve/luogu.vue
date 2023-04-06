<template>
    <div style="padding: 50px 0;">
        请选择年级
        <el-select v-model="value" class="m-2" placeholder="Select" size="large">
            <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
            />
    </el-select>
    <el-button type="primary" @click="onSubmit">查询</el-button>

    </div>
    <div style="padding: 50px 0;">
        <el-table :data="users" style="width: 100%" stripe="true" :empty-text="tableEmptyText">
            <el-table-column label="队员列表" >
                <el-table-column prop="id" label="题数排名" width="100" />
                <el-table-column prop="name" label="队员姓名" width="150" />
                <el-table-column prop="lgid" label="洛谷id" width="100">
                    <template v-slot="scope">
                       <div><a :href="scope.row.url">{{scope.row.lgid}}</a> </div>
                    </template>
                </el-table-column>
                <el-table-column prop="acNum1" label="暂无评定"  width="100"/>
                <el-table-column prop="acNum2" label="入门"  width="100"/>
                <el-table-column prop="acNum3" label="普及-"  width="100"/>
                <el-table-column prop="acNum4" label="普及/提高-"  width="100"/>
                <el-table-column prop="acNum5" label="普及+/提高"  width="100"/>
                <el-table-column prop="acNum6" label="提高+/省选"  width="100"/>
                <el-table-column prop="acNum7" label="省选/NOI-"  width="100"/>
                <el-table-column prop="acNum8" label="NOI/NOI+/CTSC"  width="100"/>

                <el-table-column prop="acNum" label="总题数" />
            </el-table-column>
        </el-table>
    </div>
  </template>
  
  <script>
  import { reactive, ref } from 'vue'
  import { getLuoguUserList } from "../../api/ac";

  export default {


  data: function() {
    return{
        users:[],
        value: ref(''),
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
        tableEmptyText: "没有符合条件的队员"
    }
  },

  created() {
    this.onSubmit();
  },

  methods: {

    onSubmit(){
        this.tableEmptyText = "查询中......";
        if(this.value == '' || this.value == '全部') this.value = null;
        getLuoguUserList(this.value).then((res) => {
            this.users = res.data.data;
            this.users.sort(this.cmp);
            var id = 1;
            this.users.forEach(user => {
                user.url = "https://www.luogu.com.cn/user/" + user.lgid;
                user.id = id;
                id = id + 1;
                user.acNum1 = user.solves[0].problemNum;
                user.acNum2 = user.solves[1].problemNum;
                user.acNum3 = user.solves[2].problemNum;
                user.acNum4 = user.solves[3].problemNum;
                user.acNum5 = user.solves[4].problemNum;
                user.acNum6 = user.solves[5].problemNum;
                user.acNum7 = user.solves[6].problemNum;
                user.acNum8 = user.solves[7].problemNum;
                console.log(user)
            });
            this.tableEmptyText = "没有符合条件的队员";
        })
        .catch((err) => {
            this.users = null;
            console.log(err);
            ElMessage.error('请求超时，请重试！');
            this.tableEmptyText = "查询失败，请重试！";
        })
    },

    cmp(user1, user2) {
        return user1.acNum > user2.acNum;
    }
  },


}

</script>
  