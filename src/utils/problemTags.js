// CF 题目标签中英文映射(题目检索页与复盘页共用)
export const typeMap = {
  '2-sat': '2-SAT问题', 'binary search': '二分', bitmasks: '位运算', 'brute force': '暴力',
  'chinese remainder theorem': '中国剩余定理', combinatorics: '组合数学', 'constructive algorithms': '构造',
  'data structures': '数据结构', 'dfs and similar': 'DFS', 'divide and conquer': '分治', dp: '动态规划',
  dsu: '并查集', 'expression parsing': '表达式分析', fft: 'FFT', flows: '网络流', games: '博弈',
  geometry: '几何', 'graph matchings': '图的匹配', graphs: '图', greedy: '贪心', hashing: '哈希',
  implementation: '代码能力', interactive: '交互', math: '数学', matrices: '矩阵',
  'meet-in-the-middle': '中途相遇', 'number theory': '数论', probabilities: '概率', schedules: '安排',
  'shortest paths': '最短路', sortings: '排序', 'string suffix structures': '字符串后缀数据结构',
  strings: '字符串', 'ternary search': '三分', trees: '树', 'two points': '尺取'
}

// 将英文标签数组转为中文(未知标签原样返回)
export function tagsToCn(tags) {
  if (!tags) return []
  return String(tags).split(',').map(t => t.trim()).filter(Boolean).map(t => typeMap[t] || t)
}
