<template>
  <div class="common-layout">
    <el-container>
      <el-header style="background-color: #545c64;">
        <el-menu
          :default-active="activeIndex2"
          class="el-menu-demo"
          mode="horizontal"
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#ffd04b"
          router
        >
          <el-menu-item index="/">首页</el-menu-item> 
          <el-menu-item index="/about">关于集训队</el-menu-item>
          <el-menu-item index="/problems">Codeforces题目检索</el-menu-item>
          <el-sub-menu index="/ac" v-if="this.$store.state.login==1">
            <template #title>题数统计</template>
            <el-menu-item index="/ac/cf">Codeforces</el-menu-item>
            <el-menu-item index="/ac/vj">virtual judge</el-menu-item>
            <el-menu-item index="/ac/luogu">洛谷</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="/rating" v-if="this.$store.state.login==1">
            <template #title>队员比赛信息</template>
            <el-menu-item index="/rating/user">查看某个队员</el-menu-item>
            <el-menu-item index="/rating/contest">查看某场比赛</el-menu-item>
          </el-sub-menu>
          <el-menu-item index="/discuss">讨论区</el-menu-item>
          <el-menu-item index="/clockIn">考勤信息</el-menu-item>
          <el-sub-menu index="/manage" v-if="this.$store.state.userType<=1">
            <template #title>系统管理</template>
            <el-menu-item index="/manage/user">系统用户管理</el-menu-item>
            <el-menu-item index="/manage/discuss">帖子管理</el-menu-item>
          </el-sub-menu>


          <div class="flex-grow" />
          <el-menu-item index="/login" v-if="this.$store.state.login==0">登录</el-menu-item>
          <el-sub-menu index="/user" v-if="this.$store.state.login==1">
            <template #title>Hi, {{this.$store.state.username}}</template>
            <el-menu-item index="/center/center">个人中心</el-menu-item>
            <el-menu-item index="/ap">修改密码</el-menu-item>
            <el-menu-item index="/center/message">我的消息</el-menu-item>
            <el-menu-item index="/" @click="onLogout">退出登录</el-menu-item>
          </el-sub-menu>
          <el-menu-item index="/c">意见反馈</el-menu-item>
        </el-menu>
      </el-header>

      <el-main style="background-color: #eee;padding: 0 20px;">
        <keep-alive :include="['problems']">
          <router-view></router-view>
        </keep-alive>
      </el-main>

      <el-footer style="background-color: #545c64; font-size: 90%;">
        <div style="color:white; margin: 3px 0;">
            友情链接：<a href="https://codeforces.com" target= '_blank'>codeforces</a> <a href="https://www.luogu.com.cn" target= '_blank'>洛谷</a>  <a href="https://vjudge.csgrandeur.cn" target= '_blank'>vjudge</a>
        </div>
        <div style="color:white;">
          此网站供电子科技大学中山学院ACM集训队使用
        </div>
      </el-footer>
    </el-container>
  </div>
</template>
  
<script>
import { ref } from "vue";
import { logout } from "../api/logout";

const activeIndex2 = ref("1");


export default {

  data: function() {
      return{
      }

  },

  methods: {
      onLogout() {
          
          logout().then((res) => {
              localStorage.removeItem('userToken');
              this.$store.commit('setLogin', 0);
              this.$store.commit('setUsername', '');
              this.$store.commit('setUserType', 2);

              window.location.replace("http://localhost:5173");

          })
          .catch((err) => {
              console.log(err)
          })

      }
  },


}




</script>

<style scoped>
  .el-menu-item{
    padding: 0 20px;
  }

  .common-layout{
   max-width: 70%;
   margin: 0 15%;
  }

  .flex-grow {
  flex-grow: 1;
}
  a {
        text-decoration: none;
      }
      a:link{color: white;}
      a:visited{color: white;}
      a:hover{color: white; text-decoration:underline;}
      a:active{color: white;}

</style>