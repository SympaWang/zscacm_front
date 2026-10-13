<template>
  <div class="chart-wrap">
    <div class="chart-toolbar">
      <span class="chart-tip">
        提示:双击曲线或下方姓名,可只看该队员,再次双击恢复
        <b v-if="isolatedName" class="isolated-tag">当前仅显示:{{ isolatedName }}</b>
      </span>
      <div class="chart-actions">
        <el-button size="small" plain @click="clearAll">一键清空</el-button>
        <el-button size="small" type="primary" plain @click="showAll">显示全部</el-button>
      </div>
    </div>
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

// 当前被隔离(单独显示)的曲线名,空字符串表示未隔离
const isolatedName = ref('')
// 隔离前的图例选中状态,用于双击恢复
let savedSelected = null

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

// ---- 图例选中状态工具 ----
function chartAlive() {
  return !!chart && !chart.isDisposed()
}

// 当前图例中的所有名字
function legendNames() {
  if (!chartAlive()) return []
  const opt = chart.getOption()
  const lg = opt && opt.legend && opt.legend[0]
  return (lg && lg.data) || []
}

// 当前哪些曲线是显示的(返回 name -> boolean)
function currentSelected(names) {
  const opt = chart.getOption()
  const lg = opt && opt.legend && opt.legend[0]
  const sel = (lg && lg.selected) || {}
  const out = {}
  names.forEach(n => { out[n] = sel[n] !== false })
  return out
}

function applySelected(names, isVisible) {
  const sel = {}
  names.forEach(n => { sel[n] = isVisible(n) })
  chart.setOption({ legend: { selected: sel } })
}

// 一键清空:隐藏所有曲线
function clearAll() {
  if (!chartAlive()) return
  const names = legendNames()
  if (!names.length) return
  applySelected(names, () => false)
  isolatedName.value = ''
  savedSelected = null
}

// 显示全部:所有曲线都显示
function showAll() {
  if (!chartAlive()) return
  const names = legendNames()
  if (!names.length) return
  applySelected(names, () => true)
  isolatedName.value = ''
  savedSelected = null
}

// 双击曲线:只看这一条;对同一条再次双击则恢复
function toggleIsolate(name) {
  if (!chartAlive() || !name) return
  const names = legendNames()
  if (!names.includes(name)) return

  // 再次双击同一条 → 恢复隔离前的状态
  if (isolatedName.value === name) {
    if (savedSelected) {
      applySelected(names, n => savedSelected[n] !== false)
    } else {
      applySelected(names, () => true)
    }
    isolatedName.value = ''
    savedSelected = null
    return
  }

  // 首次隔离时记住当前状态
  if (!isolatedName.value) {
    savedSelected = currentSelected(names)
  }
  applySelected(names, n => n === name)
  isolatedName.value = name
}

function load(grade) {
  api.getUserRatings({ grade }).then(res => {
    // 组件可能已卸载(chart 已 dispose),异步返回后需校验
    if (!chart || chart.isDisposed()) return
    const data = res.data.data
    // 数据整体刷新后,隔离/清空状态失效,重置为全部显示
    isolatedName.value = ''
    savedSelected = null
    const freshSelected = {}
    ;(data.users || []).forEach(n => { freshSelected[n] = true })
    chart.setOption({
      title: { text: 'CodeForces 参赛情况' },
      legend: { data: data.users, selected: freshSelected },
      series: data.result.map((m, i) => ({
        ...m,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        // 让整条线(而非只有圆点)响应鼠标事件,这样双击线段即可隔离该队员
        triggerLineEvent: true,
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
  // 双击曲线 → 只看该队员 / 恢复
  // 说明:ECharts 对折线的 dblclick 事件不可靠(线段默认不参与命中测试),
  // 这里用 click 事件自行配对:同一系列在 400ms 内被点击两次即视为双击。
  let lastClickName = ''
  let lastClickTime = 0
  const DBL_MS = 400
  chart.on('click', function (p) {
    const name = p.seriesName
    if (!name) return
    const now = Date.now()
    if (lastClickName === name && now - lastClickTime < DBL_MS) {
      lastClickName = ''
      lastClickTime = 0
      toggleIsolate(name)
    } else {
      lastClickName = name
      lastClickTime = now
    }
  })

  // 双击下方图例姓名 → 同样隔离/恢复
  // 图例单击仍是 ECharts 原生的"显示/隐藏该条",双击时两次点击互相抵消(净效果不变),
  // 因此在 legendselectchanged 里做同样的配对检测,把双击识别为隔离手势。
  let lastLegendName = ''
  let lastLegendTime = 0
  chart.on('legendselectchanged', function (p) {
    const name = p.name
    if (!name) return
    const now = Date.now()
    if (lastLegendName === name && now - lastLegendTime < DBL_MS) {
      lastLegendName = ''
      lastLegendTime = 0
      toggleIsolate(name)
      return
    }
    lastLegendName = name
    lastLegendTime = now
    // 用户手动点其他图例时,退出隔离态(避免"恢复"还原成过期状态)
    if (isolatedName.value && name !== isolatedName.value) {
      isolatedName.value = ''
      savedSelected = null
    }
  })
  load(props.grade)
})

watch(() => props.grade, () => load(props.grade))

onBeforeUnmount(() => {
  if (chart) chart.dispose()
})
</script>

<style scoped>
.chart-wrap {
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 16px;
}
.chart-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 4px;
}
.chart-tip { font-size: 12px; color: var(--text-muted, #a0a7b5); }
.isolated-tag { color: #409eff; margin-left: 6px; }
.chart-actions { display: flex; gap: 8px; }
.chart-container { width: 100%; height: 480px; }
</style>
