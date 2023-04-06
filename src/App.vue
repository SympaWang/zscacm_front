<script>
// 引入
import Prism from "prismjs"; // 引入插件
import 'prismjs/themes/prism.css'; // 引入样式

export default {
  mounted() {
    // 使用this.$store.state.XXX可以直接访问到仓库中的状态
    //console.log(this.$store.state.name);
  },
};
</script>


<template>
  <!-- 路由出口 -->
  <!-- 路由匹配到的组件将渲染在这里 -->
  <router-view></router-view>
</template>

<style  type="text/css">
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}

html,body,#app{
  margin: 0;
  padding: 0;
  height:100%;
  width: 100%;
  max-width: 100%;
}


</style>
