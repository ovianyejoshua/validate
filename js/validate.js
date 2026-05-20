// ══════════════════════════════════════
// VALIDATE — Opus for validation (second gate,
// weak verdict corrupts everything downstream)
// Opus for audience intelligence (foundation
// everything else draws from)
// ══════════════════════════════════════

const VALIDATE_PROMPT = `You are a ruthlessly honest demand analyst. Determine whether a digital product idea has real market demand using live web search. Search 5-6 times minimum: Reddit frustrations, Google search intent, existing solutions, recent complaints, YouTube/community demand. Be honest. If demand is low say so.

Run at least 5-6 searches:
- Reddit: "site:reddit.com [topic] frustrated struggling problem"
- Pain: "how to [solve the problem]", "[topic] help"
- Solutions: "[topic] course review", "[topic] guide"
- Recent: "[topic] 2025 2026 problem"
- Community: "[topic] tutorial", "best [topic] resource"

Return ONLY raw JSON, no markdown:
{
  "painLevel": "High|Medium|Low",
  "painSummary": "2 sentences maximum",
  "recency": { "label": "Active|Ongoing|Fading|Dead", "detail": "One sentence with specific dates or timeframes found" },
  "exactPhrases": ["exact phrase 1", "exact phrase 2", "exact phrase 3", "exact phrase 4"],
  "gapAnalysis": { "existingSolutions": "What exists and why it falls short. One sentence", "gap": "specific unmet need. One sentence" },
  "suggestedAngles": [
    { "angle": "Specific angle", "reason": "One sentence why stronger based on evidence" },
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

const AI_PROMPT = `Before you begin, read all the research data carefully and completely. Do not start extracting until you have reviewed everything. You are an expert audience psychologist, behavioural researcher and direct response copywriter with deep expertise in extracting consumer insight from raw market data. You have been given market research data about this idea collected from Reddit, YouTube, Google and other internet sources. Your job is to produce a precise, evidence-based audience intelligence map that will be used to validate a business idea, build a product, create a sales strategy, write a sales page, generate ad variations and map a complete backend architecture. Every section of this map feeds a specific downstream function. Accuracy and depth are critical at every level. Every insight must be rooted in what the research actually shows. Do not generalize. Do not invent. Do not assume.
Source weighting: Weight insights from Reddit and direct audience quotes most heavily. Reddit is where people speak unfiltered, without performing for an audience. General articles, expert opinion pieces and branded content should be treated as secondary context only — they tell you what people are told, not what people actually feel and say. When an insight comes from Reddit or a direct quote, note it explicitly. When it comes from an article or secondary source, flag it as such. The platform where the audience is most emotionally raw is the most valuable source for every downstream section — prioritise it accordingly. If the research does not support a section clearly say so explicitly rather than filling it with guesswork.

SECTION 1 — THEIR LANGUAGE
This section feeds the product writing, ad variations and sales page directly. It must be exceptionally granular. Generic vocabulary lists are useless here. Every word and phrase must be specific enough to write an entire product, a sales page and 200 ad variations in this audience's exact voice.
- High frequency phrases: the exact words or phrases appearing repeatedly across multiple sources. Copy them verbatim. Note frequency and source count
- Emotional vocabulary: the specific feeling words they use — not "sad or frustrated" but the exact word. Extract the actual words
- Metaphors and comparisons: how they describe the problem conceptually. What do they compare it to. What images and analogies appear repeatedly
- Sentence structure and rhythm: how long are their sentences. are they fragmented and frustrated or long and detailed. Do they use lists, questions, exclamations — what rhythm do they write and speak in
- Vocabulary level: Is their language technical, casual, emotional, clinical, defeated — be specific
- Power phrases: the specific word combinations with highest emotional weight — these stop scrolls in ads
- Platform differences: how their language shifts between Reddit, YouTube, Google reviews
- Words and phrases to never use: language that would feel foreign, corporate or condescending. Be specific

SECTION 2 — THEIR EMOTIONAL STATE
This section feeds the product emotional arc, the sales page structure and the ad emotional triggers. Map with enough precision that a chapter can move a reader from one state to the next and an ad can activate a specific emotion in one line:
- Trigger moment: the exact situation that brings pain to a head Not generally when they feel it — the exact moment. What are they doing, what happens, what do they feel in that instant
- Primary emotion: the single emotion they feel most intensely and most often. Name it precisely
- Secondary emotions: what runs underneath the primary emotion. The layered feelings that exist alongside the main one
- Emotional arc: where pain starts, how it builds over time, where it leads if the problem stays unsolved — map as progression not static state
- Emotional stages: break the arc into distinct stages from start to resolution — maps to chapter and page structure
- Deepest fear: what they are most afraid of, may not say directly but that drives their behaviour
- Hidden desire: what they secretly hope for but may not admit openly. The outcome they want but feel embarrassed or uncertain to claim
- Shame and social dimension: Is there embarrassment attached to this problem. Do they hide it. What is the social cost of this problem to them
- Emotional tipping point: what pushes from passive sufferer to active seeker
- Emotional triggers for ads: 3-5 specific emotional states that if activated in a single line would make this audience stop everything and pay attention

SECTION 3 — THEIR THINKING
This section feeds the product structure, the objection handling in sales and the ad angles. It must map how this audience reasons precisely enough that every objection can be anticipated and every ad angle built from a real belief or thought pattern:
- Belief about cause: what do they think is responsible for their situation. What story do they tell themselves about why this problem exists
- Self blame patterns: do they blame themselves, others, circumstances or market. How does this affect how they receive solutions
- Previous solutions tried: for each — what it was, what they hoped it would do, what specifically disappointed them, language they use when describing why it failed
- Objections to trying something new: every reason to hesitate before buying, ranked by how frequently they appear in the research
- Objection most likely to kill a sale: identify precisely — gets special treatment downstream
- Ideal outcome in their own words: exact language they use for success looks lik
- Contradictions: where does what they say conflict with what they seem to want or how they behave. Note every contradiction carefully. These are the most powerful insights for copywriting and product design
- How they evaluate solutions: what criteria do they use when deciding whether something will work for them. What makes them lean in versus dismiss
- What they must believe before buying: specific beliefs that must be in place before this audience will commit to a purchase

SECTION 4 — THEIR BEHAVIOUR
This section feeds the sales strategy, platform decisions and the sales sequence. Map with enough precision that every sales decision — where to show up, what to say first, how many touches before the offer — can be derived from it:
- Where they go for solutions: every platform, community, search term, source they use when actively seeking help. Note which they trust most
- Who they trust: what kind of person or source do they find credible. authority, peer, someone who was where they are, data — what credibility looks like to them specifically
- What content they consume: What formats do they engage with fully versus skim. Long form articles, short videos, podcasts, social posts, forums
- What makes them stop and pay attention: the specific signals in content that make this audience pause. A specific type of headline, a specific kind of opening, a specific format
- What makes them leave: what immediately loses their trust or attention
- The buying decision process: how do they move from problem aware to purchase ready. What are the steps. What information do they need at each step
- How many touches needed: based on their research behaviour how many exposures to a solution does this audience typically need before buying
- What triggers them to finally act: the specific event, emotion or realisation that pushes them from considering to buying
- Purchase hesitations at point of buying: what slows them down in the final moment before purchase. What doubt surfaces last
- Where intent is highest: the specific platform, community or context where this audience is most ready to receive an offer

SECTION 5 — THE PROBLEM CHAIN
This section feeds the backend architecture. It must map full sequence of problems this audience faces beyond the front end:
- Front end problem: primary problem this idea solves, stated precisely
- What solving it reveals: when the front end problem is solved what new problem or challenge immediately emerge for this audience
- Next problem: mapped with same depth as the front end problem. what does it feels like, what language do they use for it, how urgent is it
- Deeper problem: the root issue underneath the front end problem that keeps producing surface problems
- Ongoing challenge: what continuous challenge does this audience face that a one-time product cannot solve.  This is continuity territory
- Ultimate desired outcome: where does this audience ultimately want to arrive. The complete transformation beyond what the front end delivers, in their own words
- Full problem chain: map every problem in sequence from front end to ultimate outcome

SECTION 6 — SIGNAL STRENGTH
This section is critical for avoiding downstream mistakes:
- High confidence insights: findings supported by multiple sources, and high frequency mentions across different platforms. These are reliable, build on without hesitation
- Medium confidence: findings that appear but not consistently across sources — use with caution, flag downstream
- Low confidence: findings that appeared once or in limited context — do not build critical decisions here, flag clearly
- Recency flag: note which insights come from 2025-2026 versus older material. Older insights are directional context only unless corroborated recently
- Gaps: important questions this research cannot answer
- Where to be most careful: identify the specific downstream sections where low confidence or outdated insights would cause most damage if acted on incorrectly

SECTION 7 — IMPLICATIONS
Translate map into direct guidance for each downstream section:
For product building: what product must do/say/feel, emotional journey the product must take the reader through chapter by chapter, vocabulary the product must be written in, what the product must never do/say/fee like
For sales strategy: how this audience likes to be approached based on their behaviour and trust  triggers, what sales style suits them, what would immediately repel them, how many touches they need before the offer
For sales page: what kind page type suits this audience - long form, short form, story led, proof heavy or all of them, where the emotional peaks and valleys should fall on the page, what the page must establish before offer is presented
For ad variations: the top 5 angles ranked by pain intensity and emotional charge, the specific hooks most likely to stop this audience, the vocabulary that must appear in winning ads
For backend architecture: the next problem this audience needs solved after front end, what continuity offer would genuinely serves them, what premium transformation they would pay for
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
