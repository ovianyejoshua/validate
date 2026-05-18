function goToStrategist() {
  switchTab('strategist');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ══════════════════════════════════════
// STRATEGIST
// ══════════════════════════════════════


// ══════════════════════════════════════
// AUTH + IDENTITY SYSTEM
// ══════════════════════════════════════
const ADMIN_PASSWORD = 'Osemudiame3117';
let currentUser = null; // { id, username }

function showLogin() {
  document.getElementById('authLogin').style.display = 'block';
  document.getElementById('authRegister').style.display = 'none';
  document.getElementById('loginError').classList.remove('active');
}

function showRegister() {
  document.getElementById('authRegister').style.display = 'block';
  document.getElementById('authLogin').style.display = 'none';
  document.getElementById('registerError').classList.remove('active');
}

async function doLogin() {
  const username = document.getElementById('loginUsername').value.trim().toLowerCase();
  const pin = document.getElementById('loginPin').value.trim();
  const errEl = document.getElementById('loginError');
  errEl.classList.remove('active');

  if (!username || !pin) { errEl.textContent = 'Enter your username and PIN.'; errEl.classList.add('active'); return; }

  // Check admin
  if (pin === ADMIN_PASSWORD) {
    currentUser = { id: 'admin', username: 'admin' };
    hideAuth();
    openAdmin();
    return;
  }

  if (!db) { errEl.textContent = 'Database not connected. Check Settings.'; errEl.classList.add('active'); return; }

  try {
    const { data, error } = await db.from('users').select('id,username').eq('username', username).eq('pin', pin).single();
    if (error || !data) { errEl.textContent = 'Username or PIN incorrect. Try again.'; errEl.classList.add('active'); return; }
    currentUser = { id: data.id, username: data.username };
    hideAuth();
    initUserSession();
  } catch(e) {
    errEl.textContent = 'Error signing in: ' + e.message;
    errEl.classList.add('active');
  }
}

async function doRegister() {
  const username = document.getElementById('registerUsername').value.trim().toLowerCase();
  const pin = document.getElementById('registerPin').value.trim();
  const pinConfirm = document.getElementById('registerPinConfirm').value.trim();
  const errEl = document.getElementById('registerError');
  errEl.classList.remove('active');

  if (!username) { errEl.textContent = 'Choose a username.'; errEl.classList.add('active'); return; }
  if (!/^[a-z0-9_]{3,20}$/.test(username)) { errEl.textContent = 'Username must be 3-20 characters, letters, numbers and underscores only.'; errEl.classList.add('active'); return; }
  if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) { errEl.textContent = 'PIN must be exactly 4 digits.'; errEl.classList.add('active'); return; }
  if (pin !== pinConfirm) { errEl.textContent = 'PINs do not match.'; errEl.classList.add('active'); return; }

  if (!db) { errEl.textContent = 'Database not connected. Check Settings.'; errEl.classList.add('active'); return; }

  try {
    // Check if username taken
    const { data: existing } = await db.from('users').select('id').eq('username', username).single();
    if (existing) { errEl.textContent = 'That username is already taken. Choose another.'; errEl.classList.add('active'); return; }

    const id = Date.now().toString();
    const { error } = await db.from('users').insert({ id, username, pin, created_at: new Date().toISOString() });
    if (error) throw error;

    currentUser = { id, username };
    hideAuth();
    initUserSession();
  } catch(e) {
    errEl.textContent = 'Error creating account: ' + e.message;
    errEl.classList.add('active');
  }
}

function hideAuth() {
  document.getElementById('authScreen').style.display = 'none';
  document.getElementById('headerUserBadge').style.display = 'flex';
  document.getElementById('headerUsername').textContent = currentUser.username;
}

function doLogout() {
  currentUser = null;
  document.getElementById('authScreen').style.display = 'flex';
  document.getElementById('headerUserBadge').style.display = 'none';
  showLogin();
  // Clear state
  currentId = null; currentReport = null; currentIdea = '';
  chatHistory = []; objections = []; valueStack = []; finalOffer = null;
  finalisedOffer = null; audienceIntel = null; blueprint = null;
  approvedBlueprint = null; chapters = []; currentChapterIndex = 0;
  salesStrategy = null; salesPage = null; adVariations = null;
  adIterations = []; cumulativeLearningLog = null; backendArchitecture = null;
}

function initUserSession() {
  // Load user's history
  loadAllHistory();
  // Switch to source tab by default
  switchTab('source');
}

// ══════════════════════════════════════
// ADMIN VIEW
// ══════════════════════════════════════
async function openAdmin() {
  document.getElementById('adminScreen').classList.add('active');
  await loadAdminUsers();
}

function closeAdmin() {
  document.getElementById('adminScreen').classList.remove('active');
  // Return to auth
  currentUser = null;
  document.getElementById('authScreen').style.display = 'flex';
  document.getElementById('headerUserBadge').style.display = 'none';
  showLogin();
}

async function loadAdminUsers() {
  if (!db) return;
  try {
    const { data: users } = await db.from('users').select('id,username,created_at').order('created_at', { ascending: false });
    const { data: sessions } = await db.from('validations').select('user_id').not('user_id', 'is', null);

    const sessionCounts = {};
    (sessions || []).forEach(s => { sessionCounts[s.user_id] = (sessionCounts[s.user_id] || 0) + 1; });

    const list = document.getElementById('adminUserList');
    list.innerHTML = '';

    if (!users?.length) {
      list.innerHTML = '<div style="padding:20px;font-family:var(--mono);font-size:12px;color:var(--muted)">No users yet</div>';
      return;
    }

    users.forEach(user => {
      const count = sessionCounts[user.id] || 0;
      const joined = new Date(user.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      const div = document.createElement('div');
      div.className = 'admin-user-item';
      div.dataset.userId = user.id;
      div.innerHTML = `
        <div class="admin-user-name">${esc(user.username)}</div>
        <div class="admin-user-meta">${count} session${count !== 1 ? 's' : ''} · Joined ${joined}</div>
      `;
      div.addEventListener('click', () => loadAdminUserDetail(user, div));
      list.appendChild(div);
    });
  } catch(e) { console.error('Admin load error:', e); }
}

async function loadAdminUserDetail(user, itemEl) {
  // Mark active
  document.querySelectorAll('.admin-user-item').forEach(el => el.classList.remove('active'));
  itemEl.classList.add('active');

  document.getElementById('adminMainEmpty').style.display = 'none';
  const detail = document.getElementById('adminUserDetail');
  detail.style.display = 'block';
  detail.innerHTML = '<div style="font-family:var(--mono);font-size:12px;color:var(--muted);padding:20px 0">Loading sessions...</div>';

  try {
    const { data: sessions } = await db.from('validations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    const { data: notes } = await db.from('admin_notes')
      .select('session_id,note')
      .eq('user_id', user.id);

    const noteMap = {};
    (notes || []).forEach(n => { noteMap[n.session_id] = n.note; });

    const totalSessions = sessions?.length || 0;
    const completed = (sessions || []).filter(s => s.build_complete).length;
    const withSell = (sessions || []).filter(s => s.sales_strategy).length;

    detail.innerHTML = `
      <div style="margin-bottom:20px">
        <div style="font-family:var(--font);font-size:20px;font-weight:700;color:var(--text);margin-bottom:16px">${esc(user.username)}</div>
        <div class="admin-stats-row">
          <div class="admin-stat"><div class="admin-stat-val">${totalSessions}</div><div class="admin-stat-label">Sessions</div></div>
          <div class="admin-stat"><div class="admin-stat-val">${completed}</div><div class="admin-stat-label">Products Built</div></div>
          <div class="admin-stat"><div class="admin-stat-val">${withSell}</div><div class="admin-stat-label">In Sell</div></div>
        </div>
      </div>
      <div id="adminSessionsList"></div>
    `;

    const list = document.getElementById('adminSessionsList');
    if (!sessions?.length) {
      list.innerHTML = '<div style="font-family:var(--mono);font-size:12px;color:var(--muted)">No sessions yet</div>';
      return;
    }

    sessions.forEach(session => {
      const verdict = session.report?.verdict || '';
      const vCls = verdict === 'Build It' ? 'build' : verdict === 'Refine It' ? 'refine' : 'drop';
      const date = new Date(session.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      const existingNote = noteMap[session.id] || '';

      const stages = [
        { label: 'Validated', done: !!session.report },
        { label: 'Audience Intel', done: !!session.audience_intel },
        { label: 'Offer Built', done: !!session.finalised_offer },
        { label: 'Product Written', done: !!session.build_complete },
        { label: 'Sell Assets', done: !!session.sales_strategy },
      ];
      const dotsHtml = stages.map(s => `<span class="admin-dot ${s.done ? 'done' : ''}">${s.label}</span>`).join('');

      const card = document.createElement('div');
      card.className = 'admin-session-card';
      card.innerHTML = `
        <div class="admin-session-header" onclick="toggleAdminSession('${session.id}')">
          <div class="admin-session-idea">${esc(session.idea || 'Untitled')}</div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0">
            ${verdict ? `<span class="admin-session-verdict ${vCls}">${esc(verdict)}</span>` : ''}
            <span style="font-family:var(--mono);font-size:10px;color:var(--dim)">${date}</span>
          </div>
        </div>
        <div class="admin-session-body" id="adminBody-${session.id}">
          <div class="admin-progress-dots">${dotsHtml}</div>

          ${session.report ? `
          <div class="admin-output-section">
            <div class="admin-output-label">Validation Report</div>
            <div class="admin-output-text">Pain: ${esc(session.report.painLevel)} | Recency: ${esc(session.report.recency?.label)} | Verdict: ${esc(session.report.verdict)}
${esc(session.report.verdictReason)}
Gap: ${esc(session.report.gapAnalysis?.gap || '')}</div>
          </div>` : ''}

          ${session.audience_intel ? `
          <div class="admin-output-section">
            <div class="admin-output-label">Audience Intelligence — Summary</div>
            <div class="admin-output-text">${esc(session.audience_intel.summary || '')}</div>
          </div>` : ''}

          ${session.finalised_offer ? `
          <div class="admin-output-section">
            <div class="admin-output-label">Finalised Offer</div>
            <div class="admin-output-text">${esc(session.finalised_offer.productName || '')} — ${esc(session.finalised_offer.corePromise || '')}
Price: ${esc(session.finalised_offer.suggestedPrice || '')}
Value Stack items: ${(session.finalised_offer.valueStack || []).length}</div>
          </div>` : ''}

          ${session.sales_strategy ? `
          <div class="admin-output-section">
            <div class="admin-output-label">Sales Strategy (excerpt)</div>
            <div class="admin-output-text">${esc((session.sales_strategy || '').slice(0, 800))}...</div>
          </div>` : ''}

          <div class="admin-output-section">
            <div class="admin-output-label">Your Notes on This Session</div>
            <textarea class="admin-note-area" id="note-${session.id}" placeholder="Add your observations about the quality of output for this session...">${esc(existingNote)}</textarea>
            <button class="admin-save-note" onclick="saveAdminNote('${session.id}', '${user.id}')">Save Note</button>
          </div>
        </div>
      `;
      list.appendChild(card);
    });
  } catch(e) {
    console.error('Admin detail error:', e);
    detail.innerHTML = '<div style="font-family:var(--mono);font-size:12px;color:var(--red);padding:20px 0">Error loading sessions: ' + e.message + '</div>';
  }
}

function toggleAdminSession(id) {
  const body = document.getElementById('adminBody-' + id);
  if (body) body.classList.toggle('open');
}

async function saveAdminNote(sessionId, userId) {
  if (!db) return;
  const note = document.getElementById('note-' + sessionId)?.value || '';
  try {
    await db.from('admin_notes').upsert({
      id: sessionId + '_' + userId,
      session_id: sessionId,
      user_id: userId,
      note,
      updated_at: new Date().toISOString()
    });
    const btn = event.target;
    btn.textContent = '✓ Saved';
    btn.style.color = 'var(--green)';
    setTimeout(() => { btn.textContent = 'Save Note'; btn.style.color = ''; }, 2000);
  } catch(e) { alert('Error saving note: ' + e.message); }
}

// ══════════════════════════════════════
// IDEA SOURCING
// ══════════════════════════════════════
let selectedMethod = null;
let sourcedIdeas = null;

