<template>
  <div class="chart-wrap">
    <div class="chart-container" ref="chartRef"></div>
  </div>
</template>

<script setup>
import * as echarts from 'echarts'
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import api from '../api'

const props = defineProps({
  grade: { type: null, default: null }
})

const chartRef = ref(null)
let chart = null

const colors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc']

function pickColor(i) {
  return colors[i % colors.length]
}

function baseOption() {
  return {
    title: {
      text: 'CodeForces 参赛情况',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 600, color: '#303133' }
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#e4e7ed',
      textStyle: { color: '#303133' },
      formatter: function (g) {
        let y = ''
        for (let m = 0; m < g.length; m++) {
          if (g[m].seriesName === window.selectSeries) {
            const _ = g[m].axisValue
            const S = new Date(_)
            const w = S.getFullYear(), x = S.getMonth() + 1, b = S.getDate()
            const T = `${w}-${x}-${b}`
            y = '<div style="text-align: left;">'
            y += g[m].seriesName + '<br/>'
            y += T + '<br/>'
            y += 'Rating:' + g[m].data.value[1] + '<br/>'
            y += g[m].data.name
            y += '</div>'
            break
          }
        }
        return y
      }
    },
    legend: { orient: 'horizontal', top: 'bottom', data: [], type: 'scroll', bottom: 10, textStyle: { color: '#606266' } },
    xAxis: {
      type: 'time',
      splitLine: { show: true, lineStyle: { type: 'solid', width: 1, color: '#f0f0f0' } },
      boundaryGap: ['5%', '5%'],
      axisLine: { lineStyle: { color: '#dcdfe6' } }
    },
    yAxis: {
      type: 'value',
      splitLine: { show: true, lineStyle: { type: 'solid', width: 1, color: '#f0f0f0' } },
      axisLine: { lineStyle: { color: '#dcdfe6' } }
    },
    grid: { left: 60, right: 40, top: 60, bottom: 60 },
    series: []
  }
}

function load(grade) {
  api.getUserRatings({ grade }).then(res => {
    // 组件可能已卸载(chart 已 dispose),异步返回后需校验
    if (!chart || chart.isDisposed()) return
    const data = res.data.data
    chart.setOption({
      title: { text: 'CodeForces 参赛情况' },
      legend: { data: data.users },
      series: data.result.map((m, i) => ({
        ...m,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 2 },
        itemStyle: { color: pickColor(i) }
      }))
    })
  }).catch(e => {
    console.log(e)
  })
}

onMounted(() => {
  chart = echarts.init(chartRef.value)
  chart.setOption(baseOption())
  chart.on('mousemove', function (g) { window.selectSeries = g.seriesName })
  chart.on('mouseout', function (g) { window.selectSeries = '' })
  load(props.grade)
})

watch(() => props.grade, () => load(props.grade))

onBeforeUnmount(() => {
  chart.dispose()
})
</script>

<style scoped>
.chart-wrap {
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 16px;
}
.chart-container { width: 100%; height: 480px; }
</style>
