<template>
  <div class="manage-page">
    <div class="page-card">
      <h2 class="page-title">系统登录记录</h2>
      <div class="toolbar">
        <el-input
          v-model="keyword"
          placeholder="搜索用户名 / IP"
          clearable
          style="width: 260px"
          @keyup.enter="search"
          @clear="search"
        >
          <template #append>
            <el-button @click="search">搜索</el-button>
          </template>
        </el-input>
        <span class="toolbar-total">共 {{ total }} 条记录</span>
      </div>
      <el-table :data="logList" style="width: 100%" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="70" align="center" />
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="loginIp" label="登录IP" width="140" />
        <el-table-column label="状态" width="90" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'" size="small" effect="plain">
              {{ scope.row.status === 1 ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="message" label="结果" width="150" show-overflow-tooltip />
        <el-table-column prop="createTime" label="登录时间" width="170" align="center" />
        <el-table-column prop="userAgent" label="浏览器/设备" min-width="240" show-overflow-tooltip />
      </el-table>

      <div class="example-pagination-block" v-if="total > 0">
        <el-pagination
          layout="total, prev, pager, next"
          :total="total"
          :page-size="pageSize"
          :current-page="currentPage"
          background
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
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
const logList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = 20
const keyword = ref('')

function load() {
  loading.value = true
  api.getLoginLogList({
    keyword: keyword.value || undefined,
    currentPage: currentPage.value,
    limit: pageSize
  }).then(res => {
    loading.value = false
    if (res.data.code === 200) {
      logList.value = res.data.data.list || []
      total.value = res.data.data.total || 0
    } else {
      ElMessage.error(res.data.msg || '查询失败')
    }
  }).catch(e => {
    console.log(e)
    loading.value = false
    ElMessage.error('请求超时，请重试！')
  })
}

function search() {
  currentPage.value = 1
  load()
}

function handleCurrentChange(p) {
  currentPage.value = p
  load()
}

onMounted(() => {
  if (store.state.login != 1) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  load()
})
</script>

<style scoped>
.manage-page { padding: 8px; }
.page-card { background: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,.05); }
.page-title { margin: 0 0 16px; font-size: 18px; font-weight: 600; }
.toolbar { margin-bottom: 16px; display: flex; align-items: center; gap: 12px; }
.toolbar-total { font-size: 13px; color: #909399; }
.example-pagination-block { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
