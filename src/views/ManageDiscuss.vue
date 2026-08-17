<template>
  <div class="manage-page">
    <div class="page-card">
      <h2 class="page-title">帖子管理</h2>
      <el-table :data="discussList" style="width: 100%" v-loading="loading" :empty-text="tableEmptyText">
        <el-table-column prop="title" label="帖子标题" min-width="220" show-overflow-tooltip />
        <el-table-column prop="username" label="发贴用户" width="130" align="center" />
        <el-table-column prop="createTime" label="发帖时间" width="180" align="center" />
        <el-table-column prop="reply_num" label="回复数" width="100" align="center">
          <template #default="scope"><el-tag size="small" type="info" effect="plain">{{ scope.row.reply_num }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="text" label="帖子摘要" min-width="240" show-overflow-tooltip />
        <el-table-column label="操作" width="90" align="center" fixed="right">
          <template #default="scope">
            <el-button size="small" type="danger" plain @click="fixlist(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="example-pagination-block">
        <el-pagination
          layout="prev, pager, next"
          :total="total"
          :page-count="pageCount"
          :current-page="currentPage"
          background
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <el-dialog v-model="dialogVisible" title="操作确认" width="360px" align-center>
      <span>确定要删除该帖子吗?</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="danger" @click="deleteDiscuss(id)">确定删除</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="loginVisible" title="权限不足" width="360px" align-center>
      <span>此功能游客无法访问，请先登录!</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="login">去登录</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import api from '../api'

const store = useStore()
const router = useRouter()
const loading = ref(false)
const dialogVisible = ref(false)
const discussList = ref(null)
const pageCount = ref(1)
const currentPage = ref(1)
const tableEmptyText = ref('没有符合条件的帖子')
const total = ref(0)
const id = ref(0)
const loginVisible = ref(false)

function getDiscussList() {
  tableEmptyText.value = '正在查询中……'
  loading.value = true
  api.getDiscussList({ currentPage: currentPage.value - 1 }).then(e => {
    console.log(e)
    total.value = e.data.data.length
    pageCount.value = Math.floor(total.value / 30)
    if (total.value % 30 != 0) total.value = total.value + 1
    discussList.value = e.data.data
    discussList.value.forEach(t => {
      t.text = t.context
        .replace(/<(style|script|iframe)[^>]*?>[\s\S]+?<\/\1\s*>/gi, '')
        .replace(/<[^>]+?>/g, '')
        .replace(/\s+/g, ' ')
        .replace(/ /g, ' ')
        .replace(/>/g, ' ')
      if (t.text.length > 30) t.text = t.text.substring(0, 30) + '......'
    })
    loading.value = false
    tableEmptyText.value = '没有符合条件的帖子'
  }).catch(e => {
    discussList.value = null
    console.log(e)
    ElMessage.error('请求超时，请重试！')
    tableEmptyText.value = '查询失败，请重试！'
    loading.value = false
  })
}

function handleCurrentChange(l) { currentPage.value = l }

function fixlist(e) {
  dialogVisible.value = true
  id.value = e.discussId
}

function deleteDiscuss(e) {
  api.deleteDiscuss({ id: e }).then(() => {
    dialogVisible.value = false
    ElMessage.success('删除成功')
    getDiscussList()
  }).catch(t => { console.log(t) })
}

function login() {
  router.push('/login')
}

onMounted(() => {
  if (store.state.login != 1) loginVisible.value = true
  getDiscussList()
})
</script>
