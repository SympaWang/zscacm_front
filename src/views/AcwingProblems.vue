<template>
  <div class="problems-page">
    <!-- 筛选区 -->
    <div class="page-card">
      <h2 class="page-title">AcWing 题目检索</h2>
      <el-form :model="form" label-width="140px" class="filter-form" @keyup.enter="submit">
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="题目名称/编号">
              <el-input v-model="form.keyword" placeholder="输入题目名称或编号" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="难度">
              <el-select v-model="form.difficulty" placeholder="全部难度" clearable style="width: 100%">
                <el-option label="入门" value="入门" />
                <el-option label="简单" value="简单" />
                <el-option label="中等" value="中等" />
                <el-option label="困难" value="困难" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="标签">
              <el-select v-model="form.tag" placeholder="全部标签" clearable filterable style="width: 100%">
                <el-option v-for="t in tagList" :key="t" :label="t" :value="t" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item>
          <el-button type="primary" @click="submit">查 询</el-button>
          <el-button @click="clearForm">清 空</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 结果表 -->
    <div class="table-card">
      <el-table :data="problems" style="width: 100%" stripe :empty-text="tableEmptyText" v-loading="loading">
        <el-table-column prop="problemId" label="编号" width="90" align="center" />
        <el-table-column prop="title" label="题目名称" min-width="320">
          <template #default="scope">
            <a :href="scope.row.url" target="_blank" class="problem-link">{{ scope.row.title }}</a>
            <el-tag v-if="scope.row.source" class="ml-2" type="info" size="small" effect="plain">{{ scope.row.source }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="difficulty" label="难度" width="110" align="center">
          <template #default="scope">
            <el-tag :type="diffType(scope.row.difficulty)" size="small" effect="plain">{{ scope.row.difficulty || '未定' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="passRate" label="通过率" width="110" align="center">
          <template #default="scope">
            <span>{{ scope.row.passRate || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="标签" min-width="220">
          <template #default="scope">
            <template v-if="scope.row.tags">
              <el-tag v-for="t in scope.row.tags.split(',')" :key="t" size="small" type="warning" effect="plain" class="ml-2">{{ t }}</el-tag>
            </template>
            <span v-else class="no-tag">-</span>
          </template>
        </el-table-column>
      </el-table>
      <div class="example-pagination-block">
        <el-pagination
          layout="total, prev, pager, next"
          :total="total"
          :page-size="limit"
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
import { ElMessage } from 'element-plus'
import api from '../api'

const form = reactive({ keyword: null, difficulty: null, tag: null })
const problems = ref([])
const tagList = ref([])
const currentPage = ref(1)
const limit = 30
const total = ref(0)
const tableEmptyText = ref('没有符合条件的题目')
const loading = ref(false)

onMounted(() => { onSubmit() })

function handleCurrentChange(l) {
  currentPage.value = l
  onSubmit()
}

function clearForm() {
  Object.assign(form, { keyword: null, difficulty: null, tag: null })
  currentPage.value = 1
  onSubmit()
}

function submit() {
  currentPage.value = 1
  onSubmit()
}

function diffType(d) {
  if (d === '入门' || d === '简单') return 'success'
  if (d === '中等') return 'warning'
  if (d === '困难') return 'danger'
  return 'info'
}

function onSubmit() {
  tableEmptyText.value = '正在查询中……'
  loading.value = true
  const params = { currentPage: currentPage.value, limit }
  if (form.keyword) params.keyword = form.keyword
  if (form.difficulty) params.difficulty = form.difficulty
  if (form.tag) params.tag = form.tag
  api.getAcwingProblemList(params).then(res => {
    loading.value = false
    if (res.data.code === 200) {
      problems.value = res.data.data.list || []
      total.value = res.data.data.total || 0
      if (res.data.data.tags && res.data.data.tags.length) tagList.value = res.data.data.tags
      tableEmptyText.value = '没有符合条件的题目'
    } else {
      problems.value = []
      tableEmptyText.value = '查询失败'
    }
  }).catch(e => {
    console.log(e)
    loading.value = false
    problems.value = []
    ElMessage.error('请求超时，请重试！')
    tableEmptyText.value = '查询失败，请重试！'
  })
}
</script>

<style scoped>
.filter-form :deep(.el-form-item) { margin-bottom: 18px; }
.filter-form :deep(.el-form-item__label) { font-weight: 600; color: var(--text-secondary); }
.problem-link { font-weight: 500; }
.ml-2 { margin-left: 6px; }
.no-tag { color: var(--text-muted); }
.example-pagination-block { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
