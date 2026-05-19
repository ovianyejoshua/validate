// ══════════════════════════════════════
// VALIDATE — Opus for validation (second gate,
// weak verdict corrupts everything downstream)
// Opus for audience intelligence (foundation
// everything else draws from)
// ══════════════════════════════════════

const VALIDATE_PROMPT = `You are a ruthlessly honest demand analyst. Determine whether a digital product idea has real market demand using live web search. Search 5-6 times minimum: Reddit frustrations, Google search intent, existing solutions, recent complaints, YouTube/community demand. Be honest. If demand is low say so.

Return ONLY raw JSON, no markdown:
{
  "painLevel": "High|Medium|Low",
  "painSummary": "2 sentences maximum",
  "recency": { "label": "Active|Ongoing|Fading|Dead", "detail": "One sentence with specific dates or timeframes found" },
  "exactPhrases": ["exact phrase 1", "exact phrase 2", "exact phrase 3", "exact phrase 4"],
  "gapAnalysis": { "existingSolutions": "One sentence", "gap": "One sentence" },
  "suggestedAngles": [
    { "angle": "Specific angle", "reason": "One sentence why stronger" },
    { "angle": "Second angle", "reason": "One sentence why" },
    { "angle": "Third angle", "reason": "One sentence why" }
  ],
  "verdict": "Build It|Refine It|Drop It",
  "verdictReason": "2 sentences maximum",
  "searchedQueries": ["q1", "q2", "q3"]
}`;

const V_STEPS = [
  'Searching Reddit for frustrations...',
  'Checking Google search intent...',
  'Looking for existing solutions...',
  'Finding most recent expressions of pain...',
  'Analysing demand strength...',
  'Forming verdict...',
];

const AI_PROMPT = `You are an expert audience psychologist, behavioural researcher and direct response copywriter. Extract a precise, evidence-based audience intelligence map from the market research data provided. This map feeds product building, sales strategy, ad creation and backend architecture. Every insight must come from the research. Do not generalise, invent or assume. If the research does not support a section say so.

Source weighting: Weight Reddit and direct audience quotes most heavily — this is where people speak unfiltered. Flag insights from articles or secondary sources. The most emotionally raw platform is the most valuable for downstream work.

SECTION 1 — THEIR LANGUAGE
Extract with maximum precision — this feeds product writing, ads and sales page directly:
- High frequency phrases: exact words appearing repeatedly across multiple sources. Copy them verbatim. Note frequency and source count
- Emotional vocabulary: the specific feeling words they use — not "frustrated" but the exact word
- Metaphors and comparisons: how they describe the problem conceptually
- Sentence structure and rhythm: fragment or long, questions, exclamations — what rhythm do they write in
- Vocabulary level: technical, casual, emotional, clinical, defeated — be specific
- Power phrases: specific word combinations with highest emotional weight — these stop scrolls in ads
- Platform differences: how their language shifts between Reddit, YouTube, Google reviews
- Words and phrases to never use: language that would feel foreign, corporate or condescending

SECTION 2 — THEIR EMOTIONAL STATE
Map with enough precision that a chapter can move a reader from one state to the next and an ad can activate a specific emotion in one line:
- Trigger moment: the exact situation that brings pain to a head — what they are doing, what happens, what they feel in that instant
- Primary emotion: single most intense feeling, named precisely
- Secondary emotions: what runs underneath
- Emotional arc: where pain starts, how it builds, where it leads unsolved — map as progression not static state
- Emotional stages: distinct stages from start to resolution — maps to chapter and page structure
- Deepest fear: what they are most afraid of, may not say directly
- Hidden desire: what they secretly hope for but may not admit
- Shame and social dimension: embarrassment, hiding, social cost
- Emotional tipping point: what pushes from passive sufferer to active seeker
- Emotional triggers for ads: 3-5 specific states that if activated in one line would make them stop everything

SECTION 3 — THEIR THINKING
Map precisely enough that every objection can be anticipated and every ad angle built from a real belief:
- Belief about cause: what story do they tell themselves about why this problem exists
- Self blame patterns: do they blame themselves, others or circumstances
- Previous solutions tried: for each — what it was, what they hoped, what specifically disappointed them, language they use about it failing
- Objections to trying something new: every reason to hesitate, ranked by frequency
- Objection most likely to kill a sale: identify precisely — gets special treatment downstream
- Ideal outcome in their own words: exact language they use for success
- Contradictions: where what they say conflicts with how they behave — these are the most powerful copywriting insights
- How they evaluate solutions: criteria for deciding if something will work
- What they must believe before buying: specific beliefs that must be in place

SECTION 4 — THEIR BEHAVIOUR
Map with enough precision that every sales decision — where to show up, what to say first, how many touches before the offer — can be derived:
- Where they go for solutions: every platform, community, search term, source. Which they trust most
- Who they trust: authority, peer, someone who was where they are, data — what credibility looks like to them specifically
- Content they consume: formats they engage with fully versus skim
- What makes them stop and pay attention: specific signals — headline type, opening style, format
- What makes them leave: what immediately loses their trust or attention
- Buying decision process: steps from problem-aware to purchase-ready
- How many touches needed: based on their research behaviour
- What triggers them to finally act: specific event, emotion or realisation
- Purchase hesitations at point of buying: last doubt before purchase
- Where intent is highest: platform or context where most ready to receive an offer

SECTION 5 — THE PROBLEM CHAIN
Feeds backend architecture — map full sequence of problems beyond the front end:
- Front end problem: primary problem this idea solves, stated precisely
- What solving it reveals: next problem that immediately emerges
- Next problem: mapped with same depth — what it feels like, language used, urgency
- Deeper problem: root issue underneath that keeps producing surface problems
- Ongoing challenge: continuous challenge a one-time product cannot solve — continuity territory
- Ultimate desired outcome: where they ultimately want to arrive, in their own words
- Full problem chain: every problem in sequence from front end to ultimate outcome

SECTION 6 — SIGNAL STRENGTH
Critical for avoiding downstream mistakes:
- High confidence: multiple sources, high frequency — reliable, build on without hesitation
- Medium confidence: appears but not consistently — use with caution, flag downstream
- Low confidence: appeared once or in limited context — do not build critical decisions here, flag clearly
- Recency flag: which insights come from 2024-2026 versus older material. Older insights are directional context only unless corroborated recently
- Gaps: important questions this research cannot answer
- Where to be most careful: specific downstream sections where low confidence insights would cause most damage

SECTION 7 — IMPLICATIONS
Translate map into direct guidance for each downstream section:
For product building: what product must do/say/feel, emotional journey chapter by chapter, vocabulary to write in, what to never do/say
For sales strategy: how audience likes to be approached, sales style, repellents, touches needed before offer
For sales page: page type, emotional peaks and valleys, what must be established before offer
For ad variations: top 5 angles ranked by pain intensity, specific hooks most likely to stop them, vocabulary that must appear
For backend architecture: next problem after front end, continuity offer that genuinely serves them, premium transformation they would pay for
What to avoid across everything: approaches that would fail or alienate across every section

End with one paragraph: who this audience truly is at their core — not demographics, not their problem — who they are as people and what they are really searching for.`;

const AI_STEPS = [
  'Extracting audience language and vocabulary...',
  'Mapping emotional landscape and trigger moments...',
  'Analysing how they think and reason...',
  'Studying their behaviour patterns...',
  'Mapping the full problem chain...',
  'Assessing signal strength and recency...',
  'Translating insights into downstream implications...',
];

async function runValidation() {
  const idea = document.getElementById('ideaInput').value.trim();
  if (!ANTHROPIC_KEY) { showError('Please enter your Anthropic API key in Settings first.'); return; }
  if (!idea) { showError('Please describe your idea first.'); return; }

  document.getElementById('vResults').classList.remove('on');
  document.getElementById('vError').classList.remove('on');
  document.getElementById('aiSection').classList.remove('active');
  document.getElementById('vLoad').classList.add('on');
  document.getElementById('validateBtn').disabled = true;

  const intv = startProgress('vLog', V_STEPS);
  try {
    const raw = await callClaude(VALIDATE_PROMPT + CONCISE,
      [{ role: 'user', content: `Validate this idea: "${idea}"\n\nSearch thoroughly and return only the JSON object.` }],
      true, 3000, OPUS);
    stopProgress(intv);
    const parsed = parseJSON(raw);

    currentIdea = idea;
    currentReport = parsed;
    currentId = Date.now().toString();
    chatHistory = []; objections = []; valueStack = []; finalOffer = null;
    finalisedOffer = null; audienceIntel = null;

    renderReport(parsed);
    showStrategistSession();

    await dbSave({
      id: currentId,
      user_id: currentUser?.id || 'anonymous',
      idea: currentIdea,
      report: currentReport,
      audience_intel: null,
      finalised_offer: null,
      blueprint: null,
      approved_blueprint: null,
      chapters: [],
      build_complete: false,
      refine_history: [],
      objections: [],
      value_stack: [],
      final_offer: null,
      ad_intelligence: null,
      sales_strategy: null,
      sales_page: null,
      ad_variations: null,
      ad_iterations: [],
      cumulative_learning_log: null,
      backend_architecture: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    document.getElementById('rBtn').style.display = 'block';
    document.getElementById('eBtn').style.display = 'block';
    loadAllHistory();
    runAudienceIntelligence(idea, parsed);

  } catch(err) {
    stopProgress(intv);
    showError(err.message || 'Something went wrong. Please try again.');
    console.error(err);
  }

  document.getElementById('vLoad').classList.remove('on');
  document.getElementById('validateBtn').disabled = false;
}

function renderReport(d) {
  const vC = { 'Build It': '#00a876', 'Refine It': '#d4900a', 'Drop It': '#c0392b' };
  const vI = { 'Build It': '🟢', 'Refine It': '🟡', 'Drop It': '🔴' };
  const pC = { High: '#c0392b', Medium: '#d4900a', Low: 'var(--color-text-tertiary)' };
  const rC = { Active: '#00a876', Ongoing: '#d4900a', Fading: '#e67e22', Dead: 'var(--color-text-tertiary)' };

  const col = vC[d.verdict] || '#888';
  document.getElementById('vbx').style.borderColor = col + '33';
  document.getElementById('vic').textContent = vI[d.verdict] || '⚪';
  document.getElementById('vwd').textContent = d.verdict;
  document.getElementById('vwd').style.color = col;
  document.getElementById('vrn').textContent = d.verdictReason || '';
  document.getElementById('mp').textContent = d.painLevel || '—';
  document.getElementById('mp').style.color = pC[d.painLevel] || '#888';
  document.getElementById('mpd').textContent = (d.painSummary || '').slice(0, 85) + '...';
  document.getElementById('mr').textContent = d.recency?.label || '—';
  document.getElementById('mr').style.color = rC[d.recency?.label] || '#888';
  document.getElementById('mrd').textContent = d.recency?.detail || '';
  document.getElementById('rps').textContent = d.painSummary || '';

  const pl = document.getElementById('rph'); pl.innerHTML = '';
  (d.exactPhrases || []).forEach(p => {
    const li = document.createElement('li'); li.className = 'phi'; li.textContent = p; pl.appendChild(li);
  });

  document.getElementById('rex').textContent = d.gapAnalysis?.existingSolutions || '';
  document.getElementById('rgp').textContent = d.gapAnalysis?.gap || '';

  const al = document.getElementById('rang'); al.innerHTML = '';
  (d.suggestedAngles || []).forEach((a, i) => {
    const c = document.createElement('div'); c.className = 'ac';
    c.innerHTML = `<div class="an">Angle ${String(i + 1).padStart(2, '0')}</div><div class="at">${esc(a.angle)}</div><div class="ar">${esc(a.reason)}</div>`;
    al.appendChild(c);
  });

  const st = document.getElementById('rtgs'); st.innerHTML = '';
  (d.searchedQueries || []).forEach(q => {
    const t = document.createElement('span'); t.className = 'tg'; t.textContent = q; st.appendChild(t);
  });

  document.getElementById('vRes').classList.add('on');
}

function showError(msg) {
  const el = document.getElementById('vError');
  el.textContent = msg; el.classList.add('on');
}

function resetValidate() {
  document.getElementById('vRes').classList.remove('on');
  document.getElementById('vError').classList.remove('on');
  document.getElementById('aiSection').classList.remove('active');
  document.getElementById('ideaInput').value = '';
}

// ── AUDIENCE INTELLIGENCE (Opus — foundation everything draws from) ──
async function runAudienceIntelligence(idea, report) {
  const section = document.getElementById('aiSection');
  section.classList.add('active');
  document.getElementById('aiLoading').style.display = 'block';
  document.getElementById('aiContent').style.display = 'none';
  document.getElementById('aiStatusBadge').textContent = 'Building...';
  document.getElementById('aiStatusBadge').style.color = 'var(--muted)';

  const intv = startProgress('aiLog', AI_STEPS, 4000);

  const context = `IDEA: ${idea}

VALIDATION FINDINGS:
- Verdict: ${report.verdict} — ${report.verdictReason}
- Pain Level: ${report.painLevel}
- Pain Summary: ${report.painSummary}
- Recency: ${report.recency?.label} — ${report.recency?.detail}
- What people say: ${(report.exactPhrases || []).join(' | ')}
- Existing solutions: ${report.gapAnalysis?.existingSolutions}
- The gap: ${report.gapAnalysis?.gap}
- Suggested angles: ${(report.suggestedAngles || []).map(a => a.angle + ': ' + a.reason).join(' | ')}

Now conduct additional research across Reddit, forums, reviews and social platforms to build the complete audience intelligence map. Search for how this specific audience talks about this problem in their own unfiltered words.

Return ONLY raw JSON:
{
  "section1": "Their Language — full text",
  "section2": "Their Emotional State — full text",
  "section3": "Their Thinking — full text",
  "section4": "Their Behaviour — full text",
  "section5": "The Problem Chain — full text",
  "section6": "Signal Strength — full text",
  "section7": "Implications — full text",
  "summary": "One paragraph: who this audience truly is at their core"
}`;

  try {
    const text = await callClaude(AI_PROMPT, [{ role: 'user', content: context }], true, 6000, OPUS);
    stopProgress(intv);
    const parsed = parseJSON(text);
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
    stopProgress(intv);
    document.getElementById('aiLoading').style.display = 'none';
    document.getElementById('aiStatusBadge').textContent = 'Failed — retry';
    document.getElementById('aiStatusBadge').style.color = 'var(--red)';
    console.error('Audience intelligence error:', err);
  }
}
