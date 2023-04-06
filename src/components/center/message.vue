<template>

    <div style="padding: 50px 0;">
        
        <el-table :show-header="false" :data="messageList" stripe="true" v-loading="loading" class="el-table">
          <el-table-column prop="id">
            <template v-slot="scope">
    
              <div style="padding: 10px 10px 10px 10px;">
    
              <div style="  margin: 20px 0;">
                <div  class="context">
                    {{scope.row.username}}{{scope.row.context}}
                </div>
                <routerLink :to="{name: 'discussDetail'} " @click="sendDiscuss(JSON.stringify(scope.row))">
                  <a >查看帖子</a>
                </routerLink>
              </div>
    
              <div style="margin-top: 10px;">
                  <div style="float: left;">
                    {{scope.row.createTime}}
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
    import { getMessageList } from "../../api/message";
    
    export default {
      data: function() {
        return{
          messageList: null,
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
            getMessageList(this.$store.state.uid, this.currentPage).then((res) => {
                console.log(res);
                this.messageList = res.data.data;
                this.loading = 0;
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