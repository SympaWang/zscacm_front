<template>
  <div class="rankland-layout">
    <!-- 左侧:分类目录树(参考 RankLand) -->
    <div class="sidebar">
      <div class="sidebar-title">大赛榜单</div>
      <div class="sidebar-tip">{{ total }} 场比赛 · 官方合集</div>
      <el-tree
        :data="treeData"
        :props="treeProps"
        node-key="uk"
        highlight-current
        :default-expanded-keys="topLevelKeys"
        :expand-on-click-node="false"
        @node-click="onNodeClick"
        class="rank-tree"
      >
        <template #default="{ node, data }">
          <span class="tree-node">
            <span v-if="data.type === 1" class="tree-icon">🏆</span>
            <span v-else class="tree-icon">📁</span>
            <span class="tree-label" :title="data.name">{{ data.name }}</span>
          </span>
        </template>
      </el-tree>
    </div>

    <!-- 右侧:榜单 -->
    <div class="board-area">
      <div v-if="!currentContest" class="board-empty">
        <el-empty description="请从左侧选择一场比赛查看榜单" :image-size="120" />
      </div>
      <template v-else>
        <div class="board-header">
          <div class="board-title">
            <h2>{{ currentContest.name }}</h2>
            <div class="board-meta">
              <el-tag size="small" type="info" effect="plain">{{ formatDate(currentContest.startAt) }}</el-tag>
              <el-tag size="small" type="info" effect="plain">{{ formatDur(currentContest.durationSeconds) }}</el-tag>
              <el-tag size="small" type="success" effect="plain" v-if="rankInfo">共 {{ rankInfo.totalRows }} 队 · {{ rankInfo.problemCount }} 题</el-tag>
            </div>
          </div>
          <div class="board-controls">
            <el-radio-group v-model="rankLimit" size="small" @change="reloadRank">
              <el-radio-button :value="50">前50</el-radio-button>
              <el-radio-button :value="100">前100</el-radio-button>
              <el-radio-button :value="0">全部</el-radio-button>
            </el-radio-group>
          </div>
        </div>

        <!-- 筛选工具栏 -->
        <div class="board-toolbar">
          <el-select v-model="orgFilter" placeholder="全部学校" filterable clearable size="small" style="width: 200px;" @change="onFilterChange">
            <el-option v-for="o in organizations" :key="o" :label="o" :value="o" />
          </el-select>
          <el-checkbox v-model="officialOnly" size="small" @change="onFilterChange">仅显示正式队伍</el-checkbox>
          <span class="toolbar-info">
            正式 {{ rankInfo ? rankInfo.officialCount : 0 }} 队 · 非正式 {{ rankInfo ? rankInfo.totalRows - rankInfo.officialCount : 0 }} 队
          </span>
          <el-button size="small" type="success" plain @click="exportCsv">导出 CSV</el-button>
        </div>

        <!-- 时间轴:拖动查看历史榜单 -->
        <div class="timeline-bar" v-if="durationSec > 0">
          <span class="timeline-label">⏱ 时间轴:</span>
          <el-slider
            v-model="timelineMin"
            :min="0"
            :max="durationMin"
            :step="5"
            show-input
            :show-input-controls="false"
            input-size="small"
            style="flex: 1;"
            @change="applyTimeline"
          />
          <span class="timeline-tip">{{ timelineMin }} min</span>
        </div>

        <div class="board-wrap" v-loading="rankLoading">
          <table class="rank-board">
            <thead>
              <tr>
                <th class="col-rank">#</th>
                <th class="col-team">队伍</th>
                <th class="col-org">学校</th>
                <th class="col-solved">AC</th>
                <th class="col-penalty">罚时</th>
                <th v-for="(a, ai) in aliases" :key="a" class="col-prob">
                  <span class="prob-head" :style="probHeadStyle(ai)">
                    <span class="prob-dot" :style="probDotStyle(ai)"></span>{{ a }}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              <!-- 奖牌线 -->
              <tr v-for="(line, li) in medalLines" :key="'line' + li" class="medal-line-row">
                <td :colspan="5 + aliases.length" class="medal-line-cell">
                  <span class="medal-line-label" :class="'line-' + line.style">{{ line.title }}</span>
                  <span class="medal-line-rank">前 {{ line.rank }} 名</span>
                </td>
              </tr>
              <tr v-for="row in filteredRows" :key="row.rank" :class="rowClass(row)">
                <td class="col-rank">
                  <span class="medal" :class="'medal-' + row.rank" v-if="row.rank <= 3">{{ row.rank }}</span>
                  <span v-else>{{ row.rank }}</span>
                </td>
                <td class="col-team">
                  <div class="team-name">{{ row.teamName }}
                    <el-tag v-if="!row.official" size="mini" type="warning" effect="plain">非正式</el-tag>
                  </div>
                  <div class="team-members" v-if="row.members">{{ row.members }}</div>
                </td>
                <td class="col-org">{{ row.organization }}</td>
                <td class="col-solved">
                  <b :class="{ 'solved-top': row.solved === maxSolved }">{{ row.solved }}</b>
                </td>
                <td class="col-penalty">{{ formatTime(row.timeSec) }}</td>
                <td v-for="(p, idx) in row.problems" :key="idx" class="col-prob">
                  <div v-if="p.result" class="prob-cell" :class="probClass(p)">
                    <template v-if="p.result === 'AC'">{{ formatMin(p.acTime) }}</template>
                    <template v-else-if="p.result === 'FB'">首杀</template>
                    <template v-else-if="p.tries > 0">-{{ p.tries }}</template>
                    <template v-else>×</template>
                  </div>
                  <div v-else class="prob-cell prob-none">·</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import api from '../api'

const total = ref(0)
const treeData = ref([])
const topLevelKeys = ref([])
const treeProps = { children: 'children', label: 'name' }

const currentContest = ref(null)
const currentUk = ref('')
const rankRows = ref([])
const rankLoading = ref(false)
const rankInfo = ref(null)
const rankLimit = ref(100)
const aliases = ref([])
const maxSolved = ref(0)

// 筛选与功能
const organizations = ref([])
const orgFilter = ref('')
const officialOnly = ref(false)
const medalLine = ref([])
const durationSec = ref(0)
const timelineMin = ref(0)

const durationMin = ref(0)
const timelineMode = ref(false)
// 原始榜单数据(时间轴重建的基准,保留 solutions)
let originalRows = []

// 奖牌线行(名次阈值 -> 样式)
const medalLines = computed(() => {
  const styles = ['金奖', '银奖', '铜奖']
  const cls = ['gold', 'silver', 'bronze']
  const lines = []
  const arr = medalLine.value || []
  let prev = 1
  for (let i = 0; i < arr.length && i < 3; i++) {
    lines.push({ title: styles[i], style: cls[i], rank: arr[i] })
    prev = arr[i]
  }
  return lines
})

// 筛选后的行
const filteredRows = computed(() => {
  let rows = rankRows.value
  if (orgFilter.value) rows = rows.filter(r => r.organization === orgFilter.value)
  if (officialOnly.value) rows = rows.filter(r => r.official)
  return rows
})

onMounted(() => { loadTree() })

// 加载分类树 + 比赛列表
async function loadTree() {
  try {
    const [colRes, listRes] = await Promise.all([
      api.getRanklandCollections(),
      api.getRanklandContests({ limit: 500 })
    ])
    // 比赛列表 -> 便于按 uk 查找(未下载标记等)
    const list = (listRes.data.data && listRes.data.data.list) || []
    total.value = list.length

    // 转换分类树:叶子节点(比赛)附加比赛元信息
    if (colRes.data.code === 200 && colRes.data.data.tree) {
      const root = colRes.data.data.tree.root
      treeData.value = (root.children || []).map(c => toTree(c, list))
      topLevelKeys.value = (root.children || []).map(c => c.uniqueKey || c.name)
    }
  } catch (e) {
    console.log(e)
  }
}

// 递归转换:type=2 目录,type=1 比赛
function toTree(node, list) {
  const kids = (node.children || []).map(c => toTree(c, list))
  const item = {
    uk: node.uniqueKey || node.name,
    name: node.name,
    type: node.type
  }
  if (node.type === 1) {
    const c = list.find(x => x.uk === node.uniqueKey)
    if (c) {
      item.contest = c
      item.downloaded = c.downloaded
      item.startAt = c.startAt
      item.durationSeconds = c.durationSeconds
    }
  }
  if (kids.length) item.children = kids
  return item
}

function onNodeClick(data) {
  if (data.type !== 1 || !data.contest) {
    if (data.type === 1) ElMessage.warning('该场比赛榜单未收录或未下载')
    return
  }
  currentContest.value = data.contest
  currentUk.value = data.contest.uk
  rankLimit.value = 100
  reloadRank()
}

function reloadRank() {
  rankLoading.value = true
  api.getRanklandRank({ uk: currentUk.value, limit: rankLimit.value }).then(e => {
    rankLoading.value = false
    if (e.data.code === 200) {
      const d = e.data.data
      rankRows.value = d.rows || []
      originalRows = JSON.parse(JSON.stringify(rankRows.value)) // 深拷贝原始数据(含 solutions)
      aliases.value = d.aliases || []
      rankInfo.value = {
        totalRows: d.totalRows || 0,
        problemCount: d.problemCount || 0,
        officialCount: d.officialCount || 0
      }
      organizations.value = d.organizations || []
      medalLine.value = d.medalLine || []
      maxSolved.value = rankRows.value.reduce((mx, r) => Math.max(mx, r.solved || 0), 0)
      durationSec.value = currentContest.value ? (currentContest.value.durationSeconds || 0) : 0
      durationMin.value = Math.floor(durationSec.value / 60)
      timelineMin.value = durationMin.value
      timelineMode.value = false
      orgFilter.value = ''
      officialOnly.value = false
    } else {
      rankRows.value = []
      rankInfo.value = null
      ElMessage.error(e.data.msg || '榜单加载失败')
    }
  }).catch(err => {
    console.log(err)
    rankLoading.value = false
  })
}

function onFilterChange() {}

// 时间轴:按分钟还原 t 时刻的榜单状态
// 每题按 solutions(每次提交时间)重建:仅保留 t 之前发生的提交,
// 首杀/AC 在 t 之前发生则显示,错误提交在 t 之前发生则显示失败次数(随时间累计)
function applyTimeline(val) {
  // 使用 slider change 事件携带的最新值(不依赖 ref 读取时序)
  const current = val != null && val !== '' ? Number(val) : timelineMin.value
  const atEnd = current >= durationMin.value
  // 拖回终点:恢复原始榜单
  if (atEnd) {
    if (timelineMode.value) {
      timelineMode.value = false
      rankRows.value = JSON.parse(JSON.stringify(originalRows))
      maxSolved.value = rankRows.value.reduce((mx, r) => Math.max(mx, r.solved || 0), 0)
    }
    return
  }
  timelineMode.value = true
  const t = current * 60
  // 始终基于原始数据重建(避免二次拖动丢 solutions)
  rankRows.value = originalRows.map(row => {
    const newProbs = (row.problems || []).map(p => {
      const sols = p.solutions || []
      // 该时刻之前发生的提交
      const before = sols.filter(s => s.timeSec != null && s.timeSec <= t)
      if (!before.length) {
        return { result: null, tries: 0, acTime: null }
      }
      // 最后一条有效提交决定当前状态
      const last = before[before.length - 1]
      if (last.result === 'AC') {
        // AC:显示首杀(若该题全场首次)或 AC 用时
        const isFirstBlood = p.result === 'FB'
        return {
          result: isFirstBlood ? 'FB' : 'AC',
          tries: before.length - 1,
          acTime: last.timeSec
        }
      }
      // 尚未 AC:显示错误提交累计次数
      const wrong = before.filter(s => s.result !== 'AC').length
      return { result: 'RJ', tries: wrong, acTime: null }
    })
    // 重算 AC 数
    const ac = newProbs.filter(p => p.result === 'AC' || p.result === 'FB').length
    return { ...row, problems: newProbs, solved: ac }
  })
  maxSolved.value = rankRows.value.reduce((mx, r) => Math.max(mx, r.solved || 0), 0)
}

// 行样式:奖牌区(按名次)高亮
function rowClass(row) {
  const arr = medalLine.value || []
  const r = row.rank
  let medal = ''
  if (r <= 3) medal = 'medal-top'
  else if (r <= arr[0]) medal = 'medal-gold'
  else if (r <= arr[1]) medal = 'medal-silver'
  else if (r <= arr[2]) medal = 'medal-bronze'
  return { [medal]: true, 'is-unofficial': !row.official }
}

// 导出 CSV
function exportCsv() {
  const rows = filteredRows.value
  if (!rows.length) return
  const header = ['排名', '队伍', '学校', '队员', '解题数', '罚时']
  const lines = [header.join(',')]
  rows.forEach(r => {
    const esc = s => '"' + String(s == null ? '' : s).replace(/"/g, '""') + '"'
    lines.push([r.rank, esc(r.teamName), esc(r.organization), esc(r.members), r.solved, r.timeSec == null ? '' : formatTime(r.timeSec)].join(','))
  })
  const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = (currentContest.value ? currentContest.value.name : 'rankland') + '.csv'
  a.click()
  URL.revokeObjectURL(a.href)
}

function formatDate(s) {
  if (!s) return ''
  return String(s).slice(0, 16).replace('T', ' ')
}

function formatDur(sec) {
  if (!sec) return '-'
  const h = Math.floor(sec / 3600)
  return h + ' 小时'
}

function formatTime(sec) {
  if (sec == null) return '-'
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  if (h > 0) return h + 'h' + m + 'm'
  return m + 'm'
}

function formatMin(sec) {
  if (sec == null) return ''
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return m + ':' + String(s).padStart(2, '0')
}

function probClass(p) {
  if (p.result === 'FB') return 'prob-fb'
  if (p.result === 'AC') return 'prob-ac'
  return 'prob-rj'
}

// 题目列配色(参考 RankLand:每道题不同颜色区分)
const probColors = [
  '#5b8ff9', '#5ad8a6', '#f6bd16', '#e8684a', '#6dc8ec',
  '#9270ca', '#ff9d4d', '#269a99', '#ff99c3', '#a0a7e6',
  '#ffd666', '#4fc08d', '#e57a5e'
]
function probHeadStyle(idx) {
  return { color: probColors[idx % probColors.length] }
}
function probDotStyle(idx) {
  return { background: probColors[idx % probColors.length] }
}
</script>

<style scoped>
.rankland-layout {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  min-height: calc(100vh - 180px);
}

/* 左侧目录树 */
.sidebar {
  width: 300px;
  flex-shrink: 0;
  background: #fff;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 14px 0;
  max-height: calc(100vh - 140px);
  overflow-y: auto;
  position: sticky;
  top: 76px;
}
.sidebar-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--text-primary);
  padding: 0 16px 6px;
  border-bottom: 2px solid var(--primary, #409eff);
  display: inline-block;
  margin: 0 16px 4px;
}
.sidebar-tip { font-size: 12px; color: var(--text-muted); padding: 0 16px 10px; }

.rank-tree { padding: 0 8px; }
.rank-tree :deep(.el-tree-node__content) {
  height: 32px;
  border-radius: 6px;
  margin: 1px 0;
}
.rank-tree :deep(.el-tree-node__content:hover) { background: #f5f8fd; }
.rank-tree :deep(.el-tree-node.is-current > .el-tree-node__content) {
  background: #ecf5ff;
  color: var(--primary, #409eff);
  font-weight: 600;
}
.tree-node { display: flex; align-items: center; gap: 6px; flex: 1; min-width: 0; }
.tree-icon { font-size: 13px; flex-shrink: 0; }
.tree-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
}

/* 右侧榜单 */
.board-area {
  flex: 1;
  min-width: 0;
  background: #fff;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 20px;
}
.board-empty { display: flex; align-items: center; justify-content: center; min-height: 400px; }
.board-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.board-title h2 { margin: 0 0 8px; font-size: 19px; color: var(--text-primary); }
.board-meta { display: flex; gap: 8px; flex-wrap: wrap; }

.board-wrap {
  overflow: auto;
  max-height: calc(100vh - 320px);
  border: 1px solid #eef1f6;
  border-radius: 8px;
}

.board-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.toolbar-info { font-size: 12px; color: var(--text-muted); margin-left: 4px; }

.timeline-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding: 8px 14px;
  background: #f7f9fc;
  border-radius: 8px;
}
.timeline-label { font-size: 13px; color: var(--text-secondary); white-space: nowrap; }
.timeline-tip { font-size: 13px; color: var(--primary, #409eff); font-weight: 600; white-space: nowrap; }

.rank-board {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.rank-board th {
  background: #1f2d3d;
  color: #fff;
  padding: 8px 10px;
  text-align: center;
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 2;
}
.rank-board thead tr th { box-shadow: 0 2px 4px rgba(0,0,0,.15); }

/* 题目表头:色点 + 彩色题号 */
.prob-head {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-weight: 700;
  font-size: 14px;
}
.prob-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}
.rank-board td {
  border-bottom: 1px solid #f0f2f5;
  padding: 6px 8px;
  text-align: center;
}
.rank-board tbody tr:hover { background: #f7f9fc; }

.medal-line-row td {
  background: #fafafa;
  border-top: 2px dashed #dcdfe6;
  border-bottom: 2px dashed #dcdfe6;
  padding: 4px 10px;
  text-align: left !important;
}
.medal-line-label {
  display: inline-block;
  padding: 1px 10px;
  border-radius: 10px;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
}
.medal-line-label.line-gold { background: #e6b800; }
.medal-line-label.line-silver { background: #9aa5b0; }
.medal-line-label.line-bronze { background: #c96a2b; }
.medal-line-rank { margin-left: 8px; font-size: 12px; color: var(--text-muted); }

.rank-board tbody tr.medal-gold { background: #fffbe6; }
.rank-board tbody tr.medal-silver { background: #f5f7fa; }
.rank-board tbody tr.medal-bronze { background: #fdf3e7; }
.rank-board tbody tr.is-unofficial .col-team .team-name { color: var(--text-muted); }

.col-rank { width: 56px; }
.col-team { text-align: left !important; min-width: 220px; }
.col-org { text-align: left !important; min-width: 160px; color: var(--text-secondary); }
.col-solved { width: 60px; }
.col-penalty { width: 80px; }
.col-prob { min-width: 52px; }

.team-name { font-weight: 600; }
.team-members { font-size: 12px; color: var(--text-muted); margin-top: 2px; }

.medal {
  display: inline-block;
  width: 26px; height: 26px;
  line-height: 26px;
  border-radius: 50%;
  color: #fff;
  font-weight: 700;
  font-size: 13px;
}
.medal-1 { background: linear-gradient(135deg, #f7d774, #e6b800); }
.medal-2 { background: linear-gradient(135deg, #cfd6dd, #9aa5b0); }
.medal-3 { background: linear-gradient(135deg, #e8a06c, #c96a2b); }

.prob-cell {
  display: inline-block;
  min-width: 40px;
  padding: 4px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}
.prob-ac { background: #67c23a; color: #fff; }
.prob-fb { background: #f7ba2a; color: #fff; }
.prob-rj { background: #f56c6c; color: #fff; }
.prob-none { color: #dcdfe6; }

.solved-top { color: #e6a23c; font-size: 15px; }
</style>
