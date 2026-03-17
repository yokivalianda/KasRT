export function rp(n: number) {
  return 'Rp ' + Math.round(n).toLocaleString('id-ID')
}
export function rpCompact(n: number) {
  if (n >= 1_000_000) return 'Rp ' + (n / 1_000_000).toFixed(1).replace('.0','') + ' jt'
  if (n >= 1_000)     return 'Rp ' + (n / 1_000).toFixed(0) + ' rb'
  return 'Rp ' + Math.round(n)
}
export function tgl(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' })
}
export function tglPendek(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day:'numeric', month:'short' })
}
export function inisial(name: string) {
  return name.split(' ').slice(0,2).map(n=>n[0]).join('').toUpperCase()
}
const COLORS = ['#0F9E78','#D97706','#7C3AED','#DC2626','#0284C7','#059669','#DB2777','#D97706']
export function avatarColor(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return COLORS[Math.abs(h) % COLORS.length]
}
export function persen(a: number, b: number) {
  return b === 0 ? 0 : Math.round((a/b)*100)
}
export function hariIni() {
  return new Date().toISOString().split('T')[0]
}
export function bulanIni() {
  return new Date().toISOString().slice(0,7)
}
