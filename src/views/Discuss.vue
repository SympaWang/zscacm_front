<template>
  <div class="discuss-page">
    <div class="page-card">
      <div class="discuss-header">
        <h2 class="page-title">讨论区</h2>
        <el-button type="primary" size="large" @click="openAdd">
          <el-icon style="margin-right: 6px"><EditPen /></el-icon>发 帖
        </el-button>
      </div>

      <el-table :data="discussList" style="width: 100%" stripe :empty-text="tableEmptyText" v-loading="loading">
        <el-table-column label="帖子信息">
          <el-table-column prop="title" label="帖子标题" min-width="260">
            <template #default="scope">
              <el-link type="primary" :underline="false" @click="openDetail(scope.row)" class="post-title">{{ scope.row.title }}</el-link>
            </template>
          </el-table-column>
          <el-table-column prop="username" label="发贴用户" width="140" align="center" />
          <el-table-column prop="createTime" label="发帖时间" width="180" align="center" />
          <el-table-column prop="reply_num" label="回复数" width="90" align="center">
            <template #default="scope">
              <el-tag size="small" type="info" effect="plain">{{ scope.row.reply_num }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="text" label="帖子摘要" min-width="260" show-overflow-tooltip />
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

    <el-dialog v-model="addVisible" title="发表新帖" width="640px" align-center>
      <el-form :model="addForm" label-width="60px">
        <el-form-item label="标题">
          <el-input v-model="addForm.title" maxlength="60" show-word-limit placeholder="请输入帖子标题" />
        </el-form-item>
        <el-form-item label="内容">
          <el-input v-model="addForm.context" type="textarea" :rows="10" placeholder="支持 HTML 内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addVisible = false">取消</el-button>
          <el-button type="primary" @click="addDiscuss">发 布</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import { EditPen } from '@element-plus/icons-vue'
import api from '../api'

const router = useRouter()
const store = useStore()
const loading = ref(false)
const discussList = ref(null)
const pageCount = ref(1)
const currentPage = ref(1)
const tableEmptyText = ref('没有符合条件的帖子')
const total = ref(0)
const addVisible = ref(false)
const addForm = ref({ title: '', context: '' })

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
      if (t.text.length > 30) {
        t.text = t.text.substring(0, 30) + '......'
      }
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

function openDetail(row) {
  store.commit('setDiscuss', JSON.stringify(row))
  router.push('/discuss/detail')
}

function openAdd() {
  if (store.state.login != 1) {
    ElMessage.warning('请先登录')
    return
  }
  addVisible.value = true
}

function addDiscuss() {
  api.addDiscuss({ username: store.state.username, title: addForm.value.title, context: addForm.value.context })
    .then(res => {
      if (res.data.code == 200) {
        ElMessage.success('发布成功')
        addVisible.value = false
        addForm.value = { title: '', context: '' }
        getDiscussList()
      } else {
        ElMessage.error('发布失败')
      }
    }).catch(e => console.log(e))
}

onMounted(() => { getDiscussList() })
</script>

<style scoped>
.discuss-header { display: flex; align-items: center; justify-content: space-between; }
.discuss-header .page-title { margin-bottom: 16px; }
.post-title { font-size: 15px; font-weight: 500; }
</style>
