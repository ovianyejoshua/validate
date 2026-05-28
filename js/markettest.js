// ══════════════════════════════════════
// MARKET TEST
// Pre-order page: Sonnet (execution of clear brief)
// Test ad: Sonnet (execution of clear brief)
// Results analysis: Sonnet (rules-based diagnosis)
// ══════════════════════════════════════

let marketTestPage = null;
let marketTestAd = null;
let marketTestResults = null;
let marketTestPassed = false;
let marketTestStagesUnlocked = [1];

// ── UI Helpers ──
function toggleMarketStage(n) {
  if (!marketTestStagesUnlocked.includes(n)) return;
  document.getElementById('mstage' + n + 'Body').classList.toggle('open');
}

function unlockMarketStage(n) {
  if (!marketTestStagesUnlocked.includes(n)) marketTestStagesUnlocked.push(n);
  const status = document.getElementById('mstage' + n + 'Status');
  status.textContent = 'Ready'; status.className = 'stage-status active';
  document.getElementById('mstage' + n + 'Body').classList.add('open');
  const btn = document.getElementById('mt' + n + 'Btn');
  if (btn) btn.style.display = 'block';
}

function markMarketStageDone(n) {
  const status = document.getElementById('mstage' + n + 'Status');
  status.textContent = 'Done ✓'; status.className = 'stage-status done';
  document.getElementById('mstage' + n + 'Body').classList.remove('open');
}

function marketTestContext() {
  const aiPart = audienceIntel ? '\n\nAUDIENCE INTELLIGENCE:\n' + aiSlice('language','emotional','thinking','behaviour','implications','summary') : '';
  return baseContext() + aiPart;
}

function skipMarketTest() {
  document.getElementById('mtSkipConfirm').style.display = 'block';
}

function confirmSkipMarketTest() {
  unlockBuildFromMarketTest(false);
}

function unlockBuildFromMarketTest(validated) {
  const buildTab = document.getElementById('tab-build');
  if (buildTab) {
    buildTab.disabled = false;
    buildTab.style.opacity = '1';
    buildTab.style.cursor = 'pointer';
  }

  const msg = document.getElementById('mtBuildUnlockMsg');
  if (msg) {
    msg.style.display = 'block';
    msg.innerHTML = validated
      ? '<div class="mt-validated-msg">✓ Market validated — Build is unlocked. Real people paid for this before it existed. Build with confidence.</div>'
      : '<div class="mt-skip-msg">Build unlocked. You chose to skip the market test. You can always return here before building.</div>';
  }

  if (currentId) dbUpdate(currentId, { market_test_passed: validated });
  loadAllHistory();
}

// ══════════════════════════════════════
// STAGE 1 — PRE-ORDER LANDING PAGE
// ══════════════════════════════════════
const MT1_SYSTEM = `Before you begin, read all the following inputs carefully and completely. Do not start writing until you have reviewed everything.

You are an expert direct response copywriter specializing in pre-launch and pre-order pages for digital products. You have been given the following inputs:
- A refined offer
- A detailed audience intelligence map

Your job is to write a simple, focused pre-order landing page. This is not a full sales page. It has one job and one job only: communicate the offer clearly and compellingly enough that a real person who has never heard of this product will pay for it before it exists.

Every word on this page must earn its place. Nothing exists to impress. Nothing exists to fill space. Every element serves the single goal of converting a stranger into a paying pre-order customer.

The product does not exist yet. The audience knows this. Your job is to make the promise so clear, the pain so accurately named and the transformation so believable that paying now feels like the obvious decision.

BEFORE YOU WRITE
Review the following before a single word of the page:
- The highest intensity pain from the audience intelligence map — this governs the headline and opening
- The exact vocabulary the audience uses — every word on this page must feel like it came from them
- The emotional trigger moment — the specific situation where the pain peaks. This is where the page opens
- The ideal outcome in their own words — this is what the page is selling toward
- The objections most likely to kill a pre-order specifically — not just buying objections but pre-order specific hesitations. Why would someone not pay for something that doesn't exist yet
- The hidden desire — what they secretly want beyond the stated outcome. This is what the closing argument speaks to

Only begin writing when you have a complete picture of all of the above.

THE PAGE STRUCTURE
This page has seven elements. Nothing more. Nothing less. Every element is mandatory.

Element 1 — Headline
Write three headline options. For each provide:
- The headline itself
- Which specific pain, desire or emotional trigger from the audience intelligence it is built from
- Why it would stop this specific audience

Headline requirements:
- Must name the pain or the transformation with enough specificity that the right person immediately recognizes themselves
- Must use the audience's exact vocabulary
- Must create enough tension or desire that the next logical action is to keep reading
- Must be honest — no claim that cannot be delivered
- Maximum fifteen words. Shorter is almost always stronger

After presenting all three options recommend the strongest one and explain precisely why.

Element 2 — Opening Paragraph
One paragraph. Three to five sentences maximum.
This paragraph has one job: make the reader feel so precisely understood that they lean forward.
Requirements:
- Open inside their experience. Not with a question. Not with a statistic. Inside the specific moment where the pain is most acute — derived from the trigger moment in the audience intelligence map
- Use their exact language throughout. Every phrase should feel like something they have said or thought
- Do not introduce the product yet. Do not make any claims yet. Just make them feel seen with surgical precision
- End the paragraph in a way that makes the next section feel inevitable

Element 3 — The Problem Statement
Two to three short paragraphs.
Name the problem precisely. Not broadly. The specific version of this problem this specific audience experiences.
Requirements:
- Articulate the pain better than they can themselves — use what the audience intelligence revealed about how they think and feel about this problem
- Reference what they have already tried and why it failed — derived from the previous solutions section of the audience intelligence map
- Name the real cost of the problem continuing — not manufactured fear but the genuine consequence the research revealed
- Use their vocabulary throughout. Where specific phrases from the research belong here use them directly
- Do not exaggerate. Do not manufacture urgency. This audience will feel inauthenticity immediately

Element 4 — The Product Introduction and Promise
Two to three short paragraphs.
Requirements:
- Name the product clearly
- State what it is in one sentence — format, what it contains, how it is delivered
- State the primary transformation it delivers in the audience's own language
- Connect it directly to the specific problem just named
- State when they will receive it — be specific and honest
- Do not oversell. Do not list every feature. This is an introduction not a full pitch

Element 5 — What They Get
A focused list of every component of the offer. For each component provide:
- What it is named — in the audience's vocabulary where possible
- What it does for them specifically — the outcome it produces
- Why it matters for this specific audience — connect to a pain, objection or desire from the intelligence map
Requirements:
- Every component must feel like it was built specifically for this person because it was
- Do not list components generically
- Frame components as solutions to the objections and pains already named
- Keep each component description concise — two to three sentences maximum

Element 6 — Pre-Order Trust Stack
This element is unique to pre-order pages. The reader is being asked to pay for something that does not exist yet.
Address the following directly and honestly:

Who is behind this:
- Who is creating this product
- Why they are qualified or positioned to deliver on this promise
- Keep it brief and honest — do not manufacture credibility that does not exist

Why pre-order:
- Why is this being offered before it is built
- What does the pre-order make possible — frame it honestly
- What does the pre-order customer get that a later buyer will not

The delivery commitment:
- Exactly when the product will be delivered
- What happens if the timeline changes

The guarantee:
- What happens if they pre-order and the product is not delivered or does not match the promise
- A clear refund commitment removes the biggest pre-order objection

Requirements:
- Every element must be honest. A pre-order page that overpromises destroys trust permanently
- Use plain direct language. This is not a place for copywriting flair — it is a place for honest commitment
- Address the pre-order specific objection directly

Element 7 — Call To Action and Closing
Requirements:
Call to action button — write three options:
- Each in the audience's natural language
- Each connecting the action to the outcome not just the mechanics
- Recommend the strongest option and explain why

Closing argument:
- Two to three sentences maximum
- Remind them of where they are now and where this product takes them
- Address the final hesitation
- End with a single line derived from the hidden desire section of the intelligence map

Urgency if legitimate:
- If a genuine reason to act now exists state it clearly
- If no legitimate urgency exists do not manufacture it

AFTER WRITING
Provide a brief note covering:
- The headline recommended and the specific reason it is strongest for this audience
- The pre-order objection considered most dangerous and how the page handles it
- What would most strengthen this page
- One honest assessment — where is this page strongest and where is it most dependent on the product delivering exactly what is promised

Write the complete pre-order page now. All seven elements in full.`;

const MT1_STEPS = [
  'Reading audience intelligence map...',
  'Identifying highest intensity pain angle...',
  'Writing headline options...',
  'Writing opening and problem statement...',
  'Writing product introduction and offer stack...',
  'Building pre-order trust stack...',
  'Writing call to action and closing...',
];

async function generatePreOrderPage() {
  document.getElementById('mt1Btn').disabled = true;
  document.getElementById('mt1Loading').style.display = 'block';
  const intv = startSellLog('mt1Log', MT1_STEPS);
  try {
    const text = await callClaude(
      MT1_SYSTEM,
      [{ role: 'user', content: marketTestContext() + '\n\nWrite the complete pre-order landing page now. All seven elements in full.' }],
      false, 6000, SONNET
    );
    clearInterval(intv);
    marketTestPage = text;
    document.getElementById('mt1Output').textContent = text;
    document.getElementById('mt1Result').style.display = 'block';
    document.getElementById('mt1Loading').style.display = 'none';
    document.getElementById('mt1Btn').style.display = 'none';
    if (currentId) await dbUpdate(currentId, { market_test_page: text });
  } catch(e) {
    clearInterval(intv);
    document.getElementById('mt1Loading').style.display = 'none';
    document.getElementById('mt1Btn').disabled = false;
    alert('Error: ' + e.message);
  }
}

function approveMT1() {
  markMarketStageDone(1);
  unlockMarketStage(2);
}

// ══════════════════════════════════════
// STAGE 2 — TEST AD
// ══════════════════════════════════════
const MT2_SYSTEM = `Before you begin, read all the following inputs carefully and completely. Do not start writing until you have reviewed everything.

You are an expert direct response copywriter specializing in paid social advertising for digital products. You have been given the following inputs:
- A refined offer
- A detailed audience intelligence map
- The pre-order landing page

Your job is to write one single test ad. Not variations. Not options. One ad built from the single strongest pain angle in the audience intelligence map.

This ad has one job: stop a real person mid-scroll, make them feel their pain so precisely named that they have no choice but to click through to the pre-order page.

This ad is not trying to close a sale. The page does that. This ad is trying to earn one click from the right person. Every word serves that single goal.

The $50 market test lives or dies on this ad. If the hook does not stop the scroll nothing else matters. Write accordingly.

BEFORE YOU WRITE
Review the following before a single word of the ad:
- Section 1 of the audience intelligence map — Their Language. Every word in this ad must come from here
- Section 2 — Their Emotional State. Specifically the trigger moment, the primary emotion and the emotional tipping point. The ad opens inside one of these
- Section 7 — Implications for ad variations. The top angles ranked by pain intensity. The single highest intensity angle is what this ad is built from
- The pre-order landing page headline — the ad and the page must feel continuous
- The hidden desire — the ad may open with pain but it closes pointing toward this

The single highest intensity pain angle from the audience intelligence is the foundation of this ad. Identify it precisely before writing a single word. State it clearly to yourself first. Then build the ad around it.

Only begin writing when you know exactly which angle you are working from and why it is the strongest one available.

THE AD STRUCTURE
This ad has four parts. Every part is mandatory.

Part 1 — The Hook
The first line. The single most important line in the entire ad.
Write three hook options. For each provide:
- The hook itself
- Which specific pain, trigger moment or emotional state it is built from
- Why it would stop this specific audience mid-scroll
- What emotion it activates in the first three seconds

Hook requirements:
- Must be built from the exact language this audience uses — not paraphrased, not cleaned up, not made more polished
- Must activate an emotion immediately — pain, recognition, curiosity, fear of missing out, relief. One of these. Not a blend
- Must be specific enough that the right person thinks — this is about me
- Must create a pattern interrupt
- Maximum two sentences. One is often stronger
- Must not make a claim that cannot be immediately supported in the body

After presenting all three options recommend the strongest one and explain precisely why.

Part 2 — The Body
Three to five short paragraphs. Mobile optimized — short sentences, line breaks between every paragraph, no walls of text.
Requirements:
- Open by expanding the pain the hook introduced. Go one layer deeper
- Name what they have already tried and why it failed — briefly. One sentence
- Introduce the product as the specific answer to the specific pain just described
- State the primary transformation in one clear sentence — where they are now versus where this takes them. Use their exact language for both states
- Address the pre-order reality honestly and briefly — this is coming, here is when, here is why acting now makes sense
- Every sentence must move the reader forward. No sentence exists for atmosphere
- Use the audience's vocabulary throughout
- Never use language flagged as avoid in the audience intelligence map

Part 3 — The Call To Action
One to two sentences maximum.
Requirements:
- Tell them exactly what to do and exactly what happens when they do it
- Frame the action in terms of the outcome not the mechanics
- Use language that feels natural to this audience
- Create a sense of forward momentum
- If legitimate urgency exists state it briefly and honestly

Part 4 — Image or Visual Direction
Provide:
- The primary visual concept — what the image or video thumbnail should show
- The emotional tone of the visual
- Text overlay if any
- What to avoid visually
- Whether a static image or video thumbnail suits this audience better and why
- One specific image description concrete enough to actually use

THE COMPLETE AD
After presenting all parts separately, present the complete ad as it would appear in a Facebook or Instagram feed:
[VISUAL DIRECTION]
[HOOK]
[BODY]
[CALL TO ACTION]
Formatted exactly as it would appear.

TECHNICAL REQUIREMENTS
Before presenting the final ad confirm it meets all of the following:
- The hook is under two sentences
- The body uses line breaks between every paragraph for mobile readability
- No sentence in the body exceeds twenty words
- The call to action is clear, specific and one to two sentences maximum
- The ad contains no claim the pre-order page cannot support
- The language is consistent with the audience intelligence map vocabulary
- Nothing flagged as avoid or repellent appears anywhere
- The ad and the pre-order page feel continuous

If any requirement is not met rewrite the relevant section before presenting the final ad.

AFTER WRITING
Provide a brief note covering:
- The hook recommended and the precise reason it is strongest for this audience
- The specific audience intelligence insight doing the heaviest lifting
- The single most important thing this ad gets right
- What would make this ad significantly stronger
- One honest flag — where is this ad most dependent on the landing page to close what the ad opened

Write the complete test ad now. All four parts in full. Then the complete formatted version.`;

const MT2_STEPS = [
  'Identifying highest intensity pain angle...',
  'Reading pre-order page for continuity...',
  'Writing hook options...',
  'Writing ad body — mobile optimized...',
  'Writing call to action...',
  'Directing visual concept...',
  'Assembling complete formatted ad...',
];

async function generateTestAd() {
  document.getElementById('mt2Btn').disabled = true;
  document.getElementById('mt2Loading').style.display = 'block';
  const intv = startSellLog('mt2Log', MT2_STEPS);
  const context = marketTestContext() + '\n\nPRE-ORDER LANDING PAGE:\n' + (marketTestPage || '');
  try {
    const text = await callClaude(
      MT2_SYSTEM,
      [{ role: 'user', content: context + '\n\nWrite the complete test ad now. All four parts in full. Then the complete formatted version.' }],
      false, 5000, SONNET
    );
    clearInterval(intv);
    marketTestAd = text;
    document.getElementById('mt2Output').textContent = text;
    document.getElementById('mt2Result').style.display = 'block';
    document.getElementById('mt2Loading').style.display = 'none';
    document.getElementById('mt2Btn').style.display = 'none';
    if (currentId) await dbUpdate(currentId, { market_test_ad: text });
  } catch(e) {
    clearInterval(intv);
    document.getElementById('mt2Loading').style.display = 'none';
    document.getElementById('mt2Btn').disabled = false;
    alert('Error: ' + e.message);
  }
}

function approveMT2() {
  markMarketStageDone(2);
  unlockMarketStage(3);
}

// ══════════════════════════════════════
// STAGE 3 — RESULTS ANALYSIS
// ══════════════════════════════════════
const MT3_SYSTEM = `Before you begin, read all the following inputs carefully and completely. Do not start analyzing until you have reviewed everything.

You are an expert paid media analyst and conversion strategist. You have been given the following inputs:
- The refined offer
- The pre-order landing page
- The test ad
- The results data from 48 hours of running the $50 market test

Your job is to analyze the results precisely and tell the user exactly what their numbers mean and exactly what to do next.

This is not a motivational exercise. This is not about making the user feel good or bad about their results. This is about reading the data accurately and giving clear actionable direction based on what the numbers actually say.

Be honest. Be specific. Be direct. The user has spent real money on this test. They deserve a precise reading of what it produced.

BEFORE YOU ANALYZE
Confirm the test was set up correctly before reading any numbers. A result from a poorly set up test is not reliable data.

Verify the following against what the user has reported:
- Objective — was it Purchase objective. If not the data is unreliable. Flag this immediately
- Targeting — was it broad with no interests or lookalikes. If not flag it
- Countries — was it Tier 1 only — US, UK, CA, AU. If not flag it
- Placements — was it Feeds only with everything else unchecked. If not flag it
- Budget and duration — was it at least $15 per day run for a full 48 hours. Flag early reads
- Timing — confirm results were read after the full 48 hours not at 6 or 24 hours

If any setup condition was not met flag it clearly before proceeding. Explain how the deviation affects reliability and whether the test should be rerun. If all conditions were met proceed to analysis.

STEP 1 — READ THE PRIMARY SIGNAL

Purchases — this is always the first number to read. Everything else is secondary.

3 or more purchases:
- State clearly: the market has validated this offer
- Explain what this means — real people with real money confirmed they will pay for this product before it exists
- Give the exact next instruction: scale the budget, do not touch the creative, do not touch the ad, do not touch the page. It is working
- Explain why touching a validated setup is dangerous — the algorithm has found the buyers. Changing anything resets the learning

1 to 2 purchases:
- State clearly: this is a strong signal but not full validation
- Explain what this means — interested but sample too small to confirm
- Give exact next instruction: if budget allows run another 24 hours at the same budget
- Explain what to watch for in the additional 24 hours

Zero purchases:
- State clearly: zero purchases does not mean the idea is dead
- Instruct the user not to conclude anything yet — keep reading the other numbers
- Explain that the other numbers will tell them precisely where the breakdown occurred

STEP 2 — READ THE DIAGNOSTIC NUMBERS
Only run this step if purchases alone did not give a clear answer.

CTR All — measures every interaction. Tells you whether the hook stopped the scroll.

Below 7%:
- State clearly: the hook is not stopping the scroll
- Explain: people are seeing the ad and continuing to scroll
- Exact next instruction: change the image or the first line of copy. Do not change the offer. Do not change the page
- Suggest specifically what to change based on the audience intelligence map

7 to 8%:
- State clearly: the hook is working but not strongly
- Move to the next number before drawing conclusions

8% and above:
- State clearly: the hook is doing its job strongly
- Move to the next number

CTR Link as Percentage of CTR All
Instruct the user to calculate: CTR Link divided by CTR All equals the ratio.
Example: 3.8% divided by 9.3% equals 41%

Below 30%:
- State clearly: the hook worked but the offer did not land
- Exact next instruction: rewrite the call to action and offer framing in the ad body. Do not change the hook. Do not change the page
- Suggest specifically what to change based on the audience intelligence map

30 to 50%:
- State clearly: the hook to offer ratio is right
- Move to the next number

Above 50%:
- State clearly: the ratio is too high — curiosity clicks not qualified buyer clicks
- Exact next instruction: make the offer more specific in the ad body. Add more detail about what the product is and who it is for

Flag if sample size is too small:
- If fewer than 33 link clicks recorded state conclusions are directional only
- Explain 33 link clicks is the minimum for reliable ratio data

Add To Carts — measures people who reached the page and clicked buy.

4 or more add to carts with zero purchases:
- State clearly: this is a checkout problem not an idea problem
- Exact next instruction: check the payment setup immediately. Verify checkout loads on mobile. Verify payment processor is working. Do not change the ad or the page
- Explain why this result is encouraging — the idea and page are working

2 add to carts with zero purchases:
- State clearly: this signals roughly one purchase coming
- Instruct to run another 24 hours if budget allows

Good CTR numbers with zero add to carts:
- State clearly: the page is the problem
- Exact next instruction: review the page for price clarity, offer clarity, trust signals, mobile loading, checkout visibility
- Suggest which elements to review first based on audience purchase hesitations

STEP 3 — COMPLETE DIAGNOSIS
Structure as:
What the data says — precise plain language summary of what each number revealed
Where the breakdown occurred — identify precisely which stage failed: hook, offer-to-click, page, or checkout. Only one is true
The single most important thing to fix — one thing, not five. Justify with the specific data that supports it

STEP 4 — EXACT NEXT INSTRUCTIONS
No ambiguity. No options without clear recommendation.

3 or more purchases: Scale the budget. Do not touch anything.
1 to 2 purchases: Run 24 more hours at the same budget.
Hook problem — CTR All below 7%: Change the hook. Rerun. Provide a revised hook from the next strongest pain angle.
Offer framing problem — ratio below 30%: Rewrite CTA and offer framing. Provide a revised ad body section.
Page problem — good CTRs, zero add to carts: Review page. Identify the specific element most likely causing the drop.
Checkout problem — 4+ add to carts, zero purchases: Fix the checkout immediately.
All numbers weak across the board: State clearly what it means. Recommend returning to the Strategist to reassess the offer before spending more. Explain this is the $50 test doing exactly what it is designed to do.

STEP 5 — WHAT THIS RESULT MEANS FOR THE BIGGER PICTURE

If validated:
- Confirm the user can proceed to Build with confidence
- Explain what the validation proves — what specifically resonated enough to produce purchases
- Identify what the winning numbers reveal that the audience intelligence map should be updated with

If not validated but close:
- Confirm the idea is still viable
- Identify whether the fix is in the ad, the page or the offer
- Identify which section of the tool to return to

If not validated and numbers weak across the board:
- Be honest but not discouraging
- Explain what the $50 test saved them from
- Identify whether this is a targeting, offer or timing problem
- Recommend the specific section to return to

AFTER ANALYSIS
Provide a brief note covering:
- The single most valuable insight this test produced regardless of result
- What the user now knows about this audience and offer that they did not know before spending $50
- One thing the numbers revealed that was surprising based on what the audience intelligence predicted
- What the next $50 test should look like if one is needed

Analyze the complete results now. Setup verification first. Primary signal second. Diagnostic numbers third. Complete diagnosis fourth. Exact next instructions fifth. Bigger picture sixth.`;

const MT3_STEPS = [
  'Verifying test setup...',
  'Reading primary signal — purchases...',
  'Reading diagnostic numbers...',
  'Diagnosing where breakdown occurred...',
  'Forming exact next instructions...',
  'Placing result in bigger picture context...',
];

async function analyzeResults() {
  const resultsData = document.getElementById('mtResultsInput').value.trim();
  if (!resultsData) { alert('Please enter your results data first.'); return; }
  document.getElementById('mt3Btn').disabled = true;
  document.getElementById('mt3Loading').style.display = 'block';
  document.getElementById('mt3Output').style.display = 'none';
  const intv = startSellLog('mt3Log', MT3_STEPS);
  const context = marketTestContext()
    + '\n\nPRE-ORDER LANDING PAGE:\n' + (marketTestPage || '')
    + '\n\nTEST AD:\n' + (marketTestAd || '')
    + '\n\nRESULTS DATA FROM THE $50 TEST:\n' + resultsData;
  try {
    const text = await callClaude(
      MT3_SYSTEM,
      [{ role: 'user', content: context + '\n\nAnalyze the complete results now.' }],
      false, 5000, SONNET
    );
    clearInterval(intv);
    marketTestResults = { data: resultsData, analysis: text };
    document.getElementById('mt3OutputText').textContent = text;
    document.getElementById('mt3Output').style.display = 'block';
    document.getElementById('mt3Loading').style.display = 'none';
    document.getElementById('mt3Btn').style.display = 'none';
    if (currentId) await dbUpdate(currentId, { market_test_results: marketTestResults });

    // Check if validated — look for purchase validation signal in output
    const validated = text.toLowerCase().includes('market has validated') || text.toLowerCase().includes('3 or more purchases');
    if (validated) {
      marketTestPassed = true;
      document.getElementById('mtValidatedBanner').style.display = 'block';
      unlockBuildFromMarketTest(true);
    } else {
      document.getElementById('mtNotValidatedActions').style.display = 'block';
    }

  } catch(e) {
    clearInterval(intv);
    document.getElementById('mt3Loading').style.display = 'none';
    document.getElementById('mt3Btn').disabled = false;
    alert('Error: ' + e.message);
  }
}

function runAnotherMT() {
  document.getElementById('mt3Output').style.display = 'none';
  document.getElementById('mtResultsInput').value = '';
  document.getElementById('mt3Btn').disabled = false;
  document.getElementById('mt3Btn').style.display = 'block';
  document.getElementById('mtNotValidatedActions').style.display = 'none';
}

// ── Restore market test state from history ──
function restoreMarketTestState(entry) {
  if (!entry.market_test_page && !entry.market_test_ad && !entry.market_test_results) return;

  document.getElementById('mtLockedMsg').style.display = 'none';
  document.getElementById('mtContent').style.display = 'block';
  marketTestStagesUnlocked = [1];

  if (entry.market_test_page) {
    marketTestPage = entry.market_test_page;
    document.getElementById('mt1Output').textContent = marketTestPage;
    document.getElementById('mt1Result').style.display = 'block';
    document.getElementById('mt1Btn').style.display = 'none';
    markMarketStageDone(1); unlockMarketStage(2);
  }
  if (entry.market_test_ad) {
    marketTestAd = entry.market_test_ad;
    document.getElementById('mt2Output').textContent = marketTestAd;
    document.getElementById('mt2Result').style.display = 'block';
    document.getElementById('mt2Btn').style.display = 'none';
    markMarketStageDone(2); unlockMarketStage(3);
  }
  if (entry.market_test_results) {
    marketTestResults = entry.market_test_results;
    document.getElementById('mt3OutputText').textContent = marketTestResults.analysis;
    document.getElementById('mt3Output').style.display = 'block';
    document.getElementById('mt3Btn').style.display = 'none';
  }
  if (entry.market_test_passed) {
    marketTestPassed = true;
    document.getElementById('mtValidatedBanner').style.display = 'block';
  }
}

// ── Called from strategist.js after offer is finalised ──
function unlockMarketTest() {
  document.getElementById('mtLockedMsg').style.display = 'none';
  document.getElementById('mtContent').style.display = 'block';
  const tab = document.getElementById('tab-markettest');
  if (tab) { tab.disabled = false; tab.style.opacity = '1'; tab.style.cursor = 'pointer'; }
  unlockMarketStage(1);
}
