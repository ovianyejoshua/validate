// ══════════════════════════════════════
// UTILS — streaming callClaude
// ══════════════════════════════════════

const OPUS = 'claude-opus-4-6';
const SONNET = 'claude-sonnet-4-6';
const CONCISE = '\n\nBe precise and concise throughout. Every insight stated once, clearly. No repetition across sections. Depth comes from precision not length. Do not pad.';

// ── Progress log helper ──
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

// ── Core streaming function ──
// onChunk(text) called with each new text chunk as it arrives
// onSearch() called when a web search turn starts
// Returns the complete final text when stream ends
async function callClaudeStream(systemPrompt, messages, useSearch, maxTokens, model, onChunk, onSearch) {
  const mdl = model || SONNET;
  const tools = useSearch ? [{ type: 'web_search_20250305', name: 'web_search' }] : [];
  let finalText = '';
  let turns = 0;
  const allMessages = [...messages];

  while (turns < 15) {
    turns++;

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'interleaved-thinking-2025-05-14',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: mdl,
        max_tokens: maxTokens || 4000,
        system: systemPrompt,
        tools,
        messages: allMessages,
        stream: true,
      }),
    });

    if (!res.ok) {
      const e = await res.json();
      throw new Error(e.error?.message || 'API error ' + res.status);
    }

    // Read the stream
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let turnText = '';
    let stopReason = null;
    let toolUseBlocks = [];
    let currentToolUse = null;
    let inToolUse = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop(); // keep incomplete line

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') break;
        if (!data) continue;

        let event;
        try { event = JSON.parse(data); } catch { continue; }

        if (event.type === 'content_block_start') {
          if (event.content_block?.type === 'tool_use' || event.content_block?.type === 'server_tool_use') {
            inToolUse = true;
            currentToolUse = { id: event.content_block.id, type: event.content_block.type, name: event.content_block.name, input: '' };
            if (onSearch) onSearch(event.content_block.name);
          }
        }

        if (event.type === 'content_block_delta') {
          if (event.delta?.type === 'text_delta') {
            const chunk = event.delta.text || '';
            turnText += chunk;
            finalText += chunk;
            if (onChunk) onChunk(chunk);
          }
          if (event.delta?.type === 'input_json_delta' && currentToolUse) {
            currentToolUse.input += event.delta.partial_json || '';
          }
        }

        if (event.type === 'content_block_stop') {
          if (inToolUse && currentToolUse) {
            toolUseBlocks.push(currentToolUse);
            currentToolUse = null;
            inToolUse = false;
          }
        }

        if (event.type === 'message_delta') {
          stopReason = event.delta?.stop_reason;
        }
      }
    }

    // Build assistant message content
    const assistantContent = [];
    if (turnText) assistantContent.push({ type: 'text', text: turnText });
    toolUseBlocks.forEach(tb => assistantContent.push({ type: tb.type, id: tb.id, name: tb.name, input: {} }));
    if (assistantContent.length) allMessages.push({ role: 'assistant', content: assistantContent });

    if (stopReason === 'end_turn' || !stopReason) break;

    if (stopReason === 'tool_use' && toolUseBlocks.length > 0) {
      // Continue with tool results
      allMessages.push({
        role: 'user',
        content: toolUseBlocks.map(tb => ({
          type: 'tool_result',
          tool_use_id: tb.id,
          content: tb.input || 'Search completed.'
        }))
      });
      toolUseBlocks = [];
      turnText = '';
    } else {
      break;
    }
  }

  if (!finalText) throw new Error('No response received. Please try again.');
  return finalText;
}

// ── callClaude — wraps streaming, returns complete text ──
// Drop-in replacement for the old fetch-based version
// No timeout needed — streaming means data always flows
async function callClaude(systemPrompt, messages, useSearch, maxTokens, model) {
  return callClaudeStream(systemPrompt, messages, useSearch, maxTokens, model, null, null);
}

// ── callClaudeToElement — streams directly into a DOM element ──
// Use this for text output stages (sales page, ad variations, etc)
// onDone(fullText) called when complete
async function callClaudeToElement(systemPrompt, messages, useSearch, maxTokens, model, elementId, onDone) {
  const el = document.getElementById(elementId);
  if (el) el.textContent = '';
  let full = '';

  await callClaudeStream(
    systemPrompt, messages, useSearch, maxTokens, model,
    (chunk) => {
      full += chunk;
      if (el) el.textContent = full;
    },
    (searchName) => {
      if (el) {
        const indicator = document.createElement('div');
        indicator.style.cssText = 'font-family:var(--mono);font-size:10px;color:var(--muted);margin:4px 0;';
        indicator.textContent = '⟳ Searching...';
        indicator.className = 'search-indicator';
        el.appendChild(indicator);
      }
    }
  );

  if (onDone) onDone(full);
  return full;
}

function parseJSON(text) {
  const clean = text.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
  const s = clean.indexOf('{'), e = clean.lastIndexOf('}');
  if (s < 0 || e < 0) throw new Error('Could not parse response. Please try again.');
  return JSON.parse(clean.slice(s, e + 1));
}
