// ══════════════════════════════════════
// UTILS — callClaude, parseJSON, progress
// ══════════════════════════════════════

// Model constants
const OPUS = 'claude-opus-4-7';
const SONNET = 'claude-sonnet-4-6';

// Universal conciseness instruction appended to every system prompt
const CONCISE = '\n\nBe precise and concise throughout. Every insight stated once, clearly. No repetition across sections. Depth comes from precision not length. Do not pad.';

function startProgress(logId, steps, interval) {
  const log = document.getElementById(logId);
  if (!log) return null;
  log.innerHTML = '';
  let i = 0;
  const intv = setInterval(() => {
    if (i >= steps.length) { clearInterval(intv); return; }
    log.querySelectorAll('.log-line.latest').forEach(el => el.classList.remove('latest'));
    const line = document.createElement('div');
    line.className = 'log-line latest';
    line.textContent = steps[i++];
    log.appendChild(line);
  }, interval || 3000);
  return intv;
}

function stopProgress(intv) {
  if (intv) clearInterval(intv);
}

async function callClaude(systemPrompt, messages, useSearch, maxTokens, model) {
  const mdl = model || SONNET;
  const tools = useSearch ? [{ type: 'web_search_20250305', name: 'web_search' }] : [];
  let finalText = null;
  let turns = 0;
  const allMessages = [...messages];

  while (!finalText && turns < 15) {
    turns++;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 55000);
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: mdl,
          max_tokens: maxTokens || 4000,
          system: systemPrompt,
          tools,
          messages: allMessages,
        }),
      });
      clearTimeout(timer);
      if (!res.ok) { const e = await res.json(); throw new Error(e.error?.message || 'API error ' + res.status); }
      const data = await res.json();
      allMessages.push({ role: 'assistant', content: data.content });
      if (data.stop_reason === 'end_turn') {
        finalText = data.content.filter(b => b.type === 'text').map(b => b.text).join('');
      } else if (data.stop_reason === 'tool_use') {
        const tb = data.content.filter(b => b.type === 'tool_use' || b.type === 'server_tool_use');
        if (!tb.length) break;
        allMessages.push({ role: 'user', content: tb.map(b => ({ type: 'tool_result', tool_use_id: b.id, content: b.output || 'Search completed.' })) });
      } else {
        finalText = data.content.filter(b => b.type === 'text').map(b => b.text).join('');
      }
    } catch(e) {
      clearTimeout(timer);
      if (e.name === 'AbortError') throw new Error('Request timed out. Please try again.');
      throw e;
    }
  }
  if (!finalText) throw new Error('No response received. Please try again.');
  return finalText;
}

function parseJSON(text) {
  const clean = text.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
  const s = clean.indexOf('{'), e = clean.lastIndexOf('}');
  if (s < 0 || e < 0) throw new Error('Could not parse response. Please try again.');
  return JSON.parse(clean.slice(s, e + 1));
}
