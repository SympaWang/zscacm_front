<template>
  <div class="dashboard">
    <!-- 英雄区 -->
    <div class="hero">
      <img :src="iconUrl" class="hero-img" alt="ACM" />
      <div class="hero-text">
        <h1>ZSCACM 集训队</h1>
        <p>电子科技大学中山学院 · 算法竞赛训练平台</p>
      </div>
    </div>

    <!-- 未来比赛 -->
    <div class="page-card">
      <h2 class="page-title">未来比赛</h2>
      <el-table :data="contests" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="编号" width="90" />
        <el-table-column prop="name" label="比赛名" min-width="260" show-overflow-tooltip />
        <el-table-column prop="beginTime" label="开始时间" width="180" />
        <el-table-column prop="durationSeconds" label="比赛时长" width="130" />
        <el-table-column prop="relativeTime" label="距离开始时间" width="140">
          <template #default="scope">
            <el-tag type="success" effect="plain">{{ scope.row.relativeTime }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="比赛地址" width="110" align="center">
          <template #default="scope">
            <el-button size="small" type="primary" plain :disabled="!scope.row.url" @click="openContest(scope.row.url)">打开比赛</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 历史参与比赛 -->
    <div class="page-card">
      <div class="history-header">
        <h2 class="page-title">历史参与比赛</h2>
        <el-button size="small" type="primary" plain @click="goAllHistory">查看更多</el-button>
      </div>
      <el-collapse v-model="activeHistory" @change="loadHistoryDetail" class="history-collapse">
        <el-collapse-item v-for="c in historyContests" :key="c.id" :name="c.id">
          <template #title>
            <span class="history-name">{{ c.name }}</span>
            <span class="history-time">{{ c.beginTime }}</span>
            <el-tag size="small" type="info" effect="plain" class="history-count">共 {{ c.participantCount }} 人参加</el-tag>
            <el-button size="small" type="primary" plain class="history-open" :disabled="!c.url" @click.stop="openContest(c.url)">打开比赛</el-button>
            <el-button size="small" type="warning" plain class="history-open" @click.stop="goReview(c)">复盘</el-button>
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
      <el-empty v-if="!historyContests.length" description="暂无历史参与比赛" :image-size="80" />
    </div>

    <!-- 队员排行 -->
    <div class="page-card">
      <div class="rank-header">
        <h2 class="page-title">队员排行</h2>
        <div class="rank-filter">
          <span class="filter-label">请选择年级</span>
          <el-select v-model="grade" size="large" style="width: 140px">
            <el-option v-for="opt in options" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
          <el-button type="primary" @click="getUser">查询</el-button>
        </div>
      </div>

      <my-chart ref="myChart" :grade="grade" class="rank-chart" />

      <el-table :data="users" style="width: 100%" stripe @sort-change="sortChange" class="rank-table">
        <el-table-column prop="id" label="排名" width="70" align="center">
          <template #default="scope">
            <span class="rank-badge" :class="'rank-' + Math.min(scope.row.id, 3)">{{ scope.row.id }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="姓名" min-width="150">
          <template #default="scope">
            <span class="name-cell">
              {{ scope.row.name }}
              <span class="medal-icons" v-if="(scope.row.goldCount || 0) + (scope.row.silverCount || 0) + (scope.row.bronzeCount || 0) > 0">
                <el-tooltip v-if="scope.row.goldCount" :content="'金牌 ' + scope.row.goldCount" placement="top">
                  <span class="medal-icon gold">🥇<b>{{ scope.row.goldCount }}</b></span>
                </el-tooltip>
                <el-tooltip v-if="scope.row.silverCount" :content="'银牌 ' + scope.row.silverCount" placement="top">
                  <span class="medal-icon silver">🥈<b>{{ scope.row.silverCount }}</b></span>
                </el-tooltip>
                <el-tooltip v-if="scope.row.bronzeCount" :content="'铜牌 ' + scope.row.bronzeCount" placement="top">
                  <span class="medal-icon bronze">🥉<b>{{ scope.row.bronzeCount }}</b></span>
                </el-tooltip>
              </span>
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="grade" label="年级" width="90" sortable="custom" align="center" />
        <el-table-column prop="rating" label="当前CF分数" width="120" sortable="custom" align="center">
          <template #default="scope">
            <div :style="rankStyle(scope.row.rating)"><b>{{ scope.row.rating }}</b></div>
          </template>
        </el-table-column>
        <el-table-column prop="maxRating" label="最高CF分数" width="120" sortable="custom" align="center">
          <template #default="scope">
            <div :style="rankStyle(scope.row.maxRating)">{{ scope.row.maxRating }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="lastMonthContestNum" label="上月参赛" width="90" sortable="custom" align="center" />
        <el-table-column prop="monthContestNum" label="本月参赛" width="90" sortable="custom" align="center" />
        <el-table-column prop="contestNum" label="总参赛" width="90" sortable="custom" align="center" />
        <el-table-column prop="weekSolve" label="一周做题" width="90" sortable="custom" align="center">
          <template #default="scope">
            <el-tag size="small" type="warning" effect="plain">{{ scope.row.weekSolve }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="solved" label="总题数(CF+洛谷+VJ)" min-width="130" sortable="custom" align="center">
          <template #default="scope">
            <el-tag size="small" type="success">{{ scope.row.solved }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import api from '../api'
import MyChart from '../components/MyChart.vue'
import rankStyle from '../utils/rankStyle'

const router = useRouter()

const iconUrl = '/static/acmdq.jpg'
const contests = ref(null)
const users = ref(null)
const loading = ref(false)
const grade = ref(null)
// 历史参与比赛
const historyContests = ref([])
const activeHistory = ref([])
const historyDetail = ref({})
const historyLoading = ref({})
const options = [
  { value: '全部', label: '全部' },
  { value: '2019', label: '2019' },
  { value: '2023', label: '2023' },
  { value: '2024', label: '2024' },
  { value: '2025', label: '2025' }
]

// 加载历史参与比赛列表
function loadHistoryContests() {
  api.getEndContestsWithUsers().then(e => {
    historyContests.value = e.data || []
  }).catch(e => {
    console.log(e)
  })
}

// 打开比赛地址(新标签页)
function openContest(url) {
  if (!url) return
  window.open(url, '_blank')
}

// 查看更多:跳转到队员比赛信息-查看某场比赛页面
function goAllHistory() {
  router.push('/rating/contest')
}

// 复盘:管理员进整体复盘页(可选成员),普通队员复盘自己
function goReview(c) {
  router.push('/rating/review?contestId=' + c.id)
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

function formatSeconds(e) {
  let t = parseInt(e)
  let r = 0, s = 0, c = 0
  if (t > 60) {
    r = parseInt(t / 60); t = parseInt(t % 60)
    if (r > 60) {
      s = parseInt(r / 60); r = parseInt(r % 60)
      if (s > 23) {
        c = parseInt(s / 24); s = parseInt(s % 24)
      }
    }
  }
  let a = '' + parseInt(t) + '秒'
  if (r > 0) a = '' + parseInt(r) + '分' + a
  if (s > 0) a = '' + parseInt(s) + '小时' + a
  if (c > 0) a = '' + parseInt(c) + '天' + a
  return a
}

function getUser() {
  let g = grade.value
  if (g === '全部') g = null
  api.getUsers({ grade: g }).then(res => {
    users.value = res.data.data
    let t = 1
    users.value.forEach(r => { r.id = t; t = t + 1 })
  }).catch(e => {
    ElMessage.error('请求超时，请重试！')
    console.log(e)
  })
}

function sortChange({ prop, order }) {
  users.value.sort(compare(prop, order))
  let r = 1
  users.value.forEach(s => { s.id = r; r = r + 1 })
}

function compare(e, t) {
  function isNum(s) {
    const c = /^\d+(\.\d+)?$/
    const a = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/
    return !!(c.test(s) || a.test(s))
  }
  return function (s, c) {
    let a = s[e], d = c[e]
    if (isNum(a) || isNum(d)) return t === 'ascending' ? a - d : d - a
    if (typeof a === 'boolean' && typeof d === 'boolean') return t === 'ascending' ? a - d : d - a
    const o = String(a).localeCompare(String(d), 'zh')
    return t === 'ascending' ? o : -o
  }
}

onMounted(() => {
  loading.value = true
  api.getFutureContests().then(e => {
    contests.value = e.data
    contests.value.forEach(t => {
      t.relativeTime = formatSeconds(-t.relativeTime)
      t.durationSeconds = formatSeconds(t.durationSeconds)
    })
    loading.value = false
  }).catch(e => {
    ElMessage.error('请求超时，请重试！')
  })
  getUser()
  loadHistoryContests()
})
</script>

<style scoped>
.dashboard { padding-bottom: 20px; }

.history-collapse :deep(.el-collapse-item__header) { font-size: 15px; }
.history-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.history-name { font-weight: 500; }
.history-time { margin-left: 16px; font-size: 13px; color: var(--text-muted); }
.history-count { margin-left: 12px; }
.history-open { margin-left: 12px; }
.grade-none { color: var(--text-muted); }

.hero {
  position: relative;
  border-radius: var(--radius);
  overflow: hidden;
  margin-bottom: 20px;
  background: linear-gradient(120deg, #1f2d3d 0%, #2f4a67 60%, #3d5d80 100%);
  display: flex;
  align-items: center;
  gap: 32px;
  padding: 36px 48px;
  box-shadow: var(--shadow);
}
.hero-img { width: 180px; height: 120px; object-fit: cover; border-radius: 10px; box-shadow: 0 4px 16px rgba(0,0,0,.3); }
.hero-text h1 { color: #fff; font-size: 30px; margin: 0 0 8px; letter-spacing: 2px; }
.hero-text p { color: #b8c6d8; margin: 0; font-size: 15px; }

.rank-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
.rank-filter { display: flex; align-items: center; gap: 12px; }
.filter-label { color: var(--text-secondary); font-size: 14px; }
.rank-chart { margin: 8px 0 20px; }
.rank-table { margin-top: 4px; }

.rank-badge {
  display: inline-block;
  width: 26px; height: 26px;
  line-height: 26px;
  border-radius: 50%;
  background: #f0f2f5;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 600;
}
.rank-badge.rank-1 { background: linear-gradient(135deg, #ffd04b, #f7ba2a); color: #7c5c00; }
.rank-badge.rank-2 { background: linear-gradient(135deg, #d3d9e0, #b8c0ca); color: #4a5568; }
.rank-badge.rank-3 { background: linear-gradient(135deg, #f0b98d, #e29a63); color: #7a3d10; }

.name-cell { display: inline-flex; align-items: center; gap: 6px; }
.medal-icons { display: inline-flex; align-items: center; gap: 2px; }
.medal-icon { display: inline-flex; align-items: center; font-size: 15px; line-height: 1; cursor: default; }
.medal-icon b { font-size: 11px; margin-left: 1px; }
.medal-icon.gold b { color: #d4a017; }
.medal-icon.silver b { color: #7f8c9b; }
.medal-icon.bronze b { color: #b87333; }
</style>
