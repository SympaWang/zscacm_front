<template>
  <div class="resource-page">
    <div class="resource-layout">
      <!-- 左侧:文件目录树 -->
      <div class="tree-panel">
        <div class="tree-header">
          <span class="tree-title">📁 资料目录</span>
          <div class="tree-actions">
            <el-tooltip content="新建目录" placement="top">
              <el-button size="small" circle type="primary" plain @click="openMkdir">
                <el-icon><FolderAdd /></el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip content="上传文件" placement="top">
              <el-button size="small" circle type="success" plain @click="triggerUpload">
                <el-icon><Upload /></el-icon>
              </el-button>
            </el-tooltip>
          </div>
          <input ref="fileInput" type="file" style="display:none" @change="handleFileSelect" />
        </div>
        <el-tree
          ref="treeRef"
          :data="treeData"
          node-key="path"
          :props="treeProps"
          :expand-on-click-node="false"
          highlight-current
          @node-click="onNodeClick"
          @node-contextmenu="onContextMenu"
          class="file-tree"
        >
          <template #default="{ data }">
            <span class="tree-node" :class="{ 'is-file': data.type === 'file' }">
              <span class="node-icon">{{ data.type === 'dir' ? '📁' : fileIcon(data.name) }}</span>
              <span class="node-name">{{ data.name }}</span>
              <span class="node-size" v-if="data.type === 'file'">{{ formatSize(data.size) }}</span>
            </span>
          </template>
        </el-tree>

        <!-- 右键菜单 -->
        <div v-if="ctxMenu.visible" class="ctx-menu" :style="{ left: ctxMenu.x + 'px', top: ctxMenu.y + 'px' }">
          <div class="ctx-item" @click="ctxMkdir"><el-icon><FolderAdd /></el-icon>在此新建目录</div>
          <div class="ctx-item" @click="ctxUpload"><el-icon><Upload /></el-icon>上传文件</div>
          <div class="ctx-item" @click="ctxRename"><el-icon><Edit /></el-icon>重命名</div>
          <div class="ctx-item danger" @click="ctxDelete"><el-icon><Delete /></el-icon>删除</div>
        </div>
      </div>

      <!-- 右侧:预览窗口 -->
      <div class="preview-panel">
        <div class="preview-header" v-if="currentFile">
          <span class="preview-name">{{ currentFile.name }}</span>
          <span class="preview-path">{{ currentFile.path }}</span>
          <el-button size="small" type="primary" plain @click="downloadCurrent">下载</el-button>
        </div>
        <div class="preview-body" v-loading="previewLoading">
          <div v-if="!currentFile" class="preview-empty">
            <div class="empty-icon">📄</div>
            <p>从左侧选择文件查看预览</p>
          </div>

          <!-- 文本预览 -->
          <pre v-else-if="previewType === 'text'" class="text-view">{{ previewText }}</pre>

          <!-- 图片预览 -->
          <div v-else-if="previewType === 'image'" class="image-view">
            <img :src="previewUrl" alt="图片预览" />
          </div>

          <!-- PDF 预览 -->
          <iframe v-else-if="previewType === 'pdf'" :src="previewUrl" class="pdf-view"></iframe>

          <!-- 视频预览 -->
          <div v-else-if="previewType === 'video'" class="video-view">
            <video :src="previewUrl" controls style="width:100%;max-height:70vh"></video>
          </div>

          <!-- 其他文件 -->
          <div v-else class="preview-empty">
            <div class="empty-icon">📦</div>
            <p>该类型暂不支持在线预览</p>
            <el-button type="primary" @click="downloadCurrent">下载文件</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 新建目录对话框 -->
    <el-dialog v-model="mkdirVisible" title="新建目录" width="380px" align-center>
      <el-form label-width="70px">
        <el-form-item label="父目录">
          <el-select v-model="mkdirParent" filterable placeholder="选择父目录(默认根目录)" style="width: 100%">
            <el-option label="/ (根目录)" value="" />
            <el-option v-for="d in dirOptions" :key="d.path" :label="d.path" :value="d.path" />
          </el-select>
        </el-form-item>
        <el-form-item label="目录名">
          <el-input v-model="mkdirName" placeholder="请输入目录名称" maxlength="60" @keyup.enter="doMkdir" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="mkdirVisible = false">取消</el-button>
          <el-button type="primary" @click="doMkdir">创建</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 重命名对话框 -->
    <el-dialog v-model="renameVisible" :title="'重命名 — ' + renameTarget" width="380px" align-center>
      <el-form label-width="70px">
        <el-form-item label="新名称">
          <el-input v-model="renameName" placeholder="请输入新名称" maxlength="60" @keyup.enter="doRename" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="renameVisible = false">取消</el-button>
          <el-button type="primary" @click="doRename">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { FolderAdd, Upload, Edit, Delete, Download } from '@element-plus/icons-vue'
import api from '../api'

const treeData = ref([])
const treeProps = { children: 'children', label: 'name' }
const treeRef = ref(null)
const fileInput = ref(null)
const currentFile = ref(null)
const previewLoading = ref(false)
const previewText = ref('')
const previewUrl = ref('')
const previewType = ref('')
const mkdirVisible = ref(false)
const mkdirName = ref('')
const mkdirParent = ref('')
const renameVisible = ref(false)
const renameName = ref('')
const renameTarget = ref('')
const ctxMenu = reactive({ visible: false, x: 0, y: 0, node: null })

const TEXT_EXT = ['txt', 'md', 'markdown', 'log', 'json', 'xml', 'html', 'htm', 'css', 'js', 'java', 'cpp', 'c', 'h', 'py', 'sql', 'yml', 'yaml', 'csv', 'ini', 'conf', 'sh', 'bat', 'properties']
const IMG_EXT = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp']
const VIDEO_EXT = ['mp4', 'webm', 'ogg', 'mov']

// 所有目录路径(用于父目录选择)
const dirOptions = computed(() => {
  const result = []
  const walk = nodes => {
    for (const n of nodes || []) {
      if (n.type === 'dir') {
        result.push(n)
        walk(n.children)
      }
    }
  }
  walk(treeData.value)
  return result
})

function loadTree() {
  api.getResourceTree().then(res => {
    if (res.data.code === 200) {
      const root = res.data.data.root
      // 根节点为挂载点,显示其子节点
      treeData.value = root && root.children ? root.children : []
      // 刷新后清空选中,避免 current node 指向已删除的目录
      if (treeRef.value) treeRef.value.setCurrentKey(null)
    }
  }).catch(e => console.log(e))
}

// 获取当前有效选中目录路径(若指向已不存在的目录则回退根目录)
function currentDirPath() {
  const cur = treeRef.value ? treeRef.value.getCurrentNode() : null
  if (cur && cur.type === 'dir') {
    // 校验该目录仍存在于树中
    if (dirOptions.value.some(d => d.path === cur.path)) return cur.path
  }
  return ''
}

function onNodeClick(data) {
  if (data.type === 'file') {
    openPreview(data)
  }
}

function openPreview(file) {
  currentFile.value = file
  previewLoading.value = true
  previewText.value = ''
  previewUrl.value = ''
  const ext = getExt(file.name)
  if (TEXT_EXT.includes(ext)) {
    // 文本:请求后转字符串(后端直接返回纯文本)
    api.getResourceContent({ path: file.path }).then(res => {
      previewLoading.value = false
      previewType.value = 'text'
      const reader = new FileReader()
      reader.onload = e => { previewText.value = e.target.result }
      reader.readAsText(res.data)
    }).catch(e => { previewLoading.value = false; ElMessage.error('读取失败'); console.log(e) })
  } else if (IMG_EXT.includes(ext)) {
    loadBlobUrl(file, 'image')
  } else if (ext === 'pdf') {
    loadBlobUrl(file, 'pdf')
  } else if (VIDEO_EXT.includes(ext)) {
    loadBlobUrl(file, 'video')
  } else {
    previewLoading.value = false
    previewType.value = 'other'
  }
}

function loadBlobUrl(file, type) {
  api.getResourceContent({ path: file.path }).then(res => {
    previewLoading.value = false
    previewType.value = type
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = URL.createObjectURL(res.data)
  }).catch(e => { previewLoading.value = false; ElMessage.error('读取失败'); console.log(e) })
}

function downloadCurrent() {
  if (!currentFile.value) return
  api.getResourceContent({ path: currentFile.value.path }).then(res => {
    const url = URL.createObjectURL(res.data)
    const a = document.createElement('a')
    a.href = url
    a.download = currentFile.value.name
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 5000)
  }).catch(e => console.log(e))
}

// ---- 新建目录 ----
function openMkdir() {
  // 默认父目录为当前选中目录(未选中或已删除则根目录)
  mkdirParent.value = currentDirPath()
  mkdirName.value = ''
  mkdirVisible.value = true
}

function doMkdir() {
  if (!mkdirName.value.trim()) { ElMessage.warning('请输入目录名'); return }
  api.resourceMkdir({ path: mkdirParent.value, name: mkdirName.value.trim() }).then(res => {
    if (res.data.code === 200) {
      ElMessage.success('创建成功')
      mkdirVisible.value = false
      loadTree()
    } else {
      ElMessage.error(res.data.msg || '创建失败')
    }
  }).catch(e => console.log(e))
}

// ---- 上传 ----
function triggerUpload() {
  // 上传到当前选中目录(未选中或已删除则根目录)
  uploadPath = currentDirPath()
  fileInput.value.click()
}

function handleFileSelect(e) {
  const file = e.target.files[0]
  if (!file) return
  uploadFile(file, uploadPath || '')
  e.target.value = ''
}

function uploadFile(file, path) {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('path', path)
  api.resourceUpload(fd).then(res => {
    if (res.data.code === 200) {
      ElMessage.success('上传成功: ' + file.name)
      loadTree()
    } else {
      ElMessage.error(res.data.msg || '上传失败')
    }
  }).catch(e => console.log(e))
}

// ---- 右键菜单 ----
function onContextMenu(event, data) {
  ctxMenu.visible = true
  ctxMenu.x = event.clientX
  ctxMenu.y = event.clientY
  ctxMenu.node = data
  event.preventDefault()
}

function closeCtx() { ctxMenu.visible = false }

function ctxMkdir() {
  closeCtx()
  mkdirParent.value = ctxMenu.node ? ctxMenu.node.path : ''
  mkdirName.value = ''
  mkdirVisible.value = true
}

function ctxUpload() {
  closeCtx()
  // 上传到当前选中目录
  const path = ctxMenu.node && ctxMenu.node.type === 'dir' ? ctxMenu.node.path : (ctxMenu.node ? ctxMenu.node.path.replace(/\/[^/]+$/, '') : '')
  // 保存待上传目录
  uploadPath = path
  fileInput.value.click()
}

let uploadPath = ''

function ctxRename() {
  closeCtx()
  if (!ctxMenu.node) return
  renameTarget.value = ctxMenu.node.path
  renameName.value = ctxMenu.node.name
  renameVisible.value = true
}

function ctxDelete() {
  closeCtx()
  if (!ctxMenu.node) return
  ElMessageBox.confirm(`确定删除「${ctxMenu.node.name}」吗?${ctxMenu.node.type === 'dir' ? '目录内所有内容将一并删除!' : ''}`, '删除确认', {
    type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消'
  }).then(() => {
    api.resourceDelete({ path: ctxMenu.node.path }).then(res => {
      if (res.data.code === 200) {
        ElMessage.success('删除成功')
        if (currentFile.value && currentFile.value.path.startsWith(ctxMenu.node.path)) {
          currentFile.value = null
        }
        loadTree()
      } else {
        ElMessage.error(res.data.msg || '删除失败')
      }
    })
  }).catch(() => {})
}

function doRename() {
  if (!renameName.value.trim()) { ElMessage.warning('请输入名称'); return }
  api.resourceRename({ path: renameTarget.value, newName: renameName.value.trim() }).then(res => {
    if (res.data.code === 200) {
      ElMessage.success('重命名成功')
      renameVisible.value = false
      loadTree()
    } else {
      ElMessage.error(res.data.msg || '重命名失败')
    }
  }).catch(e => console.log(e))
}

// ---- 工具函数 ----
function getExt(name) {
  const idx = name.lastIndexOf('.')
  return idx > 0 ? name.slice(idx + 1).toLowerCase() : ''
}

function fileIcon(name) {
  const ext = getExt(name)
  if (IMG_EXT.includes(ext)) return '🖼️'
  if (ext === 'pdf') return '📕'
  if (ext === 'doc' || ext === 'docx') return '📘'
  if (ext === 'xls' || ext === 'xlsx' || ext === 'csv') return '📊'
  if (ext === 'ppt' || ext === 'pptx') return '📙'
  if (VIDEO_EXT.includes(ext)) return '🎬'
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return '🗜️'
  if (TEXT_EXT.includes(ext)) return '📝'
  return '📄'
}

function formatSize(bytes) {
  if (bytes == null) return ''
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  if (bytes < 1024 * 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + ' MB'
  return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB'
}

onMounted(() => {
  loadTree()
  document.addEventListener('click', closeCtx)
})
</script>

<style scoped>
.resource-page { padding: 8px; height: calc(100vh - 160px); }
.resource-layout { display: flex; gap: 12px; height: 100%; }
.tree-panel { width: 320px; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,.05); display: flex; flex-direction: column; overflow: hidden; position: relative; }
.tree-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; border-bottom: 1px solid #f0f2f5; }
.tree-title { font-weight: 600; font-size: 15px; color: #1f2d3d; }
.tree-actions { display: flex; gap: 6px; }
.file-tree { flex: 1; overflow: auto; padding: 8px; }
.tree-node { display: inline-flex; align-items: center; gap: 5px; font-size: 13px; }
.tree-node .node-icon { font-size: 15px; }
.tree-node .node-size { color: #a0a7b5; font-size: 11px; margin-left: 4px; }
.preview-panel { flex: 1; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,.05); display: flex; flex-direction: column; overflow: hidden; }
.preview-header { display: flex; align-items: center; gap: 10px; padding: 10px 16px; border-bottom: 1px solid #f0f2f5; }
.preview-name { font-weight: 600; font-size: 14px; }
.preview-path { color: #a0a7b5; font-size: 12px; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.preview-body { flex: 1; overflow: auto; padding: 16px; }
.preview-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #b0b7c3; }
.preview-empty .empty-icon { font-size: 52px; margin-bottom: 10px; }
.text-view { background: #f8fafc; border: 1px solid #eef1f6; border-radius: 6px; padding: 16px; font-size: 13px; line-height: 1.7; font-family: Consolas, Menlo, monospace; white-space: pre-wrap; word-break: break-all; margin: 0; }
.image-view { display: flex; justify-content: center; }
.image-view img { max-width: 100%; max-height: 70vh; border-radius: 4px; }
.pdf-view { width: 100%; height: calc(100vh - 280px); border: none; border-radius: 4px; }
.ctx-menu { position: fixed; z-index: 3000; background: #fff; border-radius: 6px; box-shadow: 0 4px 16px rgba(0,0,0,.15); padding: 5px 0; min-width: 150px; }
.ctx-item { display: flex; align-items: center; gap: 8px; padding: 8px 14px; font-size: 13px; cursor: pointer; color: #333; }
.ctx-item:hover { background: #f0f4fb; }
.ctx-item.danger { color: #f56c6c; }
.ctx-item.danger:hover { background: #fef0f0; }
</style>
