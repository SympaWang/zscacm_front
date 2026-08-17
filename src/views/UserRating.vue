<template>
  <div class="rating-page">
    <div class="search-bar">
      <span class="search-label">选择年级:</span>
      <el-select v-model="grade" size="large" style="width: 140px" placeholder="全部" clearable @change="onGradeChange">
        <el-option v-for="opt in gradeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
      </el-select>
      <span class="search-label">选择队员:</span>
      <el-select
        v-model="selectedName"
        size="large"
        style="width: 240px"
        placeholder="请选择队员"
        filterable
        :loading="loadingUsers"
        :disabled="loadingUsers"
      >
        <el-option v-for="u in userList" :key="u.username" :label="u.username" :value="u.username" />
        <template #empty>
          <span v-if="loadingUsers">正在加载...</span>
          <span v-else>暂无队员</span>
        </template>
      </el-select>
      <el-button type="primary" size="large" @click="onSubmit">查 询</el-button>
    </div>

    <my-chart ref="myChart" :grade="grade" body="body" class="rating-chart" />

    <div class="table-card">
      <el-table :data="contests" style="width: 100%" stripe :empty-text="tableEmptyText" v-loading="loading">
        <el-table-column prop="ratingTime" label="定级时间" width="180" />
        <el-table-column prop="contestName" label="比赛名" min-width="260" show-overflow-tooltip />
        <el-table-column label="比赛地址" width="110" align="center">
          <template #default="scope">
            <el-button size="small" type="primary" plain :disabled="!scope.row.contestUrl" @click="openContest(scope.row.contestUrl)">打开比赛</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="rank" label="排名" width="90" align="center" />
        <el-table-column prop="oldRating" label="定级前" width="100" align="center">
          <template #default="scope">
            <div :style="rankStyle(scope.row.oldRating)">{{ scope.row.oldRating }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="newRating" label="定级后" width="100" align="center">
          <template #default="scope">
            <div :style="rankStyle(scope.row.newRating)"><b>{{ scope.row.newRating }}</b></div>
          </template>
        </el-table-column>
        <el-table-column prop="change" label="变化" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.change > 0 ? 'danger' : 'success'" size="small" effect="plain">
              {{ scope.row.change > 0 ? '+' + scope.row.change : scope.row.change }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="loginVisible" title="提示" width="360px" align-center @closed="forceLogin">
      <div class="dialog-tip">请先登录后查询队员 Rating</div>
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
import MyChart from '../components/MyChart.vue'
import rankStyle from '../utils/rankStyle'

const store = useStore()
const router = useRouter()
const contests = ref([])
const grade = ref(null)
const gradeOptions = [
  { value: '全部', label: '全部' },
  { value: '2019', label: '2019' },
  { value: '2023', label: '2023' },
  { value: '2024', label: '2024' },
  { value: '2025', label: '2025' }
]
const userList = ref([])
const selectedName = ref('')
const loadingUsers = ref(false)
const tableEmptyText = ref('暂无数据')
const loading = ref(false)
const loginVisible = ref(false)

onMounted(() => {
  if (store.state.login != 1) loginVisible.value = true
  loadUsers()
})

function changeStyle(e) { return e > 0 ? 'color: red;' : 'color: green' }

// 加载队员列表(可按年级筛选,仅显示普通队员,不含 admin 等管理账号)
function loadUsers() {
  loadingUsers.value = true
  const params = {}
  if (grade.value && grade.value !== '全部') params.grade = grade.value
  api.getUserDetailList(params).then(e => {
    const list = e.data.data || []
    userList.value = list.filter(u => u.userType === 2)
    loadingUsers.value = false
  }).catch(e => {
    console.log(e)
    loadingUsers.value = false
    ElMessage.error('队员列表加载失败，请重试！')
  })
}

// 年级切换时重新加载队员列表并清空已选队员
function onGradeChange() {
  selectedName.value = ''
  contests.value = []
  loadUsers()
}

function onSubmit() {
  if (!selectedName.value) {
    ElMessage.warning('请先选择队员')
    return
  }
  tableEmptyText.value = '正在查询中……'
  loading.value = true
  api.getUserRating({ name: selectedName.value }).then(e => {
    loading.value = false
    contests.value = e.data.data
    console.log(e)
    tableEmptyText.value = '该队员未参加过比赛'
  }).catch(e => {
    loading.value = false
    contests.value = null
    console.log(e)
    ElMessage.error('请求超时，请重试！')
    tableEmptyText.value = '查询失败，请重试！'
  })
}

function login() {
  router.push('/login')
}

// 关闭登录提示框后也跳转到登录页
function forceLogin() {
  router.push('/login')
}

// 打开比赛地址(新标签页)
function openContest(url) {
  if (!url) return
  window.open(url, '_blank')
}
</script>

<style scoped>
.search-bar { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 20px; }
.search-label { font-size: 15px; color: var(--text-secondary); font-weight: 500; }
.rating-chart { margin-bottom: 20px; }
</style>
