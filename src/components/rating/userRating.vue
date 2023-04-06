<template>
    <div style="margin: 50px auto 0 auto; width: 300px; ">
        请输入姓名：
        <el-input v-model="this.name"/>
    </div>
    <div style="margin: 20px auto; ">
        <el-button type="primary" @click="onSubmit">查询</el-button>
    </div>
    <div style="padding: 50px 0;">

        <el-table :data="contests" style="width: 100%" stripe="true" :empty-text="tableEmptyText" v-loading="loading">
            <el-table-column label="参加的比赛" >
                <el-table-column prop="ratingTime" label="定级时间" width="250" />
                <el-table-column prop="contestName" label="比赛名" width="450" />
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
  import { getUserRating } from "../../api/rating";
  import { changeColorByRating } from "../../api/changeColor";
  import { ElMessage } from 'element-plus'


  export default {


  data: function() {
    return{
        contests:[],
        total: 0,
        name: '',
        tableEmptyText: '暂无数据',
        loading: 0,
    }
  },

  created() {
  },

  methods: {

    onSubmit(){
        this.tableEmptyText = "正在查询中……";
        this.loading = ref(true);
        getUserRating(this.name).then((res) => {
            this.loading = 0;
            this.contests = res.data.data;
            console.log(res);
            this.tableEmptyText = "该队员未参加过比赛";
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
  