<template>
    <div style="margin: 50px auto 0 auto; width: 900px; ">
        请选择场次：
        <el-select v-model="value" class="m-2" placeholder="Select" size="large" style="width: 600px;" >
            <el-option
            v-for="item in contest"
            :key="item.id"
            :label="item.name"
            :value="item.id"
            />
    </el-select>
    </div>
    <div style="margin: 20px auto; ">
        <el-button type="primary" @click="onSubmit">查询</el-button>
    </div>
    <div style="padding: 50px 0;">

        <el-table :data="contests" style="width: 100%" :empty-text="tableEmptyText" v-loading="loading">
            <el-table-column label="参加的队员" >
                <el-table-column prop="username" label="姓名" width="250" />
                <el-table-column prop="handle" label="cf昵称" width="400">
                    <template v-slot="scope">
                       <div><a :href="scope.row.url">{{scope.row.handle}}</a> </div>
                    </template>
                </el-table-column>
                <el-table-column prop="rank" label="排名" width="180" />
                <el-table-column prop="oldRating" label="定级前分数" width="180">
                    <template v-slot="scope">
                        <div :style="rankStyle(scope.row.oldRating)">
                        {{scope.row.oldRating}}
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="newRating" label="定级后分数" width="180">
                    <template v-slot="scope">
                        <div :style="rankStyle(scope.row.newRating)">
                        {{scope.row.newRating}}
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="change" label="+/-">
                    <template v-slot="scope">
                        <div :style="changeStyle(scope.row.change)">
                        {{ scope.row.change > 0 ? '+' + scope.row.change : scope.row.change}}
                        </div>
                    </template>
                </el-table-column>
            </el-table-column>
        </el-table>
    </div>
  </template>
  
  <script>
  import { reactive, ref } from 'vue'
  import { getContestUser, getEndContests} from "../../api/rating";
  import { changeColorByRating} from "../../api/changeColor";
  import { ElMessage } from 'element-plus'


  export default {


  data: function() {
    return{
        contests:[],
        contest:[],
        total: 0,
        value: ref(''),
        tableEmptyText: '暂无数据',
        loading: 0,
    }
  },

  created() {
    this.getContest();
  },

  methods: {

    getContest(){
        getEndContests().then((res) => {
            this.contest = res.data;
        })
        .catch((err) => {
            console.log(err)
            ElMessage.error('请求超时，请重试！');
        })
    },

    onSubmit(){
        this.tableEmptyText = "正在查询中……";
        this.loading = ref(true);
        getContestUser(this.value).then((res) => {
            console.log(res)
            this.loading = 0;
            this.contests = res.data.data;
            this.contests.forEach(contest => {
                contest.url = "https://codeforces.com/profile/" + contest.handle;
            });
            this.tableEmptyText = "该比赛未定级或无人参加";
        })
        .catch((err) => {
            this.loading = 0;
            this.contests = null;
            console.log(err)
            ElMessage.error('请求超时，请重试！');
            this.tableEmptyText = "查询失败，请重试！";
        })
    },

    changeStyle(change){
        if(change > 0) return 'color: red;';
        else return 'color: green';
    },

    rankStyle(rank) {
        return changeColorByRating(rank);
    }


  },


}

</script>
  