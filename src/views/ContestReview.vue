<template>
  <div class="review-page" v-loading="loading">
    <div class="page-card">
      <div class="review-header">
        <h2 class="page-title">{{ contestName }}</h2>
        <div class="review-actions">
          <!-- 管理员:选择成员查看指定队员复盘 -->
          <template v-if="isAdmin">
            <el-select v-model="selectedHandle" placeholder="选择成员查看个人复盘" filterable clearable style="width: 260px" @change="onMemberChange">
              <el-option v-for="m in memberOptions" :key="m.handle" :label="m.label" :value="m.handle" />
            </el-select>
            <el-button size="small" :type="mode === 'team' ? 'primary' : 'default'" plain @click="loadTeam">整体复盘</el-button>
          </template>
          <template v-else>
            <el-tag v-if="mode === 'member'" type="warning" effect="plain">我的复盘</el-tag>
          </template>
          <el-button size="small" @click="goBack">返 回</el-button>
        </div>
      </div>

      <!-- 本场表现总览 -->
      <div v-if="overview" class="overview-grid" :class="{ 'grid-5': mode === 'team' }">
        <template v-if="mode === 'member'">
          <div class="ov-item">
            <div class="ov-num">{{ overview.rank }}</div>
            <div class="ov-label">本场排名 (共 {{ overview.totalRows }} 名系统成员)</div>
          </div>
          <div class="ov-item">
            <div class="ov-num">{{ overview.acCount }}</div>
            <div class="ov-label">AC 题数</div>
          </div>
          <div class="ov-item">
            <div class="ov-num" :style="{ color: ratingColor }">{{ ratingText }}</div>
            <div class="ov-label">Rating 变化</div>
          </div>
          <div class="ov-item">
            <div class="ov-num">{{ overview.penalty }}</div>
            <div class="ov-label">罚时</div>
          </div>
        </template>
        <template v-else>
          <div class="ov-item">
            <div class="ov-num">{{ overview.memberCount }}</div>
            <div class="ov-label">参赛系统成员</div>
          </div>
          <div class="ov-item">
            <div class="ov-num">{{ overview.avgAc }}</div>
            <div class="ov-label">平均 AC 题数</div>
          </div>
          <div class="ov-item">
            <div class="ov-num">{{ overview.maxAc }}</div>
            <div class="ov-label">最多 AC 题数</div>
          </div>
          <div class="ov-item">
            <div class="ov-num">{{ overview.avgRank }}</div>
            <div class="ov-label">平均排名</div>
          </div>
          <div class="ov-item">
            <div class="ov-num">{{ overview.avgPenalty }}</div>
            <div class="ov-label">平均罚时</div>
          </div>
        </template>
      </div>
    </div>

    <!-- AI 文字总结 -->
    <div class="page-card">
      <div class="ai-header">
        <h2 class="page-title">🤖 AI 复盘总结</h2>
        <el-tag v-if="aiSummary" size="small" type="success" effect="plain">已缓存</el-tag>
      </div>
      <div v-if="aiLoading" class="ai-loading">
        <el-icon class="is-loading" style="margin-right: 6px;"><Loading /></el-icon>
        AI 正在生成复盘总结...
      </div>
      <div v-else-if="aiSummary" class="ai-summary" v-html="renderMarkdown(aiSummary)"></div>
      <div v-else class="ai-loading">暂无 AI 总结(数据未同步或生成失败)</div>
    </div>

    <!-- 逐题复盘 -->
    <div class="page-card">
      <h2 class="page-title">逐题复盘</h2>
      <el-table :data="problems" size="small" stripe style="width: 100%">
        <el-table-column prop="index" label="题号" width="70" align="center" />
        <el-table-column prop="name" label="题目" min-width="220" show-overflow-tooltip />
        <el-table-column prop="rating" label="难度" width="90" align="center">
          <template #default="s">
            <el-tag size="small" :type="ratingType(s.row.rating)" effect="plain">{{ s.row.rating || '-' }}</el-tag>
          </template>
        </el-table-column>
        <template v-if="mode === 'member'">
          <el-table-column label="状态" width="110" align="center">
            <template #default="s">
              <el-tag :type="statusType(s.row.status)" size="small">{{ s.row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="wa" label="WA次数" width="90" align="center">
            <template #default="s">
              <span :style="{ color: s.row.wa > 0 ? '#f56c6c' : '#67c23a' }">{{ s.row.wa }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="acTime" label="AC耗时(秒)" width="120" align="center">
            <template #default="s">
              <span v-if="s.row.acTime != null">{{ formatMin(s.row.acTime) }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
        </template>
        <template v-else>
          <el-table-column prop="acCount" label="通过人数" width="100" align="center" />
          <el-table-column prop="passRate" label="通过率" width="110" align="center">
            <template #default="s">
              <span>{{ s.row.passRate }}%</span>
            </template>
          </el-table-column>
          <el-table-column prop="totalWa" label="总WA次数" width="100" align="center" />
        </template>
        <el-table-column prop="tags" label="标签" min-width="200">
          <template #default="s">
            <template v-if="s.row.tags">
              <el-tag v-for="t in cnTags(s.row.tags)" :key="t" size="small" type="info" effect="plain" class="ml-2">{{ t }}</el-tag>
            </template>
            <span v-else>-</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 成员表现 -->
    <div class="page-card">
      <h2 class="page-title">{{ mode === 'member' ? '同场系统成员对比' : '参赛成员表现' }}</h2>
      <el-table :data="mode === 'member' ? peers : members" size="small" stripe style="width: 100%">
        <el-table-column label="排名" width="90" align="center">
          <template #default="s">
            <b :style="{ color: s.row.isMe ? '#e6a23c' : '#409eff' }">{{ s.row.rank }}</b>
          </template>
        </el-table-column>
        <el-table-column label="队员" min-width="160">
          <template #default="s">
            <span :style="{ fontWeight: s.row.isMe ? 700 : 400, color: s.row.isMe ? '#e6a23c' : '#333' }">
              {{ displayName(s.row) }}<span v-if="s.row.isMe"> (我)</span>
            </span>
            <div v-if="s.row.name && s.row.handle !== s.row.name" class="member-handle">{{ s.row.handle }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="acCount" label="AC题数" width="100" align="center" />
        <el-table-column prop="penalty" label="罚时" width="100" align="center" />
        <el-table-column v-if="mode === 'team'" label="Rating变化" width="120" align="center">
          <template #default="s">
            <el-tag v-if="s.row.change !== undefined" :type="s.row.change > 0 ? 'danger' : 'success'" size="small">
              {{ s.row.change > 0 ? '+' + s.row.change : s.row.change }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column v-if="mode === 'team'" label="操作" width="110" align="center">
          <template #default="s">
            <el-button size="small" type="warning" plain @click="viewMember(s.row.handle)">查看复盘</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="!hasList" description="暂无数据" :image-size="60" />
    </div>

    <el-dialog v-model="loginVisible" title="提示" width="360px" align-center @closed="forceLogin">
      <div class="dialog-tip">请先登录后查看复盘</div>
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
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import api from '../api'
import { tagsToCn } from '../utils/problemTags'

const store = useStore()
const route = useRoute()
const router = useRouter()
const loading = ref(false)
const contestName = ref('')
const mode = ref('member')
const overview = ref(null)
const problems = ref([])
const peers = ref([])
const members = ref([])
const memberOptions = ref([])
const selectedHandle = ref('')
const loginVisible = ref(false)
const aiSummary = ref('')
const aiLoading = ref(false)

// 简单 markdown 渲染:列表项转 html
function renderMarkdown(text) {
  if (!text) return ''
  return text
    .split('\n')
    .map(line => {
      const t = line.trim()
      if (t.startsWith('- ')) return '<div class="ai-item">' + escapeHtml(t.substring(2)) + '</div>'
      if (t.startsWith('**') && t.endsWith('**')) return '<div class="ai-title">' + escapeHtml(t.slice(2, -2)) + '</div>'
      return '<div>' + escapeHtml(t) + '</div>'
    })
    .join('')
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// 英文标签转中文(未知原样)
function cnTags(tags) {
  return tagsToCn(tags)
}

const isAdmin = computed(() => store.state.login == 1 && store.state.userType <= 1)
const hasList = computed(() => (mode.value === 'member' ? peers.value.length : members.value.length) > 0)

const ratingText = computed(() => {
  if (!overview.value || overview.value.change === undefined) return '-'
  const c = overview.value.change
  return c > 0 ? '+' + c : String(c)
})
const ratingColor = computed(() => {
  const c = overview.value && overview.value.change
  if (c === undefined) return '#909399'
  return c > 0 ? '#f56c6c' : '#67c23a'
})

onMounted(() => {
  if (store.state.login != 1) {
    loginVisible.value = true
    return
  }
  load()
})

function load() {
  const contestId = route.query.contestId
  if (!contestId) {
    ElMessage.error('缺少比赛参数')
    return
  }
  if (isAdmin.value && !route.query.handle && !route.query.username) {
    loadTeam()
  } else {
    loadMember()
  }
}

function loadTeam() {
  mode.value = 'team'
  loading.value = true
  api.getContestReview({ contestId: route.query.contestId }).then(e => {
    loading.value = false
    if (e.data.code === 200) {
      const d = e.data.data
      contestName.value = d.contest ? d.contest.name : ''
      overview.value = d.overview || null
      problems.value = d.problems || []
      members.value = (d.members || []).map(m => ({ ...m, isMe: false }))
      memberOptions.value = buildMemberOptions(d.members || [])
      selectedHandle.value = ''
      aiSummary.value = d.aiSummary || ''
    } else {
      ElMessage.error(e.data.msg || '加载失败')
    }
  }).catch(err => {
    console.log(err)
    loading.value = false
  })
}

function loadMember() {
  mode.value = 'member'
  loading.value = true
  const contestId = route.query.contestId
  const params = { contestId }
  if (route.query.handle) params.handle = route.query.handle
  else if (selectedHandle.value) params.handle = selectedHandle.value
  else params.username = store.state.username
  api.getContestReview(params).then(e => {
    loading.value = false
    if (e.data.code === 200) {
      const d = e.data.data
      contestName.value = d.contest ? d.contest.name : ''
      overview.value = d.overview || null
      problems.value = d.problems || []
      peers.value = (d.peers || []).map(p => ({ ...p, isMe: p.handle === d.handle }))
      if (!memberOptions.value.length && d.peers) {
        memberOptions.value = buildMemberOptions(d.peers)
      }
      aiSummary.value = d.aiSummary || ''
    } else {
      ElMessage.error(e.data.msg || '加载失败')
    }
  }).catch(err => {
    console.log(err)
    loading.value = false
  })
}

// 管理员切换成员
function onMemberChange(v) {
  if (!v) { loadTeam(); return }
  viewMember(v)
}

function viewMember(handle) {
  selectedHandle.value = handle
  mode.value = 'member'
  loading.value = true
  api.getContestReview({ contestId: route.query.contestId, handle }).then(e => {
    loading.value = false
    if (e.data.code === 200) {
      const d = e.data.data
      overview.value = d.overview || null
      problems.value = d.problems || []
      peers.value = (d.peers || []).map(p => ({ ...p, isMe: false }))
      aiSummary.value = d.aiSummary || ''
    } else {
      ElMessage.error(e.data.msg || '加载失败')
    }
  }).catch(err => {
    console.log(err)
    loading.value = false
  })
}

function formatMin(sec) {
  if (sec == null) return '-'
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return m + '分' + s + '秒'
}

function ratingType(r) {
  if (r >= 2000) return 'danger'
  if (r >= 1400) return 'warning'
  return 'success'
}

// 队员显示名:优先真实姓名,无则回退 handle
function displayName(row) {
  if (row && row.name && String(row.name).trim()) return row.name
  return row ? row.handle : ''
}

// 管理员下拉选项:label 用"姓名 (handle)"
function buildMemberOptions(list) {
  const seen = new Set()
  const opts = []
  for (const m of list || []) {
    if (!m.handle || seen.has(m.handle)) continue
    seen.add(m.handle)
    const name = m.name && String(m.name).trim() ? m.name : m.handle
    opts.push({ handle: m.handle, label: name === m.handle ? name : `${name} (${m.handle})` })
  }
  return opts
}

function statusType(s) {
  if (s === 'AC') return 'success'
  if (s === 'WA') return 'danger'
  return 'info'
}

function goBack() {
  router.push('/rating/contest')
}

function login() { router.push('/login') }
function forceLogin() { router.push('/login') }
</script>

<style scoped>
.review-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.review-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.overview-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 8px; }
.overview-grid.grid-5 { grid-template-columns: repeat(5, 1fr); }
.ov-item { background: #f7f9fc; border: 1px solid #eef1f6; border-radius: 10px; padding: 16px; text-align: center; }
.ov-num { font-size: 26px; font-weight: 700; color: #409eff; }
.ov-label { margin-top: 6px; font-size: 13px; color: var(--text-secondary); }
.ml-2 { margin-left: 6px; }
.ai-header { display: flex; align-items: center; gap: 12px; }
.ai-loading { color: var(--text-muted); font-size: 14px; padding: 12px 0; }
.ai-summary { background: #f0f9eb; border: 1px solid #e1f3d8; border-radius: 8px; padding: 14px 18px; font-size: 14px; line-height: 1.8; }
.ai-summary :deep(.ai-title) { font-weight: 700; color: #67c23a; margin-top: 8px; }
.ai-summary :deep(.ai-item) { margin: 2px 0; color: #333; }
.member-handle { font-size: 12px; color: #a0a7b5; }
</style>
