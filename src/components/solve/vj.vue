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
        <el-table :data="users" style="width: 100%" stripe="true" :empty-text="tableEmptyText" v-loading="loading">
            <el-table-column label="队员列表" >
                <el-table-column prop="id" label="题数排名" width="180" />
                <el-table-column prop="name" label="队员姓名" width="280" />
                <el-table-column prop="vjName" label="vj账号" width="300">
                    <template v-slot="scope">
                       <div><a :href="scope.row.url">{{scope.row.vjName}}</a> </div>
                    </template>
                </el-table-column>
                <el-table-column prop="weekProblem" label="7日内做题数"  width="180"/>
                <el-table-column prop="monthProblem" label="30日内做题数"  width="180"/>
                <el-table-column prop="totalProblem" label="总题量" />
            </el-table-column>
        </el-table>
    </div>
  </template>
  
  <script>
  import { reactive, ref } from 'vue'
  import { getVjUserList } from "../../api/ac";
  import { ElMessage } from 'element-plus'


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
        tableEmptyText: "没有符合条件的队员",
        loading: 0,
    }
  },

  created() {
    this.onSubmit();
  },

  methods: {

    onSubmit(){
        this.tableEmptyText = "查询中......";
        this.loading = ref(true);
        if(this.value == '' || this.value == '全部') this.value = null;
        getVjUserList(this.value).then((res) => {
            console.log(res)
            this.users = res.data.data;
            this.users.sort(this.cmp);
            var id = 1;
            this.users.forEach(user => {
                user.url = "https://vjudge.csgrandeur.cn/user/" + user.vjName;
                user.id = id;
                id = id + 1;
            });
            this.tableEmptyText = "没有符合条件的队员";
            this.loading = 0;
        })
        .catch((err) => {
            this.users = null;
            console.log(err);
            ElMessage.error('请求超时，请重试！');
            this.tableEmptyText = "查询失败，请重试！";
            this.loading = 0;
        })
    },

    cmp(user1, user2) {
        return user1.totalProblem > user2.totalProblem;
    }
  },


}

</script>
  