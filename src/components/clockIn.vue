<template>

    <div style="padding: 30px 0;">
        <el-calendar v-model="value" @click="onSubmit()"/>

        <div style="padding: 50px 0;">
        请选择年级
            <el-select v-model="grade" class="m-2" placeholder="Select" size="large">
                <el-option
                v-for="item in grades"
                :key="item.value"
                :label="item.label"
                :value="item.value"
                />
            </el-select>
            <el-button type="primary" @click="onSubmit">查询</el-button>
    </div>

    <div>
        <el-table :data="attendances" style="width: 100%" stripe="true" :empty-text="tableEmptyText" v-loading="loading">
            <el-table-column label="队员列表" >
                <el-table-column prop="username" label="队员姓名" width="380" />
                <el-table-column prop="startTime" label="训练开始打卡时间" width="400"/>
                <el-table-column prop="endTime" label="训练结束打卡时间" />
                <el-table-column prop="status" label="考勤情况" />
            </el-table-column>
        </el-table>
    </div>

    </div>


</template>
    
<script>
    import {getAttendance} from "../api/attendance";
    
    export default {
      data: function() {
        return{
            value: new Date(),
            grade: null,
            grades:[
                {
                value: '全部',
                label: '',
                },
                {
                value: '2019',
                label: '2019',
                },
                {
                    value: '2020',
                    label: '2020',
                },
                {
                    value: '2021',
                    label: '2021',
                },
                {
                    value: '2022',
                    label: '2022',
                },
            ],
            attendances: '',
        }
      },
    
      components: {

      },
    
      methods: {
        
        onSubmit() {
            getAttendance(this.value, this.grade).then((res) => {
                this.attendances = res.data.data;
                console.log(res);

            })
            .catch((err) => {
                ElMessage.error('请求超时，请重试！');
                console.log(err)
            })

        },

      },
    
      created: function()  {

        this.onSubmit();
       
      }
    
    }
    
    </script>