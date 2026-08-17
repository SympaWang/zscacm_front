// CF rating -> 颜色(还原自 changeColor chunk)
export default function rankStyle(o) {
  if (o == 0) return 'color: #000000'
  if (o < 1200) return 'color: #808080'
  if (o < 1400) return 'color: #008000'
  if (o < 1600) return 'color: #03a89e'
  if (o < 1900) return 'color: #0000ff'
  if (o < 2100) return 'color: #aa00aa'
  if (o < 2400) return 'color: #ff8c00'
  if (o < 3000) return 'color: #ff0000'
  return 'color: #ff0000'
}
