function startAIProgress() {
  const log = document.getElementById('aiLog');
  log.innerHTML = '';
  let i = 0;
  aiProgressInterval = setInterval(() => {
    if (i >= AI_STEPS.length) { clearInterval(aiProgressInterval); return; }
    log.querySelectorAll('.log-line.latest').forEach(el => el.classList.remove('latest'));
    const line = document.createElement('div');
    line.className = 'log-line latest';
    line.textContent = AI_STEPS[i++];
    log.appendChild(line);
  }, 4000);
}

function stopAIProgress() {
  if (aiProgressInterval) { clearInterval(aiProgressInterval); aiProgressInterval = null; }
}

async function runAudienceIntelligence(idea, report) {
  const section = document.getElementById('aiSection');
  section.classList.add('active');
  document.getElementById('aiLoading').style.display = 'block';
  document.getElementById('aiContent').style.display = 'none';
  document.getElementById('aiStatusBadge').textContent = 'Building...';
  document.getElementById('aiStatusBadge').style.color = 'var(--muted)';
  document.getElementById('aiStatusBadge').style.borderColor = 'var(--border)';
  startAIProgress();

  const userMsg = `IDEA: ${idea}

VALIDATION FINDINGS:
- Verdict: ${report.verdict} — ${report.verdictReason}
- Pain Level: ${report.painLevel}
- Pain Summary: ${report.painSummary}
- Recency: ${report.recency?.label} — ${report.recency?.detail}
- What people actually say: ${(report.exactPhrases||[]).join(' | ')}
- Existing solutions: ${report.gapAnalysis?.existingSolutions}
- The gap: ${report.gapAnalysis?.gap}
- Suggested angles: ${(report.suggestedAngles||[]).map(a=>a.angle+': '+a.reason).join(' | ')}
- Searches performed: ${(report.searchedQueries||[]).join(', ')}

Now conduct additional research to build a complete audience intelligence map. Search Reddit, forums, reviews and social platforms to find how this specific audience talks about this problem in their own unfiltered words. Then produce the full audience intelligence map as a JSON object.`;

  try {
    const text = await callClaude(AI_PROMPT, [{ role: 'user', content: userMsg }], true, 6000);
    stopAIProgress();
    if (!text) throw new Error('No audience intelligence returned.');

    const clean = text.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
    const s = clean.indexOf('{'), e = clean.lastIndexOf('}');
    if (s < 0 || e < 0) throw new Error('Could not parse audience intelligence.');
    const parsed = JSON.parse(clean.slice(s, e + 1));

    audienceIntel = parsed;

    document.getElementById('ai1').textContent = parsed.section1 || '';
    document.getElementById('ai2').textContent = parsed.section2 || '';
    document.getElementById('ai3').textContent = parsed.section3 || '';
    document.getElementById('ai4').textContent = parsed.section4 || '';
    document.getElementById('ai5').textContent = parsed.section5 || '';
    document.getElementById('ai6').textContent = parsed.section6 || '';
    document.getElementById('ai7').textContent = parsed.section7 || '';
    document.getElementById('aiSummary').textContent = parsed.summary || '';

    document.getElementById('aiLoading').style.display = 'none';
    document.getElementById('aiContent').style.display = 'block';
    document.getElementById('aiStatusBadge').textContent = 'Complete ✓';
    document.getElementById('aiStatusBadge').style.color = 'var(--green)';
    document.getElementById('aiStatusBadge').style.borderColor = 'rgba(0,217,139,.3)';

    if (currentId) await dbUpdate(currentId, { audience_intel: parsed });

  } catch(err) {
    stopAIProgress();
    document.getElementById('aiLoading').style.display = 'none';
    document.getElementById('aiStatusBadge').textContent = 'Failed — reload and retry';
    document.getElementById('aiStatusBadge').style.color = 'var(--red)';
    document.getElementById('aiStatusBadge').style.borderColor = 'rgba(255,80,80,.3)';
    console.error('Audience intelligence error:', err);
  }
}


async function runValidation() {
  const idea = document.getElementById('ideaInput').value.trim();
  if (!anthropicKey) { showError('No API key found. Please refresh the page.'); return; }
  if (!idea) { showError('Please describe your idea first.'); return; }

  document.getElementById('reportBox').classList.remove('active');
  document.getElementById('errorBox').classList.remove('active');
  document.getElementById('loadingBox').classList.add('active');
  document.getElementById('validateBtn').disabled = true;
  startProgress();

  try {
    const text = await callClaude(VALIDATE_PROMPT, [{ role: 'user', content: `Validate this digital product idea: "${idea}"\n\nSearch the web thoroughly and return only the JSON object.` }], true);
    stopProgress();
    const parsed = parseJSON(text);

    currentIdea = idea;
    currentReport = parsed;
    currentId = Date.now().toString();
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

    await dbSave({ id: currentId, idea: currentIdea, report: currentReport, audience_intel: null, refine_history: [], objections: [], value_stack: [], final_offer: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });

    document.getElementById('loadingBox').classList.remove('active');
    document.getElementById('validateBtn').disabled = false;
    renderReport(parsed);
    setupStrategist();
    loadAllHistory();
    // Automatically kick off audience intelligence
    runAudienceIntelligence(currentIdea, parsed);
  } catch(err) {
    stopProgress();
    document.getElementById('loadingBox').classList.remove('active');
    document.getElementById('validateBtn').disabled = false;
    showError(err.message || 'Something went wrong. Please try again.');
    console.error(err);
  }
}

function showError(msg) {
  document.getElementById('errorMsg').textContent = msg;
  document.getElementById('errorBox').classList.add('active');
}

function renderReport(d) {
  const vC = { 'Build It': '#00d98b', 'Refine It': '#f0c040', 'Drop It': '#ff5050' };
  const vI = { 'Build It': '🟢', 'Refine It': '🟡', 'Drop It': '🔴' };
  const pC = { High: '#ff5050', Medium: '#f0c040', Low: '#666' };
  const rC = { Active: '#00d98b', Ongoing: '#f0c040', Fading: '#ff9933', Dead: '#555' };

  const color = vC[d.verdict] || '#888';
  document.getElementById('verdictBlock').style.borderColor = color + '25';
  document.getElementById('verdictIcon').textContent = vI[d.verdict] || '⚪';
  document.getElementById('verdictWord').textContent = d.verdict || '';
  document.getElementById('verdictWord').style.color = color;
  document.getElementById('verdictReason').textContent = d.verdictReason || '';
  document.getElementById('painValue').textContent = d.painLevel || '—';
  document.getElementById('painValue').style.color = pC[d.painLevel] || '#888';
  document.getElementById('painDetail').textContent = (d.painSummary || '').slice(0, 80) + '...';
  document.getElementById('recencyValue').textContent = d.recency?.label || '—';
  document.getElementById('recencyValue').style.color = rC[d.recency?.label] || '#888';
  document.getElementById('recencyDetail').textContent = d.recency?.detail || '';
  document.getElementById('painSummary').textContent = d.painSummary || '';

  const pl = document.getElementById('phraseList');
  pl.innerHTML = '';
  (d.exactPhrases || []).forEach(p => { const li = document.createElement('li'); li.className = 'phrase-item'; li.textContent = p; pl.appendChild(li); });

  document.getElementById('existingSolutions').textContent = d.gapAnalysis?.existingSolutions || '';
  document.getElementById('gapText').textContent = d.gapAnalysis?.gap || '';

  const al = document.getElementById('anglesList');
  al.innerHTML = '';
  (d.suggestedAngles || []).forEach((a, i) => {
    const card = document.createElement('div');
    card.className = 'angle-card';
    card.innerHTML = `<div class="angle-num">Angle ${String(i+1).padStart(2,'0')}</div><div class="angle-title">${esc(a.angle)}</div><div class="angle-reason">${esc(a.reason)}</div>`;
    al.appendChild(card);
  });

  const st = document.getElementById('searchTags');
  st.innerHTML = '';
  (d.searchedQueries || []).forEach(q => { const t = document.createElement('span'); t.className = 'search-tag'; t.textContent = q; st.appendChild(t); });

  document.getElementById('reportBox').classList.add('active');
  document.getElementById('reportBox').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function resetValidate() {
  document.getElementById('ideaInput').value = '';
  document.getElementById('reportBox').classList.remove('active');
  document.getElementById('errorBox').classList.remove('active');
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
  resetStrategist();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

