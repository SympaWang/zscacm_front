<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-brand">
        <img src="/static/zscacm.png" class="auth-logo" alt="ZSCACM" />
        <h1 class="auth-title">ZSCACM 集训队</h1>
        <p class="auth-sub">电子科技大学中山学院 ACM 集训队</p>
      </div>
      <el-form :model="form" label-position="top" class="auth-form" @keyup.enter="onSubmit">
        <el-form-item label="学号">
          <el-input v-model="form.name" size="large" placeholder="请输入学号" :prefix-icon="User" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" size="large" type="password" show-password placeholder="请输入密码" :prefix-icon="Lock" />
        </el-form-item>
        <div class="auth-error" v-if="info">{{ info }}</div>
        <el-button type="primary" size="large" class="auth-submit" @click="onSubmit" :loading="loading">登 录</el-button>
        <div class="auth-footer">
          <el-link type="primary" :underline="'never'" @click="forgetPassword">忘记密码?</el-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage, ElNotification } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import api from '../api'

const router = useRouter()
const store = useStore()

const form = reactive({ name: '', password: '' })
const info = ref('')
const loading = ref(false)

function forgetPassword() {
  router.push('/forgetPassword')
}

// 洛谷做题记录未公开提示(悬浮提示,引导用户调整隐私设置)
function showLgPrivacyTip() {
  ElNotification({
    title: '洛谷做题记录未公开',
    message: '检测到你的洛谷做题记录未公开,平台无法统计你的洛谷做题数据。' +
      '请在洛谷「个人设置 → 账号安全与隐私」中开启"公开我的做题记录",调整后重新登录即可正常统计。',
    type: 'warning',
    duration: 0,
    position: 'top-right',
    offset: 80
  })
}

function onSubmit() {
  if (!form.name || !form.password) {
    info.value = '请输入学号和密码'
    return
  }
  loading.value = true
  api.login({ username: form.name, password: form.password }).then(res => {
    loading.value = false
    const data = res.data
    if (data.code !== 200 || data.data.token == null) {
      info.value = '学号或密码错误!'
    } else {
      localStorage.setItem('userToken', data.data.token)
      localStorage.setItem('userUid', data.data.uid)
      localStorage.setItem('userName', data.data.username)
      localStorage.setItem('userType', data.data.userType)
      localStorage.setItem('userLgPrivacy', data.data.lgPrivacy !== undefined ? data.data.lgPrivacy : 0)
      store.commit('setLogin', 1)
      store.commit('setUid', data.data.uid)
      store.commit('setUsername', data.data.username)
      store.commit('setUserType', data.data.userType)
      store.commit('setLgPrivacy', data.data.lgPrivacy !== undefined ? data.data.lgPrivacy : 0)
      ElMessage.success('登录成功')
      // 洛谷做题记录未公开时提示用户调整隐私设置
      if (data.data.lgPrivacy === 1) {
        showLgPrivacyTip()
      }
      // 普通队员登录后默认进入个人首页,其他账号进入平台首页
      if (data.data.userType === 2) {
        router.push('/center/home')
      } else {
        router.push('/dashboard/index')
      }
    }
  }).catch(() => {
    loading.value = false
    ElMessage.error('请求超时,请重试')
  })
}
</script>

<style scoped>
.auth-page {
  min-height: calc(100vh - 116px);
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(1200px 500px at 20% -10%, rgba(64, 158, 255, 0.18), transparent),
    radial-gradient(1000px 400px at 90% 110%, rgba(255, 208, 75, 0.12), transparent),
    linear-gradient(160deg, #eef3fa 0%, #e8eef7 100%);
  padding: 40px 16px;
}
.auth-card {
  width: 420px;
  max-width: 100%;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(31, 45, 61, 0.14);
  padding: 40px 40px 32px;
}
.auth-brand { text-align: center; margin-bottom: 28px; }
.auth-logo { width: 64px; height: 64px; border-radius: 14px; }
.auth-title { font-size: 24px; margin: 14px 0 4px; color: var(--text-main); }
.auth-sub { margin: 0; font-size: 13px; color: var(--text-muted); }
.auth-form :deep(.el-form-item__label) { font-weight: 600; color: var(--text-secondary); }
.auth-error { color: #f56c6c; font-size: 13px; margin-bottom: 12px; text-align: center; }
.auth-submit {
  width: 100%;
  font-size: 16px;
  letter-spacing: 6px;
  margin-top: 4px;
}
.auth-footer { text-align: center; margin-top: 16px; }
</style>
