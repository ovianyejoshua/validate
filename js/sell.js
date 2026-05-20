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

function toggleSellStage(n) {
  if (!sellStagesUnlocked.includes(n)) return;
  document.getElementById('sstage' + n + 'Body').classList.toggle('open');
}

function unlockSellStage(n) {
  if (!sellStagesUnlocked.includes(n)) sellStagesUnlocked.push(n);
  const status = document.getElementById('sstage' + n + 'Status');
  status.textContent = 'Ready'; status.className = 'stage-status active';
  document.getElementById('sstage' + n + 'Body').classList.add('open');
  const btn = document.getElementById('ss' + n + 'Btn');
  if (btn) btn.style.display = 'block';
  if (n === 4) { const inp = document.getElementById('ss5Input'); if(inp) inp.style.display = 'block'; }
}

function markSellStageDone(n) {
  const status = document.getElementById('sstage' + n + 'Status');
  status.textContent = 'Done ✓'; status.className = 'stage-status done';
  document.getElementById('sstage' + n + 'Body').classList.remove('open');
}

function approveSellStage(n) {
  markSellStageDone(n);
  if (n < 5) unlockSellStage(n + 1);
  if (n === 4) {
    // Also unlock backend which is stage 5
    unlockSellStage(5);
  }
}

function rerunSellStage(n) {
  document.getElementById('ss' + n + 'Result').style.display = 'none';
  const btn = document.getElementById('ss' + n + 'Btn');
  if (btn) { btn.style.display = 'block'; btn.disabled = false; }
  const status = document.getElementById('sstage' + n + 'Status');
  status.textContent = 'Ready'; status.className = 'stage-status active';
}

function copySellOutput(id) {
  const text = document.getElementById(id)?.textContent || '';
  navigator.clipboard.writeText(text).then(() => {
    const btn = event.target;
    btn.textContent = '✓ Copied';
    setTimeout(() => btn.textContent = 'Copy', 2000);
  });
}

function startSellLog(logId, steps, interval) {
  const log = document.getElementById(logId);
  log.innerHTML = '';
  let i = 0;
  const intv = setInterval(() => {
    if (i >= steps.length) { clearInterval(intv); return; }
    log.querySelectorAll('.log-line.latest').forEach(el => el.classList.remove('latest'));
    const line = document.createElement('div');
    line.className = 'log-line latest';
    line.textContent = steps[i++];
    log.appendChild(line);
  }, interval || 3500);
  return intv;
}

// Sliced context builders for each Sell stage
function sellContextStrategy() {
  // Sales strategy: behaviour + thinking + signals + implications
  const aiPart = audienceIntel ? `

AUDIENCE INTELLIGENCE:
${aiSlice('behaviour','thinking','signals','implications','summary')}` : '';
  const chs = chapters || [];
  const productText = chs.map(c => `CHAPTER ${c.number}: ${c.title}\n${c.content}`).join('\n\n---\n\n');
  return baseContext() + aiPart + `

COMPLETED PRODUCT:
${productText || '(Product not yet written)'}`;
}

function sellContextSalesPage() {
  // Sales page: language + emotional + implications
  const aiPart = audienceIntel ? `

AUDIENCE INTELLIGENCE:
${aiSlice('language','emotional','implications','summary')}` : '';
  const chs = chapters || [];
  const productText = chs.map(c => `CHAPTER ${c.number}: ${c.title}\n${c.content}`).join('\n\n---\n\n');
  return baseContext() + aiPart + `

COMPLETED PRODUCT:
${productText || '(Product not yet written)'}`;
}

function sellContextAds() {
  // Ad variations: language + emotional + implications
  const aiPart = audienceIntel ? `

AUDIENCE INTELLIGENCE:
${aiSlice('language','emotional','implications','summary')}` : '';
  return baseContext() + aiPart;
}

function sellContextBackend() {
  // Backend: problemChain + behaviour + implications
  const aiPart = audienceIntel ? `

AUDIENCE INTELLIGENCE:
${aiSlice('problemChain','behaviour','implications','summary')}` : '';
  return baseContext() + aiPart;
}

// sellContext() kept as full context for iteration loop which needs everything
function sellContext() {
  const aiPart = audienceIntel ? `

AUDIENCE INTELLIGENCE (FULL):
${aiSlice('language','emotional','thinking','behaviour','problemChain','signals','implications','summary')}` : '';
  const chs = chapters || [];
  const productText = chs.map(c => `CHAPTER ${c.number}: ${c.title}\n${c.content}`).join('\n\n---\n\n');
  return baseContext() + aiPart + `

COMPLETED PRODUCT:
${productText || '(Product not yet written)'}`;
}

// ══════════════════════════════════════
// SELL STAGE 1 — SALES STRATEGY
// ══════════════════════════════════════
const SS1_SYSTEM = `Before you begin, read all the following inputs carefully and completely. Do not start generating the sales strategy until you have reviewed everything.

You are an expert sales strategist, direct response marketer and consumer psychologist with deep expertise in selling digital products to specific audiences. You have been given full market research, a detailed audience intelligence map, a refined offer and a completed digital product.

Your job is to produce a precise, audience-derived sales strategy governing every sales decision for this product. Not generic advice. Every recommendation rooted in what the research and audience intelligence actually reveals. Do not generalize. Do not invent. Do not assume.

Produce a complete strategy covering:

SECTION 1 — SALES STYLE: Primary sales style, tone, voice, pacing — all derived from audience intelligence.

SECTION 2 — TRUST TRIGGERS: What kind of proof moves them, who they trust, what transparency they need, what makes them believe.

SECTION 3 — REPELLENTS: Hard sell triggers, language landmines, credibility killers, overpromising lines.

SECTION 4 — PLATFORM STRATEGY: Primary platform, secondary platforms, platform-specific approach, where intent is highest.

SECTION 5 — MESSAGE LENGTH AND FORMAT: Long form or short form, format recommendation, structure preference.

SECTION 6 — URGENCY AND SCARCITY: Genuine urgency, legitimate scarcity, what would feel manipulative, cost of inaction framing.

SECTION 7 — OBJECTION HANDLING: Top three objections at point of buying, when to address each, how to address them, the objection most likely to kill the sale.

SECTION 8 — SALES SEQUENCE: Exposures needed, ideal sales sequence mapped out, what content builds most trust, ideal moment to present the offer.

SECTION 9 — SALES ASSETS RECOMMENDATION: For each recommended asset — what it is, why it suits this audience, where it fits, priority level. End with a note that these are recommendations and the user decides.

SECTION 10 — SALES STRATEGY SUMMARY: The single most important thing to get right, the biggest risk, the sales approach in one plain paragraph.

Use bullet points within sections. Where you reference specific audience language or behaviour format it in italics. Be precise and specific throughout.`;

const SS1_STEPS = [
  'Reading audience intelligence map...',
  'Analysing how this audience buys...',
  'Mapping trust triggers and repellents...',
  'Determining platform and format strategy...',
  'Mapping objection handling sequence...',
  'Building complete sales strategy...',
];

async function runSalesStrategy() {
  document.getElementById('ss1Btn').disabled = true;
  document.getElementById('ss1Loading').style.display = 'block';
  const intv = startSellLog('ss1Log', SS1_STEPS);
  try {
    const text = await callClaude(SS1_SYSTEM, [{ role: 'user', content: sellContext() + '\n\nGenerate the complete sales strategy now.' }], false, 6000);
    clearInterval(intv);
    salesStrategy = text;
    document.getElementById('ss1Output').textContent = text;
    document.getElementById('ss1Result').style.display = 'block';
    document.getElementById('ss1Loading').style.display = 'none';
    document.getElementById('ss1Btn').style.display = 'none';
    if (currentId) await dbUpdate(currentId, { sales_strategy: text });
  } catch(e) {
    clearInterval(intv);
    document.getElementById('ss1Loading').style.display = 'none';
    document.getElementById('ss1Btn').disabled = false;
    alert('Error: ' + e.message);
  }
}

// ══════════════════════════════════════
// SELL STAGE 2 — SALES PAGE
// ══════════════════════════════════════
const SS2_SYSTEM = `Before you begin, read all the following inputs carefully and completely. Do not start writing until you have reviewed everything.

You are an expert direct response copywriter with deep expertise in writing high converting sales pages for digital products. You have been given: a detailed audience intelligence map, a refined offer, a completed digital product, and a full sales strategy.

Your job is to write a complete, audience-derived sales page. One job: move the reader to buy.

Before you write, review: the sales style and tone from the sales strategy, the audience's exact vocabulary and emotional state, the top objections and how to handle them, the trust triggers, the repellents, and the single most important thing to get right from the strategy summary.

Write these sections in full:

SECTION 1 — HEADLINE: Three headline options. For each: the headline, which pain/desire it builds from, which intelligence element it draws from, why it would stop this audience. All three must be genuinely strong.

SECTION 2 — OPENING: Confirm the reader is in the right place. Mirror their emotional state. Make them feel understood before anything is sold. No more than three to four short paragraphs. Do not introduce the product yet.

SECTION 3 — PROBLEM SECTION: Articulate their pain better than they can themselves. Their exact language. The deeper frustration underneath. What they have already tried and why it failed.

SECTION 4 — AGITATION: The cost of the problem staying unsolved. What happens if nothing changes. Derive from the emotional arc. Do not manufacture fear the research does not support.

SECTION 5 — SOLUTION INTRODUCTION: Present the product as the answer. Frame it against what they have already tried. Keep it concise — the proof comes later.

SECTION 6 — WHAT IS INSIDE: Every component. For each: what it does for the reader in terms of outcome. Frame against a specific pain or desire. Connect components to objections they had.

SECTION 7 — PROOF SECTION: Use only the proof types the sales strategy identified as effective for this audience. Placeholder proof clearly marked if no real proof yet.

SECTION 8 — OBJECTION HANDLING: Top three objections addressed in the order and manner the strategy recommends. Woven naturally — not an obvious FAQ unless strategy recommends it.

SECTION 9 — OFFER STACK: Every component with its value. Build the stack so total value significantly exceeds the price. Present the price clearly and confidently.

SECTION 10 — CALL TO ACTION: Three CTA options in the audience's language. What happens after they click. Make the next step feel safe and easy.

SECTION 11 — CLOSING ARGUMENT: Two to three sentences summarising what they get. Where they are now versus where this takes them. One final line from the hidden desire section of the intelligence map.

AFTER WRITING — Writer note: recommended headline and why, the most dangerous objection and how the page handles it, any judgment calls made, what real proof would most strengthen this page.

Write the complete sales page now. Every section. In full.`;

const SS2_STEPS = [
  'Reading sales strategy and audience intelligence...',
  'Mapping emotional arc for page structure...',
  'Writing headline options...',
  'Writing opening and problem sections...',
  'Writing agitation and solution...',
  'Writing proof and objection handling...',
  'Writing offer stack and call to action...',
  'Completing closing argument and writer note...',
];

async function runSalesPage() {
  document.getElementById('ss2Btn').disabled = true;
  document.getElementById('ss2Loading').style.display = 'block';
  const intv = startSellLog('ss2Log', SS2_STEPS);
  const context = sellContext() + '\n\nSALES STRATEGY:\n' + (salesStrategy || '');
  try {
    const text = await callClaude(SS2_SYSTEM, [{ role: 'user', content: context + '\n\nWrite the complete sales page now.' }], false, 8000);
    clearInterval(intv);
    salesPage = text;
    document.getElementById('ss2Output').textContent = text;
    document.getElementById('ss2Result').style.display = 'block';
    document.getElementById('ss2Loading').style.display = 'none';
    document.getElementById('ss2Btn').style.display = 'none';
    if (currentId) await dbUpdate(currentId, { sales_page: text });
  } catch(e) {
    clearInterval(intv);
    document.getElementById('ss2Loading').style.display = 'none';
    document.getElementById('ss2Btn').disabled = false;
    alert('Error: ' + e.message);
  }
}

// ══════════════════════════════════════
// SELL STAGE 4 — AD VARIATIONS
// ══════════════════════════════════════
const SS_AV_SYSTEM = `Before you begin, read all the following inputs carefully and completely. Do not start generating until you have reviewed everything.

You are an expert direct response copywriter and paid media strategist with deep expertise in creating high converting ad variations for digital products. You have been given: a detailed audience intelligence map, a refined offer, a completed digital product, a full sales strategy, a completed sales page, and a full ad intelligence research report.

Your job is to generate up to 200 ad variations that combine two sources of intelligence most advertisers never have simultaneously — what the market has already proven works through the ad intelligence report, and what this specific audience actually thinks, feels and says through the audience intelligence map. Most advertisers have one or the other. You have both. Use them together.

Every variation must be traceable back to either a convergence signal from the ad intelligence report, a specific insight from the audience intelligence map, or both. Nothing invented. Nothing generic. One job: give the user a complete, market validated, audience specific testing arsenal.

BEFORE YOU GENERATE ANYTHING
Review carefully:
From the ad intelligence report: highest convergence angles, strongest hook patterns, validated language and vocabulary, proven emotional triggers, winning creative format, gap intelligence, confidence assessment.
From the audience intelligence map: Section 1 (language), Section 2 (emotional state), Section 3 (thinking), Section 7 (implications for ad variations).
From the sales strategy: sales style and tone, repellents, trust triggers, urgency and scarcity levers.

STEP 1 — FORMAT RECOMMENDATION
Cross reference winning creative format from ad intelligence report with how this audience consumes content and sales style. For each format: name and description, market validation from ad intelligence, audience fit from intelligence map, effectiveness rank, production effort, combined priority score, specific guidance on length and structure. Label AD FORMAT RECOMMENDATION.

STEP 2 — MASTER ANGLE BANK
Two tiers:
TIER 1 — MARKET VALIDATED ANGLES: Sourced from ad intelligence report with high or medium convergence. These are proven. For each: angle stated precisely, convergence strength, connection to audience intelligence, emotional trigger, confidence level (market validated plus audience confirmed = highest).
TIER 2 — AUDIENCE INTELLIGENCE ANGLES: Sourced from audience intelligence map without strong market validation. Sub-divide into: Gap angles (identified as missing from competitor advertising — high differentiation potential) and Pure audience angles (emerging entirely from audience research). For each: angle, specific intelligence insight, why it should resonate, risk level.
Label all angles clearly by tier. Label Tier 2 as experiments. Present as MASTER ANGLE BANK.

STEP 3 — GENERATE VARIATIONS
Organise by angle. Within each angle vary: hooks built from validated hook patterns first, lengths, emotional entry points, calls to action, market validated language variations, audience language variations.
For every variation: the complete variation ready to test, tier (market validated or experiment), angle it builds from, specific signal it draws from (ad intelligence/audience intelligence/both), hook pattern used, emotional trigger activated, validated language elements it contains, audience language elements it contains, format, effectiveness rank within cluster.
Volume: Tier 1 angles minimum 25 variations each. Tier 2 gap angles minimum 15 each labeled experiment. Tier 2 pure audience angles minimum 10 each labeled experiment. Total as close to 200 as inputs support. Do not pad.
Language: validated vocabulary from ad intelligence throughout, audience vocabulary from intelligence map throughout, nothing flagged as avoid or repellent in any variation. No two variations identical. Every variation must feel like it was written by someone who knows both what works in this market and who this specific audience is.

STEP 4 — PRIORITIZED TESTING ROADMAP
First round: first 10 variations crossing highest effectiveness with lowest production effort, why each leads. Market validation testing: which tier 1 to prioritize, what positive result looks like, what underperformance of a high convergence angle means. Experiment testing: which tier 2 to test and when, how to structure experiments. Iteration trigger: when to return, exactly what data to bring back.

STEP 5 — INTELLIGENCE INTEGRATION ASSESSMENT
Where market validation and audience intelligence strongly agreed. Where they diverged and how to read results from those variations. Where audience intelligence filled gaps. Where market data corrected assumptions. Single most valuable insight from combining both sources that neither alone would have revealed.

STEP 6 — AFTER GENERATING
Angle predicted strongest and why supported by both sources. Format predicted best. Most important creative decision for this niche. What real proof would most strengthen the arsenal. Honest assessment: where strongest, where most dependent on testing, what makes next iteration significantly more powerful.`;

const SS_AV_STEPS = [
  'Reading ad intelligence report and audience map...',
  'Determining validated ad formats...',
  'Building master angle bank — tier 1 and tier 2...',
  'Generating tier 1 market validated variations...',
  'Generating tier 2 experiment variations...',
  'Building prioritized testing roadmap...',
  'Assessing intelligence integration...',
];

// ══════════════════════════════════════
// SELL STAGE 3 — AD INTELLIGENCE RESEARCH
// ══════════════════════════════════════
const SS3_SYSTEM = `Before you begin, read all the following inputs carefully and completely. Do not start researching until you have reviewed everything.

You are an expert paid media analyst, creative strategist and market intelligence researcher with deep expertise in extracting actionable advertising intelligence from publicly visible ad platforms. You have been given the refined offer, audience intelligence map and sales strategy.

You are not looking for ads that exist. You are looking for CONVERGENCE — the same angles, hooks, formats and creative approaches appearing independently across multiple different advertisers. Convergence is proof the market has validated something.

RESEARCH SCOPE: Search Facebook Ad Library and publicly visible ad content using multiple query variations — product type, pain point, audience description, transformation promised. Cast wide, narrow ruthlessly.

EXTRACTION 1 — ANGLE CONVERGENCE: For each angle: state it precisely, how many advertisers use it independently, longevity, exact language used, emotional trigger, why it works for this audience, convergence strength (high=5+ advertisers, medium=3-4, low=1-2). Rank by convergence strength.

EXTRACTION 2 — HOOK PATTERN CONVERGENCE: For each hook pattern: describe precisely, specific examples from real ads in italics, how many advertisers use it, what stops this audience, emotional state in first 3 seconds, convergence strength, hook length. Note which appear in longest running ads.

EXTRACTION 3 — LANGUAGE AND VOCABULARY CONVERGENCE: Exact words and phrases appearing repeatedly. Power words, verbatim repetitions, CTA language, what successful advertisers conspicuously avoid. Note whether language already appears in audience intelligence.

EXTRACTION 4 — EMOTIONAL TRIGGER CONVERGENCE: Specific emotion triggered, how activated, how many advertisers use it, when in ad it appears, connection to audience intelligence emotional state, convergence strength, early or late.

EXTRACTION 5 — CREATIVE FORMAT CONVERGENCE: Dominant format with proportions. Video: style, length, opening, captions, production quality, pacing. Static image: image vs text ratio, what depicted, testimonials, color patterns, text overlay. Text only: length, structure, opening line, line breaks, emoji. End with: strongest format, strongest longevity signal, format to test first, what winning creative looks and feels like.

EXTRACTION 6 — OFFER AND POSITIONING CONVERGENCE: How offers framed, primary value proposition, price handling, urgency mechanisms, proof elements, CTA framing, convergence strength.

EXTRACTION 7 — GAP INTELLIGENCE: Angles no advertiser uses despite audience intelligence suggesting resonance. Missing emotional triggers. Ignored segments. Absent formats that work in adjacent niches. Language from audience intelligence not reflected in any ad. For each gap: what is missing, why it likely works, risk, whether to test alongside proven angles or after.

SYNTHESIS: Single strongest validated angle with evidence. Single strongest hook with evidence. Single strongest format. Language that must appear. Emotional triggers and order. Three most important gaps. What a market validated winning ad looks like from first impression to CTA — described completely.

INTELLIGENCE CONFIDENCE ASSESSMENT: How many advertisers found, longevity of longest running ads, where intelligence is strongest, where thinnest, what only real testing reveals. If few advertisers found say so clearly.

Present with clear headers, bullet points. Quote ads in italics. End with one paragraph: what winning advertising looks like in this niche based entirely on what the market has already validated.`;

const SS3_STEPS = [
  'Searching Facebook Ad Library for this niche...',
  'Finding advertisers running long term campaigns...',
  'Identifying angle convergence across advertisers...',
  'Extracting hook patterns from top performers...',
  'Analysing creative format distribution...',
  'Mapping language and vocabulary patterns...',
  'Identifying emotional trigger convergence...',
  'Extracting gap intelligence...',
  'Synthesising complete market intelligence picture...',
];

async function runAdIntelligence() {
  document.getElementById('ss3Btn').disabled = true;
  document.getElementById('ss3Loading').style.display = 'block';
  const intv = startSellLog('ss3Log', SS3_STEPS, 3800);
  const aiPart = audienceIntel ? '\n\nAUDIENCE INTELLIGENCE:\n' + aiSlice('language','emotional','behaviour','implications','summary') : '';
  const context = baseContext() + aiPart + '\n\nSALES STRATEGY:\n' + (salesStrategy || '(Not yet generated)');
  try {
    const text = await callClaude(SS3_SYSTEM, [{ role: 'user', content: context + '\n\nResearch active advertisers in this niche and produce the complete ad intelligence report now.' }], true, 8000);
    clearInterval(intv);
    adIntelligence = text;
    document.getElementById('ss3Output').textContent = text;
    document.getElementById('ss3Result').style.display = 'block';
    document.getElementById('ss3Loading').style.display = 'none';
    document.getElementById('ss3Btn').style.display = 'none';
    if (currentId) await dbUpdate(currentId, { ad_intelligence: text });
  } catch(e) {
    clearInterval(intv);
    document.getElementById('ss3Loading').style.display = 'none';
    document.getElementById('ss3Btn').disabled = false;
    alert('Error: ' + e.message);
  }
}

async function runAdVariations() {
  document.getElementById('ss4Btn').disabled = true;
  document.getElementById('ss4Loading').style.display = 'block';
  const intv = startSellLog('ss4Log', SS_AV_STEPS);
  const context = sellContext() + '\n\nSALES STRATEGY:\n' + (salesStrategy||'') + '\n\nSALES PAGE:\n' + (salesPage||'');
  try {
    const text = await callClaude(SS_AV_SYSTEM, [{ role: 'user', content: context + '\n\nGenerate the complete ad variation arsenal now.' }], false, 8000);
    clearInterval(intv);
    adVariations = text;
    document.getElementById('ss4Output').textContent = text;
    document.getElementById('ss4Result').style.display = 'block';
    document.getElementById('ss4Loading').style.display = 'none';
    document.getElementById('ss4Btn').style.display = 'none';
    if (currentId) await dbUpdate(currentId, { ad_variations: text });
  } catch(e) {
    clearInterval(intv);
    document.getElementById('ss4Loading').style.display = 'none';
    document.getElementById('ss4Btn').disabled = false;
    alert('Error: ' + e.message);
  }
}

// ══════════════════════════════════════
// SELL STAGE 5 — AD ITERATION LOOP
// ══════════════════════════════════════
const SS5_SYSTEM = `Before you begin, read all the following inputs carefully and completely.

You are an expert paid media strategist, direct response copywriter and consumer behaviour analyst. You have been given: original ad variations tested, performance data (may be raw metrics, human description, or both — accept and interpret either), audience intelligence map, sales strategy, and cumulative learning log from previous iterations if one exists.

Your job is to analyze what the market revealed, extract winning DNA, update the cumulative learning log and generate the next stronger round.

STEP 1 — PERFORMANCE ANALYSIS: Analyse all performance data provided. Identify top performers, weakest performers, surprising results. If metrics and human description conflict, note it. Label: PERFORMANCE ANALYSIS.

STEP 2 — WINNING DNA EXTRACTION: For every top performing variation examine: angle, hook, language, length, emotional trigger, call to action, format. Identify the single strongest angle, hook pattern, resonant vocabulary, best emotional entry point, anything surprising. Label: WINNING DNA.

STEP 3 — LOSING PATTERN ANALYSIS: Examine underperformers. Identify angles to retire, hook patterns to avoid, vocabulary producing no response, emotional triggers that fell flat. Label: LOSING PATTERNS.

STEP 4 — UPDATE CUMULATIVE LEARNING LOG: Update the running record. Track: Confirmed Winners (angles, hooks, vocabulary, emotional triggers, formats confirmed by real data), Confirmed Losers (retired), Open Questions (untested angles, raised hypotheses), Audience Intelligence Updates (what real market behaviour revealed that research did not show). If a log exists from previous iterations update it — do not start fresh. Label: CUMULATIVE LEARNING LOG — ITERATION [N].

STEP 5 — GENERATE NEXT ROUND: Build from winners. Retire losers. Introduce 1-2 controlled experiments from open questions — label these clearly as EXPERIMENT. Minimum 30 variations per confirmed winning angle. All confirmed resonant vocabulary throughout. No retired vocabulary.

STEP 6 — TESTING ROADMAP FOR THIS ROUND: First 10 to test, experiments to watch, metrics to track, iteration trigger, what to bring back.

STEP 7 — BRIEF NOTE: Most important insight this iteration revealed, how intelligence map should be updated, where next iteration finds biggest gains, honest assessment of how much stronger this round is.`;

const SS5_STEPS = [
  'Analysing performance data...',
  'Extracting winning DNA from top performers...',
  'Identifying losing patterns to retire...',
  'Updating cumulative learning log...',
  'Generating next round from confirmed winners...',
  'Building testing roadmap...',
];

async function runAdIteration() {
  const perfData = document.getElementById('performanceData').value.trim();
  if (!perfData) { alert('Please enter your performance data first.'); return; }
  document.getElementById('ss5Btn').disabled = true;
  document.getElementById('ss5Loading').style.display = 'block';
  document.getElementById('ss5Result').style.display = 'none';
  const intv = startSellLog('ss5Log', SS5_STEPS);
  const iterNum = adIterations.length + 1;
  const context = sellContext()
    + '\n\nSALES STRATEGY:\n' + (salesStrategy||'')
    + '\n\nORIGINAL AD VARIATIONS:\n' + (adVariations||'')
    + (cumulativeLearningLog ? '\n\nCUMULATIVE LEARNING LOG FROM PREVIOUS ITERATIONS:\n' + cumulativeLearningLog : '')
    + '\n\nPERFORMANCE DATA FROM TESTING:\n' + perfData
    + `\n\nThis is iteration ${iterNum}. Analyse, extract winning DNA, update cumulative log, generate next round.`;
  try {
    const text = await callClaude(SS5_SYSTEM, [{ role: 'user', content: context }], false, 8000);
    clearInterval(intv);
    adIterations.push({ iteration: iterNum, data: perfData, result: text });
    // Extract and update cumulative learning log
    // Extract and update cumulative learning log
    const logStart = text.indexOf('CUMULATIVE LEARNING LOG');
    if (logStart > -1) {
      const logEnd = text.indexOf('STEP 5', logStart);
      cumulativeLearningLog = logEnd > -1 ? text.slice(logStart, logEnd).trim() : text.slice(logStart).trim();
    }
    document.getElementById('ss5OutputTitle').textContent = 'Iteration ' + iterNum + ' — Analysis & Next Round';
    document.getElementById('ss5Output').textContent = text;
    document.getElementById('ss5Result').style.display = 'block';
    document.getElementById('ss5Loading').style.display = 'none';
    document.getElementById('iterationCount').textContent = 'Iteration ' + iterNum + ' complete';
    document.getElementById('performanceData').value = '';
    document.getElementById('ss5Btn').disabled = false;
    if (currentId) await dbUpdate(currentId, { ad_iterations: adIterations, cumulative_learning_log: cumulativeLearningLog });
  } catch(e) {
    clearInterval(intv);
    document.getElementById('ss5Loading').style.display = 'none';
    document.getElementById('ss5Btn').disabled = false;
    alert('Error: ' + e.message);
  }
}

function runAnotherIteration() {
  document.getElementById('ss5Result').style.display = 'none';
  document.getElementById('performanceData').value = '';
  document.getElementById('ss5Btn').disabled = false;
  document.getElementById('ss5Btn').style.display = 'block';
}

// ══════════════════════════════════════
// SELL STAGE 6 — BACKEND ARCHITECTURE
// ══════════════════════════════════════
const SS6_SYSTEM = `Before you begin, read all the following inputs carefully and completely. Do not start generating the backend architecture until you have reviewed everything.

You are an expert business strategist, digital product architect and direct response marketer. You have been given: full market research, detailed audience intelligence map, refined offer and completed front end product, full sales strategy, and cumulative learning log from ad iterations if available.

Your job is to map out a complete backend architecture derived entirely from what the inputs reveal about this audience — what they need next, what they would pay for, what keeps them engaged, and what their ultimate desired outcome looks like beyond the front end.

Not generic upsell advice. Every recommendation rooted in what the research, audience intelligence and real market behaviour actually reveals. Do not invent. Do not assume.

STEP 1 — AUDIENCE NEXT PROBLEM MAP: From the problem chain in the audience intelligence, identify: problem that emerges immediately after front end is solved, deeper problem underneath the front end, ongoing challenge a one-time product cannot solve, ultimate desired outcome, what they have demonstrated willingness to pay for, gaps between where front end leaves them and where they want to be. Every backend recommendation must connect to a problem identified here.

SECTION 1 — DOWNSELL: Barrier to purchase for non-buyers, lower ticket offer that removes it, format and price point, how it leads back to front end. For each: product name and description, barrier it removes, problem it solves, format and price, how it connects back, priority.

SECTION 2 — UPSELLS: What they need immediately after receiving front end, what makes front end more effective, implementation gap, higher ticket offer for most committed segment. For each: product name, why it is natural next step, problem it addresses, format, price range, where in purchase flow, priority.

SECTION 3 — CONTINUITY: Ongoing challenge never solved by one-time product, what they need consistently, format and monthly price, what keeps them subscribed, retention risk and mitigation. For each: product name, ongoing need served, format and price, core ongoing value, retention risk, priority.

SECTION 4 — BACKEND PRODUCTS: Ultimate transformation beyond front end, deeper problem beneath everything, what they would invest significantly in, format for high ticket. For each: product name, deep transformation, problem addressed, format and price, who it is for, how customer journey leads here, priority.

SECTION 5 — BUNDLE OPPORTUNITIES: Natural product combinations, bundle that serves specific segment, compelling price point, best entry point bundle. For each: bundle name and contents, audience segment, why together, price point and saving, where in journey.

SECTION 6 — PREMIUM TIER: Most committed segment's ultimate desire, what justifies premium price, format at highest tier. For premium tier: name and description, ultimate transformation, who it is for, price range, what makes it worth it, how entire journey leads here.

STEP 2 — COMPLETE BACKEND MAP: Present full architecture as customer journey from first touch to premium tier. For each stage: product, price point, problem solved, natural next step.

STEP 3 — REVENUE PROJECTION: What architecture looks like with 100 front end customers, typical conversion rates for this type of offer, total revenue per customer across full architecture, biggest revenue opportunity, quickest win.

AFTER GENERATING — Note: single biggest backend opportunity, quickest win to build first, longest term highest value play, honest assessment of where architecture is strongest.`;

const SS6_STEPS = [
  'Mapping audience next problem chain...',
  'Designing downsell for non-buyers...',
  'Designing upsells for buyers...',
  'Building continuity offer...',
  'Mapping backend products and premium tier...',
  'Assembling complete customer journey map...',
  'Building revenue framework...',
];

async function runBackendArchitecture() {
  document.getElementById('ss6Btn').disabled = true;
  document.getElementById('ss6Loading').style.display = 'block';
  const intv = startSellLog('ss6Log', SS6_STEPS);
  const context = sellContext()
    + '\n\nSALES STRATEGY:\n' + (salesStrategy||'')
    + (cumulativeLearningLog ? '\n\nCUMULATIVE LEARNING LOG FROM AD ITERATIONS:\n' + cumulativeLearningLog : '');
  try {
    const text = await callClaude(SS6_SYSTEM, [{ role: 'user', content: context + '\n\nGenerate the complete backend architecture now.' }], false, 8000);
    clearInterval(intv);
    backendArchitecture = text;
    document.getElementById('ss6Output').textContent = text;
    document.getElementById('ss6Result').style.display = 'block';
    document.getElementById('ss6Loading').style.display = 'none';
    document.getElementById('ss6Btn').style.display = 'none';
    if (currentId) await dbUpdate(currentId, { backend_architecture: text });
  } catch(e) {
    clearInterval(intv);
    document.getElementById('ss6Loading').style.display = 'none';
    document.getElementById('ss6Btn').disabled = false;
    alert('Error: ' + e.message);
  }
}

// ══════════════════════════════════════
// SELL UNLOCK + RESTORE
// ══════════════════════════════════════
function unlockSell() {
  document.getElementById('sellLocked').style.display = 'none';
  document.getElementById('sellReady').style.display = 'block';
  const tab = document.getElementById('tab-sell');
  if (tab) { tab.disabled = false; tab.style.opacity = '1'; tab.style.cursor = 'pointer'; }
}

function restoreSellState(entry) {
  if (entry.ad_intelligence) {
    adIntelligence = entry.ad_intelligence;
    document.getElementById('ss3Output').textContent = adIntelligence;
    document.getElementById('ss3Result').style.display = 'block';
    document.getElementById('ss3Btn').style.display = 'none';
    markSellStageDone(3); unlockSellStage(4);
  }
  if (entry.sales_strategy) {
    salesStrategy = entry.sales_strategy;
    document.getElementById('ss1Output').textContent = salesStrategy;
    document.getElementById('ss1Result').style.display = 'block';
    document.getElementById('ss1Btn').style.display = 'none';
    markSellStageDone(1); unlockSellStage(2);
  }
  if (entry.sales_page) {
    salesPage = entry.sales_page;
    document.getElementById('ss2Output').textContent = salesPage;
    document.getElementById('ss2Result').style.display = 'block';
    document.getElementById('ss2Btn').style.display = 'none';
    markSellStageDone(2); unlockSellStage(3);
  }
  if (entry.ad_variations) {
    adVariations = entry.ad_variations;
    document.getElementById('ss4Output').textContent = adVariations;
    document.getElementById('ss4Result').style.display = 'block';
    document.getElementById('ss4Btn').style.display = 'none';
    markSellStageDone(3); unlockSellStage(4);
    document.getElementById('ss5Input').style.display = 'block';
  }
  if (entry.ad_iterations?.length) {
    adIterations = entry.ad_iterations;
    cumulativeLearningLog = entry.cumulative_learning_log || null;
    const last = adIterations[adIterations.length - 1];
    document.getElementById('iterationCount').textContent = 'Iteration ' + adIterations.length + ' complete';
    document.getElementById('ss5OutputTitle').textContent = 'Iteration ' + last.iteration + ' — Analysis & Next Round';
    document.getElementById('ss5Output').textContent = last.result;
    document.getElementById('ss5Result').style.display = 'block';
    unlockSellStage(5);
  }
  if (entry.backend_architecture) {
    backendArchitecture = entry.backend_architecture;
    document.getElementById('ss6Output').textContent = backendArchitecture;
    document.getElementById('ss6Result').style.display = 'block';
    document.getElementById('ss6Btn').style.display = 'none';
    markSellStageDone(5);
  }
}

// ══════════════════════════════════════
// EXPORT ALL SELL ASSETS
// ══════════════════════════════════════
function exportSellAssets() {
  const fo = finalisedOffer || {};
  let content = `SELL ASSETS EXPORT\n${fo.productName || 'Product'}\n${'='.repeat(50)}\n\n`;
  if (salesStrategy) content += `SALES STRATEGY\n${'='.repeat(50)}\n${salesStrategy}\n\n`;
  if (salesPage) content += `SALES PAGE\n${'='.repeat(50)}\n${salesPage}\n\n`;
  if (adIntelligence) content += `AD INTELLIGENCE RESEARCH\n${'='.repeat(50)}\n${adIntelligence}\n\n`;
  if (adVariations) content += `AD VARIATIONS\n${'='.repeat(50)}\n${adVariations}\n\n`;
  if (adIterations.length) {
    content += `AD ITERATION LOG\n${'='.repeat(50)}\n`;
    adIterations.forEach(it => { content += `\nITERATION ${it.iteration}:\n${it.result}\n`; });
    content += '\n';
  }
  if (cumulativeLearningLog) content += `CUMULATIVE LEARNING LOG\n${'='.repeat(50)}\n${cumulativeLearningLog}\n\n`;
  if (backendArchitecture) content += `BACKEND ARCHITECTURE\n${'='.repeat(50)}\n${backendArchitecture}\n\n`;
  const blob = new Blob([content], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `sell-assets-${(fo.productName||'product').replace(/[^a-z0-9]/gi,'-')}.txt`;
  a.click();
}
