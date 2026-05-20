//═════════════════════════════════════
// SMART TOKEN OPTIMIZATION
// ══════════════════════════════════════
// Each downstream section only receives the audience intelligence sections it needs

function aiSlice(...keys) {
  if (!audienceIntel) return '';
  const map = {
    language:     audienceIntel.section1 || '',
    emotional:    audienceIntel.section2 || '',
    thinking:     audienceIntel.section3 || '',
    behaviour:    audienceIntel.section4 || '',
    problemChain: audienceIntel.section5 || '',
    signals:      audienceIntel.section6 || '',
    implications: audienceIntel.section7 || '',
    summary:      audienceIntel.summary  || ''
  };
  const labels = {
    language:     'THEIR LANGUAGE',
    emotional:    'THEIR EMOTIONAL STATE',
    thinking:     'THEIR THINKING',
    behaviour:    'THEIR BEHAVIOUR',
    problemChain: 'THE PROBLEM CHAIN',
    signals:      'SIGNAL STRENGTH',
    implications: 'IMPLICATIONS',
    summary:      'CORE AUDIENCE SUMMARY'
  };
  return keys.map(k => map[k] ? (labels[k] + ':\n' + map[k]) : '').filter(Boolean).join('\n\n');
}

// Base offer + validation context (no AI sections — each function adds its own slice)
function baseContext() {
  const r = currentReport || {};
  const fo = finalisedOffer || {};
  return `IDEA: ${currentIdea}

VALIDATION:
Verdict: ${r.verdict} — ${r.verdictReason}
Pain Level: ${r.painLevel}
Pain Summary: ${r.painSummary}
Recency: ${r.recency?.label} — ${r.recency?.detail}
What people say: ${(r.exactPhrases||[]).join(' | ')}
Gap: ${r.gapAnalysis?.gap}
Existing solutions: ${r.gapAnalysis?.existingSolutions}
Suggested angles: ${(r.suggestedAngles||[]).map(a=>a.angle+': '+a.reason).join(' | ')}

FINALISED OFFER:
Product: ${fo.productName || ''}
Tagline: ${fo.tagline || ''}
Audience: ${fo.targetAudience || ''}
Promise: ${fo.corePromise || ''}
One-liner: ${fo.oneLiner || ''}
Included: ${(fo.coreProduct?.structure||[]).join(', ')}
Bonuses: ${(fo.bonuses||[]).map(b=>b.title+': '+b.description).join(' | ')}
Guarantee: ${fo.guarantee || ''}
Price: ${fo.suggestedPrice || ''}
Chosen Angle: ${fo.chosenAngle || ''}
Objections: ${(fo.objections||[]).join(' | ')}
Value Stack: ${(fo.valueStack||[]).map(v=>v.bonusName+': '+v.bonusDescription).join(' | ')}`;
}

function reportContext() {
  if (!currentReport) return '';
  // Strategist chat: language + thinking + implications
  const aiContext = audienceIntel ? `

AUDIENCE INTELLIGENCE:
${aiSlice('language','thinking','implications','summary')}` : '';
  return `IDEA: ${currentIdea}
VERDICT: ${currentReport.verdict} — ${currentReport.verdictReason}
PAIN LEVEL: ${currentReport.painLevel}
PAIN SUMMARY: ${currentReport.painSummary}
RECENCY: ${currentReport.recency?.label} — ${currentReport.recency?.detail}
WHAT PEOPLE SAY: ${(currentReport.exactPhrases||[]).join(' | ')}
EXISTING SOLUTIONS: ${currentReport.gapAnalysis?.existingSolutions}
THE GAP: ${currentReport.gapAnalysis?.gap}
SUGGESTED ANGLES: ${(currentReport.suggestedAngles||[]).map(a=>a.angle+': '+a.reason).join(' | ')}${aiContext}`;
}

