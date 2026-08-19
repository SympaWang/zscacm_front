<template>
  <div class="message-page">
    <div class="page-card">
      <h2 class="page-title">我的消息</h2>
      <div v-if="messageList && messageList.length" class="msg-list" v-loading="loading">
        <div v-for="item in messageList" :key="item.id" class="msg-item">
          <el-avatar :size="40" class="msg-avatar">{{ (item.username || '?').charAt(0) }}</el-avatar>
          <div class="msg-body">
            <div class="msg-text">
              <span class="msg-name">{{ item.username }}</span>
              <span class="msg-context">{{ item.context }}</span>
            </div>
            <div class="msg-foot">
              <span class="msg-time">{{ item.createTime }}</span>
              <el-link type="primary" :underline="'never'" @click="openDiscuss(item)">查看帖子</el-link>
            </div>
          </div>
        </div>
      </div>
      <el-empty v-else-if="!loading" description="暂无消息" />
      <div class="example-pagination-block" v-if="messageList && messageList.length">
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
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import api from '../api'

const store = useStore()
const router = useRouter()
const messageList = ref(null)
const pageCount = ref(1)
const currentPage = ref(1)
const tableEmptyText = ref('没有消息')
const loading = ref(false)
const total = ref(0)

function openDiscuss(row) {
  store.commit('setDiscuss', JSON.stringify({ discussId: row.targetId, title: row.context }))
  router.push('/discuss/detail')
}

function handleCurrentChange(e) { currentPage.value = e }

function onSubmit() {
  loading.value = true
  api.getMessage({ userId: store.state.uid, currentPage: currentPage.value - 1 }).then(e => {
    console.log(e)
    messageList.value = e.data.data
    loading.value = false
  }).catch(e => {
    messageList.value = null
    console.log(e)
    ElMessage.error('请求超时，请重试！')
    loading.value = false
  })
}

onMounted(() => { onSubmit() })
</script>

<style scoped>
.msg-list { max-width: 860px; }
.msg-item {
  display: flex;
  gap: 14px;
  padding: 16px 0;
  border-bottom: 1px dashed #f0f0f0;
}
.msg-avatar { flex-shrink: 0; background: var(--primary); color: #fff; }
.msg-body { flex: 1; }
.msg-text { font-size: 14px; line-height: 1.6; }
.msg-name { font-weight: 600; margin-right: 6px; }
.msg-context { color: var(--text-secondary); }
.msg-foot { margin-top: 8px; display: flex; justify-content: space-between; align-items: center; }
.msg-time { font-size: 12px; color: var(--text-muted); }
</style>
