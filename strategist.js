function setupStrategist() {
  if (!currentReport) return;
  document.getElementById('stratEmpty').style.display = 'none';
  document.getElementById('stratContent').style.display = 'block';
  document.getElementById('stratIdeaText').textContent = currentIdea;

  const v = currentReport.verdict;
  const badge = document.getElementById('stratVerdictBadge');
  badge.textContent = v;
  const cls = v === 'Build It' ? 'build' : v === 'Refine It' ? 'refine' : 'drop';
  badge.className = 'strat-verdict-badge h-verdict ' + cls;

  stagesUnlocked = [1];
  unlockStage(1);
}

function resetStrategist() {
  document.getElementById('stratEmpty').style.display = 'block';
  document.getElementById('stratContent').style.display = 'none';
  document.getElementById('refineMessages').innerHTML = '<div class="chat-msg assistant"><div class="chat-bubble">I\'ve reviewed your validation report. Let\'s refine your idea into something precise. What angle are you leaning towards — or would you like me to recommend the strongest one based on the research?</div></div>';
  document.getElementById('objectionsList').innerHTML = '';
  document.getElementById('objectionsResult').style.display = 'none';
  document.getElementById('valueStackList').innerHTML = '';
  document.getElementById('valueStackResult').style.display = 'none';
  document.getElementById('offerResult').style.display = 'none';
  [1,2,3,4].forEach(i => {
    document.getElementById('stage'+i+'Body').classList.remove('open');
    document.getElementById('stage'+i+'Status').textContent = i === 1 ? 'In Progress' : 'Locked';
    document.getElementById('stage'+i+'Status').className = 'stage-status ' + (i === 1 ? 'active' : 'locked');
  });
  document.getElementById('stage1Body').classList.add('open');
}

function restoreStrategistStages() {
  if (!currentReport) return;
  setupStrategist();

  // Restore audience intelligence
  if (entry.audience_intel) {
    audienceIntel = entry.audience_intel;
    document.getElementById('aiSection').classList.add('active');
    document.getElementById('aiLoading').style.display = 'none';
    document.getElementById('aiContent').style.display = 'block';
    document.getElementById('ai1').textContent = entry.audience_intel.section1 || '';
    document.getElementById('ai2').textContent = entry.audience_intel.section2 || '';
    document.getElementById('ai3').textContent = entry.audience_intel.section3 || '';
    document.getElementById('ai4').textContent = entry.audience_intel.section4 || '';
    document.getElementById('ai5').textContent = entry.audience_intel.section5 || '';
    document.getElementById('ai6').textContent = entry.audience_intel.section6 || '';
    document.getElementById('ai7').textContent = entry.audience_intel.section7 || '';
    document.getElementById('aiSummary').textContent = entry.audience_intel.summary || '';
    document.getElementById('aiStatusBadge').textContent = 'Complete ✓';
    document.getElementById('aiStatusBadge').style.color = 'var(--green)';
  }

  // Restore refine chat
  if (refineHistory.length > 0) {
    const msgs = document.getElementById('refineMessages');
    msgs.innerHTML = '<div class="chat-msg assistant"><div class="chat-bubble">I\'ve reviewed your validation report. Let\'s refine your idea into something precise. What angle are you leaning towards — or would you like me to recommend the strongest one based on the research?</div></div>';
    refineHistory.forEach(m => appendChatMsg('refineMessages', m.role, m.content));
    markStageDone(1);
    unlockStage(2);
  }

  // Restore objections
  if (objections.length > 0) {
    renderObjections(objections);
    markStageDone(2);
    unlockStage(3);
  }

  // Restore value stack
  if (valueStack.length > 0) {
    renderValueStack(valueStack);
    markStageDone(3);
    unlockStage(4);
  }

  // Restore final offer
  if (finalOffer) {
    renderFinalOffer(finalOffer);
    markStageDone(4);
  }
}

function toggleStage(n) {
  if (!stagesUnlocked.includes(n)) return;
  const body = document.getElementById('stage'+n+'Body');
  body.classList.toggle('open');
}

function unlockStage(n) {
  if (!stagesUnlocked.includes(n)) stagesUnlocked.push(n);
  const status = document.getElementById('stage'+n+'Status');
  if (status.textContent === 'Locked') {
    status.textContent = 'Ready';
    status.className = 'stage-status active';
  }
  document.getElementById('stage'+n+'Body').classList.add('open');
}

function markStageDone(n) {
  const status = document.getElementById('stage'+n+'Status');
  status.textContent = 'Done';
  status.className = 'stage-status done';
}

// ── Stage 1: Refine Chat ──
async function sendChat(type) {
  const inputId = type + 'Input';
  const msgsId = type + 'Messages';
  const sendBtnId = type + 'SendBtn';
  const input = document.getElementById(inputId);
  const msg = input.value.trim();
  if (!msg) return;

  input.value = '';
  input.style.height = 'auto';
  refineHistory.push({ role: 'user', content: msg });
  appendChatMsg(msgsId, 'user', msg);
  await saveCurrentState();

  document.getElementById(sendBtnId).disabled = true;
  const thinkId = 'think-' + Date.now();
  appendChatMsg(msgsId, 'assistant', 'Thinking...', thinkId, true);

  const sysPrompt = `You are a sharp product strategist. Help the user refine their digital product idea based on this validation report:

${reportContext()}

Be direct, specific, and strategic. Short paragraphs. Use **bold** for key points. Help them sharpen the angle, define the audience precisely, and get clear on exactly what they're building.`;

  try {
    const reply = await callClaude(sysPrompt, refineHistory);
    refineHistory.push({ role: 'assistant', content: reply });
    await saveCurrentState();
    document.getElementById(thinkId)?.remove();
    appendChatMsg(msgsId, 'assistant', reply);
  } catch(e) {
    document.getElementById(thinkId)?.remove();
    appendChatMsg(msgsId, 'assistant', 'Something went wrong. Please try again.');
    console.error(e);
  }
  document.getElementById(sendBtnId).disabled = false;
}

function handleKey(e, type) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(type); }
}

function appendChatMsg(containerId, role, text, id, thinking) {
  const container = document.getElementById(containerId);
  const wrap = document.createElement('div');
  wrap.className = 'chat-msg ' + role;
  if (id) wrap.id = id;
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble' + (thinking ? ' thinking' : '');
  if (!thinking) {
    bubble.innerHTML = text
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
      .split('\n\n').map(p=>`<p>${p.replace(/\n/g,'<br>')}</p>`).join('');
  } else { bubble.textContent = text; }
  wrap.appendChild(bubble);
  container.appendChild(wrap);
  container.scrollTop = container.scrollHeight;
}

function completeStage1() {
  markStageDone(1);
  unlockStage(2);
  document.getElementById('stage1Body').classList.remove('open');
  document.getElementById('stage2Body').classList.add('open');
}

// ── Stage 2: Objections ──
async function findObjections() {
  document.getElementById('findObjectionsBtn').disabled = true;
  document.getElementById('objectionsLoading').style.display = 'block';

  const refinedContext = refineHistory.length > 0
    ? '\n\nREFINED DIRECTION FROM STRATEGY CHAT:\n' + refineHistory.filter(m=>m.role==='assistant').slice(-2).map(m=>m.content).join('\n')
    : '';

  const prompt = `You are a conversion expert. Based on this validated product idea, identify EVERY possible objection a potential buyer might have for saying no.

${reportContext()}${refinedContext}

Be exhaustive. Think about:
- Price objections, time objections, trust objections
- "I can do this myself" objections
- "I've tried before and failed" objections
- Specific fears and doubts for this audience
- Timing objections, priority objections
- Skepticism about results
- Competitive objections ("I already have X")

Return ONLY raw JSON array, no markdown:
[
  { "category": "Price", "objection": "The exact objection as the buyer would think it", "detail": "Why they think this specifically for this product" },
  ...
]

Return at least 10-15 objections. Be specific to this idea and audience, not generic.`;

  try {
    const text = await callClaude(prompt, [{ role: 'user', content: 'Find all objections for this product idea.' }], true);
    let clean = text.replace(/```json\s*/gi,'').replace(/```/g,'').trim();
    const s = clean.indexOf('['), e = clean.lastIndexOf(']');
    objections = JSON.parse(clean.slice(s, e+1));
    await saveCurrentState();
    document.getElementById('objectionsLoading').style.display = 'none';
    renderObjections(objections);
    markStageDone(2);
    unlockStage(3);
  } catch(err) {
    document.getElementById('objectionsLoading').style.display = 'none';
    document.getElementById('findObjectionsBtn').disabled = false;
    console.error(err);
  }
}

function renderObjections(list) {
  const container = document.getElementById('objectionsList');
  container.innerHTML = '';
  list.forEach(obj => {
    const div = document.createElement('div');
    div.className = 'objection-item';
    div.innerHTML = `<strong>${esc(obj.category)}</strong><br>${esc(obj.objection)}<br><span style="font-size:13px;color:#666">${esc(obj.detail)}</span>`;
    container.appendChild(div);
  });
  document.getElementById('objectionsResult').style.display = 'block';
}

// ── Stage 3: Value Stack ──
async function buildValueStack() {
  document.getElementById('buildStackBtn').disabled = true;
  document.getElementById('valueStackLoading').style.display = 'block';

  const prompt = `You are an offer-building expert. Turn every objection into a bonus, feature, or guarantee that neutralises it completely.

${reportContext()}

OBJECTIONS TO NEUTRALISE:
${objections.map((o,i)=>`${i+1}. [${o.category}] ${o.objection}`).join('\n')}

For each objection, create a specific bonus, feature, module, or guarantee that makes that objection irrelevant. Be creative and specific to this product.

Return ONLY raw JSON array, no markdown:
[
  {
    "objection": "the original objection",
    "bonusTitle": "Name of the Bonus/Feature/Guarantee",
    "bonusType": "Bonus"|"Feature"|"Guarantee"|"Module",
    "description": "What this is and how it completely neutralises the objection"
  },
  ...
]`;

  try {
    const text = await callClaude(prompt, [{ role: 'user', content: 'Build the value stack.' }]);
    let clean = text.replace(/```json\s*/gi,'').replace(/```/g,'').trim();
    const s = clean.indexOf('['), e = clean.lastIndexOf(']');
    valueStack = JSON.parse(clean.slice(s, e+1));
    await saveCurrentState();
    document.getElementById('valueStackLoading').style.display = 'none';
    renderValueStack(valueStack);
    markStageDone(3);
    unlockStage(4);
  } catch(err) {
    document.getElementById('valueStackLoading').style.display = 'none';
    document.getElementById('buildStackBtn').disabled = false;
    console.error(err);
  }
}

function renderValueStack(list) {
  const container = document.getElementById('valueStackList');
  container.innerHTML = '';
  list.forEach(item => {
    const card = document.createElement('div');
    card.className = 'vs-card';
    card.innerHTML = `
      <div class="vs-objection">Neutralises: "${esc(item.objection)}"</div>
      <div class="vs-bonus-label">${esc(item.bonusType)}</div>
      <div class="vs-bonus-title">${esc(item.bonusTitle)}</div>
      <div class="vs-bonus-desc">${esc(item.description)}</div>
    `;
    container.appendChild(card);
  });
  document.getElementById('valueStackResult').style.display = 'block';
}

// ── Stage 4: Final Offer ──
async function buildFinalOffer() {
  document.getElementById('buildOfferBtn').disabled = true;
  document.getElementById('offerLoading').style.display = 'block';

  const prompt = `You are a world-class copywriter and offer architect. Assemble everything into a complete, irresistible offer.

${reportContext()}

REFINED DIRECTION:
${refineHistory.filter(m=>m.role==='assistant').slice(-3).map(m=>m.content).join('\n\n')}

VALUE STACK:
${valueStack.map(v=>`- ${v.bonusTitle} (${v.bonusType}): ${v.description}`).join('\n')}

Create the complete offer. Return ONLY raw JSON, no markdown:
{
  "productName": "The name of the product",
  "tagline": "One compelling sentence that summarises the transformation",
  "targetAudience": "Precise description of who this is for",
  "corePromise": "The main outcome/transformation in 2-3 sentences",
  "whatIsIncluded": ["Core item 1", "Core item 2", "Core item 3"],
  "bonuses": [
    { "title": "Bonus name", "description": "What it is and its value" }
  ],
  "guarantee": "The guarantee you offer",
  "suggestedPrice": "Recommended price with brief reasoning",
  "oneLiner": "The one sentence pitch you'd use to sell this to a cold audience"
}`;

  try {
    const text = await callClaude(prompt, [{ role: 'user', content: 'Build the final offer.' }]);
    finalOffer = parseJSON(text);
    await saveCurrentState();
    document.getElementById('offerLoading').style.display = 'none';
    renderFinalOffer(finalOffer);
    markStageDone(4);
    loadAllHistory();
  } catch(err) {
    document.getElementById('offerLoading').style.display = 'none';
    document.getElementById('buildOfferBtn').disabled = false;
    console.error(err);
  }
}

function renderFinalOffer(offer) {
  const box = document.getElementById('offerBox');
  const bonuses = (offer.bonuses || []).map(b => `<li class="offer-bonus-item"><strong>${esc(b.title)}</strong> — ${esc(b.description)}</li>`).join('');
  const included = (offer.whatIsIncluded || []).map(i => `<li class="offer-bonus-item">${esc(i)}</li>`).join('');
  box.innerHTML = `
    <div class="offer-name">${esc(offer.productName)}</div>
    <div class="offer-tagline">${esc(offer.tagline)}</div>
    <div class="offer-section-label">Who This Is For</div>
    <div class="offer-core">${esc(offer.targetAudience)}</div>
    <div class="offer-section-label">The Promise</div>
    <div class="offer-core">${esc(offer.corePromise)}</div>
    <div class="offer-section-label">What's Included</div>
    <ul class="offer-bonuses">${included}</ul>
    <div class="offer-section-label">Bonuses</div>
    <ul class="offer-bonuses">${bonuses}</ul>
    <div class="offer-section-label">Guarantee</div>
    <div class="offer-core">${esc(offer.guarantee)}</div>
    <div class="offer-section-label">Suggested Price</div>
    <div class="offer-price">${esc(offer.suggestedPrice)}</div>
    <div class="offer-section-label">The One-Liner Pitch</div>
    <div class="offer-core" style="font-style:italic;color:var(--text)">"${esc(offer.oneLiner)}"</div>
  `;
  document.getElementById('offerResult').style.display = 'block';
  document.getElementById('finaliseSection').style.display = 'block';
}



// ══════════════════════════════════════
// BUILD SECTION
// ══════════════════════════════════════
let blueprint = null;
let approvedBlueprint = null;
let chapters = []; // { number, title, brief, content, writerNote, approved }
let currentChapterIndex = 0;
let buildStagesUnlocked = [1];

const BLUEPRINT_STEPS = [
  'Reading your finalised offer...',
  'Studying the audience intelligence map...',
  'Mapping the emotional arc...',
  'Designing chapter structure...',
  'Building the language guide...',
  'Assembling the complete blueprint...',
];

const CHAPTER_STEPS = [
  'Reviewing emotional arc and chapter brief...',
  'Studying previously written chapters...',
  'Writing from audience intelligence...',
  'Completing the chapter...',
];

