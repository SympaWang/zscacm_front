<template>
  <div class="honor-page">
    <!-- 学校总览 -->
    <div class="page-card">
      <h2 class="page-title">电子科技大学中山学院 — 历史荣誉</h2>
      <div class="overview-grid" v-if="overview">
        <div class="ov-item">
          <div class="ov-num">{{ overview.totalCount || 0 }}</div>
          <div class="ov-label">累计获奖场次</div>
        </div>
        <div class="ov-item">
          <div class="ov-num ov-gold">{{ overview.goldCount || 0 }}</div>
          <div class="ov-label"><span class="medal-dot gold"></span>金牌</div>
        </div>
        <div class="ov-item">
          <div class="ov-num ov-silver">{{ overview.silverCount || 0 }}</div>
          <div class="ov-label"><span class="medal-dot silver"></span>银牌</div>
        </div>
        <div class="ov-item">
          <div class="ov-num ov-bronze">{{ overview.bronzeCount || 0 }}</div>
          <div class="ov-label"><span class="medal-dot bronze"></span>铜牌</div>
        </div>
        <div class="ov-item">
          <div class="ov-num">{{ overview.bestRank || '-' }}</div>
          <div class="ov-label">历史最好名次</div>
        </div>
      </div>
    </div>

    <!-- 获奖记录(可按队伍/年份筛选) -->
    <div class="page-card">
      <div class="card-header">
        <h2 class="page-title">获奖记录</h2>
        <div class="filter-bar">
          <el-select v-model="teamFilter" placeholder="选择队伍" filterable clearable style="width: 220px" @change="loadAwards">
            <el-option v-for="t in teamList" :key="t.teamName" :label="teamLabel(t)" :value="t.teamName" />
          </el-select>
          <el-select v-model="yearFilter" placeholder="选择年份" clearable style="width: 120px" @change="loadAwards">
            <el-option v-for="y in yearList" :key="y" :label="y" :value="y" />
          </el-select>
        </div>
      </div>
      <el-table :data="awards" v-loading="awardsLoading" size="small" stripe>
        <el-table-column prop="date" label="时间" width="100" align="center" />
        <el-table-column prop="contestName" label="竞赛" min-width="220" show-overflow-tooltip />
        <el-table-column prop="place" label="地点" width="80" align="center" />
        <el-table-column label="队伍" min-width="150">
          <template #default="s">
            <el-link type="primary" :underline="false" @click="showTeamDetail(s.row.teamName)">{{ s.row.teamName }}</el-link>
          </template>
        </el-table-column>
        <el-table-column label="奖项" width="90" align="center">
          <template #default="s">
            <el-tag v-if="s.row.medalType && s.row.medalType !== 'NONE'" :type="medalTagType(s.row.medalType)" size="small">{{ medalCn(s.row.medalType) }}</el-tag>
            <span v-else class="muted">—</span>
          </template>
        </el-table-column>
        <el-table-column label="正式排名" width="90" align="center">
          <template #default="s">{{ s.row.officialRank || '—' }} / {{ s.row.totalOfficialTeams }}</template>
        </el-table-column>
        <el-table-column label="全部排名" width="90" align="center">
          <template #default="s">{{ s.row.rank }} / {{ s.row.totalTeams }}</template>
        </el-table-column>
        <el-table-column label="成员" min-width="200">
          <template #default="s">
            <span v-for="(m, i) in s.row.members || []" :key="m.id" class="member-chip">
              <el-link type="primary" :underline="false" @click="showMemberDetail(m.name)">{{ m.name }}</el-link><span v-if="i < (s.row.members || []).length - 1">、</span>
            </span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 队伍荣誉 -->
    <div class="page-card">
      <div class="card-header">
        <h2 class="page-title">队伍荣誉</h2>
        <el-button size="small" @click="showTeamDetail(activeTeam)" v-if="activeTeam">查看 {{ activeTeam }} 详情</el-button>
      </div>
      <el-table :data="teamList" v-loading="teamLoading" size="small" stripe>
        <el-table-column label="队伍" min-width="180">
          <template #default="s">
            <el-link type="primary" :underline="false" @click="showTeamDetail(s.row.teamName)">{{ s.row.teamName }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="totalCount" label="参赛场次" width="90" align="center" />
        <el-table-column label="金牌" width="90" align="center">
          <template #default="s"><span class="medal-count gold">{{ s.row.goldCount || 0 }}</span></template>
        </el-table-column>
        <el-table-column label="银牌" width="90" align="center">
          <template #default="s"><span class="medal-count silver">{{ s.row.silverCount || 0 }}</span></template>
        </el-table-column>
        <el-table-column label="铜牌" width="90" align="center">
          <template #default="s"><span class="medal-count bronze">{{ s.row.bronzeCount || 0 }}</span></template>
        </el-table-column>
        <el-table-column prop="latestDate" label="最近参赛" width="110" align="center" />
      </el-table>
    </div>

    <!-- 个人荣誉 -->
    <div class="page-card">
      <div class="card-header">
        <h2 class="page-title">个人荣誉</h2>
        <el-input v-model="memberKeyword" placeholder="搜索成员姓名" clearable style="width: 220px" @keyup.enter="loadMembers" @clear="loadMembers">
          <template #append><el-button @click="loadMembers">搜索</el-button></template>
        </el-input>
      </div>
      <el-table :data="memberList" v-loading="memberLoading" size="small" stripe>
        <el-table-column label="姓名" min-width="110">
          <template #default="s">
            <el-link type="primary" :underline="false" @click="showMemberDetail(s.row.name)">{{ s.row.name }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="totalCount" label="参赛场次" width="90" align="center" />
        <el-table-column label="金牌" width="90" align="center">
          <template #default="s"><span class="medal-count gold">{{ s.row.goldCount || 0 }}</span></template>
        </el-table-column>
        <el-table-column label="银牌" width="90" align="center">
          <template #default="s"><span class="medal-count silver">{{ s.row.silverCount || 0 }}</span></template>
        </el-table-column>
        <el-table-column label="铜牌" width="90" align="center">
          <template #default="s"><span class="medal-count bronze">{{ s.row.bronzeCount || 0 }}</span></template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 队伍详情弹窗 -->
    <el-dialog v-model="teamDialogVisible" :title="'队伍详情 — ' + activeTeam" width="760px" align-center>
      <el-table :data="teamAwards" size="small" stripe>
        <el-table-column prop="date" label="时间" width="100" align="center" />
        <el-table-column prop="contestName" label="竞赛" min-width="200" show-overflow-tooltip />
        <el-table-column label="奖项" width="90" align="center">
          <template #default="s">
            <el-tag v-if="s.row.medalType && s.row.medalType !== 'NONE'" :type="medalTagType(s.row.medalType)" size="small">{{ medalCn(s.row.medalType) }}</el-tag>
            <span v-else class="muted">—</span>
          </template>
        </el-table-column>
        <el-table-column label="排名" width="100" align="center">
          <template #default="s">{{ s.row.officialRank || '—' }} / {{ s.row.totalOfficialTeams }}</template>
        </el-table-column>
        <el-table-column label="成员" min-width="180">
          <template #default="s">
            <span v-for="(m, i) in s.row.members || []" :key="m.id">
              <el-link type="primary" :underline="false" @click="showMemberDetail(m.name)">{{ m.name }}</el-link><span v-if="i < (s.row.members || []).length - 1">、</span>
            </span>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 个人详情弹窗 -->
    <el-dialog v-model="memberDialogVisible" :title="'个人荣誉 — ' + activeMember" width="760px" align-center>
      <div class="member-summary" v-if="memberSummary">
        <span class="medal-count gold">金牌 {{ memberSummary.goldCount || 0 }}</span>
        <span class="medal-count silver">银牌 {{ memberSummary.silverCount || 0 }}</span>
        <span class="medal-count bronze">铜牌 {{ memberSummary.bronzeCount || 0 }}</span>
        <span class="medal-count plain">参赛 {{ memberSummary.totalCount || 0 }} 场</span>
      </div>
      <el-table :data="memberAwards" size="small" stripe>
        <el-table-column prop="date" label="时间" width="100" align="center" />
        <el-table-column prop="contestName" label="竞赛" min-width="200" show-overflow-tooltip />
        <el-table-column prop="teamName" label="队伍" min-width="130" />
        <el-table-column label="奖项" width="90" align="center">
          <template #default="s">
            <el-tag v-if="s.row.medalType && s.row.medalType !== 'NONE'" :type="medalTagType(s.row.medalType)" size="small">{{ medalCn(s.row.medalType) }}</el-tag>
            <span v-else class="muted">—</span>
          </template>
        </el-table-column>
        <el-table-column label="排名" width="100" align="center">
          <template #default="s">{{ s.row.rank }} / {{ s.row.totalTeams }}</template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'

const overview = ref(null)
const teamList = ref([])
const teamLoading = ref(false)
const awards = ref([])
const awardsLoading = ref(false)
const teamFilter = ref('')
const yearFilter = ref('')
const yearList = ref([])
const memberList = ref([])
const memberLoading = ref(false)
const memberKeyword = ref('')
const activeTeam = ref('')
const teamDialogVisible = ref(false)
const teamAwards = ref([])
const activeMember = ref('')
const memberDialogVisible = ref(false)
const memberAwards = ref([])
const memberSummary = ref(null)

const medalCnMap = { GOLD: '金牌', SILVER: '银牌', BRONZE: '铜牌' }
function medalCn(t) { return medalCnMap[t] || t }
function medalTagType(t) {
  if (t === 'GOLD') return 'warning'
  if (t === 'SILVER') return 'info'
  return 'danger'
}
function teamLabel(t) {
  const parts = []
  if (t.silverCount) parts.push('银' + t.silverCount)
  if (t.bronzeCount) parts.push('铜' + t.bronzeCount)
  return parts.length ? t.teamName + ' (' + parts.join(' ') + ')' : t.teamName
}

function loadOverview() {
  api.getHonorOverview().then(res => {
    if (res.data.code === 200) {
      overview.value = res.data.data.overview || null
    }
  }).catch(e => console.log(e))
}

function loadTeams() {
  teamLoading.value = true
  api.getHonorTeams().then(res => {
    teamLoading.value = false
    if (res.data.code === 200) {
      teamList.value = res.data.data || []
      const years = new Set()
      ;(res.data.data || []).forEach(() => {})
    }
  }).catch(e => { teamLoading.value = false; console.log(e) })
  // 年份列表从获奖记录中提取
  api.getHonorAwards({}).then(res => {
    if (res.data.code === 200) {
      const ys = new Set((res.data.data || []).map(a => (a.date || '').slice(0, 4)).filter(Boolean))
      yearList.value = [...ys].sort((a, b) => b.localeCompare(a))
    }
  }).catch(e => console.log(e))
}

function loadAwards() {
  awardsLoading.value = true
  api.getHonorAwards({ team: teamFilter.value || undefined, year: yearFilter.value || undefined }).then(res => {
    awardsLoading.value = false
    if (res.data.code === 200) {
      awards.value = res.data.data || []
    }
  }).catch(e => { awardsLoading.value = false; console.log(e) })
}

function loadMembers() {
  memberLoading.value = true
  api.getHonorMembers({ name: memberKeyword.value || undefined }).then(res => {
    memberLoading.value = false
    if (res.data.code === 200) {
      memberList.value = res.data.data || []
    }
  }).catch(e => { memberLoading.value = false; console.log(e) })
}

function showTeamDetail(name) {
  activeTeam.value = name
  teamDialogVisible.value = true
  api.getHonorAwards({ team: name }).then(res => {
    if (res.data.code === 200) {
      teamAwards.value = res.data.data || []
    }
  }).catch(e => console.log(e))
}

function showMemberDetail(name) {
  activeMember.value = name
  memberDialogVisible.value = true
  api.getHonorMemberDetail({ name }).then(res => {
    if (res.data.code === 200) {
      memberAwards.value = res.data.data || []
    }
  }).catch(e => console.log(e))
  api.getHonorMembers({ name }).then(res => {
    if (res.data.code === 200) {
      memberSummary.value = (res.data.data || [])[0] || null
    }
  }).catch(e => console.log(e))
}

onMounted(() => {
  loadOverview()
  loadTeams()
  loadAwards()
  loadMembers()
})
</script>

<style scoped>
.honor-page { padding: 8px; }
.page-card { background: #fff; border-radius: 8px; padding: 20px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,.05); }
.page-title { margin: 0 0 14px; font-size: 18px; font-weight: 600; }
.card-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
.filter-bar { display: flex; gap: 10px; }
.overview-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; }
.ov-item { background: #f7f9fc; border: 1px solid #eef1f6; border-radius: 10px; padding: 16px; text-align: center; }
.ov-num { font-size: 28px; font-weight: 700; color: #409eff; }
.ov-num.ov-gold { color: #d4a017; }
.ov-num.ov-silver { color: #7f8c9b; }
.ov-num.ov-bronze { color: #b87333; }
.ov-label { margin-top: 6px; font-size: 13px; color: #888; }
.medal-dot { display: inline-block; width: 12px; height: 12px; border-radius: 50%; vertical-align: -1px; margin-right: 4px; }
.medal-dot.gold { background: linear-gradient(135deg, #f7d774, #d4a017); }
.medal-dot.silver { background: linear-gradient(135deg, #d8dee6, #9aa7b4); }
.medal-dot.bronze { background: linear-gradient(135deg, #e8b98a, #b87333); }
.medal-count { font-weight: 700; font-size: 14px; }
.medal-count.gold { color: #d4a017; }
.medal-count.silver { color: #7f8c9b; }
.medal-count.bronze { color: #b87333; }
.medal-count.plain { color: #409eff; }
.member-chip { white-space: nowrap; }
.muted { color: #bbb; }
</style>
