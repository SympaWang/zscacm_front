<template>
  <div class="detail-page">
    <div class="page-card post-card">
      <h1 class="post-title">{{ row.title }}</h1>
      <div class="post-meta">
        <el-avatar :size="32" class="post-avatar">{{ (row.username || '?').charAt(0) }}</el-avatar>
        <span class="post-author">{{ row.username }}</span>
        <span class="post-time">发布于 {{ row.createTime }}</span>
      </div>
      <div class="post-content editor-content-view" v-html="row.context"></div>
    </div>

    <div class="page-card">
      <h2 class="page-title">评论</h2>
      <Reply :row="row" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useStore } from 'vuex'
import Reply from '../components/Reply.vue'

const store = useStore()
const row = ref({})

onMounted(() => {
  row.value = JSON.parse(store.state.discuss || '{}')
  console.log(row.value)
  // 代码高亮(prismjs 动态加载,还原自原版)
  const scripts = [
    'https://unpkg.com/prismjs@latest/components/prism-java.js',
    'https://unpkg.com/prismjs@latest/components/prism-core.js',
    'https://unpkg.com/prismjs@latest/components/prism-c.js',
    'https://unpkg.com/prismjs@latest/components/prism-cpp.js',
    'https://unpkg.com/prismjs@latest/components/prism-python.js',
    'https://unpkg.com/prismjs@latest/prism.js',
    'https://unpkg.com/prismjs@latest/plugins/autoloader/prism-autoloader.js'
  ]
  scripts.forEach(src => {
    const t = document.createElement('script')
    t.type = 'text/javascript'
    t.src = src
    document.body.appendChild(t)
  })
  setTimeout(() => {
    if (window.Prism) Prism.highlightAll()
  }, 1000)
})
</script>

<style scoped>
.post-title { font-size: 24px; margin: 0 0 14px; color: var(--text-main); line-height: 1.4; }
.post-meta { display: flex; align-items: center; gap: 10px; padding-bottom: 14px; border-bottom: 1px solid #f0f0f0; margin-bottom: 18px; }
.post-avatar { background: var(--primary); color: #fff; font-weight: 600; }
.post-author { font-weight: 600; color: var(--text-secondary); }
.post-time { color: var(--text-muted); font-size: 13px; }
.post-content { line-height: 1.9; font-size: 15px; word-break: break-word; }
.post-content :deep(pre) { background: #282c34; color: #abb2bf; padding: 14px; border-radius: 8px; overflow-x: auto; }
.post-content :deep(code) { background: #f0f2f5; padding: 2px 5px; border-radius: 4px; font-family: Consolas, monospace; }
.post-content :deep(pre code) { background: transparent; padding: 0; }
</style>
