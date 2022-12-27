<template>
  <div class="common-layout">
    <el-container>
      <el-header>
        <el-menu
          :default-active="activeIndex2"
          class="el-menu-demo"
          mode="horizontal"
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#ffd04b"
          @select="handleSelect"
        >
          <el-menu-item index="1">首页</el-menu-item> 
          <el-sub-menu index="2">
            <template #title>Workspace</template>
            <el-menu-item index="2-1">item one</el-menu-item>
            <el-menu-item index="2-2">item two</el-menu-item>
            <el-menu-item index="2-3">item three</el-menu-item>
          </el-sub-menu>
          <el-menu-item index="3" disabled>Info</el-menu-item>
          <el-menu-item index="4">Orders</el-menu-item>
        </el-menu>
      </el-header>
      <el-main>
        <el-table :data="tableData" style="width: 100%">
        <el-table-column type="index" label="编号" :index="indexMethod"  width="180" />
        <el-table-column prop="name" label="比赛名" width="400" />
        <el-table-column prop="begin_time" label="开始时间" width="180" />
        <el-table-column prop="length" label="长度" width="180"/>
        <el-table-column prop="address" label="距离报名时间" width="180"/>
        <el-table-column prop="address1" label="距离开始时间" />

  </el-table>
      </el-main>
      <el-footer>Footer</el-footer>
    </el-container>
  </div>
</template>
  
<script lang="ts" setup>
import { ref } from "vue";
const activeIndex2 = ref("1");
const handleSelect = (key: string, keyPath: string[]) => {
  console.log(key, keyPath);
};
const indexMethod = (index: number) => {
  return index
}
const tableData = [

]
</script>

<style scoped>
  .el-menu-item{
    padding: 0 20px;
  }

  .common-layout{
   max-width: 70%;
   margin: 0 15%;
  }

</style>