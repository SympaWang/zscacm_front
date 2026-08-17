<template>
  <div class="manage-page">
    <div class="page-card">
      <h2 class="page-title">系统用户管理</h2>
      <div class="toolbar">
        <el-button type="primary" @click="downloadTemplate">
          <el-icon style="margin-right: 6px"><Download /></el-icon>下载模板
        </el-button>
        <el-upload
          :show-file-list="false"
          :before-upload="handleExcelImport"
          accept=".xlsx,.xls"
          style="display: inline-block; margin: 0 8px"
        >
          <el-button type="success">
            <el-icon style="margin-right: 6px"><Upload /></el-icon>Excel 导入
          </el-button>
        </el-upload>
        <el-button @click="addVisible = true">
          <el-icon style="margin-right: 6px"><Plus /></el-icon>JSON 批量添加
        </el-button>
        <el-button type="warning" @click="exportExcel">
          <el-icon style="margin-right: 6px"><FolderOpened /></el-icon>导出 Excel
        </el-button>
      </div>
      <el-table :data="users" style="width: 100%" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="60" align="center" />
        <el-table-column prop="username" label="姓名" min-width="100" />
        <el-table-column prop="studentNum" label="学号" width="130" />
        <el-table-column prop="grade" label="年级" width="80" align="center" />
        <el-table-column prop="handle" label="CF" width="120" />
        <el-table-column prop="lgid" label="洛谷id" width="90" align="center" />
        <el-table-column prop="vjName" label="VJ" width="120" />
        <el-table-column prop="email" label="邮箱" min-width="140" show-overflow-tooltip />
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="openEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" plain @click="removeUser(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="editVisible" :title="editing.id ? '编辑用户' : '添加用户'" width="520px" align-center>
      <el-form :model="editing" label-width="100px">
        <el-form-item label="姓名"><el-input v-model="editing.username" /></el-form-item>
        <el-form-item label="学号"><el-input v-model="editing.studentNum" /></el-form-item>
        <el-form-item label="年级"><el-input v-model="editing.grade" /></el-form-item>
        <el-form-item label="CF用户名"><el-input v-model="editing.handle" /></el-form-item>
        <el-form-item label="洛谷id"><el-input v-model="editing.lgid" /></el-form-item>
        <el-form-item label="VJ用户名"><el-input v-model="editing.vjName" /></el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editVisible = false">取消</el-button>
          <el-button type="primary" @click="save">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="addVisible" title="JSON 批量添加用户" width="560px" align-center>
      <p class="add-tip">粘贴 JSON 数组,字段:姓名(username)、学号(studentNum)、年级(grade)、CF(handle)、洛谷(lgid)、VJ(vjName)</p>
      <el-input v-model="addJson" type="textarea" :rows="10" placeholder='[{"username":"张三","studentNum":"2023...","grade":2023}]' />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addVisible = false">取消</el-button>
          <el-button type="primary" @click="saveAdd">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Download, Upload, FolderOpened } from '@element-plus/icons-vue'
import * as XLSX from 'xlsx'
import api from '../api'

const users = ref([])
const loading = ref(false)
const editVisible = ref(false)
const addVisible = ref(false)
const editing = ref({})
const addJson = ref('')

// Excel 列头(中文) -> 字段
const HEADER_MAP = {
  '姓名': 'username',
  '学号': 'studentNum',
  '姓名拼音': 'pyName',
  '年级': 'grade',
  'CF用户名': 'handle',
  '洛谷id': 'lgid',
  'VJ用户名': 'vjName',
  '邮箱': 'email',
  '电话': 'phone'
}

function load() {
  loading.value = true
  api.getUserDetailList().then(res => {
    users.value = res.data.data
    loading.value = false
  }).catch(e => { console.log(e); loading.value = false })
}

// 下载导入模板(仅表头)
function downloadTemplate() {
  const headers = Object.keys(HEADER_MAP)
  const ws = XLSX.utils.aoa_to_sheet([headers])
  ws['!cols'] = headers.map(h => ({ wch: h.length * 2 + 6 }))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '用户')
  XLSX.writeFile(wb, '用户导入模板.xlsx')
  ElMessage.success('模板已下载')
}

// Excel 导入(前端解析 -> addUser)
function handleExcelImport(file) {
  const reader = new FileReader()
  reader.onload = e => {
    try {
      const data = new Uint8Array(e.target.result)
      const wb = XLSX.read(data, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json(ws, { defval: '' })
      const list = rows.map(r => normalizeRow(r)).filter(r => r.username || r.studentNum)
      if (!list.length) {
        ElMessage.warning('文件中无有效数据')
        return
      }
      api.addUser(list).then(res => {
        ElMessage.success('导入成功,新增 ' + (res.data.data || 0) + ' 人')
        load()
      }).catch(err => {
        console.log(err)
        ElMessage.error('导入失败')
      })
    } catch (err) {
      console.log(err)
      ElMessage.error('文件解析失败,请使用模板格式')
    }
  }
  reader.readAsArrayBuffer(file)
  return false // 阻止 el-upload 自动上传
}

// 行数据规范化:数字字段转 number,空值转 null
function normalizeRow(r) {
  const item = {}
  for (const [zh, field] of Object.entries(HEADER_MAP)) {
    let v = r[zh]
    if (v === undefined || v === null) v = ''
    v = String(v).trim()
    if (field === 'grade' || field === 'lgid') {
      const n = Number(v)
      item[field] = v === '' ? null : (isNaN(n) ? null : n)
    } else {
      item[field] = v === '' ? null : v
    }
  }
  return item
}

// 导出当前用户列表为 Excel
function exportExcel() {
  if (!users.value.length) {
    ElMessage.warning('暂无数据可导出')
    return
  }
  const headers = Object.keys(HEADER_MAP)
  const data = users.value.map(u => headers.map(h => (u[HEADER_MAP[h]] === null || u[HEADER_MAP[h]] === undefined ? '' : u[HEADER_MAP[h]])))
  const ws = XLSX.utils.aoa_to_sheet([headers, ...data])
  ws['!cols'] = headers.map(h => ({ wch: h.length * 2 + 6 }))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '用户')
  XLSX.writeFile(wb, '用户列表.xlsx')
  ElMessage.success('已导出 ' + users.value.length + ' 人')
}

function openEdit(row) {
  editing.value = { ...row }
  editVisible.value = true
}

function save() {
  api.updateUserDetail(editing.value).then(res => {
    if (res.data.code == 200) {
      ElMessage.success('保存成功')
      editVisible.value = false
      load()
    }
  }).catch(e => console.log(e))
}

function removeUser(row) {
  ElMessageBox.confirm(`确定删除用户「${row.username}」吗?`, '提示', { type: 'warning' }).then(() => {
    api.deleteUser({ id: row.id }).then(res => {
      ElMessage.success('删除成功')
      load()
    }).catch(e => console.log(e))
  }).catch(() => {})
}

function saveAdd() {
  try {
    const list = JSON.parse(addJson.value)
    api.addUser(list).then(res => {
      ElMessage.success('添加成功')
      addVisible.value = false
      load()
    }).catch(e => console.log(e))
  } catch (e) {
    ElMessage.error('JSON格式错误')
  }
}

onMounted(() => { load() })
</script>

<style scoped>
.toolbar { margin-bottom: 16px; }
.add-tip { color: var(--text-muted); font-size: 13px; margin: 0 0 12px; }
</style>
