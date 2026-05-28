
// ══════════════════════════════════════
// CONFIG — your keys baked in
// ══════════════════════════════════════

const ANTHROPIC_KEY = localStorage.getItem('v_ak') || '';
const SB_URL = 'https://gntswhwivhzgbaahpwqy.supabase.co';
const SB_KEY = 'sb_publishable_cFtogIiMoTSVSAg0LEg53g_5rJdVopC';

// ══════════════════════════════════════
// STATE
// ══════════════════════════════════════
let anthropicKey = ANTHROPIC_KEY;
let db = null;
let currentId = null;
let currentReport = null;
let currentIdea = '';
let refinedIdea = '';
let refineHistory = [];
let objections = [];
let valueStack = [];
let finalOffer = null;
let stagesUnlocked = [1];

// ══════════════════════════════════════
// INIT
// ══════════════════════════════════════
function initSupabase() {
  try {
    const url = localStorage.getItem('v_sb_url') || SB_URL;
    const key = localStorage.getItem('v_sb_key') || SB_KEY;
    db = window.supabase.createClient(url, key);
    const statusEl = document.getElementById('dbStatus');
    if (statusEl) { statusEl.textContent = '● DB Connected'; statusEl.className = 'db-status ok'; }
  } catch(e) {
    const statusEl = document.getElementById('dbStatus');
    if (statusEl) { statusEl.textContent = '● DB Error'; statusEl.className = 'db-status err'; }
    console.error('Supabase init error:', e);
  }
  const saved = localStorage.getItem('v_ak');
  if (saved) anthropicKey = saved;
}

window.addEventListener('load', () => {
  initSupabase();
  document.getElementById('authScreen').style.display = 'flex';
  showLogin();
});

// ══════════════════════════════════════
// TABS
// ══════════════════════════════════════
function switchTab(name) {
  const names = ['validate','strategist','markettest','build','sell','history','settings'];
  document.querySelectorAll('.tab').forEach((t,i) => {
    t.classList.toggle('active', names[i] === name);
  });
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.getElementById('panel-' + name).classList.add('active');
  if (name === 'history') loadAllHistory();
  if (name === 'settings') renderSettingsStatus();
}
