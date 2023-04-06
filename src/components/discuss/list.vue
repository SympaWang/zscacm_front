<template>

<div style="padding: 50px 0;">
    
    <el-table :show-header="false" :data="discussList" stripe="true" v-loading="loading" class="el-table">
      <el-table-column prop="id">
        <template v-slot="scope">

          <div style="padding: 10px 10px 10px 10px;">
            <div class="title">
            <b>{{scope.row.title}}</b>
          </div>

          <div style="  margin: 20px 0;">
            <div v-html="scope.row.text" class="context">
            </div>
            <routerLink :to="{name: 'discussDetail'} " @click="sendDiscuss(JSON.stringify(scope.row))">
              <a >查看原文</a>
            </routerLink>
          </div>

          <div style="margin-top: 10px;">
              <div style="float: left; margin-right: 10px;">
              {{scope.row.username}}
              </div>
              <div style="float: left;">
                发布于:{{scope.row.createTime}}
              </div>
              <div style="float: right;">
                <el-icon><ChatDotSquare /></el-icon>
                {{scope.row.reply_num}}
              </div>
          </div>

          </div>
          
        </template>
      </el-table-column>
    </el-table>

</div>
<div class="example-pagination-block" :empty-text="tableEmptyText" >
        <el-pagination layout="prev, pager, next" 
        :total="total" 
        :page-count="pageCount"
        :current-page="currentPage"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        @click="onSubmit"
        />
    </div>

      
</template>

<script>

import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { getDiscussList } from "../../api/discuss";

export default {
  data: function() {
    return{
      discussList: null,
      pageCount: 1,
      currentPage: 1,
      tableEmptyText: "没有符合条件的题目",
      loading: 0,
      total: 0,
    }
  },

  methods: {
    handleSizeChange(val){
      this.pageSize=val;
    },
    handleCurrentChange(val){
      this.currentPage=val;
    },

    sendDiscuss(discuss){
      this.$store.commit('setDiscuss', discuss);
    },

    onSubmit(){
      this.tableEmptyText = "正在查询中……";
        this.loading = ref(true);
        getDiscussList(this.currentPage).then((res) => {
            console.log(res);
            this.total = res.data.data.length;
            this.pageCount = Math.floor(this.total / 30);
            if(this.total % 30 != 0) this.total = this.total + 1;

            this.discussList = res.data.data;
            this.discussList.forEach(discuss => {
              discuss.text = discuss.context.replace(/<(style|script|iframe)[^>]*?>[\s\S]+?<\/\1\s*>/gi, '').replace(/<[^>]+?>/g, '').replace(/\s+/g, ' ').replace(/ /g, ' ').replace(/>/g, ' ');

            });
            this.loading = 0;
            this.tableEmptyText = "没有符合条件的题目";
        })
        .catch((err) => {
            this.discussList = null;
            console.log(err);
            ElMessage.error('请求超时，请重试！');
            this.tableEmptyText = "查询失败，请重试！";
            this.loading = 0;
        })
    }

  },

  created: function()  {
    this.onSubmit();
  }

}

</script>

<style>

.el-table{
            border-radius: 15px 15px 15px 15px;
 }

.title {
  -webkit-box-sizing: content-box;
  -moz-box-sizing: content-box;
  box-sizing: content-box;
  border: none;
  font: normal 21px/1 Impact, Charcoal, sans-serif;
  color: black;
  -o-text-overflow: ellipsis;
  text-overflow: ellipsis;
  letter-spacing: 4px;
  word-spacing: 3px;
}

.context {

  width:300px; 
  height:50px; 
  line-height:25px;
  overflow:hidden;
}

</style>