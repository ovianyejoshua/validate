async function loadAllHistory() {
  const items = await dbLoadAll();
  renderHistoryBar(items);
  renderHistoryGrid(items);
}

function renderHistoryBar(items) {
  const bar = document.getElementById('historyBar');
  const inner = document.getElementById('historyInner');
  if (!items || items.length === 0) { bar.classList.remove('active'); return; }
  bar.classList.add('active');
  inner.innerHTML = '<span class="history-label">Recent</span>';
  items.slice(0,8).forEach(entry => {
    const v = entry.report?.verdict || '';
    const cls = v === 'Build It' ? 'build' : v === 'Refine It' ? 'refine' : 'drop';
    const div = document.createElement('div');
    div.className = 'h-item' + (entry.id === currentId ? ' active' : '');
    div.dataset.id = entry.id;
    div.innerHTML = `<span class="h-idea">${esc(entry.idea||'')}</span><span class="h-verdict ${cls}">${esc(v)}</span><span class="h-del" data-id="${entry.id}">✕</span>`;
    div.addEventListener('click', e => {
      if (e.target.classList.contains('h-del')) { deleteEntry(e.target.dataset.id); return; }
      loadEntry(entry.id);
    });
    inner.appendChild(div);
  });
}

function renderHistoryGrid(items) {
  const grid = document.getElementById('historyGrid');
  if (!items || items.length === 0) {
    grid.innerHTML = '<div class="history-empty"><p class="history-empty-text">No validations yet.<br>Go to the Validate tab to get started.</p></div>';
    return;
  }
  grid.innerHTML = '';
  items.forEach(entry => {
    const v = entry.report?.verdict || '';
    const cls = v === 'Build It' ? 'build' : v === 'Refine It' ? 'refine' : 'drop';
    const date = entry.created_at ? new Date(entry.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}) : '';
    const stagesComplete = [
      entry.refine_history?.length > 0 ? '✓ Refined' : '',
      entry.objections?.length > 0 ? '✓ Objections' : '',
      entry.value_stack?.length > 0 ? '✓ Value Stack' : '',
      entry.final_offer ? '✓ Final Offer' : '',
    ].filter(Boolean).join('  ·  ');

    const card = document.createElement('div');
    card.className = 'history-card' + (entry.id === currentId ? ' active' : '');
    card.innerHTML = `
      <div>
        <div class="hc-idea">${esc(entry.idea||'')}</div>
        <div class="hc-meta">
          <span>${date}</span>
          ${stagesComplete ? `<span>${stagesComplete}</span>` : ''}
        </div>
      </div>
      <div class="hc-right">
        <span class="hc-verdict ${cls}">${esc(v)}</span>
        <button class="hc-del" onclick="deleteEntry('${entry.id}');event.stopPropagation()">Delete</button>
      </div>
    `;
    card.addEventListener('click', () => loadEntry(entry.id));
    grid.appendChild(card);
  });
}

async function loadEntry(id) {
  const entry = await dbLoad(id);
  if (!entry) return;

  currentId = entry.id;
  currentIdea = entry.idea || '';
  currentReport = entry.report;
  audienceIntel = entry.audience_intel || null;
  refineHistory = entry.refine_history || [];
  objections = entry.objections || [];
  valueStack = entry.value_stack || [];
  finalOffer = entry.final_offer || null;
  finalisedOffer = entry.finalised_offer || null;

  // Restore build state
  restoreBuildState(entry);
  // Restore sell state
  if (entry.build_complete) { unlockSell(); restoreSellState(entry); }

  // Restore Build tab if offer was finalised
  if (finalisedOffer) {
    const buildTab = document.getElementById('tab-build');
    if (buildTab) { buildTab.disabled = false; buildTab.style.opacity = '1'; buildTab.style.cursor = 'pointer'; }
    renderOfferHandoff(finalisedOffer);
    document.getElementById('finaliseDone').style.display = 'flex';
    document.getElementById('finaliseBtn').style.display = 'none';
  }

  // Restore validate tab
  document.getElementById('ideaInput').value = currentIdea;
  document.getElementById('loadingBox').classList.remove('active');
  document.getElementById('errorBox').classList.remove('active');
  renderReport(currentReport);

  // Restore audience intelligence if it exists
  if (audienceIntel) {
    document.getElementById('aiSection').classList.add('active');
    document.getElementById('aiLoading').style.display = 'none';
    document.getElementById('aiContent').style.display = 'block';
    document.getElementById('ai1').textContent = audienceIntel.section1 || '';
    document.getElementById('ai2').textContent = audienceIntel.section2 || '';
    document.getElementById('ai3').textContent = audienceIntel.section3 || '';
    document.getElementById('ai4').textContent = audienceIntel.section4 || '';
    document.getElementById('ai5').textContent = audienceIntel.section5 || '';
    document.getElementById('ai6').textContent = audienceIntel.section6 || '';
    document.getElementById('ai7').textContent = audienceIntel.section7 || '';
    document.getElementById('aiSummary').textContent = audienceIntel.summary || '';
    document.getElementById('aiStatusBadge').textContent = 'Complete ✓';
    document.getElementById('aiStatusBadge').style.color = 'var(--green)';
    document.getElementById('aiStatusBadge').style.borderColor = 'rgba(0,217,139,.3)';
  } else {
    document.getElementById('aiSection').classList.remove('active');
  }

  // Restore strategist tab
  setupStrategist();
  restoreStrategistStages();

  // Update history bar active state
  document.querySelectorAll('.h-item').forEach(el => el.classList.toggle('active', el.dataset.id === id));

  switchTab('validate');
  loadAllHistory();
}

async function deleteEntry(id) {
  await dbDelete(id);
  if (currentId === id) {
    currentId = null; currentReport = null; currentIdea = '';
    refineHistory = []; objections = []; valueStack = []; finalOffer = null; finalisedOffer = null; audienceIntel = null;
  blueprint = null; approvedBlueprint = null; chapters = []; currentChapterIndex = 0; buildStagesUnlocked = [1];
  salesStrategy = null; salesPage = null; adIntelligence = null; adVariations = null; adIterations = []; cumulativeLearningLog = null; backendArchitecture = null; sellStagesUnlocked = [1];
  const st = document.getElementById('tab-sell'); if(st){st.disabled=true;st.style.opacity='.35';st.style.cursor='not-allowed';}
  document.getElementById('sellLocked').style.display='block';
  document.getElementById('sellReady').style.display='none';
  const bt = document.getElementById('tab-build'); if(bt){bt.disabled=true;bt.style.opacity='.35';bt.style.cursor='not-allowed';}
  document.getElementById('buildLocked').style.display='block';
  document.getElementById('buildReady').style.display='none';
  document.getElementById('finaliseSection').style.display='none';
  document.getElementById('finaliseDone').style.display='none';
  document.getElementById('finaliseBtn').style.display='block';
  document.getElementById('finaliseBtn').disabled=false;
  document.getElementById('blueprintResult').style.display='none';
  document.getElementById('generateBlueprintBtn').style.display='block';
  document.getElementById('generateBlueprintBtn').disabled=false;
  document.getElementById('chaptersContainer').innerHTML='';
  document.getElementById('chapterOutput').style.display='none';
  document.getElementById('completeProductResult').style.display='none';
  document.getElementById('aiSection').classList.remove('active');
  document.getElementById('aiContent').style.display = 'none';
  document.getElementById('aiLoading').style.display = 'none';
    document.getElementById('reportBox').classList.remove('active');
    document.getElementById('ideaInput').value = '';
    resetStrategist();
  }
  await loadAllHistory();
}
