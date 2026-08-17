<template>
  <div class="auth-page">
    <div class="auth-card auth-card-sm">
      <div class="auth-brand">
        <h1 class="auth-title">修改密码</h1>
        <p class="auth-sub">修改后需重新登录</p>
      </div>
      <div class="auth-error" v-if="info">{{ info }}</div>
      <el-form :model="form" label-position="top" class="auth-form" @keyup.enter="onSubmit">
        <el-form-item label="原密码">
          <el-input v-model="form.oldPassword" size="large" type="password" show-password placeholder="请输入原密码" :prefix-icon="Lock" />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input v-model="form.newPassword" size="large" type="password" show-password placeholder="请输入新密码" :prefix-icon="Key" />
        </el-form-item>
        <el-form-item label="重复输入新密码">
          <el-input v-model="checkPassword" size="large" type="password" show-password placeholder="请再次输入新密码" :prefix-icon="Key" />
        </el-form-item>
        <el-button type="primary" size="large" class="auth-submit" @click="onSubmit" :loading="loading">确 定</el-button>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import { Lock, Key } from '@element-plus/icons-vue'
import api from '../api'

const router = useRouter()
const store = useStore()
const form = reactive({ oldPassword: '', newPassword: '' })
const checkPassword = ref('')
const info = ref('')
const loading = ref(false)

function onSubmit() {
  if (form.newPassword !== checkPassword.value) {
    info.value = '两次密码输入不一致!'
    return
  }
  loading.value = true
  api.changePassword({ uid: store.state.uid, oldPassword: form.oldPassword, newPassword: form.newPassword })
    .then(o => {
      loading.value = false
      info.value = ''
      if (o.data.code != 200) {
        info.value = '原密码错误!'
      } else {
        ElMessage.success('密码修改成功,请重新登录')
        localStorage.removeItem('userToken')
        store.commit('setLogin', 0)
        store.commit('setUsername', '')
        store.commit('setUserType', 2)
        router.push('/login')
      }
    }).catch(o => {
      loading.value = false
      ElMessage.error('请求超时,请重试!')
      console.log(o)
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
  width: 460px;
  max-width: 100%;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(31, 45, 61, 0.14);
  padding: 36px 40px 28px;
}
.auth-brand { text-align: center; margin-bottom: 20px; }
.auth-title { font-size: 24px; margin: 0 0 6px; color: var(--text-main); }
.auth-sub { margin: 0; font-size: 13px; color: var(--text-muted); }
.auth-form :deep(.el-form-item__label) { font-weight: 600; color: var(--text-secondary); }
.auth-error { color: #f56c6c; font-size: 13px; margin-bottom: 12px; text-align: center; }
.auth-submit { width: 100%; font-size: 16px; letter-spacing: 6px; margin-top: 4px; }
</style>
