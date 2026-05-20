// ══════════════════════════════════════
// IDEA SOURCING
// ══════════════════════════════════════

let selectedMethod = null;
let sourcedIdeas = null;

function selectMethod(n) {
  selectedMethod = n;
  document.getElementById('methodCard1').classList.toggle('selected', n === 1);
  document.getElementById('methodCard2').classList.toggle('selected', n === 2);
  const catInput = document.getElementById('categoryInput');
  catInput.style.display = n === 1 ? 'block' : 'none';
  document.getElementById('sourceBtn').disabled = false;
  document.getElementById('sourceHint').textContent = n === 1
    ? 'Enter a category above, then hunt'
    : 'Ready — the tool will follow the strongest signals';
}

const SOURCE_SYSTEM = `You are an expert market researcher, digital product strategist and opportunity analyst with deep expertise in finding underserved, high demand niches for digital products. Your job is to surface genuinely great ideas — not obvious ones, not trending ones, not crowded ones. Specific, niche, fresh opportunities where real pain exists, money is already moving and the product market has not caught up yet.

This is the most important research task in the entire tool. The quality of everything that follows depends entirely on the quality of the ideas you surface here. Do not rush. Do not settle for obvious. Hunt for gems.

Research these sources thoroughly: Reddit subreddits where people vent and ask for help, YouTube comments where people say what the video failed to give them, Amazon and Gumroad one/two/three star reviews of existing products, Google search suggestions and related searches, Facebook groups and online forums, Quora questions asked repeatedly with unsatisfying answers.

Read what you find carefully before forming any ideas. The ideas must emerge from the research. Let the pain lead you to the idea.

Every idea must pass all ten criteria:
1. Hungry Audience — identifiable group actively feeling this pain now
2. Willingness To Pay — money already moving in this space
3. Gap — existing solutions fail this audience in a specific demonstrable way
4. Accessibility — buildable as a written digital product, no credentials required
5. Specificity — narrow enough to own, niche within a niche
6. Urgency — pain is present tense, needed now
7. Emotional Intensity — genuine suffering, not mild inconvenience
8. Underrepresentation — loud community conversation, thin product market
9. Word Of Mouth Potential — transformation people naturally share
10. Repeat Pain — recurring problem or new people constantly entering the same situation

Surface 2-5 ideas. Rank strongest to weakest. Be precise and concise — one sentence of evidence per criterion, not a paragraph. Depth comes from precision not length.

Return ONLY raw JSON, no markdown:
{
  "ideas": [
    {
      "rank": 1,
      "title": "Specific niche idea stated precisely",
      "pain": "The pain in the audience's own words — 2 sentences max",
      "audience": "Who exactly — named precisely in one sentence",
      "oneLiner": "The idea at its sharpest",
      "gemVerdict": "strong gem|promising candidate|proceed with caution",
      "gemAssessment": "2-3 sentences: what makes it strong, where caution is warranted, honest verdict",
      "criteria": {
        "hungryAudience": { "evidence": "One precise sentence from research", "confidence": "high|medium|low" },
        "willingnessToPay": { "evidence": "One precise sentence from research", "confidence": "high|medium|low" },
        "gap": { "evidence": "One precise sentence from research", "confidence": "high|medium|low" },
        "accessibility": { "evidence": "One precise sentence from research", "confidence": "high|medium|low" },
        "specificity": { "evidence": "One precise sentence from research", "confidence": "high|medium|low" },
        "urgency": { "evidence": "One precise sentence from research", "confidence": "high|medium|low" },
        "emotionalIntensity": { "evidence": "One precise sentence from research", "confidence": "high|medium|low" },
        "underrepresentation": { "evidence": "One precise sentence from research", "confidence": "high|medium|low" },
        "wordOfMouth": { "evidence": "One precise sentence from research", "confidence": "high|medium|low" },
        "repeatPain": { "evidence": "One precise sentence from research", "confidence": "high|medium|low" }
      },
      "criteriaScores": {
        "hungryAudience": 8, "willingnessToPay": 7, "gap": 9, "accessibility": 10,
        "specificity": 8, "urgency": 9, "emotionalIntensity": 8,
        "underrepresentation": 9, "wordOfMouth": 7, "repeatPain": 8, "total": 83
      }
    }
  ],
  "huntingNotes": "3-5 sentences: strongest signals found, most underrepresented spaces, what warrants further investigation"
}`;

const SOURCE_STEPS = [
  'Searching Reddit for recurring frustrations...',
  'Reading YouTube comments...',
  'Scanning low-rated reviews on Amazon and Gumroad...',
  'Following Google search suggestions...',
  'Looking for loud conversations with thin product markets...',
  'Evaluating ideas against all ten criteria...',
  'Ranking candidates by evidence strength...',
];

async function runIdeaSourcing() {
  const method = selectedMethod;
  const category = document.getElementById('categoryInput').value.trim();
  if (method === 1 && !category) {
    document.getElementById('sourceHint').textContent = 'Enter a category first';
    return;
  }

  document.getElementById('sourceBtn').disabled = true;
  document.getElementById('sourceResults').classList.remove('active');
  document.getElementById('sourceLoading').style.display = 'block';

  const logEl = document.getElementById('sourceLog');
  const intv = setInterval(() => {
    if (i >= SOURCE_STEPS.length) { clearInterval(intv); return; }
    logEl.querySelectorAll('.log-line.latest').forEach(el => el.classList.remove('latest'));
    const line = document.createElement('div');
    line.className = 'log-line latest';
    line.textContent = SOURCE_STEPS[i++];
    logEl.appendChild(line);
  }, 4000);

  const userMsg = method === 1
    ? `Hunt for underserved digital product ideas within: "${category}". Research thoroughly across Reddit, YouTube comments, Amazon reviews, Google searches and forums. Surface 2-5 ranked gem candidates. Return only the JSON object.`
    : `You have full autonomy. No category specified. Follow the strongest signals you find across the internet — go where genuine pain, underrepresentation and willingness to pay intersect. Do not default to popular or obvious spaces. Hunt specifically for conversations happening loudly in communities that the product market has not yet answered adequately. Research thoroughly across Reddit, YouTube comments, Amazon reviews, Google searches and forums. Surface 2-5 ranked gem candidates. Return only the JSON object.`;

  try {
    const text = await callClaude(SOURCE_SYSTEM + CONCISE, [{ role: 'user', content: userMsg }], true, 5000, OPUS);
    stopProgress(intv);
    document.getElementById('sourceLoading').style.display = 'none';

    let parsed;
    try {
      parsed = parseJSON(text);
    } catch(e) {
      // Fallback — show raw text if JSON parse fails
      document.getElementById('sourceResults').classList.add('active');
      document.getElementById('ideaCardsList').innerHTML = `<div style="font-family:var(--mono);font-size:13px;color:var(--muted);padding:20px;background:var(--surface);border:1px solid var(--border);border-radius:4px;white-space:pre-wrap;line-height:1.7">${esc(text)}</div>`;
      document.getElementById('sourceBtn').disabled = false;
      return;
    }

    sourcedIdeas = parsed;
    renderSourcedIdeas(parsed);

  // Save to supabase if connected
    if (db && currentUser) {
      try {
        await db.from('idea_sources').upsert({
          id: Date.now().toString(),
          user_id: currentUser.id,
          method: method === 1 ? 'category' : 'autonomous',
          category: category || null,
          results: parsed,
          created_at: new Date().toISOString()
        });
      } catch(e) { console.log('Source save note:', e.message); }
    }

  } catch(err) {
    stopProgress(intv);
    document.getElementById('sourceLoading').style.display = 'none';
    document.getElementById('sourceBtn').disabled = false;
    alert('Error during idea sourcing: ' + err.message);
    console.error(err);
  }
}

function renderSourcedIdeas(data) {
  const list = document.getElementById('ideaCardsList');
  list.innerHTML = '';

  const criteriaKeys = ['hungryAudience','willingnessToPay','gap','accessibility','specificity','urgency','emotionalIntensity','underrepresentation','wordOfMouth','repeatPain'];
  const criteriaShort = ['Hungry','Pays','Gap','Access','Specific','Urgent','Emotion','Underrep','WOM','Repeat'];

  (data.ideas || []).forEach(idea => {
    const gemCls = idea.gemVerdict === 'strong gem' ? 'strong' : idea.gemVerdict === 'promising candidate' ? 'promising' : 'caution';
    const gemLabel = idea.gemVerdict === 'strong gem' ? '★ Strong Gem' : idea.gemVerdict === 'promising candidate' ? '◆ Promising' : '⚠ Caution';

    const criteriaHtml = criteriaKeys.map((key, i) => {
      const score = idea.criteriaScores?.[key] || 0;
      const cls = score >= 8 ? 'high' : score >= 6 ? 'med' : 'low';
      return `<div class="idea-criterion">
        <div class="idea-criterion-name">${criteriaShort[i]}</div>
        <div class="idea-criterion-score ${cls}">${score}</div>
      </div>`;
    }).join('');

    const evidenceHtml = criteriaKeys.map((key, i) => {
      const c = idea.criteria?.[key];
      if (!c) return '';
      return `<div style="padding:8px 0;border-bottom:1px solid var(--border)">
        <div style="font-family:var(--mono);font-size:10px;color:var(--muted);margin-bottom:3px;display:flex;align-items:center;justify-content:space-between">
          <span>${criteriaShort[i]}. ${key.replace(/([A-Z])/g,' $1').trim()}</span>
          <span style="color:${c.confidence==='high'?'var(--green)':c.confidence==='medium'?'var(--yellow)':'var(--red)'}">${c.confidence}</span>
        </div>
        <div style="font-family:Georgia,serif;font-size:13px;color:#888;line-height:1.6">${esc(c.evidence)}</div>
      </div>`;
    }).join('');

    const card = document.createElement('div');
    card.className = 'idea-card';
    card.innerHTML = `
      <div class="idea-card-header">
        <span class="idea-card-rank">Idea ${idea.rank}</span>
        <span class="idea-card-title">${esc(idea.title)}</span>
        <span class="idea-card-gem ${gemCls}">${gemLabel}</span>
      </div>
      <div class="idea-card-body">
        <div class="idea-card-pain">"${esc(idea.pain)}"</div>
        <div class="idea-card-oneliner">${esc(idea.oneLiner)}</div>
        <div style="font-family:var(--mono);font-size:10px;letter-spacing:.15em;text-transform:uppercase;color:var(--muted);margin-bottom:10px">Scores Across Ten Criteria (out of 10)</div>
        <div class="idea-criteria-grid">${criteriaHtml}</div>
        <div style="font-family:var(--mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin:14px 0 8px">Total Score: <strong style="color:var(--text);font-size:14px">${idea.criteriaScores?.total || '—'}/100</strong></div>
        <details style="margin-bottom:16px">
          <summary style="font-family:var(--mono);font-size:11px;color:var(--muted);cursor:pointer;padding:8px 0">View evidence for all criteria</summary>
          <div style="margin-top:8px">${evidenceHtml}</div>
        </details>
        <div class="idea-card-assessment">${esc(idea.gemAssessment)}</div>
        <button class="btn-select-idea" onclick="selectIdea(${idea.rank - 1})">Select This Idea — Validate It →</button>
      </div>
    `;
    list.appendChild(card);
  });

  if (data.ideas?.length) {
    const thead = `<tr><th>Rank</th><th>Idea</th><th>Verdict</th><th>Score</th></tr>`;
    const rows = data.ideas.map(idea => `
      <tr>
        <td>${idea.rank}</td>
        <td style="color:var(--text);max-width:320px">${esc(idea.title)}</td>
        <td><span class="idea-card-gem ${idea.gemVerdict==='strong gem'?'strong':idea.gemVerdict==='promising candidate'?'promising':'caution'}" style="display:inline-block">${idea.gemVerdict}</span></td>
        <td style="color:var(--green);font-weight:700">${idea.criteriaScores?.total || '—'}/100</td>
      </tr>
    `).join('');
    document.getElementById('rankingTable').innerHTML = thead + rows;
    document.getElementById('rankingTableWrap').style.display = 'block';
  }

  if (data.huntingNotes) {
    document.getElementById('huntingNotesBody').textContent = data.huntingNotes;
    document.getElementById('huntingNotes').style.display = 'block';
  }

  document.getElementById('sourceResults').classList.add('active');
  document.getElementById('sourceBtn').disabled = false;
  document.getElementById('sourceResults').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function selectIdea(index) {
  const idea = sourcedIdeas?.ideas?.[index];
  if (!idea) return;
  document.getElementById('ideaInput').value = idea.title + '. ' + idea.oneLiner;
  switchTab('validate');
  document.getElementById('ideaInput').focus();
  document.getElementById('ideaInput').scrollIntoView({ behavior: 'smooth', block: 'center' });
}
