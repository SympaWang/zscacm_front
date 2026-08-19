<template>
  <div class="home-page" v-loading="loading">
    <!-- 用户信息头 -->
    <div class="hero">
      <div class="hero-avatar">{{ avatarChar }}</div>
      <div class="hero-info">
        <h2 class="hero-name">{{ user.username }} <span class="hero-grade">{{ user.grade }}级</span></h2>
        <div class="hero-tags">
          <el-tag size="small" effect="plain" v-if="user.handle">CF: {{ user.handle }}</el-tag>
          <el-tag size="small" type="success" effect="plain" v-if="user.vjName">VJ: {{ user.vjName }}</el-tag>
          <el-tag size="small" type="warning" effect="plain" v-if="user.lgid">洛谷: {{ user.lgid }}</el-tag>
        </div>
      </div>
      <el-button size="large" class="hero-switch" @click="goPlatformHome">平台首页</el-button>
      <div class="hero-stats">
        <div class="hero-stat">
          <div class="hero-stat-num">{{ rating.current }}</div>
          <div class="hero-stat-label">当前 CF Rating</div>
        </div>
        <div class="hero-stat">
          <div class="hero-stat-num">{{ rating.max }}</div>
          <div class="hero-stat-label">最高 Rating</div>
        </div>
        <div class="hero-stat">
          <div class="hero-stat-num">{{ rating.rank }}</div>
          <div class="hero-stat-label">CF 等级</div>
        </div>
      </div>
    </div>

    <!-- 做题统计卡片 -->
    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-num">{{ solves.day }}</div>
        <div class="stat-label">今日做题</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">{{ solves.week }}</div>
        <div class="stat-label">本周做题</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">{{ solves.month }}</div>
        <div class="stat-label">本月做题</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">{{ solves.year }}</div>
        <div class="stat-label">今年做题</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">{{ contests.total }}</div>
        <div class="stat-label">参赛总场次</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">{{ contests.month }}</div>
        <div class="stat-label">本月参赛</div>
      </div>
    </div>

    <!-- 平台总题数 -->
    <div class="page-card">
      <h2 class="page-title">各平台总题数</h2>
      <div class="platform-row">
        <div class="platform-item">
          <span class="platform-dot cf"></span>Codeforces <b>{{ solves.cf }}</b>
        </div>
        <div class="platform-item">
          <span class="platform-dot lg"></span>洛谷 <b>{{ solves.luogu }}</b>
        </div>
        <div class="platform-item">
          <span class="platform-dot vj"></span>VJudge <b>{{ solves.vj }}</b>
        </div>
        <div class="platform-item total">
          合计 <b>{{ solves.total }}</b>
        </div>
      </div>
    </div>

    <!-- 近7天通过/未通过题目 -->
    <div class="page-card">
      <div class="recent-header">
        <h2 class="page-title">近 7 天做题情况</h2>
        <el-button size="small" type="primary" plain @click="goSubmitHistory">提交历史查询</el-button>
      </div>
      <div class="recent-block">
        <div class="recent-title">
          <el-tag size="small" type="success" effect="dark">通过 {{ recentPassed.length }} 题</el-tag>
          <span class="recent-tip">点击题目可查看提交历史</span>
        </div>
        <div v-if="recentLoading" class="recent-loading">加载中...</div>
        <div v-else-if="recentPassed.length" class="recent-list">
          <div v-for="p in recentPassed.slice(0, recentPassedExpand ? recentPassed.length : 5)" :key="p.key" class="recent-item pass" @click="openHistory(p)">
            <span class="recent-platform">{{ p.platform }}</span>
            <span class="recent-name">{{ p.name || p.key }}</span>
            <span class="recent-time">{{ formatTime(p.lastTime) }}</span>
          </div>
          <div v-if="recentPassed.length > 5" class="recent-more" @click="recentPassedExpand = !recentPassedExpand">
            {{ recentPassedExpand ? '收起' : '展开更多 (' + recentPassed.length + ')' }}
          </div>
        </div>
        <el-empty v-else-if="!recentLoading" description="近 7 天暂无通过记录" :image-size="50" />

        <div class="recent-title" style="margin-top: 18px;">
          <el-tag size="small" type="danger" effect="dark">未通过 {{ recentFailed.length }} 题</el-tag>
          <span class="recent-tip">近 7 天提交过但未通过的题目</span>
        </div>
        <div v-if="recentFailed.length" class="recent-list">
          <div v-for="p in recentFailed.slice(0, recentFailedExpand ? recentFailed.length : 5)" :key="p.key" class="recent-item fail" @click="openHistory(p)">
            <span class="recent-platform">{{ p.platform }}</span>
            <span class="recent-name">{{ p.name || p.key }}</span>
            <span class="recent-time">{{ formatTime(p.lastTime) }}</span>
          </div>
          <div v-if="recentFailed.length > 5" class="recent-more" @click="recentFailedExpand = !recentFailedExpand">
            {{ recentFailedExpand ? '收起' : '展开更多 (' + recentFailed.length + ')' }}
          </div>
        </div>
        <el-empty v-else-if="!recentLoading" description="近 7 天无不通过记录" :image-size="50" />
      </div>
    </div>

    <!-- 提交历史弹窗 -->
    <el-dialog v-model="historyVisible" :title="historyTitle" width="720px" align-center>
      <el-table :data="historyList" size="small" max-height="420" stripe>
        <el-table-column prop="time" label="提交时间" width="170" />
        <el-table-column label="状态" width="140" align="center">
          <template #default="s">
            <el-tag :type="s.row.ok ? 'success' : 'danger'" size="small">
              {{ s.row.ok ? '通过' : (s.row.status || '未通过') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="language" label="语言" min-width="180" show-overflow-tooltip />
        <el-table-column prop="runtime" label="耗时(ms)" width="100" align="center">
          <template #default="s">
            <span v-if="s.row.runtime != null">{{ s.row.runtime }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="题目" min-width="160" show-overflow-tooltip>
          <template #default="s">
            <el-link v-if="s.row.url" type="primary" :href="s.row.url" target="_blank">{{ s.row.problemName }}</el-link>
            <span v-else>{{ s.row.problemName }}</span>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button type="primary" @click="historyVisible = false">关 闭</el-button>
      </template>
    </el-dialog>

    <!-- CF Rating 变化曲线 -->
    <div class="page-card">
      <h2 class="page-title">CF Rating 变化曲线</h2>
      <div v-if="rating.trend && rating.trend.length" ref="trendChartRef" class="trend-chart"></div>
      <el-empty v-else description="暂无定级记录" :image-size="80" />
    </div>

    <!-- 同年级对比 -->
    <div class="page-card">
      <h2 class="page-title">同年级对比 ({{ user.grade }}级)</h2>
      <div class="compare-top">
        <div class="compare-item">
          <div class="compare-rank">{{ compare.myRatingRank > 0 ? compare.myRatingRank : '-' }} / {{ compare.gradeCount }}</div>
          <div class="compare-label">Rating 排名</div>
          <div class="compare-sub">年级平均 {{ compare.avgRating }} · 最高 {{ compare.maxRating }}</div>
        </div>
        <div class="compare-item">
          <div class="compare-rank">{{ compare.mySolvedRank > 0 ? compare.mySolvedRank : '-' }} / {{ compare.gradeCount }}</div>
          <div class="compare-label">做题数排名</div>
          <div class="compare-sub">年级平均 {{ compare.avgSolved }} · 最高 {{ compare.maxSolved }}</div>
        </div>
        <div class="compare-item">
          <div class="compare-rank">{{ compare.myContestRank > 0 ? compare.myContestRank : '-' }} / {{ compare.gradeCount }}</div>
          <div class="compare-label">参赛场次排名</div>
          <div class="compare-sub">年级平均 {{ compare.avgContest }} · 最高 {{ compare.maxContest }}</div>
        </div>
      </div>
      <div v-if="compare.members && compare.members.length" ref="compareChartRef" class="compare-chart"></div>
      <el-empty v-else description="同年级暂无其他队员数据" :image-size="80" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import api from '../api'

const store = useStore()
const route = useRoute()
const router = useRouter()
const loading = ref(false)
const data = ref({ user: {}, solves: {}, contests: {}, rating: { trend: [] }, compare: {} })

// 查看的目标用户:URL ?uid= 优先(管理员查看他人),否则当前登录用户
const viewUid = computed(() => {
  const q = Number(route.query.uid)
  return q > 0 ? q : store.state.uid
})

const user = computed(() => data.value.user || {})
const solves = computed(() => data.value.solves || {})
const contests = computed(() => data.value.contests || {})
const rating = computed(() => data.value.rating || { trend: [] })
const compare = computed(() => data.value.compare || {})

const avatarChar = computed(() => (user.value.username || '?').charAt(0))

// 切换到平台首页(原首页)
function goPlatformHome() {
  router.push('/dashboard/index')
}

let trendChart = null
let compareChart = null
const trendChartRef = ref(null)
const compareChartRef = ref(null)

// 近 7 天通过/未通过题目
const recentPassed = ref([])
const recentFailed = ref([])
const recentLoading = ref(false)
const recentPassedExpand = ref(false)
const recentFailedExpand = ref(false)
const historyVisible = ref(false)
const historyTitle = ref('')
const historyList = ref([])

// 跳转到提交历史查询页
function goSubmitHistory() {
  router.push('/center/history')
}

function loadRecent() {
  recentLoading.value = true
  api.getPersonalRecentProblems({ uid: viewUid.value }).then(e => {
    const d = e.data.data || {}
    recentPassed.value = d.passed || []
    recentFailed.value = d.failed || []
    recentLoading.value = false
  }).catch(e => {
    console.log(e)
    recentLoading.value = false
  })
}

// 点击题目查看提交历史
function openHistory(p) {
  historyTitle.value = (p.name || p.key) + ' — 提交历史'
  historyList.value = []
  historyVisible.value = true
  const platform = String(p.platform || '').toLowerCase()
  // 后端 platform 区分:CF 用 "CF", VJ 用 OJ 名(如 CodeForces)。统一转 key 前缀判断
  const isCf = p.key && p.key.startsWith('cf:')
  const apiPlatform = isCf ? 'cf' : 'vj'
  api.getPersonalSubmitHistory({ uid: viewUid.value, platform: apiPlatform, key: p.key }).then(res => {
    const d = res.data && res.data.data
    historyList.value = Array.isArray(d) ? d : []
  }).catch(e => {
    console.log(e)
    historyList.value = []
  })
}

// 时间戳(ms)格式化
function formatTime(ms) {
  if (!ms) return '-'
  const d = new Date(ms)
  const p = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

function loadData() {
  loading.value = true
  api.getPersonalHome({ uid: viewUid.value }).then(e => {    data.value = e.data.data || {}
    loading.value = false
    nextTick(() => {
      renderTrend()
      renderCompare()
    })
  }).catch(e => {
    console.log(e)
    loading.value = false
    ElMessage.error('数据加载失败，请重试！')
  })
}

function renderTrend() {
  const trend = rating.value.trend || []
  if (!trend.length || !trendChartRef.value) return
  if (trendChart) trendChart.dispose()
  trendChart = echarts.init(trendChartRef.value)
  trendChart.setOption({
    tooltip: {
      trigger: 'axis',
      formatter: function (g) {
        const p = g[0]
        const item = trend[p.dataIndex]
        return item.contestName + '<br/>' + item.time + '<br/>Rating: ' + item.rating
      }
    },
    grid: { left: 50, right: 30, top: 30, bottom: 50 },
    xAxis: { type: 'category', data: trend.map(t => t.time), axisLabel: { rotate: 30 } },
    yAxis: { type: 'value', name: 'Rating' },
    series: [{
      type: 'line',
      data: trend.map(t => t.rating),
      smooth: true,
      symbolSize: 6,
      lineStyle: { width: 2, color: '#5470c6' },
      itemStyle: { color: '#5470c6' },
      areaStyle: { color: 'rgba(84,112,198,0.15)' }
    }]
  })
}

function renderCompare() {
  const members = compare.value.members || []
  if (!members.length || !compareChartRef.value) return
  if (compareChart) compareChart.dispose()

  const myUid = viewUid.value
  const top = [...members].sort((a, b) => b.rating - a.rating).slice(0, 10)
  const names = top.map(m => m.name + (m.uid === myUid ? ' (我)' : ''))
  const colors = top.map(m => m.uid === myUid ? '#e6a23c' : '#5470c6')

  compareChart = echarts.init(compareChartRef.value)
  compareChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['Rating', '做题数'], bottom: 0 },
    grid: { left: 60, right: 30, top: 30, bottom: 60 },
    xAxis: { type: 'category', data: names, axisLabel: { rotate: 30 } },
    yAxis: { type: 'value' },
    series: [
      {
        name: 'Rating',
        type: 'bar',
        data: top.map(m => m.rating),
        itemStyle: { color: (p) => colors[p.dataIndex] },
        barMaxWidth: 28
      },
      {
        name: '做题数',
        type: 'bar',
        data: top.map(m => m.solved),
        itemStyle: { color: 'rgba(84,112,198,0.45)' },
        barMaxWidth: 28
      }
    ]
  })
}

function resize() {
  if (trendChart) trendChart.resize()
  if (compareChart) compareChart.resize()
}

onMounted(() => {
  // 未登录访问个人首页时跳转登录页
  if (store.state.login != 1) {
    router.push('/login')
    return
  }
  loadData()
  loadRecent()
  window.addEventListener('resize', resize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  if (trendChart) { trendChart.dispose(); trendChart = null }
  if (compareChart) { compareChart.dispose(); compareChart = null }
})
</script>

<style scoped>
.home-page { padding-bottom: 20px; }

.hero {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 28px 36px;
  margin-bottom: 20px;
  border-radius: var(--radius);
  background: linear-gradient(120deg, #1f2d3d 0%, #2f4a67 60%, #3d5d80 100%);
  box-shadow: var(--shadow);
}
.hero-avatar {
  width: 72px; height: 72px;
  border-radius: 50%;
  background: rgba(255,255,255,.15);
  color: #fff;
  font-size: 30px;
  font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  border: 2px solid rgba(255,255,255,.4);
}
.hero-info { flex: 1; min-width: 0; }
.hero-name { color: #fff; margin: 0 0 10px; font-size: 24px; }
.hero-grade { font-size: 14px; font-weight: 400; color: #b8c6d8; margin-left: 8px; }
.hero-tags { display: flex; gap: 8px; flex-wrap: wrap; }
.hero-tags :deep(.el-tag) { background: rgba(255,255,255,.12); color: #e5ecf5; border-color: rgba(255,255,255,.25); }
.hero-switch { flex-shrink: 0; }
.hero-stats { display: flex; gap: 28px; flex-shrink: 0; }
.hero-stat { text-align: center; }
.hero-stat-num { color: #ffd04b; font-size: 24px; font-weight: 700; }
.hero-stat-label { color: #b8c6d8; font-size: 12px; margin-top: 4px; }

.stat-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}
.stat-card {
  background: #fff;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 20px 12px;
  text-align: center;
}
.stat-num { font-size: 28px; font-weight: 700; color: var(--primary, #409eff); }
.stat-label { margin-top: 6px; font-size: 13px; color: var(--text-secondary); }

.page-card { margin-bottom: 20px; }
.platform-row { display: flex; gap: 24px; flex-wrap: wrap; align-items: center; }
.platform-item { font-size: 14px; color: var(--text-secondary); }
.platform-item b { font-size: 18px; color: var(--text-primary); margin-left: 4px; }
.platform-dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 6px; }
.platform-dot.cf { background: #5470c6; }
.platform-dot.lg { background: #91cc75; }
.platform-dot.vj { background: #fac858; }
.platform-item.total { font-weight: 600; color: var(--text-primary); }

.trend-chart { width: 100%; height: 360px; }

.recent-title { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.recent-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.recent-tip { font-size: 12px; color: var(--text-muted); }
.recent-loading { color: var(--text-muted); font-size: 13px; padding: 12px 0; }
.recent-list { display: flex; flex-direction: column; gap: 8px; }
.recent-more {
  margin-top: 4px;
  text-align: center;
  font-size: 13px;
  color: var(--primary, #409eff);
  cursor: pointer;
  padding: 6px 0;
  border-radius: 6px;
  background: #f7f9fc;
  transition: background .2s;
}
.recent-more:hover { background: #ecf3fd; }
.recent-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid #eef1f6;
  cursor: pointer;
  transition: all .2s;
  font-size: 14px;
}
.recent-item:hover { border-color: var(--primary, #409eff); box-shadow: 0 2px 8px rgba(64,158,255,.15); }
.recent-item.pass { background: #f0f9eb; }
.recent-item.fail { background: #fef0f0; }
.recent-platform {
  flex-shrink: 0;
  font-size: 12px;
  color: #fff;
  border-radius: 4px;
  padding: 2px 8px;
  background: var(--primary, #409eff);
}
.recent-item.fail .recent-platform { background: #f56c6c; }
.recent-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--text-primary); }
.recent-time { flex-shrink: 0; font-size: 12px; color: var(--text-muted); }

.compare-top { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 20px; }
.compare-item {
  flex: 1;
  min-width: 200px;
  background: #f7f9fc;
  border: 1px solid #eef1f6;
  border-radius: 10px;
  padding: 16px 20px;
  text-align: center;
}
.compare-rank { font-size: 26px; font-weight: 700; color: var(--primary, #409eff); }
.compare-label { margin-top: 6px; font-size: 14px; color: var(--text-secondary); }
.compare-sub { margin-top: 6px; font-size: 12px; color: var(--text-muted); }
.compare-chart { width: 100%; height: 360px; }
</style>
