<template>
    <div style="padding: 50px 0;">
        <div>
        <table align="center" class="neauacm_logo" style="padding: 10px 0 30px 0;">
            <tbody><tr>
                <td>
                  <el-image style="width: 200px; height: 200px" :src='iconUrl'/>
                </td>
                <td width="5%"></td>
                <td>
                    <h2>电子科技大学中山学院ACM集训队</h2>
                </td>
            </tr>
        </tbody></table>
      </div>
        <el-table :data="contests" style="width: 100%">
            <el-table-column label="未来的比赛" >
                <el-table-column prop="id" label="编号" width="180" />
                <el-table-column prop="name" label="比赛名" width="500" />
                <el-table-column prop="beginTime" label="开始时间" width="250" />
                <el-table-column prop="durationSeconds" label="比赛时长" width="180"/>
                <el-table-column prop="relativeTime" label="距离开始时间" />
            </el-table-column>
        </el-table>
      </div>

      <div style="padding: 50px 0; width: 100%">
        <div style="padding: 10px 0;">
        请选择年级
        <el-select v-model="grade" class="m-2" placeholder="Select" size="large">
            <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
            />
    </el-select>
    <el-button type="primary" @click="getUser">查询</el-button>

    </div>
        <el-table :data="users" style="width: 100%" @sort-change="sortChange">
            <el-table-column label="队员信息" >
                <el-table-column prop="name" label="姓名" width="200" />
                <el-table-column prop="grade" label="年级" width="150" sortable="custom"/>
                <el-table-column prop="rating" label="当前cf分数" width="250" sortable="custom">
                  <template v-slot="scope">
                        <div :style="rankStyle(scope.row.rating)">
                        {{scope.row.rating}}
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="maxRating" label="最高cf分数" width="250" sortable="custom">
                  <template v-slot="scope">
                        <div :style="rankStyle(scope.row.maxRating)">
                        {{scope.row.maxRating}}
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="contestNum" label="cf参赛场数" width="250" sortable="custom"/>
                <el-table-column prop="solved" label="总题数(cf+洛谷+VJ)" sortable="custom"/>
            </el-table-column>
        </el-table>
      </div>
      
</template>


<script>
import { getFutureContests, getUsers } from "../api/index";
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { changeColorByRating } from "../api/changeColor";

export default {
  data: function() {
    return{
      iconUrl: '/static/zscacm.png',
      contests: null,
      users: null,
      loading: 0,
      grade: null,
      options:[
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
    }
  },

  methods: {

    formatSeconds(value) {
      //  秒
      let second = parseInt(value)
      //  分
      let minute = 0
      //  小时
      let hour = 0
      //  天
      let day = 0
      //  如果秒数大于60，将秒数转换成整数
      if (second > 60) {
        //  获取分钟，除以60取整数，得到整数分钟
        minute = parseInt(second / 60)
        //  获取秒数，秒数取佘，得到整数秒数
        second = parseInt(second % 60)
        //  如果分钟大于60，将分钟转换成小时
        if (minute > 60) {
          //  获取小时，获取分钟除以60，得到整数小时
          hour = parseInt(minute / 60)
          //  获取小时后取佘的分，获取分钟除以60取佘的分
          minute = parseInt(minute % 60)
          //  如果小时大于24，将小时转换成天
           if (hour > 23) {
             //  获取天数，获取小时除以24，得到整天数
             day = parseInt(hour / 24)
             //  获取天数后取余的小时，获取小时除以24取余的小时
             hour = parseInt(hour % 24)
           }
        }
      }

      let result = '' + parseInt(second) + '秒'
      if (minute > 0) {
        result = '' + parseInt(minute) + '分' + result
      }
      if (hour > 0) {
        result = '' + parseInt(hour) + '小时' + result
      }
       if (day > 0) {
         result = '' + parseInt(day) + '天' + result
       }
      console.log('result：', result)
      return result
    },

    rankStyle(rank) {
        return changeColorByRating(rank);
    },

    getUser() {
      getUsers(this.grade).then((res) => {
      console.log(res)
        this.users = res.data.data
        this.users.forEach(user => {

        });
      })
      .catch((err) => {
        ElMessage.error('请求超时，请重试！');
        console.log(err)
      })
    },

    	// 排序
      sortChange({ prop, order }){
      this.users.sort(this.compare(prop, order));
    },

	/**
     * 排序比较
     * @param {string} propertyName 排序的属性名
     * @param {string} sort ascending(升序)/descending(降序)
     * @return {function}
     */
    compare(propertyName, sort) {
    	// 判断是否为数字
        function isNumberV(val) {
            var regPos = /^\d+(\.\d+)?$/; //非负浮点数
            var regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/; //负浮点数
            if (regPos.test(val) || regNeg.test(val)) {
                return true;
            } else {
                return false;
            }
        }
        
        return function (obj1, obj2) {
            let value1 = obj1[propertyName];
            let value2 = obj2[propertyName];
            // 数字类型的比较
            if(isNumberV(value1) || isNumberV(value2)){
                if (sort === "ascending") {
                    return value1 - value2;
                } else {
                    return value2 - value1;
                }
            }
            // 布尔值的比较：利用减法-转化true 和 false
            // true => 1   false ⇒ 0
            // true-false => 1  false-true => -1
            // 下面方法是按照先false后true的顺序排序，如果想先true后false，调整value1-value2 和  value2 - value1的顺序即可
            else if(_.isBoolean(value1) && _.isBoolean(value2)){
                if (sort === "ascending") {
                    return value1 - value2;
                } else {
                    return value2 - value1;
                }
            }
            // 字符比较使用localeCompare()
            else {
                const res = value1.localeCompare(value2, "zh");
                return sort === "ascending" ? res : -res;
            }
        };
    }



  },

  created: function()  {
    this.loading = ref(true);
    getFutureContests().then((res) => {
      console.log(res)
      this.contests = res.data
      this.contests.forEach(contest => {
          contest.relativeTime = this.formatSeconds(-contest.relativeTime);
          contest.durationSeconds = this.formatSeconds(contest.durationSeconds);
      });
      this.loading = 0;
    })
    .catch((err) => {
      ElMessage.error('请求超时，请重试！');
      console.log(err)
    })

    this.getUser();

  }

}

</script>