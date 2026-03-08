const agree = document.getElementById('agree')
const btn = document.getElementById('install')
const bar = document.getElementById('bar')
agree.addEventListener('change', () => { btn.disabled = !agree.checked })
btn.addEventListener('click', () => {
  btn.disabled = true
  if (window.installer && window.installer.accept) {
    window.installer.accept()
  }
})
if (window.installer && window.installer.onProgress) {
  window.installer.onProgress(p => { bar.style.width = Math.round(p*100) + '%' })
}
