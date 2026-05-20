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
1. Hungry Audience — clearly identifiable group actively feeling this pain right now
2. Willingness To Pay — money already moving, people buying even inadequate solutions
3. Gap — existing solutions fail this audience in a specific demonstrable way
4. Accessibility — can be built as a written digital product without requiring credentials or technical expertise
5. Specificity — narrow enough to own, niche within a niche
6. Urgency — pain is present tense, they need a solution now
7. Emotional Intensity — deep suffering not mild inconvenience
8. Underrepresentation — conversation loud in communities but quiet in product market
9. Word Of Mouth Potential — transformation people naturally share
10. Repeat Pain — problem recurs or new people keep entering the same painful situation

Surface between 5 and 10 ideas. Never more. Rank from strongest to weakest.

Return ONLY a raw JSON object, no markdown fences:
{
  "ideas": [
    {
      "rank": 1,
      "title": "Specific niche idea stated precisely",
      "pain": "The pain in the audience's own words and emotional register",
      "audience": "Who exactly this is for — named precisely",
      "oneLiner": "The idea distilled to its sharpest most specific form",
      "gemVerdict": "strong gem" | "promising candidate" | "proceed with caution",
      "gemAssessment": "Honest paragraph on overall strength, where evidence is strongest, where caution is warranted",
      "criteria": {
        "hungryAudience": { "evidence": "what research found", "confidence": "high|medium|low" },
        "willingnessToPay": { "evidence": "what research found", "confidence": "high|medium|low" },
        "gap": { "evidence": "what research found", "confidence": "high|medium|low" },
        "accessibility": { "evidence": "what research found", "confidence": "high|medium|low" },
        "specificity": { "evidence": "what research found", "confidence": "high|medium|low" },
        "urgency": { "evidence": "what research found", "confidence": "high|medium|low" },
        "emotionalIntensity": { "evidence": "what research found", "confidence": "high|medium|low" },
        "underrepresentation": { "evidence": "what research found", "confidence": "high|medium|low" },
        "wordOfMouth": { "evidence": "what research found", "confidence": "high|medium|low" },
        "repeatPain": { "evidence": "what research found", "confidence": "high|medium|low" }
      },
      "criteriaScores": {
        "hungryAudience": 8,
        "willingnessToPay": 7,
        "gap": 9,
        "accessibility": 10,
        "specificity": 8,
        "urgency": 9,
        "emotionalIntensity": 8,
        "underrepresentation": 9,
        "wordOfMouth": 7,
        "repeatPain": 8,
        "total": 83
      }
    }
  ],
  "huntingNotes": "What the research revealed about the broader landscape, strongest signals, most underrepresented spaces, what would be investigated further"
}`;

const SOURCE_STEPS = [
  'Searching Reddit for recurring frustrations...',
  'Reading YouTube comments for what videos failed to deliver...',
  'Scanning one and two star reviews on Amazon and Gumroad...',
  'Following Google search suggestions and related searches...',
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
  logEl.innerHTML = '';
  let i = 0;
  const intv = setInterval(() => {
    if (i >= SOURCE_STEPS.length) { clearInterval(intv); return; }
    logEl.querySelectorAll('.log-line.latest').forEach(el => el.classList.remove('latest'));
    const line = document.createElement('div');
    line.className = 'log-line latest';
    line.textContent = SOURCE_STEPS[i++];
    logEl.appendChild(line);
  }, 4000);

  const userMsg = method === 1
    ? `Hunt for underserved digital product ideas within this category: "${category}". Research thoroughly across Reddit, YouTube comments, Amazon reviews, Google searches and forums. Surface 5-10 ranked gem candidates. Return only the JSON object.`
    : `You have full autonomy. No category specified. Follow the strongest signals you find across the internet — go where genuine pain, underrepresentation and willingness to pay intersect. Do not default to popular or obvious spaces. Hunt specifically for conversations happening loudly in communities that the product market has not yet answered adequately. Research thoroughly across Reddit, YouTube comments, Amazon reviews, Google searches and forums. Surface 5-10 ranked gem candidates. Return only the JSON object.`;

  try {
    const text = await callClaude(SOURCE_SYSTEM, [{ role: 'user', content: userMsg }], true, 8000);
    clearInterval(intv);
    document.getElementById('sourceLoading').style.display = 'none';

    const clean = text.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
    const s = clean.indexOf('{'), e = clean.lastIndexOf('}');
    if (s < 0 || e < 0) throw new Error('Could not parse sourcing results.');
    const parsed = JSON.parse(clean.slice(s, e + 1));

    sourcedIdeas = parsed;
    renderSourcedIdeas(parsed);

    // Save to supabase if connected
    if (db) {
      try {
        await db.from('idea_sources').upsert({
          id: Date.now().toString(),
          user_id: currentUser?.id || 'anonymous',
          method: method === 1 ? 'category' : 'autonomous',
          category: category || null,
          results: parsed,
          created_at: new Date().toISOString()
        });
      } catch(e) { console.log('Source save note:', e.message); }
    }

  } catch(err) {
    clearInterval(intv);
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
      const confCls = c.confidence === 'high' ? 'high' : c.confidence === 'medium' ? 'med' : 'low';
      return `<div style="padding:10px 0;border-bottom:1px solid var(--border)">
        <div style="font-family:var(--mono);font-size:10px;color:var(--muted);margin-bottom:4px;display:flex;align-items:center;justify-content:space-between">
          <span>${criteriaShort[i]}. ${key.replace(/([A-Z])/g,' $1').trim()}</span>
          <span style="color:${c.confidence==='high'?'var(--green)':c.confidence==='medium'?'var(--yellow)':'var(--red)'}">${c.confidence}</span>
        </div>
        <div style="font-family:Georgia,serif;font-size:13px;color:#888;line-height:1.65">${esc(c.evidence)}</div>
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

  // Ranking table
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

  // Hunting notes
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
  // Populate the validate tab with this idea
  document.getElementById('ideaInput').value = idea.title + '. ' + idea.oneLiner;
  switchTab('validate');
  document.getElementById('ideaInput').focus();
  // Scroll to textarea
  document.getElementById('ideaInput').scrollIntoView({ behavior: 'smooth', block: 'center' });
}
