<template>
  <div class="center-page">
    <div class="page-card">
      <div class="center-head">
        <h2 class="page-title">我的信息</h2>
        <el-button v-if="check" type="primary" plain @click="check = false">编 辑</el-button>
        <el-button v-else type="primary" @click="onSubmit">保 存</el-button>
      </div>
      <el-descriptions :column="2" border v-if="check">
        <el-descriptions-item label="姓名">{{ user.username }}</el-descriptions-item>
        <el-descriptions-item label="学号">{{ user.studentNum }}</el-descriptions-item>
        <el-descriptions-item label="姓名拼音">{{ user.pyName }}</el-descriptions-item>
        <el-descriptions-item label="年级">{{ user.grade }}</el-descriptions-item>
        <el-descriptions-item label="洛谷id">{{ user.lgid || '-' }}</el-descriptions-item>
        <el-descriptions-item label="VJ用户名">{{ user.vjName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="CF用户名">{{ user.handle || '-' }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ user.email || '-' }}</el-descriptions-item>
        <el-descriptions-item label="电话">{{ user.phone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ user.createTime }}</el-descriptions-item>
      </el-descriptions>
      <el-form v-else :model="user" label-width="120px" class="edit-form">
        <el-form-item label="姓名"><el-input v-model="user.username" /></el-form-item>
        <el-form-item label="学号"><el-input v-model="user.studentNum" /></el-form-item>
        <el-form-item label="姓名拼音"><el-input v-model="user.pyName" placeholder="全部小写" /></el-form-item>
        <el-form-item label="邮箱"><el-input v-model="user.email" /></el-form-item>
        <el-form-item label="电话"><el-input v-model="user.phone" /></el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">保存修改</el-button>
          <el-button @click="check = true">取消</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import api from '../api'

const store = useStore()
const user = ref({})
const check = ref(true)

function onSubmit() {
  check.value = true
  api.updateUserDetail(user.value).then(e => {
    if (e.data.code == 200) ElMessage.success('保存成功')
  }).catch(e => {})
}

onMounted(() => {
  api.getUserDetail({ uid: store.state.uid }).then(e => {
    console.log(e)
    user.value = e.data.data
  }).catch(e => {})
})
</script>

<style scoped>
.center-head { display: flex; align-items: center; justify-content: space-between; }
.edit-form :deep(.el-form-item__label) { font-weight: 600; color: var(--text-secondary); }
</style>
