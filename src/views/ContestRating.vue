<template>
  <div class="rating-page">
    <div class="page-card">
      <h2 class="page-title">比赛 Rating 查询</h2>
      <div class="contest-select">
        <span class="select-label">请选择场次:</span>
        <el-select
          v-model="value"
          size="large"
          style="width: 520px"
          placeholder="选择比赛"
          filterable
          :loading="loadingContest"
          :disabled="loadingContest"
        >
          <el-option v-for="item in contest" :key="item.id" :label="formatOption(item)" :value="item.id" />
          <template #empty>
            <span v-if="loadingContest">正在加载...</span>
            <span v-else>暂无比赛</span>
          </template>
        </el-select>
        <el-button type="primary" size="large" @click="onSubmit">查 询</el-button>
        <el-button size="large" plain :disabled="!currentContest || !currentContest.url" @click="openContest(currentContest && currentContest.url)">打开比赛</el-button>
      </div>
    </div>

    <div class="table-card">
      <el-table :data="contests" style="width: 100%" stripe :empty-text="tableEmptyText" v-loading="loading">
        <el-table-column prop="username" label="姓名" min-width="140" />
        <el-table-column prop="rank" label="排名" width="90" align="center" />
        <el-table-column prop="oldRating" label="定级前" width="110" align="center">
          <template #default="scope">
            <div :style="rankStyle(scope.row.oldRating)">{{ scope.row.oldRating }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="newRating" label="定级后" width="110" align="center">
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
        <el-table-column label="CF主页" width="160">
          <template #default="scope">
            <el-link type="primary" :href="scope.row.url" target="_blank">{{ scope.row.handle }}</el-link>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 全部历史比赛(按时间倒序,含无人参加场次,分页) -->
    <div class="page-card">
      <div class="history-header">
        <h2 class="page-title">历史比赛</h2>
        <div class="history-header-right">
          <el-button size="small" :type="onlyWithUsers ? 'primary' : 'default'" plain @click="toggleOnlyWithUsers">
            {{ onlyWithUsers ? '显示全部比赛' : '只看有人参加' }}
          </el-button>
          <span class="history-total">共 {{ historyTotal }} 场</span>
        </div>
      </div>
      <el-collapse v-model="activeHistory" @change="loadHistoryDetail" class="history-collapse">
        <el-collapse-item v-for="c in historyContests" :key="c.id" :name="c.id">
          <template #title>
            <span class="history-name">{{ c.name }}</span>
            <span class="history-time">{{ c.beginTime }}</span>
            <el-tag size="small" type="info" effect="plain" class="history-count">共 {{ c.participantCount || 0 }} 人参加</el-tag>
            <el-button size="small" type="primary" plain class="history-open" :disabled="!c.url" @click.stop="openContest(c.url)">打开比赛</el-button>
          </template>
          <el-table :data="historyDetail[c.id] || []" size="small" v-loading="historyLoading[c.id]">
            <el-table-column prop="username" label="姓名" min-width="120" />
            <el-table-column prop="grade" label="年级" width="80" align="center">
              <template #default="s">
                <span v-if="s.row.grade">{{ s.row.grade }}级</span>
                <span v-else class="grade-none">-</span>
              </template>
            </el-table-column>
            <el-table-column prop="rank" label="排名" width="80" align="center" />
            <el-table-column prop="oldRating" label="定级前" width="100" align="center">
              <template #default="s"><div :style="rankStyle(s.row.oldRating)">{{ s.row.oldRating }}</div></template>
            </el-table-column>
            <el-table-column prop="newRating" label="定级后" width="100" align="center">
              <template #default="s"><div :style="rankStyle(s.row.newRating)"><b>{{ s.row.newRating }}</b></div></template>
            </el-table-column>
            <el-table-column prop="change" label="变化" width="90" align="center">
              <template #default="s">
                <el-tag :type="s.row.change > 0 ? 'danger' : 'success'" size="small" effect="plain">
                  {{ s.row.change > 0 ? '+' + s.row.change : s.row.change }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="CF主页" min-width="120">
              <template #default="s">
                <el-link type="primary" :href="s.row.url" target="_blank">{{ s.row.handle }}</el-link>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-if="!historyLoading[c.id] && (!historyDetail[c.id] || !historyDetail[c.id].length)" description="该场比赛无定级记录" :image-size="60" />
        </el-collapse-item>
      </el-collapse>
      <el-empty v-if="!historyContests.length && !historyPageLoading" description="暂无历史比赛" :image-size="80" />
      <div class="history-pagination">
        <el-pagination
          background
          layout="total, prev, pager, next, jumper"
          :total="historyTotal"
          :page-size="PAGE_SIZE"
          :current-page="historyPage"
          @current-change="onPageChange"
        />
      </div>
    </div>

    <el-dialog v-model="loginVisible" title="提示" width="360px" align-center @closed="forceLogin">
      <div class="dialog-tip">请先登录后查询比赛 Rating</div>
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
import rankStyle from '../utils/rankStyle'

const store = useStore()
const router = useRouter()
const contests = ref([])
const contest = ref([])
const value = ref('')
const tableEmptyText = ref('暂无数据')
const loading = ref(false)
const loadingContest = ref(false)
const loginVisible = ref(false)

// 历史比赛(全部已结束比赛,按时间倒序,分页)
const PAGE_SIZE = 10
const historyContests = ref([])
const historyTotal = ref(0)
const historyPage = ref(1)
const historyPageLoading = ref(false)
const activeHistory = ref([])
const historyDetail = ref({})
const historyLoading = ref({})
// 是否只看有人参加的比赛
const onlyWithUsers = ref(false)

// 选项显示:比赛名 + 开始时间
function formatOption(item) {
  const t = item.beginTime ? ' (' + item.beginTime + ')' : ''
  return item.name + t
}

// 当前选中的比赛对象
const currentContest = computed(() => {
  return contest.value.find(i => i.id === value.value) || null
})

// 打开比赛地址(新标签页)
function openContest(url) {
  if (!url) return
  window.open(url, '_blank')
}

onMounted(() => {
  if (store.state.login != 1) loginVisible.value = true
  getContest()
  loadHistory()
})

function getContest() {
  loadingContest.value = true
  api.getEndContests().then(e => {
    contest.value = e.data
    loadingContest.value = false
  }).catch(e => {
    console.log(e)
    loadingContest.value = false
    ElMessage.error('请求超时，请重试！')
  })
}

function changeStyle(e) { return e > 0 ? 'color: red;' : 'color: green' }

function onSubmit() {
  tableEmptyText.value = '正在查询中……'
  loading.value = true
  api.getContestUser({ contestId: value.value }).then(e => {
    console.log(e)
    loading.value = false
    contests.value = e.data.data
    contests.value.forEach(a => {
      a.url = 'https://codeforces.com/profile/' + a.handle
    })
    tableEmptyText.value = '该比赛未定级或无人参加'
  }).catch(e => {
    loading.value = false
    contests.value = null
    console.log(e)
    ElMessage.error('请求超时，请重试！')
    tableEmptyText.value = '查询失败，请重试！'
  })
}

// 加载历史比赛分页数据
function loadHistory() {
  historyPageLoading.value = true
  api.getEndContestsPage({ page: historyPage.value, size: PAGE_SIZE, onlyWithUsers: onlyWithUsers.value }).then(e => {
    historyContests.value = e.data.list || []
    historyTotal.value = e.data.total || 0
    historyPageLoading.value = false
  }).catch(e => {
    console.log(e)
    historyPageLoading.value = false
    ElMessage.error('历史比赛加载失败，请重试！')
  })
}

// 切换"只看有人参加"筛选
function toggleOnlyWithUsers() {
  onlyWithUsers.value = !onlyWithUsers.value
  historyPage.value = 1
  activeHistory.value = []
  loadHistory()
}

function onPageChange(p) {
  historyPage.value = p
  activeHistory.value = []
  loadHistory()
}

// 展开某场比赛时加载参与详情(懒加载,已加载则跳过)
function loadHistoryDetail(names) {
  if (!names || !names.length) return
  names.forEach(id => {
    if (historyDetail.value[id] !== undefined) return
    historyLoading.value = { ...historyLoading.value, [id]: true }
    api.getContestUser({ contestId: id }).then(res => {
      const list = (res.data.data || []).map(a => {
        a.url = 'https://codeforces.com/profile/' + a.handle
        return a
      })
      historyDetail.value = { ...historyDetail.value, [id]: list }
      historyLoading.value = { ...historyLoading.value, [id]: false }
    }).catch(e => {
      console.log(e)
      historyDetail.value = { ...historyDetail.value, [id]: [] }
      historyLoading.value = { ...historyLoading.value, [id]: false }
    })
  })
}

function login() {
  router.push('/login')
}

// 关闭登录提示框后也跳转到登录页
function forceLogin() {
  router.push('/login')
}
</script>

<style scoped>
.select-label { font-size: 15px; color: var(--text-secondary); font-weight: 500; }
.contest-select { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }

.history-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.history-header-right { display: flex; align-items: center; gap: 12px; }
.history-total { font-size: 13px; color: var(--text-muted); }
.history-collapse :deep(.el-collapse-item__header) { font-size: 15px; }
.history-name { font-weight: 500; }
.history-time { margin-left: 16px; font-size: 13px; color: var(--text-muted); }
.history-count { margin-left: 12px; }
.history-open { margin-left: 12px; }
.grade-none { color: var(--text-muted); }
.history-pagination { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
