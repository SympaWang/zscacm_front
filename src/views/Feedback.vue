<template>
  <div class="feedback-page">
    <div class="page-card">
      <h2 class="page-title">意见反馈</h2>
      <el-form :model="form" label-width="80px">
        <el-form-item label="主题">
          <el-input v-model="form.title" maxlength="50" show-word-limit placeholder="请输入反馈主题(选填)" />
        </el-form-item>
        <el-form-item label="内容">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="10"
            maxlength="2000"
            show-word-limit
            placeholder="请输入您的意见、建议或遇到的问题..."
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" @click="submit" :loading="sending">
            <el-icon style="margin-right: 6px"><Promotion /></el-icon>发 送
          </el-button>
        </el-form-item>
      </el-form>
      <p class="tip">反馈将发送到管理员邮箱,感谢您的支持!</p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import { Promotion } from '@element-plus/icons-vue'
import api from '../api'

const store = useStore()
const form = reactive({ title: '', content: '' })
const sending = ref(false)

function submit() {
  if (!form.content || !form.content.trim()) {
    ElMessage.warning('请输入反馈内容')
    return
  }
  sending.value = true
  api.submitFeedback({
    title: form.title.trim() || '意见反馈',
    content: form.content.trim(),
    username: store.state.username || ''
  }).then(res => {
    sending.value = false
    if (res.data.code == 200) {
      ElMessage.success('发送成功,感谢反馈!')
      form.title = ''
      form.content = ''
    } else {
      ElMessage.error('发送失败:' + (res.data.msg || ''))
    }
  }).catch(() => {
    sending.value = false
    ElMessage.error('请求失败,请重试')
  })
}
</script>

<style scoped>
.feedback-page { max-width: 860px; }
.tip { color: var(--text-muted); font-size: 13px; margin-top: 4px; }
</style>
