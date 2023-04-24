<template>
    <div class="chart-container" ref="chartRef" :style="{ width: chartWidth, height: chartHeight }"></div>
</template>
  
<script setup>
import * as echarts from 'echarts';
import { ref, onMounted, onUnmounted } from 'vue';
import { getUserRating } from '../../api/chart';

const props = defineProps({
    width: {
        type: String,
        default: '100%'
    },
    height: {
        type: String,
        default: '500px'
    }
});

let chartInstance;
let chartOption;
const chartWidth = props.width;
const chartHeight = props.height;
const chartRef = ref();
let dbtime1 = new Date();

onMounted(() => {
    initChart();
    //监听窗口大小变化，改变图表大小
    window.addEventListener('resize', () => {
        chartInstance.resize();
    });
    //请求数据
    getData();
});

function initChart() {
    chartOption = {
        title: {
            text: 'xxx参赛数据',
            left: 'center',
        },
        tooltip: {
            trigger: 'axis', //设置鼠标划过时显示信息  如果不设置  不显示坐标轴指示器
            formatter: function (params) {
                let result = '';
                for (let i = 0; i < params.length; i++) {
                    if (params[i].seriesName === window.selectSeries) {
                        const timestamp = params[i].axisValue;
                        const date = new Date(timestamp);
                        const year = date.getFullYear();
                        const month = date.getMonth() + 1;
                        const day = date.getDate();
                        const formattedDate = `${year}-${month}-${day}`;
                        result = '<div style="text-align: left;">';
                        result += params[i].seriesName + '<br/>';
                        result += formattedDate + '<br/>';
                        result += 'Rating' + ':' + params[i].data.value[1] + '<br/>';
                        result += params[i].data.name;
                        result += '</div>';
                        break;
                    }
                }
                return result;
            }
        },
        legend: {
            orient: 'horizontal',
            top: 'bottom',
            data: [],
        },
        xAxis: {
            type: 'time',
            splitLine: {
                show: true
            },
            boundaryGap: ['5%', '5%'],
        },
        yAxis: {
            type: 'value',
        },
        series: [
        ]
    }

    //初始化echart
    chartInstance = echarts.init(chartRef.value);
    //设置echart数据
    chartInstance.setOption(chartOption);

    //当 鼠标移到线条上时触发
    chartInstance.on('mousemove', function (params) {
        window.selectSeries = params.seriesName;
    });
    //当 鼠标移出线条时触发 ，如果不处理这个，鼠标移到空白上还有tooltip显示。
    chartInstance.on('mouseout', function (params) {
        window.selectSeries = '';
    });

    //legend双击
    chartInstance.on('legendselectchanged', function (params) {
        let selected = params.selected;
        let dbLegend = doubleClick();
        if (dbLegend === 2) {
            let count = 0;
            for (let item in selected) {
                if (selected[item]) {
                    count++;
                }
            };
            if (count === 1 || count === 0) {
                for (let item in selected) {
                    selected[item] = true;
                };
            } else {
                for (let item in selected) {
                    if (item === params.name) {
                        selected[item] = true;
                    } else {
                        selected[item] = false;
                    }
                };
            };
            let newOption = {
                legend: {
                    selected: selected
                }
            };
            chartInstance.setOption(newOption);
        }
    });
};

//后续请求数据配置数据
function getData() {
    chartOption.title.text = 'CodeForces 参赛情况';

    getUserRating().then((res) => {
            chartOption.legend.data = res.data.data.users;
            chartOption.series = res.data.data.result;
            console.log(res)
            chartInstance.setOption(chartOption);

        })
        .catch((err) => {
            console.log(err)
        })
};

//监听是否双击
function doubleClick() {
    let dbtime2 = new Date();
    if (dbtime2 - dbtime1 <= 300) {
        return 2;
    } else {
        dbtime1 = dbtime2;
        return 1;
    }
}

onUnmounted(() => {
    //组件卸载时，销毁echart
    chartInstance.dispose();
});
</script>
  