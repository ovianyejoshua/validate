function esc(str) {
  return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Auto-resize chat inputs
document.addEventListener('DOMContentLoaded', () => {
  ['refineInput'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => { el.style.height='auto'; el.style.height=Math.min(el.scrollHeight,120)+'px'; });
  });
});
