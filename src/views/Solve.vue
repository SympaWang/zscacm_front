<template>
  <div class="solve-page">
    <div class="page-card solve-select">
      <el-form :model="form" inline>
        <el-form-item label="OJ">
          <el-select v-model="form.oj" size="large" style="width: 180px">
            <el-option v-for="oj in ojs" :key="oj.value" :label="oj.label" :value="oj.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="年级">
          <el-select v-model="form.grade" size="large" style="width: 140px">
            <el-option v-for="opt in options" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" @click="onSubmit">查 询</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div v-if="show == 1"><CfTable :grade="grade" /></div>
    <div v-else-if="show == 2"><LuoguTable :grade="grade" /></div>
    <div v-else-if="show == 3"><VjTable :grade="grade" /></div>
    <el-empty v-else description="请选择 OJ 与年级后查询" />
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import api from '../api'
import rankStyle from '../utils/rankStyle'

const form = reactive({ oj: '', grade: '' })
const grade = ref('')
const show = ref(0)
const options = [
  { value: '全部', label: '全部' },
  { value: '2019', label: '2019' },
  { value: '2023', label: '2023' },
  { value: '2024', label: '2024' },
  { value: '2025', label: '2025' }
]
const ojs = [
  { value: 'cf', label: 'Codeforces' },
  { value: 'luogu', label: '洛谷' },
  { value: 'vj', label: 'VJudge' }
]

// ---------- CF 排行 ----------
const CfTable = {
  props: ['grade'],
  data() {
    return { users: [], value: '', tableEmptyText: '没有符合条件的队员', loading: 0 }
  },
  watch: {
    grade: {
      handler(e) {
        this.value = e
        this.onSubmit()
      },
      immediate: true
    }
  },
  methods: {
    rankStyle,
    onSubmit() {
      this.tableEmptyText = '查询中......'
      this.loading = true
      if (this.value == '' || this.value == '全部') this.value = null
      api.getAcCf({ grade: this.value }).then(e => {
        this.users = e.data.data
        this.sortChange({ prop: 'acNum', order: 'descending' })
        this.users.forEach(t => { t.url = 'https://codeforces.com/profile/' + t.handle })
        this.loading = 0
        this.tableEmptyText = '没有符合条件的队员'
      }).catch(e => {
        this.users = null
        console.log(e)
        ElMessage.error('请求超时，请重试！')
        this.tableEmptyText = '查询失败，请重试！'
        this.loading = 0
      })
    },
    sortChange({ prop, order }) {
      this.users.sort(this.compare(prop, order))
      let r = 1
      this.users.forEach(s => { s.id = r; r = r + 1 })
    },
    compare(e, t) {
      function isNum(s) {
        const i = /^\d+(\.\d+)?$/
        const a = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/
        return !!(i.test(s) || a.test(s))
      }
      return function (s, i) {
        const a = s[e], l = i[e]
        if (isNum(a) || isNum(l)) return t === 'ascending' ? a - l : l - a
        if (typeof a === 'boolean' && typeof l === 'boolean') return t === 'ascending' ? a - l : l - a
        return t === 'ascending' ? String(a).localeCompare(String(l), 'zh') : -String(a).localeCompare(String(l), 'zh')
      }
    }
  },
  template: `
    <div class="table-card">
      <div class="oj-banner oj-cf">Codeforces AC 排行</div>
      <el-table :data="users" style="width: 100%" stripe :empty-text="tableEmptyText" @sort-change="sortChange" :default-sort="{prop:'acNum',order:'descending'}" v-loading="loading">
        <el-table-column prop="id" label="排名" width="80" align="center">
          <template #default="p"><span class="rank-no">{{ p.row.id }}</span></template>
        </el-table-column>
        <el-table-column prop="name" label="队员姓名" min-width="140" />
        <el-table-column prop="handle" label="CF昵称" min-width="160">
          <template #default="p"><a :href="p.row.url" target="_blank">{{ p.row.handle }}</a></template>
        </el-table-column>
        <el-table-column prop="rating" label="分数" sortable="custom" align="center">
          <template #default="p"><b :style="rankStyle(p.row.rating)">{{ p.row.rating }}</b></template>
        </el-table-column>
        <el-table-column prop="acNum" label="AC题数" sortable="custom" align="center">
          <template #default="p"><el-tag type="success">{{ p.row.acNum }}</el-tag></template>
        </el-table-column>
      </el-table>
    </div>`
}

// ---------- 洛谷排行 ----------
const LuoguTable = {
  props: ['grade'],
  data() {
    return { users: [], value: '', tableEmptyText: '没有符合条件的队员', loading: 0 }
  },
  watch: {
    grade: {
      handler(e) {
        this.value = e
        this.onSubmit()
      },
      immediate: true
    }
  },
  methods: {
    rankStyle,
    onSubmit() {
      this.tableEmptyText = '查询中......'
      if (this.value == '' || this.value == '全部') this.value = null
      api.getAcLuogu({ grade: this.value }).then(e => {
        this.users = e.data.data
        this.users.sort(this.cmp)
        this.sortChange({ prop: 'acNum', order: 'descending' })
        this.users.forEach(t => {
          t.url = 'https://www.luogu.com.cn/user/' + t.lgid
          t.acNum1 = t.solves[0].problemNum
          t.acNum2 = t.solves[1].problemNum
          t.acNum3 = t.solves[2].problemNum
          t.acNum4 = t.solves[3].problemNum
          t.acNum5 = t.solves[4].problemNum
          t.acNum6 = t.solves[5].problemNum
          t.acNum7 = t.solves[6].problemNum
          t.acNum8 = t.solves[7].problemNum
        })
        this.tableEmptyText = '没有符合条件的队员'
      }).catch(e => {
        this.users = null
        console.log(e)
        ElMessage.error('请求超时，请重试！')
        this.tableEmptyText = '查询失败，请重试！'
      })
    },
    cmp(e, t) { return e.acNum > t.acNum },
    sortChange({ prop, order }) {
      this.users.sort(this.compare(prop, order))
      let r = 1
      this.users.forEach(s => { s.id = r; r = r + 1 })
    },
    compare(e, t) {
      function isNum(s) {
        const i = /^\d+(\.\d+)?$/
        const a = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/
        return !!(i.test(s) || a.test(s))
      }
      return function (s, i) {
        const a = s[e], l = i[e]
        if (isNum(a) || isNum(l)) return t === 'ascending' ? a - l : l - a
        return t === 'ascending' ? String(a).localeCompare(String(l), 'zh') : -String(a).localeCompare(String(l), 'zh')
      }
    }
  },
  template: `
    <div class="table-card">
      <div class="oj-banner oj-luogu">洛谷 AC 排行</div>
      <el-table :data="users" style="width: 100%" stripe :empty-text="tableEmptyText" @sort-change="sortChange" :default-sort="{prop:'acNum',order:'descending'}">
        <el-table-column prop="id" label="排名" width="70" align="center">
          <template #default="p"><span class="rank-no">{{ p.row.id }}</span></template>
        </el-table-column>
        <el-table-column prop="name" label="队员姓名" min-width="110" />
        <el-table-column prop="lgid" label="洛谷id" width="100">
          <template #default="p"><a :href="p.row.url" target="_blank">{{ p.row.lgid }}</a></template>
        </el-table-column>
        <el-table-column prop="acNum1" label="暂无评定" width="90" align="center" />
        <el-table-column prop="acNum2" label="入门" width="80" align="center" />
        <el-table-column prop="acNum3" label="普及-" width="80" align="center" />
        <el-table-column prop="acNum4" label="普及/提高-" width="100" align="center" />
        <el-table-column prop="acNum5" label="普及+/提高" width="100" align="center" />
        <el-table-column prop="acNum6" label="提高+/省选" width="100" align="center" />
        <el-table-column prop="acNum7" label="省选/NOI-" width="100" align="center" />
        <el-table-column prop="acNum8" label="NOI/NOI+/CTSC" width="110" align="center" />
        <el-table-column prop="acNum" label="总题数" sortable="custom" align="center">
          <template #default="p"><el-tag type="success">{{ p.row.acNum }}</el-tag></template>
        </el-table-column>
      </el-table>
    </div>`
}

// ---------- VJ 排行 ----------
const VjTable = {
  props: ['grade'],
  data() {
    return { users: [], value: '', tableEmptyText: '没有符合条件的队员', loading: 0 }
  },
  watch: {
    grade: {
      handler(e) {
        this.value = e
        this.onSubmit()
      },
      immediate: true
    }
  },
  methods: {
    rankStyle,
    onSubmit() {
      this.tableEmptyText = '查询中......'
      this.loading = true
      if (this.value == '' || this.value == '全部') this.value = null
      api.getAcVj({ grade: this.value }).then(e => {
        console.log(e)
        this.users = e.data.data
        this.users.sort(this.cmp)
        this.sortChange({ prop: 'totalProblem', order: 'descending' })
        this.users.forEach(t => { t.url = 'https://vjudge.csgrandeur.cn/user/' + t.vjName })
        this.tableEmptyText = '没有符合条件的队员'
        this.loading = 0
      }).catch(e => {
        this.users = null
        console.log(e)
        ElMessage.error('请求超时，请重试！')
        this.tableEmptyText = '查询失败，请重试！'
        this.loading = 0
      })
    },
    cmp(e, t) { return e.totalProblem > t.totalProblem },
    sortChange({ prop, order }) {
      this.users.sort(this.compare(prop, order))
      let r = 1
      this.users.forEach(s => { s.id = r; r = r + 1 })
    },
    compare(e, t) {
      function isNum(s) {
        const i = /^\d+(\.\d+)?$/
        const a = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/
        return !!(i.test(s) || a.test(s))
      }
      return function (s, i) {
        const a = s[e], l = i[e]
        if (isNum(a) || isNum(l)) return t === 'ascending' ? a - l : l - a
        return t === 'ascending' ? String(a).localeCompare(String(l), 'zh') : -String(a).localeCompare(String(l), 'zh')
      }
    }
  },
  template: `
    <div class="table-card">
      <div class="oj-banner oj-vj">VJudge AC 排行</div>
      <el-table :data="users" style="width: 100%" stripe :empty-text="tableEmptyText" @sort-change="sortChange" :default-sort="{prop:'totalProblem',order:'descending'}" v-loading="loading">
        <el-table-column prop="id" label="排名" width="80" align="center">
          <template #default="p"><span class="rank-no">{{ p.row.id }}</span></template>
        </el-table-column>
        <el-table-column prop="name" label="队员姓名" min-width="130" />
        <el-table-column prop="vjName" label="VJ账号" min-width="150">
          <template #default="p"><a :href="p.row.url" target="_blank">{{ p.row.vjName }}</a></template>
        </el-table-column>
        <el-table-column prop="weekProblem" label="7日内做题" width="110" sortable="custom" align="center">
          <template #default="p"><el-tag type="warning" effect="plain">{{ p.row.weekProblem }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="monthProblem" label="30日内做题" width="110" sortable="custom" align="center">
          <template #default="p"><el-tag type="info" effect="plain">{{ p.row.monthProblem }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="totalProblem" label="总题量" sortable="custom" align="center">
          <template #default="p"><el-tag type="success">{{ p.row.totalProblem }}</el-tag></template>
        </el-table-column>
      </el-table>
    </div>`
}

function onSubmit() {
  grade.value = form.grade
  if (form.oj == 'cf') show.value = 1
  else if (form.oj == 'luogu') show.value = 2
  else if (form.oj == 'vj') show.value = 3
}

onMounted(() => { grade.value = '全部' })
</script>

<style scoped>
.solve-select :deep(.el-form-item) { margin-bottom: 0; margin-right: 24px; }
.solve-select :deep(.el-form-item__label) { font-weight: 600; color: var(--text-secondary); }

.oj-banner {
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
}
.oj-cf { background: linear-gradient(90deg, #3b8cff, #5aa2ff); }
.oj-luogu { background: linear-gradient(90deg, #f0a63c, #f5bd6b); }
.oj-vj { background: linear-gradient(90deg, #6b7cff, #8b98ff); }

.rank-no {
  display: inline-block;
  min-width: 24px;
  color: var(--text-secondary);
  font-weight: 600;
}
</style>
