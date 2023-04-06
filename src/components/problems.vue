<template>
    <div style="padding: 50px 0;">
        <el-form :model="form" label-width="120px">

        <el-form-item value="problemName" label="问题名称">
            <el-input v-model="form.problemName" />
        </el-form-item>

        <el-form-item value="problemId" label="问题编号">
            <el-input v-model="form.problemIds" />
        </el-form-item>

        <el-form-item label="仅显示未通过">
            <el-select v-model="form.submited" >
                <el-option label="否" value="0" />
                <el-option label="是" value="1" />
            </el-select>
        </el-form-item>

        <el-form-item label="难度区间">
            <el-col :span="11">
                <el-input v-model="form.diff1" />
            </el-col>
            <el-col :span="2" class="text-center">
            <span class="text-gray-500">-</span>
            </el-col>
            <el-col :span="11">
                <el-input v-model="form.diff2" />
            </el-col>
        </el-form-item>
        <el-form-item value="problemType" label="标签(最多三个)">
            <el-checkbox-group v-model="form.problemType" :max="3">
            <el-checkbox value="2-sat" label="2-SAT问题" name="type" />
            <el-checkbox value="binary search" label="二分" name="type" />
            <el-checkbox value="bitmasks" label="位运算" name="type" />
            <el-checkbox value="brute force" label="暴力" name="type" />
            <el-checkbox value="chinese remainder theorem" label="中国剩余定理" name="type" />
            <el-checkbox value="combinatorics" label="组合数学" name="type" />
            <el-checkbox value="constructive algorithms" label="构造" name="type" />
            <el-checkbox value="data structures" label="数据结构" name="type" />
            <el-checkbox value="dfs and similar" label="DFS" name="type" />
            <el-checkbox value="divide and conquer" label="分治" name="type" />
            <el-checkbox value="dp" label="动态规划" name="type" />
            <el-checkbox value="dsu" label="并查集" name="type" />
            <el-checkbox value="expression parsing" label="表达式分析" name="type" />
            <el-checkbox value="fft" label="FFT" name="type" />
            <el-checkbox value="flows" label="网络流" name="type" />
            <el-checkbox value="games" label="博弈" name="type" />
            <el-checkbox value="geometry" label="几何" name="type" />
            <el-checkbox value="graph matchings" label="图的匹配" name="type" />
            <el-checkbox value="graphs" label="图" name="type" />
            <el-checkbox value="greedy" label="贪心" name="type" />
            <el-checkbox value="hashing" label="哈希" name="type" />
            <el-checkbox value="implementation" label="代码能力" name="type" />
            <el-checkbox value="interactive" label="交互" name="type" />
            <el-checkbox value="math" label="数学" name="type" />
            <el-checkbox value="matrices" label="矩阵" name="type" />
            <el-checkbox value="meet-in-the-middle" label="中途相遇" name="type" />
            <el-checkbox value="number theory" label="数论" name="type" />
            <el-checkbox value="probabilities" label="概率" name="type" />
            <el-checkbox value="schedules" label="安排" name="type" />
            <el-checkbox value="shortest paths" label="最短路" name="type" />
            <el-checkbox value="sortings" label="排序" name="type" />
            <el-checkbox value="string suffix structures" label="字符串后缀数据结构" name="type" />
            <el-checkbox value="strings" label="字符串" name="type" />
            <el-checkbox value="ternary search" label="三分" name="type" />
            <el-checkbox value="trees" label="树" name="type" />
            <el-checkbox value="two points" label="尺取" name="type" />
            </el-checkbox-group>
        </el-form-item>

        <el-form-item label="指定年级未做过">
            <el-select v-model="grade" class="m-2" placeholder="Select" size="large">
            <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
            />
    </el-select>
        </el-form-item>

        <el-form-item>
            <el-button type="primary" @click="onSubmit">查询</el-button>
            <el-button @click="clearForm">清空</el-button>
        </el-form-item>

        </el-form>
    </div>
        <el-form>
            <el-form-item label="显示题目标签">
                <el-switch v-model="showType" />
            </el-form-item>
        </el-form>
        <el-table :data="problems" style="width: 100%" stripe="true" :empty-text="tableEmptyText"  v-loading="loading">
            <el-table-column label="题目列表" >
                <el-table-column prop="status" label="提交状态" width="200" >
                    <template v-slot="scope">
                        <div :style="(scope.row.status=='OK'||scope.row.status=='-')?'color:green;':'color:red;'">
                        {{ scope.row.status}}
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="id" label="问题编号"  width="180" />
                <el-table-column prop="problemName" label="问题名称" width="580">
                    <template v-slot="scope">
                       <div><a :href="scope.row.url">{{scope.row.problemName}}</a> </div>
                        <el-tag class="ml-2" type="success" v-for="tag in scope.row.type" :key="tag"  v-show="showType">{{typeMap[tag]}}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="difficulty" label="难度" width="200" >
                    <template v-slot="scope">
                        <div :style="rankStyle(scope.row.difficulty)">
                        {{scope.row.difficulty}}
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="acceptNum" label="通过人数" />
            </el-table-column>
        </el-table>
    <div>
    <div class="example-pagination-block" style="padding: 20px 0;">
        <el-pagination layout="prev, pager, next" 
        :total="total" 
        :page-count="pageCount"
        :current-page="currentPage"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        @click="onSubmit"
        />
    </div>

    </div>
  </template>
  
  <script>
  import { reactive, ref} from 'vue'
  import { getProblemList } from "../api/problems";
  import { changeColorByRating } from "../api/changeColor";
  import { ElMessage } from 'element-plus'

  const loading = ref(true)
  
  export default {

  data: function() {
    return{
        form: reactive({
            problemName: null,
            problemIds: null,
            submited: '0',
            diff1: null,
            diff2: null,
            problemType: [],
        }),
        grade: ref(''),
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
        problems: null,
        pageCount: 1,
        currentPage: 1,
        typeMap: {
        '2-sat': '2-SAT问题',
        'binary search': '二分',
        'bitmasks': '位运算',
        'brute force': '暴力',
        'chinese remainder theorem': '中国剩余定理',
        'combinatorics': '组合数学',
        'constructive algorithms': '构造',
        'data structures': '数据结构',
        'dfs and similar': 'DFS',
        'divide and conquer': '分治',
        'dp': '动态规划',
        'dsu': '并查集',
        'expression parsing': '表达式分析',
        'fft': 'FFT',
        'flows': '网络流',
        'games': '博弈',
        'geometry': '几何',
        'graph matchings': '图的匹配',
        'graphs': '图',
        'greedy': '贪心',
        'hashing': '哈希',
        'implementation': '代码能力',
        'interactive': '交互',
        'math': '数学',
        'matrices': '矩阵',
        'meet-in-the-middle': '中途相遇',
        'number theory': '数论',
        'probabilities': '概率',
        'schedules': '安排',
        'shortest paths': '最短路',
        'sortings': '排序',
        'string suffix structures': '字符串后缀数据结构',
        'strings': '字符串',
        'ternary search': '三分',
        'trees': '树',
        'two points': '尺取',
        },
        showType: false,
        tableEmptyText: "没有符合条件的题目",
        loading: 0,
        total: 0,

    }
  },

  created() {
    this.onSubmit();
  },

  methods: {
    handleSizeChange(val){
	    this.pageSize=val;
	},
	handleCurrentChange(val){
	    this.currentPage=val;
	},

    clearForm() {
        this.form = reactive({
            problemName: null,
            problemIds: null,
            submited: '0',
            diff1: null,
            diff2: null,
            problemType: [],
        })
    },

    onSubmit(){
        this.tableEmptyText = "正在查询中……";
        this.loading = ref(true);
        getProblemList(this.form, this.currentPage, this.$store.state.username, this.grade).then((res) => {
            this.total = res.data[res.data.length - 1].total;
            this.pageCount = Math.floor(this.total / 30);
            if(this.total % 30 != 0) this.total = this.total + 1;
            res.data.pop();
            this.problems = res.data; 
            this.problems.forEach(problem => {
                problem.problemName = problem.problem.problemName;
                problem.id = '' + problem.problem.firstId + String.fromCharCode(64 + problem.problem.secondId);
                if(problem.problem.thirdId != 0) problem.id = problem.id + problem.problem.thirdId;
                problem.difficulty = problem.problem.difficulty;
                if(problem.difficulty == 0) problem.difficulty = "未定";
                problem.acceptNum = problem.problem.acceptNum;
                problem.url = problem.problem.url;
                problem.status = problem.status.toLowerCase();
            });
            this.loading = 0;
            this.tableEmptyText = "没有符合条件的题目";
        })
        .catch((err) => {
            this.problems = null;
            console.log(err);
            ElMessage.error('请求超时，请重试！');
            this.tableEmptyText = "查询失败，请重试！";
            this.loading = 0;
        })
    },

    
    rankStyle(rank) {
        return changeColorByRating(rank);
    }
  },


}

</script>
  