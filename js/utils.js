function startProgress() {
  const log = document.getElementById('progressLog');
  log.innerHTML = '';
  let i = 0;
  progressTimer = setInterval(() => {
    if (i >= STEPS.length) { clearInterval(progressTimer); return; }
    log.querySelectorAll('.log-line.latest').forEach(el => el.classList.remove('latest'));
    const line = document.createElement('div');
    line.className = 'log-line latest';
    line.textContent = STEPS[i++];
    log.appendChild(line);
  }, 3000);
}

function stopProgress() { if (progressTimer) clearInterval(progressTimer); }

async function callClaude(systemPrompt, messages, useSearch = false, maxTokens = 4000) {
  const tools = useSearch ? [{ type: 'web_search_20250305', name: 'web_search' }] : undefined;
  const allMessages = [...messages];
  let finalText = null;
  let turns = 0;

  while (!finalText && turns < 15) {
    turns++;
    const body = { model: 'claude-opus-4-6', max_tokens: maxTokens, system: systemPrompt, messages: allMessages };
    if (tools) body.tools = tools;

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) { const e = await res.json(); throw new Error(e.error?.message || `API error ${res.status}`); }
    const data = await res.json();
    allMessages.push({ role: 'assistant', content: data.content });

    if (data.stop_reason === 'end_turn') {
      finalText = data.content.filter(b => b.type === 'text').map(b => b.text).join('');
    } else if (data.stop_reason === 'tool_use') {
      const toolBlocks = data.content.filter(b => b.type === 'tool_use' || b.type === 'server_tool_use');
      if (!toolBlocks.length) break;
      allMessages.push({ role: 'user', content: toolBlocks.map(b => ({ type: 'tool_result', tool_use_id: b.id, content: b.output || 'Search completed.' })) });
    } else {
      finalText = data.content.filter(b => b.type === 'text').map(b => b.text).join('');
    }
  }
  return finalText || '';
}

function parseJSON(text) {
  let clean = text.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
  const s = clean.indexOf('{'), e = clean.lastIndexOf('}');
  if (s === -1 || e === -1) throw new Error('Could not parse response. Please try again.');
  return JSON.parse(clean.slice(s, e + 1));
}

// ══════════════════════════════════════
// AUDIENCE INTELLIGENCE
// ══════════════════════════════════════
const AI_PROMPT = `Before you begin, read all the research data carefully and completely. Do not start extracting until you have reviewed everything.

You are an expert audience psychologist, behavioural researcher and direct response copywriter with deep expertise in extracting consumer insight from raw market data.

You have been given market research data about this idea collected from Reddit, YouTube, Google and other internet sources. Your job is to produce a precise, evidence-based audience intelligence map that will be used to validate a business idea, build a product, create a sales strategy, write a sales page, generate ad variations and map a complete backend architecture.

Every section of this map feeds a specific downstream function. Accuracy and depth are critical at every level. Every insight must be rooted in what the research actually shows. Do not generalize. Do not invent. Do not assume.

Source weighting: Weight insights from Reddit and direct audience quotes most heavily. Reddit is where people speak unfiltered, without performing for an audience. General articles, expert opinion pieces and branded content should be treated as secondary context only — they tell you what people are told, not what people actually feel and say. When an insight comes from Reddit or a direct quote, note it explicitly. When it comes from an article or secondary source, flag it as such. The platform where the audience is most emotionally raw is the most valuable source for every downstream section — prioritise it accordingly.

If the research does not support a section clearly say so explicitly rather than filling it with guesswork.

SECTION 1 — THEIR LANGUAGE
This section feeds the product writing, ad variations and sales page directly. It must be exceptionally granular. Generic vocabulary lists are useless here. Every word and phrase must be specific enough to write an entire product, a sales page and 200 ad variations in this audience's exact voice.
Extract with maximum precision:
- High frequency phrases — the exact words and phrases that appear repeatedly across multiple sources. Do not paraphrase. Copy them exactly as the audience wrote or said them. Note how often each appears and across how many different sources
- Emotional vocabulary — the specific feeling words this audience reaches for. Not sad or frustrated — the exact words they use. Devastated, stuck, invisible, exhausted. Extract the actual words
- Metaphors and comparisons — how they describe the problem conceptually. What do they compare it to. What images and analogies appear repeatedly
- Sentence structure and rhythm — how long are their sentences. Are they fragmented and frustrated or long and detailed. Do they use lists, questions, exclamations. What rhythm do they write and speak in
- Vocabulary level — is their language technical, casual, emotional, clinical, defeated. Be specific about the register
- Power phrases — the specific combinations of words that carry the most emotional weight. The phrases that would stop this audience mid scroll if they appeared in an ad
- Platform differences — do they speak differently on Reddit versus YouTube versus Google. Note every difference. The platform where they are most emotionally raw is the most valuable source of ad language
- Words and phrases to never use — language that would feel foreign, condescending, corporate or off to this audience. Be specific

SECTION 2 — THEIR EMOTIONAL STATE
This section feeds the product emotional arc, the sales page structure and the ad emotional triggers. It must be mapped with enough precision that a chapter can be written to move the reader from one emotional state to the next and an ad can be written to activate a specific emotion in a single line.
Map with precision:
- The trigger moment — the specific situation or event that brings the pain to a head. Not generally when they feel it — the exact moment. What are they doing, what happens, what do they feel in that instant
- Primary emotion — the single emotion they feel most intensely and most often. Name it precisely
- Secondary emotions — what runs underneath the primary emotion. The layered feelings that exist alongside the main one
- The emotional arc — where the pain starts, how it builds over time, where it leads if the problem stays unsolved. Map this as a progression not a static state
- Emotional stages — break the arc into distinct stages. What does stage one feel like, stage two, stage three. This maps directly to chapter and sales page structure
- Their deepest fear — what they are most afraid of about this situation. The fear they may not say directly but that drives their behaviour
- Their hidden desire — what they secretly hope for but may not admit openly. The outcome they want but feel embarrassed or uncertain to claim
- Shame and social dimension — is there embarrassment attached to this problem. Do they hide it. What is the social cost of this problem for them
- The emotional tipping point — the moment when passive sufferer becomes active seeker. What pushes them from living with the problem to desperately looking for a solution
- Emotional triggers for ads — the three to five specific emotional states that if activated in a single line would make this audience stop everything and pay attention

SECTION 3 — THEIR THINKING
This section feeds the product structure, the objection handling in sales and the ad angles. It must map how this audience reasons precisely enough that every objection can be anticipated and every ad angle can be built from a real belief or thought pattern.
Map with precision:
- Their belief about the cause — what do they think is responsible for their situation. What story do they tell themselves about why this problem exists
- Self blame patterns — do they blame themselves, others, circumstances or the market. How does this affect how they receive solutions
- Previous solutions tried — every solution this audience has already attempted. For each one: what it was, what they hoped it would do, what specifically disappointed them, what language they use when describing why it failed
- Their objections to trying something new — every reason they would hesitate before buying. Ranked by how frequently they appear in the research
- The objection most likely to kill a sale — identify it precisely. This gets special treatment in every downstream section
- Their ideal outcome in their own words — not what you think they want. The exact language they use when describing what success looks like
- Contradictions — where does what they say conflict with what they seem to want or how they behave. Note every contradiction carefully. These are the most powerful insights for copywriting and product design
- How they evaluate solutions — what criteria do they use when deciding whether something will work for them. What makes them lean in versus dismiss
- What they need to believe before buying — the specific beliefs that must be in place before this audience will commit to a purchase

SECTION 4 — THEIR BEHAVIOUR
This section feeds the sales strategy, platform decisions and the sales sequence. It must be mapped with enough precision that every sales decision — where to show up, what to say first, how many touches before the offer — can be derived from it.
Map with precision:
- Where they go looking for solutions — every platform, community, search term and source they use when actively seeking help. Note which ones they trust most
- Who they trust — what kind of person or source do they find credible. Is it someone who has been where they are, an authority figure, a peer, a brand, data and research. Be specific about what credibility looks like to this audience
- What content they consume — what formats do they engage with. Long form articles, short videos, podcasts, social posts, forums. What do they read all the way through versus skim
- What makes them stop and pay attention — the specific signals in content that make this audience pause. A specific type of headline, a specific kind of opening, a specific format
- What makes them leave — what immediately loses their attention or trust
- The buying decision process — how do they move from problem aware to purchase ready. What are the steps. What information do they need at each step
- How many touches they need — based on their research behaviour how many exposures to a solution does this audience typically need before buying
- What triggers them to finally act — the specific event, emotion or realisation that pushes them from considering to buying
- Purchase hesitations at the point of buying — what slows them down in the final moment before purchase. What doubt surfaces last
- Where intent is highest — the specific platform, community or context where this audience is most ready to receive an offer

SECTION 5 — THE PROBLEM CHAIN
This section feeds the backend architecture directly. It must map the full sequence of problems this audience faces beyond the front end problem so that every backend product recommendation is rooted in a real demonstrated need.
Map with precision:
- The front end problem — the primary problem this idea solves. State it precisely
- What solving this problem reveals — when the front end problem is solved what new problem or challenge immediately emerges for this audience
- The next problem — map it with the same depth as the front end problem. What does it feel like, what language do they use for it, how urgent is it
- The deeper problem — what sits underneath the front end problem that the front end only partially addresses. The root issue that keeps producing surface problems
- The ongoing challenge — what challenge does this audience face continuously that a one time product cannot solve. This is continuity territory
- The ultimate desired outcome — where does this audience ultimately want to arrive. The complete transformation beyond what the front end delivers. In their own words
- The full problem chain — map every problem in sequence from front end to ultimate outcome. Show the complete journey this audience is on and where each backend product fits in that journey

SECTION 6 — SIGNAL STRENGTH
This section is critical for avoiding expensive mistakes downstream. Every section that follows depends on this audience intelligence being accurate. This section tells us how much to trust each insight.
- High confidence insights — findings supported by multiple sources and high frequency mentions across different platforms. These are reliable and should be treated as confirmed. Build on these without hesitation
- Medium confidence insights — findings that appear but not consistently across sources. Worth using but treat with some caution. Flag where these appear in downstream sections
- Low confidence insights — things that appeared once or in limited context. Do not build critical decisions on these. Flag them clearly wherever they appear downstream
- Recency flag — note which insights come from 2024-2026 sources versus older material. Audience language and pain points evolve. Insights from older sources should be treated as directional context, not current truth, unless corroborated by recent sources. For any insight that would significantly affect a downstream decision, flag clearly whether it is recent or historical
- Gaps in the research — what important questions this research cannot answer. What would we need to know to make better decisions that the current data does not reveal
- Where to be most careful — identify the specific downstream sections where low confidence or outdated insights might cause the most damage if acted on incorrectly

SECTION 7 — IMPLICATIONS
Translate the entire map into direct actionable guidance for every downstream section.
For product building:
- What the product must do, say and feel like based on this audience
- The emotional journey the product must take the reader through chapter by chapter
- The vocabulary the product must be written in
- What the product must never do, say or feel like
For sales strategy:
- How this audience likes to be approached based on their behaviour and trust triggers
- What sales style suits them
- What would immediately repel them
- How many touches they need before the offer
For the sales page:
- What kind of page suits this audience — long form, short form, story led, proof heavy
- Where the emotional peaks and valleys should fall on the page
- What the page must establish before the offer is presented
For ad variations:
- The top five angles ranked by pain intensity and emotional charge
- The specific hooks most likely to stop this audience
- The vocabulary that must appear in winning ads
For backend architecture:
- The next problem this audience needs solved after the front end
- What continuity offer would serve them genuinely
- What premium transformation they would ultimately pay for
What to avoid across everything:
- Based on what you found what approaches would fail or alienate this audience across every section

Present each section with clear headers. Use bullet points within sections. Where you quote directly from the research format it in italics. Be thorough. Be specific. Be honest about what the research supports and what it does not.

Return your response as a JSON object with this exact structure, no markdown fences:
{"section1":"full text for their language","section2":"full text for their emotional state","section3":"full text for their thinking","section4":"full text for their behaviour","section5":"full text for the problem chain","section6":"full text for signal strength","section7":"full text for implications","summary":"one paragraph — who this audience truly is at their core, not their demographics, not their problem, who they are as people and what they are really searching for beneath everything the research reveals"}`;


const AI_STEPS = [
  'Extracting audience language and vocabulary...',
  'Mapping emotional landscape and trigger moments...',
  'Analysing how they think and reason...',
  'Studying their behaviour patterns...',
  'Assessing signal strength and recency...',
  'Translating insights into product and copy implications...',
];

let audienceIntel = null;
let aiProgressInterval = null;

