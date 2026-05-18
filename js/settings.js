function renderSettingsStatus() {
  const ak = localStorage.getItem('v_ak') || '';
  const sbUrl = localStorage.getItem('v_sb_url') || SB_URL;
  const sbKey = localStorage.getItem('v_sb_key') || SB_KEY;
  if (ak) document.getElementById('settingsAnthropicKey').value = ak;
  if (sbUrl) document.getElementById('settingsSbUrl').value = sbUrl;
  if (sbKey) document.getElementById('settingsSbKey').value = sbKey;
  // Show current status
  if (anthropicKey) {
    setStatus('anthropic', 'ok', 'Key loaded');
  }
  if (db) {
    setStatus('supabase', 'ok', 'Connected');
  }
}

function setStatus(which, state, text) {
  const dot = document.getElementById(which + 'Dot');
  const txt = document.getElementById(which + 'StatusText');
  if (!dot || !txt) return;
  dot.className = 'status-dot ' + state;
  txt.textContent = text;
  txt.className = 'status-text ' + state;
}

async function testAnthropicKey() {
  const key = document.getElementById('settingsAnthropicKey').value.trim();
  if (!key) { setStatus('anthropic', 'err', 'No key entered'); return; }
  const btn = document.getElementById('testAnthropicBtn');
  btn.textContent = 'Testing...'; btn.disabled = true;
  setStatus('anthropic', 'idle', 'Testing...');
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
      body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 10, messages: [{ role: 'user', content: 'Hi' }] })
    });
    if (res.ok) {
      anthropicKey = key;
      localStorage.setItem('v_ak', key);
      setStatus('anthropic', 'ok', '✓ Connected — key works');
      btn.textContent = 'Test Connection'; btn.classList.add('ok');
    } else {
      const e = await res.json();
      setStatus('anthropic', 'err', 'Error: ' + (e.error?.message || res.status));
      btn.textContent = 'Test Connection';
    }
  } catch(e) {
    setStatus('anthropic', 'err', 'Connection failed');
    btn.textContent = 'Test Connection';
  }
  btn.disabled = false;
}

async function testSupabaseConnection() {
  const url = document.getElementById('settingsSbUrl').value.trim();
  const key = document.getElementById('settingsSbKey').value.trim();
  if (!url || !key) { setStatus('supabase', 'err', 'Enter URL and key'); return; }
  const btn = document.getElementById('testSupabaseBtn');
  btn.textContent = 'Testing...'; btn.disabled = true;
  setStatus('supabase', 'idle', 'Testing...');
  try {
    const testDb = window.supabase.createClient(url, key);
    const { error } = await testDb.from('validations').select('id').limit(1);
    if (!error) {
      db = testDb;
      localStorage.setItem('v_sb_url', url);
      localStorage.setItem('v_sb_key', key);
      setStatus('supabase', 'ok', '✓ Connected — database accessible');
      btn.textContent = 'Test Connection'; btn.classList.add('ok');
      loadAllHistory();
    } else {
      setStatus('supabase', 'err', 'DB error: ' + error.message);
      btn.textContent = 'Test Connection';
    }
  } catch(e) {
    setStatus('supabase', 'err', 'Connection failed: ' + e.message);
    btn.textContent = 'Test Connection';
  }
  btn.disabled = false;
}

function saveSettings() {
  const ak = document.getElementById('settingsAnthropicKey').value.trim();
  const sbUrl = document.getElementById('settingsSbUrl').value.trim();
  const sbKey = document.getElementById('settingsSbKey').value.trim();
  if (ak) { anthropicKey = ak; localStorage.setItem('v_ak', ak); }
  if (sbUrl) localStorage.setItem('v_sb_url', sbUrl);
  if (sbKey) localStorage.setItem('v_sb_key', sbKey);
  if (sbUrl && sbKey) {
    try {
      db = window.supabase.createClient(sbUrl, sbKey);
      setStatus('supabase', 'ok', '✓ Saved — test to verify');
      loadAllHistory();
    } catch(e) { setStatus('supabase', 'err', 'Init error: ' + e.message); }
  }
  if (ak) setStatus('anthropic', 'ok', '✓ Saved — test to verify');
}

// ══════════════════════════════════════
// SELL STATE
// ══════════════════════════════════════
let sellStagesUnlocked = [1];
let salesStrategy = null;
let salesPage = null;
let adIntelligence = null;
let adVariations = null;
let adIterations = [];
let cumulativeLearningLog = null;
let backendArchitecture = null;

// ══════════════════════════════════════
// SELL UI HELPERS
// ══════════════════════════════════════
