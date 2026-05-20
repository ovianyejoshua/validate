
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

function toggleBuildStage(n) {
  if (!buildStagesUnlocked.includes(n)) return;
  document.getElementById('bstage'+n+'Body').classList.toggle('open');
}

function unlockBuildStage(n) {
  if (!buildStagesUnlocked.includes(n)) buildStagesUnlocked.push(n);
  const status = document.getElementById('bstage'+n+'Status');
  status.textContent = 'Ready';
  status.className = 'stage-status active';
  document.getElementById('bstage'+n+'Body').classList.add('open');
}

function markBuildStageDone(n) {
  const status = document.getElementById('bstage'+n+'Status');
  status.textContent = 'Done';
  status.className = 'stage-status done';
}

function buildContext() {
  if (!finalisedOffer) return '';
  // Build needs: language + emotional + implications only
  const aiPart = audienceIntel ? `

AUDIENCE INTELLIGENCE:
${aiSlice('language','emotional','implications','summary')}` : '';
  return baseContext() + `

OBJECTIONS (${(finalisedOffer.objections||[]).length}):
${(finalisedOffer.objections||[]).map((o,i)=>`${i+1}. ${o}`).join('\n')}

VALUE STACK:
${(finalisedOffer.valueStack||[]).map(v=>`- ${v.bonusName}: ${v.bonusDescription} (solves: ${v.objectionItSolves})`).join('\n')}` + aiPart;
}

const BLUEPRINT_SYSTEM = `Before you begin, read all the following inputs carefully and completely. Do not start generating the blueprint until you have reviewed everything.

You are an expert product architect, instructional designer and direct response copywriter. You have been given a finalised offer and a detailed audience intelligence map.

Your job is to generate a precise, audience-derived blueprint for a written digital product. This blueprint will be used to write the actual product chapter by chapter. Every decision you make — structure, flow, length, tone, chapter content — must be derived from the inputs. Do not invent. Do not use generic ebook structures. This blueprint must feel like it was designed specifically for this audience because it was.

SECTION 1 — PRODUCT DEFINITION
Determine the following from the inputs:
- Format — what type of written product best suits this offer and this audience. Ebook, guide, framework, playbook, workbook. Justify your choice based on the audience intelligence
- Estimated length — how long should this product be to fully deliver the offer without padding or leaving gaps. Give a page range and justify it
- Primary tone — derived from the audience's emotional state and vocabulary. How should this product feel to read. Be specific and pull from the audience intelligence map
- Writing person — first person, second person. Which works best for this audience and why

SECTION 2 — EMOTIONAL ARC
Before mapping chapters, map the emotional journey the reader will travel through the product.
- Where the reader is emotionally when they pick this product up
- Where they need to be emotionally by the end
- The emotional stages in between
- Key moments of tension and release
This arc will govern the chapter order and flow. Every chapter must move the reader one step forward emotionally.

SECTION 3 — CHAPTER BLUEPRINT
Map every chapter of the product. For each chapter provide:
- Chapter number and title — written in the audience's own vocabulary where possible
- Core job — what this chapter must accomplish for the reader
- Emotional function — where the reader enters and where they leave
- Objection or pain addressed — which specific objection or pain this chapter resolves
- Value delivered — which element of the value stack this chapter delivers
- Key points to cover
- Audience language to use — specific words and phrases from the intelligence map
- What to avoid — anything that would jar, confuse or lose this reader in this chapter

SECTION 4 — LANGUAGE GUIDE
Compile a writing guide derived entirely from the audience intelligence map.
- Core vocabulary — words and phrases that must appear throughout
- Words and phrases to avoid
- Sentence structure — length, complexity, rhythm
- How to open chapters
- How to close chapters
- How to handle objections in the writing

SECTION 5 — PRODUCT EXPERIENCE
Describe how the product should feel from beginning to end.
- What the reader feels in the first three pages
- How each chapter opening should feel
- How the product builds
- What the reader feels at the very end
- What would make this reader put the product down and not return

SECTION 6 — BLUEPRINT SUMMARY
Close with a clean summary table and one paragraph addressed directly to the writer summarising exactly what kind of product this needs to be, who it is for, and what success looks like when the reader finishes it.

Return your response as a JSON object with this exact structure, no markdown fences:
{
  "section1": "product definition text",
  "section2": "emotional arc text",
  "chapters": [
    {
      "number": 1,
      "title": "Chapter title",
      "coreJob": "what this chapter must do",
      "emotionalEntry": "reader emotional state entering",
      "emotionalExit": "reader emotional state leaving",
      "objectionAddressed": "specific objection",
      "valueDelivered": "value stack element",
      "keyPoints": ["point 1", "point 2", "point 3"],
      "audienceLanguage": "specific vocabulary for this chapter",
      "avoid": "what to avoid in this chapter"
    }
  ],
  "section4": "language guide text",
  "section5": "product experience text",
  "section6": "blueprint summary text",
  "totalChapters": 8,
  "estimatedPages": "45-60 pages",
  "format": "Guide",
  "tone": "tone description"
}`;

async function generateBlueprint() {
  if (!finalisedOffer) return;
  document.getElementById('generateBlueprintBtn').disabled = true;
  document.getElementById('blueprintLoading').style.display = 'block';
  document.getElementById('blueprintResult').style.display = 'none';

  const logEl = document.getElementById('blueprintLog');
  logEl.innerHTML = '';
  let i = 0;
  const bpInt = setInterval(() => {
    if (i >= BLUEPRINT_STEPS.length) { clearInterval(bpInt); return; }
    logEl.querySelectorAll('.log-line.latest').forEach(el => el.classList.remove('latest'));
    const line = document.createElement('div');
    line.className = 'log-line latest';
    line.textContent = BLUEPRINT_STEPS[i++];
    logEl.appendChild(line);
  }, 3500);

  try {
    const text = await callClaude(BLUEPRINT_SYSTEM, [{ role: 'user', content: buildContext() + '\n\nGenerate the complete product blueprint as a JSON object.' }], false, 6000);
    clearInterval(bpInt);
    blueprint = parseJSON(text);
    renderBlueprint(blueprint);
    document.getElementById('blueprintLoading').style.display = 'none';
    document.getElementById('blueprintResult').style.display = 'block';
    document.getElementById('generateBlueprintBtn').style.display = 'none';
    if (currentId) await dbUpdate(currentId, { blueprint });
  } catch(err) {
    clearInterval(bpInt);
    document.getElementById('blueprintLoading').style.display = 'none';
    document.getElementById('generateBlueprintBtn').disabled = false;
    console.error('Blueprint error:', err);
    alert('Error generating blueprint: ' + err.message);
  }
}

function renderBlueprint(bp) {
  const box = document.getElementById('blueprintBox');
  const chaptersHtml = (bp.chapters || []).map(ch => `
    <div class="blueprint-section">
      <div class="blueprint-section-title">Chapter ${ch.number} — ${esc(ch.title)}</div>
      <div class="blueprint-section-body"><strong>Core Job:</strong> ${esc(ch.coreJob)}
<strong>Emotional Arc:</strong> ${esc(ch.emotionalEntry)} → ${esc(ch.emotionalExit)}
<strong>Objection Addressed:</strong> ${esc(ch.objectionAddressed)}
<strong>Value Delivered:</strong> ${esc(ch.valueDelivered)}
<strong>Key Points:</strong> ${(ch.keyPoints||[]).map(p=>'• '+p).join('\n')}
<strong>Audience Language:</strong> ${esc(ch.audienceLanguage)}
<strong>Avoid:</strong> ${esc(ch.avoid)}</div>
    </div>
  `).join('');

  box.innerHTML = `
    <div class="blueprint-section">
      <div class="blueprint-section-title">Product Definition</div>
      <div class="blueprint-section-body">${esc(bp.section1)}</div>
    </div>
    <div class="blueprint-section">
      <div class="blueprint-section-title">Emotional Arc</div>
      <div class="blueprint-section-body">${esc(bp.section2)}</div>
    </div>
    ${chaptersHtml}
    <div class="blueprint-section">
      <div class="blueprint-section-title">Language Guide</div>
      <div class="blueprint-section-body">${esc(bp.section4)}</div>
    </div>
    <div class="blueprint-section">
      <div class="blueprint-section-title">Product Experience</div>
      <div class="blueprint-section-body">${esc(bp.section5)}</div>
    </div>
    <div class="blueprint-section">
      <div class="blueprint-section-title">Blueprint Summary</div>
      <div class="blueprint-section-body">${esc(bp.section6)}</div>
    </div>
  `;
}

function regenerateBlueprint() {
  blueprint = null;
  document.getElementById('blueprintResult').style.display = 'none';
  document.getElementById('generateBlueprintBtn').style.display = 'block';
  document.getElementById('generateBlueprintBtn').disabled = false;
}

async function approveBlueprint() {
  approvedBlueprint = blueprint;
  chapters = [];
  currentChapterIndex = 0;

  // Set up chapter progress pips
  const pipsHtml = (blueprint.chapters||[]).map((ch, i) =>
    `<div class="chapter-pip" id="pip-${i}"></div>`
  ).join('');
  document.getElementById('chapterProgressBar').innerHTML = pipsHtml;
  document.getElementById('chapterProgress').style.display = 'block';

  markBuildStageDone(1);
  unlockBuildStage(2);
  document.getElementById('bstage1Body').classList.remove('open');
  document.getElementById('bstage2Body').classList.add('open');
  document.getElementById('currentChapterArea').style.display = 'block';
  document.getElementById('writeChapterBtn').style.display = 'block';

  updateChapterUI();
  if (currentId) await dbUpdate(currentId, { approved_blueprint: approvedBlueprint });
}

function updateChapterUI() {
  if (!approvedBlueprint) return;
  const total = approvedBlueprint.chapters.length;
  const current = approvedBlueprint.chapters[currentChapterIndex];
  if (!current) {
    // All chapters done
    assembleCompleteProduct();
    return;
  }

  // Update pip
  const pip = document.getElementById('pip-'+currentChapterIndex);
  if (pip) pip.classList.add('writing');

  // Show done chapters
  const doneHtml = chapters.map((ch, i) => `
    <div class="chapter-done-item" onclick="viewChapter(${i})">
      <div class="chapter-done-title">Chapter ${ch.number}: ${esc(ch.title)}</div>
      <div class="chapter-done-badge">✓ Approved</div>
    </div>
  `).join('');
  document.getElementById('chaptersContainer').innerHTML = doneHtml ? `<div class="chapters-done-list">${doneHtml}</div>` : '';

  document.getElementById('writeChapterBtn').textContent = `Write Chapter ${currentChapterIndex + 1} of ${total}: "${current.title}" →`;
  document.getElementById('writeChapterBtn').style.display = 'block';
  document.getElementById('chapterOutput').style.display = 'none';
}

function viewChapter(index) {
  const ch = chapters[index];
  if (!ch) return;
  document.getElementById('chapterOutputTitle').textContent = `Chapter ${ch.number}: ${ch.title}`;
  document.getElementById('chapterWriterNote').textContent = ch.writerNote ? 'Writer note: ' + ch.writerNote : '';
  document.getElementById('chapterOutputBody').textContent = ch.content;
  document.getElementById('chapterOutput').style.display = 'block';
  document.getElementById('approveChapterBtn').style.display = 'none';
  document.getElementById('rewriteChapterBtn').style.display = 'none';
}

const CHAPTER_SYSTEM = `Before you begin, read all the following inputs carefully and completely. Do not start writing until you have reviewed everything.

You are an expert writer and direct response copywriter. You have been given a finalised offer, a fully approved product blueprint, a detailed audience intelligence map, all previously written chapters, and the specific chapter brief you are writing now.

Your job is to write one chapter and one chapter only. Do not write ahead. Do not summarise what is coming. Write this chapter completely, precisely and powerfully. This is a real product that a real person will pay for and read. Write accordingly.

BEFORE YOU WRITE
Review the following before a single word of the chapter:
- The emotional arc — where is the reader entering this chapter and where must they leave it
- The core job — what must this chapter accomplish
- The objection or pain this chapter addresses — know it precisely before writing
- The previously written chapters — understand what has already been said, what tone has been established, what promises have been made

Write entirely from the audience intelligence map. It contains everything you need about how to write for this reader — their vocabulary, their sentence rhythm, their emotional register, the words that belong in this product and the words that do not.

Only begin writing when you have a complete picture of all of the above.

WHAT THIS CHAPTER MUST DELIVER
By the end of this chapter the reader must:
- Have received the specific value mapped to this chapter in the blueprint
- Have moved from their emotional entry state to their emotional exit state for this chapter
- Feel that the product understands them — not just their problem but how they think and feel about it
- Be closer to the transformation promised in the offer than they were at the start of this chapter

WHAT TO AVOID
- Do not repeat points covered in previous chapters
- Do not address objections by announcing them — never write "you might be thinking" or any variation. Weave the resolution into the content itself
- Do not open the chapter with "In this chapter" or any meta-announcement of what is coming

AFTER WRITING
When the chapter is complete, provide a brief writer note covering:
- Whether the chapter fulfilled its core job from the blueprint
- The emotional state the reader should be in having finished this chapter
- Any judgment call made and why

Return your response as a JSON object, no markdown fences:
{
  "chapterTitle": "the chapter title",
  "chapterContent": "the full chapter text",
  "writerNote": "the brief writer note"
}`;

async function writeNextChapter() {
  if (!approvedBlueprint) return;
  const chapterBrief = approvedBlueprint.chapters[currentChapterIndex];
  if (!chapterBrief) return;

  document.getElementById('writeChapterBtn').style.display = 'none';
  document.getElementById('chapterLoading').style.display = 'block';
  document.getElementById('chapterOutput').style.display = 'none';

  const logEl = document.getElementById('chapterLog');
  logEl.innerHTML = '';
  let i = 0;
  const chInt = setInterval(() => {
    if (i >= CHAPTER_STEPS.length) { clearInterval(chInt); return; }
    logEl.querySelectorAll('.log-line.latest').forEach(el => el.classList.remove('latest'));
    const line = document.createElement('div');
    line.className = 'log-line latest';
    line.textContent = CHAPTER_STEPS[i++];
    logEl.appendChild(line);
  }, 4000);

  const previousChaptersText = chapters.length > 0
    ? '\n\nPREVIOUSLY WRITTEN CHAPTERS:\n' + chapters.map(ch => `CHAPTER ${ch.number}: ${ch.title}\n${ch.content}`).join('\n\n---\n\n')
    : '';

  const chapterBriefText = `CHAPTER TO WRITE NOW:
Chapter ${chapterBrief.number}: ${chapterBrief.title}
Core Job: ${chapterBrief.coreJob}
Emotional Entry: ${chapterBrief.emotionalEntry}
Emotional Exit: ${chapterBrief.emotionalExit}
Objection Addressed: ${chapterBrief.objectionAddressed}
Value Delivered: ${chapterBrief.valueDelivered}
Key Points: ${(chapterBrief.keyPoints||[]).join(', ')}
Audience Language: ${chapterBrief.audienceLanguage}
Avoid: ${chapterBrief.avoid}`;

  const userMsg = buildContext() + previousChaptersText + '\n\n' + chapterBriefText + '\n\nWrite this chapter now. Return only the JSON object.';

  try {
    const text = await callClaude(CHAPTER_SYSTEM, [{ role: 'user', content: userMsg }], false, 4000);
    clearInterval(chInt);
    const parsed = parseJSON(text);

    document.getElementById('chapterLoading').style.display = 'none';
    document.getElementById('chapterOutputTitle').textContent = `Chapter ${chapterBrief.number}: ${parsed.chapterTitle || chapterBrief.title}`;
    document.getElementById('chapterWriterNote').textContent = parsed.writerNote ? 'Writer note: ' + parsed.writerNote : '';
    document.getElementById('chapterOutputBody').textContent = parsed.chapterContent || '';
    document.getElementById('chapterOutput').style.display = 'block';
    document.getElementById('approveChapterBtn').style.display = 'block';
    document.getElementById('rewriteChapterBtn').style.display = 'block';

    // Store pending chapter
    window._pendingChapter = {
      number: chapterBrief.number,
      title: parsed.chapterTitle || chapterBrief.title,
      content: parsed.chapterContent || '',
      writerNote: parsed.writerNote || '',
      approved: false
    };

    // Update pip to writing
    const pip = document.getElementById('pip-'+currentChapterIndex);
    if (pip) { pip.classList.remove('writing'); pip.classList.add('writing'); }

  } catch(err) {
    clearInterval(chInt);
    document.getElementById('chapterLoading').style.display = 'none';
    document.getElementById('writeChapterBtn').style.display = 'block';
    console.error('Chapter write error:', err);
    alert('Error writing chapter: ' + err.message);
  }
}

async function approveChapter() {
  const pending = window._pendingChapter;
  if (!pending) return;
  pending.approved = true;
  chapters.push(pending);
  window._pendingChapter = null;

  // Mark pip done
  const pip = document.getElementById('pip-'+currentChapterIndex);
  if (pip) { pip.classList.remove('writing'); pip.classList.add('done'); }

  currentChapterIndex++;
  if (currentId) await dbUpdate(currentId, { chapters });

  // Check if all chapters done
  if (currentChapterIndex >= approvedBlueprint.chapters.length) {
    await assembleCompleteProduct();
  } else {
    updateChapterUI();
  }
}

async function rewriteChapter() {
  window._pendingChapter = null;
  document.getElementById('chapterOutput').style.display = 'none';
  document.getElementById('writeChapterBtn').style.display = 'block';
  updateChapterUI();
}

async function assembleCompleteProduct() {
  markBuildStageDone(2);
  unlockBuildStage(3);
  document.getElementById('bstage2Body').classList.remove('open');
  document.getElementById('bstage3Body').classList.add('open');

  const productHtml = chapters.map(ch => `
    <div class="complete-chapter">
      <div class="complete-chapter-title">Chapter ${ch.number}: ${esc(ch.title)}</div>
      <div class="complete-chapter-body">${esc(ch.content)}</div>
    </div>
  `).join('');

  document.getElementById('completeProductBox').innerHTML = productHtml;
  document.getElementById('completeProductResult').style.display = 'block';
  markBuildStageDone(3);

  if (currentId) await dbUpdate(currentId, { chapters, build_complete: true });
  unlockSell();
  loadAllHistory();
}

function exportProduct() {
  unlockSell();
  if (!chapters.length) return;
  const offer = finalisedOffer || {};
  let content = `${offer.productName || 'Your Product'}\n${offer.tagline || ''}\n\n`;
  chapters.forEach(ch => {
    content += `CHAPTER ${ch.number}: ${ch.title}\n${'='.repeat(50)}\n\n${ch.content}\n\n`;
  });
  const blob = new Blob([content], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${(offer.productName||'product').replace(/[^a-z0-9]/gi,'-')}.txt`;
  a.click();
}

// Restore build state when loading history
function restoreBuildState(entry) {
  if (!entry.blueprint) return;
  blueprint = entry.blueprint;
  approvedBlueprint = entry.approved_blueprint || null;
  chapters = entry.chapters || [];
  currentChapterIndex = chapters.length;
  buildStagesUnlocked = [1];

  // Render blueprint
  renderBlueprint(blueprint);
  document.getElementById('generateBlueprintBtn').style.display = 'none';
  document.getElementById('blueprintResult').style.display = 'block';

  if (approvedBlueprint) {
    markBuildStageDone(1);
    unlockBuildStage(2);

    // Restore progress pips
    const pipsHtml = (approvedBlueprint.chapters||[]).map((ch, i) =>
      `<div class="chapter-pip ${i < chapters.length ? 'done' : ''}" id="pip-${i}"></div>`
    ).join('');
    document.getElementById('chapterProgressBar').innerHTML = pipsHtml;
    document.getElementById('chapterProgress').style.display = 'block';
    document.getElementById('currentChapterArea').style.display = 'block';

    if (entry.build_complete) {
      markBuildStageDone(2);
      unlockBuildStage(3);
      const productHtml = chapters.map(ch => `
        <div class="complete-chapter">
          <div class="complete-chapter-title">Chapter ${ch.number}: ${esc(ch.title)}</div>
          <div class="complete-chapter-body">${esc(ch.content)}</div>
        </div>
      `).join('');
      document.getElementById('completeProductBox').innerHTML = productHtml;
      document.getElementById('completeProductResult').style.display = 'block';
      markBuildStageDone(3);
    } else {
      updateChapterUI();
    }
  }
}


// ══════════════════════════════════════
// FINALISE OFFER + BUILD HANDOFF
// ══════════════════════════════════════
let finalisedOffer = null;

async function finaliseOffer() {
  const btn = document.getElementById('finaliseBtn');
  btn.disabled = true;
  btn.textContent = 'Finalising...';

  // Build the structured handoff document from everything we have
  const handoff = {
    productName: finalOffer?.productName || '',
    tagline: finalOffer?.tagline || '',
    targetAudience: finalOffer?.targetAudience || '',
    corePromise: finalOffer?.corePromise || '',
    chosenAngle: extractChosenAngle(),
    coreProduct: {
      format: finalOffer?.whatIsIncluded?.[0] || '',
      structure: finalOffer?.whatIsIncluded || [],
      promise: finalOffer?.corePromise || ''
    },
    valueStack: valueStack.map(v => ({
      bonusName: v.bonusTitle || v.title || '',
      bonusDescription: v.description || '',
      objectionItSolves: v.objection || v.objectionAddressed || '',
      audiencePainItAddresses: v.pain || ''
    })),
    bonuses: finalOffer?.bonuses || [],
    guarantee: finalOffer?.guarantee || '',
    suggestedPrice: finalOffer?.suggestedPrice || '',
    oneLiner: finalOffer?.oneLiner || '',
    completeOffer: buildCompleteOfferParagraph(),
    audienceLanguage: audienceIntel?.section1?.slice(0, 600) || '',
    audienceEmotions: audienceIntel?.section2?.slice(0, 600) || '',
    toneGuide: audienceIntel?.section6?.slice(0, 400) || '',
    coreAudienceSummary: audienceIntel?.summary || '',
    objections: objections,
    finalisedAt: new Date().toISOString()
  };

  finalisedOffer = handoff;

  // Save to Supabase
  if (currentId) await dbUpdate(currentId, { finalised_offer: handoff });

  // Unlock Build tab
  const buildTab = document.getElementById('tab-build');
  if (buildTab) {
    buildTab.disabled = false;
    buildTab.style.opacity = '1';
    buildTab.style.cursor = 'pointer';
  }

  // Render handoff in Build panel
  renderOfferHandoff(handoff);

  // Show done state
  document.getElementById('finaliseDone').style.display = 'flex';
  btn.style.display = 'none';

  markStageDone(4);
  loadAllHistory();
}

function extractChosenAngle() {
  // Pull the last assistant message that mentions angle or direction from refine chat
  const assistantMsgs = refineHistory.filter(m => m.role === 'assistant');
  if (!assistantMsgs.length) return currentReport?.suggestedAngles?.[0]?.angle || '';
  // Look for angle mentions in last few messages
  const recent = assistantMsgs.slice(-3).map(m => m.content).join(' ');
  const angleMatch = recent.match(/angle[:\s]+([^.\n]{20,120})/i);
  return angleMatch ? angleMatch[1].trim() : (currentReport?.suggestedAngles?.[0]?.angle || '');
}

function buildCompleteOfferParagraph() {
  if (!finalOffer) return '';
  const bonusList = (finalOffer.bonuses || []).map(b => b.title).join(', ');
  return `${finalOffer.productName} — ${finalOffer.corePromise} Includes: ${(finalOffer.whatIsIncluded||[]).join(', ')}. Plus bonuses: ${bonusList}. ${finalOffer.guarantee} ${finalOffer.suggestedPrice}.`;
}

function renderOfferHandoff(handoff) {
  document.getElementById('buildLocked').style.display = 'none';
  document.getElementById('buildReady').style.display = 'block';

  const bonusList = (handoff.bonuses || []).map(b =>
    `<li><strong>${esc(b.title)}</strong> — ${esc(b.description)}</li>`
  ).join('');

  const vsList = (handoff.valueStack || []).map(v =>
    `<li><strong>${esc(v.bonusName)}</strong> — solves: ${esc(v.objectionItSolves)}</li>`
  ).join('');

  document.getElementById('offerHandoffContent').innerHTML = `
    <div class="handoff-field">
      <div class="handoff-field-label">Product Name</div>
      <div class="handoff-field-value" style="font-size:20px;font-weight:700;color:var(--text)">${esc(handoff.productName)}</div>
    </div>
    <div class="handoff-field">
      <div class="handoff-field-label">Tagline</div>
      <div class="handoff-field-value" style="font-style:italic">"${esc(handoff.tagline)}"</div>
    </div>
    <div class="handoff-field">
      <div class="handoff-field-label">Who This Is For</div>
      <div class="handoff-field-value">${esc(handoff.targetAudience)}</div>
    </div>
    <div class="handoff-field">
      <div class="handoff-field-label">The Core Promise</div>
      <div class="handoff-field-value">${esc(handoff.corePromise)}</div>
    </div>
    <div class="handoff-field">
      <div class="handoff-field-label">The One-Liner Pitch</div>
      <div class="handoff-field-value" style="font-style:italic;color:var(--text)">"${esc(handoff.oneLiner)}"</div>
    </div>
    <div class="handoff-field">
      <div class="handoff-field-label">What's Included</div>
      <ul class="handoff-list">${(handoff.coreProduct?.structure||[]).map(i=>`<li>${esc(i)}</li>`).join('')}</ul>
    </div>
    <div class="handoff-field">
      <div class="handoff-field-label">Value Stack (${(handoff.valueStack||[]).length} items)</div>
      <ul class="handoff-list">${vsList}</ul>
    </div>
    <div class="handoff-field">
      <div class="handoff-field-label">Audience Language</div>
      <div class="handoff-field-value mono">${esc(handoff.audienceLanguage.slice(0,300))}...</div>
    </div>
    <div class="handoff-field">
      <div class="handoff-field-label">Tone Guide</div>
      <div class="handoff-field-value mono">${esc(handoff.toneGuide.slice(0,200))}...</div>
    </div>
    <div class="handoff-field">
      <div class="handoff-field-label">Price</div>
      <div class="handoff-field-value">${esc(handoff.suggestedPrice)}</div>
    </div>
    <div class="handoff-field">
      <div class="handoff-field-label">Guarantee</div>
      <div class="handoff-field-value">${esc(handoff.guarantee)}</div>
    </div>
  `;
}
