<template>
  <div class="problems-page">
    <!-- 筛选区 -->
    <div class="page-card">
      <h2 class="page-title">Codeforces 题目检索</h2>
      <el-form :model="form" label-width="140px" class="filter-form" @keyup.enter="submit">
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item value="problemName" label="问题名称">
              <el-input v-model="form.problemName" placeholder="输入题目名称" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item value="problemId" label="问题编号">
              <el-input v-model="form.problemIds" placeholder="如 1741A" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="store.state.login == 1" label="仅显示我未通过">
              <el-select v-model="form.submited">
                <el-option label="否" value="0" />
                <el-option label="是" value="1" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="难度区间">
              <div class="diff-range">
                <el-input v-model="form.diff1" placeholder="最低" clearable />
                <span class="diff-sep">-</span>
                <el-input v-model="form.diff2" placeholder="最高" clearable />
              </div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item value="problemType" label="标签(最多三个)">
          <el-checkbox-group v-model="form.problemType" :max="3" class="tag-group">
            <el-checkbox v-for="(label, value) in typeMap" :key="value" :value="value" :label="label" name="type" />
          </el-checkbox-group>
        </el-form-item>
        <el-form-item v-if="store.state.login == 1" label="指定年级未做过">
          <el-select v-model="grade" size="large" style="width: 180px">
            <el-option v-for="opt in options" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submit">查 询</el-button>
          <el-button @click="clearForm">清 空</el-button>
          <div class="show-type">
            <span class="show-type-label">显示题目标签</span>
            <el-switch v-model="showType" />
          </div>
        </el-form-item>
      </el-form>
    </div>

    <!-- 结果表 -->
    <div class="table-card">
      <el-table :data="problems" style="width: 100%" stripe :empty-text="tableEmptyText" v-loading="loading">
        <el-table-column prop="status" label="提交状态" width="110" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status == 'OK' || scope.row.status == '-' ? 'success' : 'danger'" size="small" effect="light">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="id" label="问题编号" width="110" />
        <el-table-column prop="problemName" label="问题名称" min-width="320">
          <template #default="scope">
            <a :href="scope.row.url" target="_blank" class="problem-link">{{ scope.row.problemName }}</a>
            <el-tag v-for="type in scope.row.type" :key="type" class="ml-2" type="success" size="small" effect="plain" v-show="showType">{{ typeMap[type] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="difficulty" label="难度" width="110" align="center">
          <template #default="scope">
            <div :style="rankStyle(scope.row.difficulty)"><b>{{ scope.row.difficulty }}</b></div>
          </template>
        </el-table-column>
        <el-table-column prop="acceptNum" label="通过人数" width="110" align="center" />
      </el-table>
      <div class="example-pagination-block">
        <el-pagination
          layout="prev, pager, next"
          :total="total"
          :page-count="pageCount"
          :current-page="currentPage"
          background
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import api from '../api'
import rankStyle from '../utils/rankStyle'
import { typeMap } from '../utils/problemTags'

const store = useStore()
const form = reactive({ problemName: null, problemIds: null, submited: '0', diff1: null, diff2: null, problemType: [] })
const grade = ref('')
const options = [
  { value: '全部', label: '全部' },
  { value: '2019', label: '2019' },
  { value: '2023', label: '2023' },
  { value: '2024', label: '2024' },
  { value: '2025', label: '2025' }
]
const problems = ref(null)
const pageCount = ref(1)
const currentPage = ref(1)
const showType = ref(false)
const tableEmptyText = ref('没有符合条件的题目')
const loading = ref(false)
const total = ref(0)

onMounted(() => { onSubmit() })

function handleCurrentChange(l) { currentPage.value = l }

function clearForm() {
  Object.assign(form, { problemName: null, problemIds: null, submited: '0', diff1: null, diff2: null, problemType: [] })
}

function submit() {
  currentPage.value = 1
  onSubmit()
}

function buildUrl() {
  let d = grade.value
  if (d === '全部') d = null
  let r = '/problemList?currentPage=' + currentPage.value
  if (form.problemName != null) r = r + '&problemName=' + form.problemName
  if (form.diff1 != null) r = r + '&diff1=' + form.diff1
  if (form.diff2 != null) r = r + '&diff2=' + form.diff2
  if (form.problemIds != null) r = r + '&problemIds=' + form.problemIds
  if (form.problemType != null) r = r + '&problemType=' + encodeURI(form.problemType)
  const c = store.state.username
  if (c != null && c !== '') r = r + '&sysUser=' + c
  if (d != null && d !== '') r = r + '&grade=' + d
  r = r + '&submited=' + form.submited
  return r.replace(/ /g, '%20')
}

function onSubmit() {
  tableEmptyText.value = '正在查询中……'
  loading.value = true
  api.getProblemListRaw(buildUrl()).then(l => {
    total.value = l.data[l.data.length - 1].total
    pageCount.value = Math.floor(total.value / 30)
    if (total.value % 30 != 0) total.value = total.value + 1
    l.data.pop()
    problems.value = l.data
    problems.value.forEach(a => {
      a.problemName = a.problem.problemName
      a.id = '' + a.problem.firstId + String.fromCharCode(64 + a.problem.secondId)
      if (a.problem.thirdId != 0) a.id = a.id + a.problem.thirdId
      a.difficulty = a.problem.difficulty
      if (a.difficulty == 0) a.difficulty = '未定'
      a.acceptNum = a.problem.acceptNum
      a.url = a.problem.url
      a.status = a.status.toLowerCase()
    })
    loading.value = false
    tableEmptyText.value = '没有符合条件的题目'
  }).catch(l => {
    problems.value = null
    console.log(l)
    ElMessage.error('请求超时，请重试！')
    tableEmptyText.value = '查询失败，请重试！'
    loading.value = false
  })
}
</script>

<style scoped>
.filter-form :deep(.el-form-item) { margin-bottom: 18px; }
.filter-form :deep(.el-form-item__label) { font-weight: 600; color: var(--text-secondary); }
.diff-range { display: flex; align-items: center; gap: 8px; width: 100%; }
.diff-sep { color: var(--text-muted); }
.tag-group { display: flex; flex-wrap: wrap; gap: 4px; }
.show-type { margin-left: 24px; display: inline-flex; align-items: center; gap: 8px; }
.show-type-label { color: var(--text-secondary); font-size: 14px; }
.problem-link { font-weight: 500; }
.ml-2 { margin-left: 6px; }
</style>
