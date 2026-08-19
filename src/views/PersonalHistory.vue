<template>
  <div class="history-page" v-loading="loading">
    <div class="page-card">
      <div class="search-header">
        <h2 class="page-title">提交历史查询</h2>
      </div>
      <div class="search-bar">
        <span class="search-label">时间范围:</span>
        <el-date-picker
          v-model="range"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          value-format="YYYY-MM-DD HH:mm:ss"
          style="width: 400px"
        />
        <span class="search-label">题目名称:</span>
        <el-input v-model="keyword" placeholder="输入题目名称或题号" clearable style="width: 240px" @keyup.enter="onSearch" />
        <el-button type="primary" @click="onSearch">查 询</el-button>
        <el-button @click="onReset">重 置</el-button>
      </div>
    </div>

    <div class="table-card">
      <el-table :data="list" size="small" stripe :empty-text="tableEmptyText" style="width: 100%">
        <el-table-column label="平台" width="110" align="center">
          <template #default="s">
            <el-tag size="small" :type="s.row.platform === 'CF' ? 'primary' : 'warning'" effect="plain">{{ s.row.platform }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="time" label="提交时间" width="170" />
        <el-table-column label="状态" width="130" align="center">
          <template #default="s">
            <el-tag :type="s.row.ok ? 'success' : 'danger'" size="small">
              {{ s.row.ok ? '通过' : (s.row.status || '未通过') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="problemNo" label="题号" width="130" align="center" />
        <el-table-column label="题目" min-width="240" show-overflow-tooltip>
          <template #default="s">
            <el-link v-if="s.row.url" type="primary" :href="s.row.url" target="_blank">{{ s.row.problemName }}</el-link>
            <span v-else>{{ s.row.problemName }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="language" label="语言" min-width="160" show-overflow-tooltip />
        <el-table-column prop="runtime" label="耗时(ms)" width="100" align="center">
          <template #default="s">
            <span v-if="s.row.runtime != null">{{ s.row.runtime }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
      </el-table>
      <div class="history-pagination">
        <el-pagination
          background
          layout="total, prev, pager, next"
          :total="total"
          :page-size="pageSize"
          :current-page="page"
          @current-change="onPageChange"
        />
      </div>
    </div>

    <el-dialog v-model="loginVisible" title="提示" width="360px" align-center @closed="forceLogin">
      <div class="dialog-tip">请先登录后查询提交历史</div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="login">去登录</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import api from '../api'

const store = useStore()
const router = useRouter()
const loading = ref(false)
const range = ref(null)
const keyword = ref('')
const allData = ref([])
const page = ref(1)
const pageSize = 20
const tableEmptyText = ref('暂无数据')
const loginVisible = ref(false)

// 分页切片显示
const list = computed(() => {
  const start = (page.value - 1) * pageSize
  return allData.value.slice(start, start + pageSize)
})
const total = computed(() => allData.value.length)

onMounted(() => {
  if (store.state.login != 1) {
    loginVisible.value = true
    return
  }
  load()
})

function load() {
  loading.value = true
  const params = { uid: store.state.uid }
  if (range.value && range.value.length === 2) {
    params.start = Date.parse(range.value[0])
    params.end = Date.parse(range.value[1])
  }
  if (keyword.value) params.keyword = keyword.value
  api.getPersonalSubmitSearch(params).then(e => {
    loading.value = false
    const data = e.data
    if (data.code === 200) {
      allData.value = data.data || []
      page.value = 1
    } else {
      allData.value = []
      tableEmptyText.value = '查询失败'
    }
  }).catch(e => {
    console.log(e)
    loading.value = false
    allData.value = []
    tableEmptyText.value = '查询失败，请重试！'
  })
}

function onSearch() {
  page.value = 1
  load()
}

function onReset() {
  range.value = null
  keyword.value = ''
  page.value = 1
  load()
}

function onPageChange(p) {
  page.value = p
  load()
}

function login() {
  router.push('/login')
}

function forceLogin() {
  router.push('/login')
}
</script>

<style scoped>
.search-header { display: flex; align-items: center; justify-content: space-between; }
.search-bar { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.search-label { font-size: 14px; color: var(--text-secondary); font-weight: 500; }
.history-pagination { display: flex; justify-content: flex-end; margin-top: 16px; }
.table-card { margin-top: 20px; }
</style>
