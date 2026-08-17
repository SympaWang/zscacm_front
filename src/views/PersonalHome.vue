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
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import api from '../api'

const store = useStore()
const router = useRouter()
const loading = ref(false)
const data = ref({ user: {}, solves: {}, contests: {}, rating: { trend: [] }, compare: {} })

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

function loadData() {
  loading.value = true
  api.getPersonalHome({ uid: store.state.uid }).then(e => {    data.value = e.data.data || {}
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

  const myUid = store.state.uid
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
  loadData()
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
