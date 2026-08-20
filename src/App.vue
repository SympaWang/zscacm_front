<template>
  <div class="common-layout">
    <el-container>
      <el-header class="app-header" height="56px">
        <div class="header-inner">
          <div class="brand" @click="$router.push('/')">
            <img src="/static/zscacm.png" class="brand-logo" alt="ZSCACM" />
            <span class="brand-name">ZSCACM 集训队</span>
          </div>
          <el-menu
            :default-active="activeIndex2"
            class="el-menu-demo"
            mode="horizontal"
            background-color="transparent"
            text-color="#c0c4cc"
            active-text-color="#ffd04b"
            router
            :ellipsis="false"
          >
            <el-sub-menu index="/dashboard">
              <template #title>首页</template>
              <el-menu-item index="/dashboard/index">首页</el-menu-item>
              <el-menu-item v-if="store.state.login == 1" index="/center/home">个人首页</el-menu-item>
              <el-menu-item v-if="store.state.login == 1 && store.state.userType <= 1" index="/rating/user?viewHome=1">查看某队员首页</el-menu-item>
            </el-sub-menu>
            <el-menu-item index="/about">关于集训队</el-menu-item>
            <el-sub-menu index="/problems">
              <template #title>题目检索</template>
              <el-menu-item index="/problems">CF 题目检索</el-menu-item>
              <el-menu-item index="/problems/acwing">AcWing 题目检索</el-menu-item>
            </el-sub-menu>
            <el-menu-item index="/solve">做题统计</el-menu-item>
            <el-sub-menu index="/rating">
              <template #title>队员比赛信息</template>
              <el-menu-item index="/rating/user">查看某个队员</el-menu-item>
              <el-menu-item index="/rating/contest">查看某场比赛</el-menu-item>
            </el-sub-menu>
            <el-menu-item index="/discuss">讨论区</el-menu-item>
            <el-menu-item index="/rankland">大赛榜单</el-menu-item>
            <el-sub-menu v-if="store.state.login == 1 && store.state.userType <= 1" index="/manage" class="nav-right">
              <template #title>系统管理</template>
              <el-menu-item index="/manage/user">系统用户管理</el-menu-item>
              <el-menu-item index="/manage/log">登录记录</el-menu-item>
              <el-menu-item index="/manage/discuss">帖子管理</el-menu-item>
            </el-sub-menu>
            <el-menu-item v-if="store.state.login == 0" index="/login" class="nav-right">登录</el-menu-item>
            <el-sub-menu v-if="store.state.login == 1" index="/user" class="nav-right">
              <template #title>Hi, {{ store.state.username }}</template>
              <el-menu-item index="/center/center">个人中心</el-menu-item>
              <el-menu-item index="/center/changePassword">修改密码</el-menu-item>
              <el-menu-item index="/center/message">我的消息</el-menu-item>
              <el-menu-item index="/" @click="onLogout">退出登录</el-menu-item>
            </el-sub-menu>
            <el-menu-item v-if="store.state.login == 1" index="/feedback" class="nav-right">意见反馈</el-menu-item>
          </el-menu>
        </div>
      </el-header>

      <el-main class="app-main">
        <router-view v-slot="{ Component }">
          <keep-alive :include="['problems']">
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </el-main>

      <el-footer class="app-footer" height="60px">
        <div class="footer-inner">
          <div class="footer-links">
            友情链接：
            <a href="https://codeforces.com" target="_blank">Codeforces</a>
            <span class="link-sep">·</span>
            <a href="https://www.luogu.com.cn" target="_blank">洛谷</a>
            <span class="link-sep">·</span>
            <a href="https://vjudge.csgrandeur.cn" target="_blank">VJudge</a>
          </div>
          <div class="footer-copy">此网站供电子科技大学中山学院 ACM 集训队使用</div>
        </div>
      </el-footer>
    </el-container>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import { ElNotification } from 'element-plus'
import api from './api'

const store = useStore()
const route = useRoute()
const router = useRouter()

const activeIndex2 = computed(() => route.path)

// 洛谷做题记录未公开提示(悬浮,登录/刷新后检测)
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

onMounted(() => {
  // 已登录且洛谷隐私未公开时提示
  if (store.state.login == 1 && store.state.lgPrivacy === 1) {
    showLgPrivacyTip()
  }
})

function onLogout() {
  api.logout().then(() => {
    localStorage.removeItem('userToken')
    localStorage.removeItem('userUid')
    localStorage.removeItem('userName')
    localStorage.removeItem('userType')
    localStorage.removeItem('userLgPrivacy')
    store.commit('setLogin', 0)
    store.commit('setUsername', '')
    store.commit('setUserType', 2)
    store.commit('setLgPrivacy', 0)
    router.push('/dashboard/index')
  }).catch(a => {
    console.log(a)
  })
}
</script>

<style scoped>
.common-layout { min-height: 100vh; display: flex; flex-direction: column; }
.common-layout :deep(.el-container) { flex: 1; }

.app-header {
  background: linear-gradient(90deg, #1f2d3d 0%, #2b3d52 100%);
  padding: 0 32px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
.header-inner {
  max-width: 1400px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  gap: 32px;
}
.brand { display: flex; align-items: center; gap: 10px; cursor: pointer; flex-shrink: 0; }
.brand-logo { width: 34px; height: 34px; border-radius: 6px; }
.brand-name { color: #fff; font-size: 18px; font-weight: 700; letter-spacing: 1px; }

.app-header :deep(.el-menu) {
  border-bottom: none;
  flex: 1;
  background: transparent;
}
/* 右侧菜单项(系统管理/登录/用户/意见反馈)靠右对齐,仅第一个吸收剩余空间 */
.app-header :deep(.el-menu .nav-right) { margin-left: auto; }
.app-header :deep(.el-menu .nav-right ~ .nav-right) { margin-left: 0; }
.app-header :deep(.el-menu-item),
.app-header :deep(.el-sub-menu__title) {
  color: #c0c4cc;
  font-size: 14px;
  border-bottom: none !important;
  height: 56px;
  line-height: 56px;
}
.app-header :deep(.el-menu-item:hover),
.app-header :deep(.el-sub-menu__title:hover) {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}
.app-header :deep(.el-menu-item.is-active) {
  color: var(--nav-active);
  border-bottom: 2px solid var(--nav-active) !important;
  background: transparent;
}

.app-main {
  background: var(--bg);
  padding: 20px 32px 40px;
  flex: 1;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
}

.app-footer {
  background: var(--nav-bg);
  padding: 0;
}
.footer-inner {
  max-width: 1400px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  flex-wrap: wrap;
  gap: 8px;
}
.footer-links { color: #c0c4cc; font-size: 13px; }
.footer-links a { color: #a3b3c7; }
.footer-links a:hover { color: var(--nav-active); text-decoration: none; }
.link-sep { margin: 0 6px; color: #5a6b80; }
.footer-copy { color: #8a97a8; font-size: 13px; }
</style>
