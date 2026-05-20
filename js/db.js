
// ══════════════════════════════════════
// DATABASE
// ══════════════════════════════════════
async function dbSave(data) {
  if (!db) return;
  try {
    const { error } = await db.from('validations').upsert(data);
    if (error) console.error('DB save error:', error);
  } catch(e) { console.error('DB exception:', e); }
}

async function dbLoad(id) {
  if (!db) return null;
  try {
    const { data, error } = await db.from('validations').select('*').eq('id', id).single();
    if (error) { console.error('DB load error:', error); return null; }
    return data;
  } catch(e) { console.error('DB load exception:', e); return null; }
}

async function dbLoadAll() {
  if (!db) return [];
  try {
    const { data, error } = await db.from('validations').select('id,idea,report,created_at,refine_history,objections,value_stack,final_offer,audience_intel,finalised_offer,blueprint,approved_blueprint,chapters,build_complete,sales_strategy,sales_page,ad_intelligence,ad_variations,ad_iterations,cumulative_learning_log,backend_architecture').order('created_at', { ascending: false }).limit(50);
    if (error) { console.error('DB loadAll error:', error); return []; }
    return data || [];
  } catch(e) { console.error('DB loadAll exception:', e); return []; }
}

async function dbDelete(id) {
  if (!db) return;
  try {
    const { error } = await db.from('validations').delete().eq('id', id);
    if (error) console.error('DB delete error:', error);
  } catch(e) { console.error('DB delete exception:', e); }
}

async function saveCurrentState() {
  if (!currentId) return;
  await dbSave({
    id: currentId,
    idea: currentIdea,
    report: currentReport,
    refine_history: refineHistory,
    objections: objections,
    value_stack: valueStack,
    final_offer: finalOffer,
    updated_at: new Date().toISOString(),
  });
}
