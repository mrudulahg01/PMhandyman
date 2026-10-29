import { JOURNEYS, SEGMENTS, PERIODS, getJourneyData } from './data.js';

const icons = {
  radar: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="m12 12 7-7"/><circle cx="12" cy="12" r="1"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  route: '<circle cx="6" cy="5" r="2"/><circle cx="18" cy="19" r="2"/><path d="M6 7v8a4 4 0 0 0 4 4h6M8 5h6a4 4 0 0 1 0 8h-4"/>',
  flask: '<path d="M9 3h6M10 3v6L4 19a1.5 1.5 0 0 0 1.3 2h13.4a1.5 1.5 0 0 0 1.3-2L14 9V3M8 15h8"/>',
  spark: '<path d="m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4ZM20 2v4M18 4h4"/>',
  arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/><path d="M16 3a4 4 0 0 1 0 8"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  repeat: '<path d="m17 2 4 4-4 4M3 11V8a2 2 0 0 1 2-2h16M7 22l-4-4 4-4M21 13v3a2 2 0 0 1-2 2H3"/>',
  error: '<circle cx="12" cy="12" r="9"/><path d="M12 7v6m0 4h.01"/>',
  exit: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 14 5-5-5-5M21 12H9"/>',
  message: '<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6A8.4 8.4 0 0 1 12.5 3h.5a8.5 8.5 0 0 1 8 8v.5Z"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 3H20v19H6.5A2.5 2.5 0 0 1 4 19.5v-14A2.5 2.5 0 0 1 6.5 3Z"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>',
  bag: '<rect x="4" y="7" width="16" height="14" rx="2"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/>',
  plug: '<path d="M9 3v5M15 3v5M7 8h10v3a5 5 0 0 1-10 0V8ZM12 16v5"/>',
  refresh: '<path d="M21 11a9 9 0 0 0-15.5-6L3 8M3 3v5h5M3 13a9 9 0 0 0 15.5 6L21 16m-5 0h5v5"/>',
  launch: '<path d="M12 19V5m-7 7 7-7 7 7M5 19h14"/>'
};
const ico = (name, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.route}</svg>`;
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const fmt = value => new Intl.NumberFormat('en-US').format(value);
const pct = value => `${Number(value).toFixed(1)}%`;
const jidIcon = { onboarding:'launch', checkout:'bag', integrations:'plug', renewal:'refresh' };
let saved = [];
try { saved = JSON.parse(localStorage.getItem('friction-radar-experiments') || '[]'); if (!Array.isArray(saved)) saved = []; } catch {}
const state = { journey:'onboarding', segment:'all', period:30, step:null, view:'overview', assistant:'insight', saved };
const app = document.getElementById('app');
const dialog = document.getElementById('dialog');
const periodInfo = () => PERIODS.find(p => p.value === state.period) || PERIODS[1];
const getData = () => getJourneyData(state.journey, state.segment, state.period);
const selectedStep = data => data.steps.find(s => s.id === state.step) || data.worstStep;
const saveKey = step => `${state.journey}:${step.id}:${state.segment}`;
const isSaved = step => state.saved.some(s => s.key === saveKey(step));
const sparkline = (values, cls = '') => {
  const low = Math.min(...values) - 2, high = Math.max(...values) + 2;
  return `<svg class="sparkline ${cls}" viewBox="0 0 180 42" role="img" aria-label="Illustrative step drop-off trend, ${pct(values[0])} to ${pct(values.at(-1))}"><path d="${values.map((v,i) => `${i ? 'L' : 'M'}${(i/(values.length-1)*176+2).toFixed(1)},${(38-(v-low)/(high-low)*34).toFixed(1)}`).join(' ')}" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
};
function render() {
  const focused=document.activeElement;
  const focusId=focused?.id;
  const focusClass=focused?.classList?.[0];
  const focusDataset=focused && app.contains(focused) ? Object.entries(focused.dataset || {}).find(([key])=>['action','segment','step','assistant','journey','revisit','remove'].includes(key)) : null;
  const data = getData();
  const step = selectedStep(data); state.step = step.id;
  app.innerHTML = `<div class="app-shell">
    <aside class="sidebar" aria-label="Main navigation">
      <a href="#" class="brand" data-action="overview"><span class="brand-mark">${ico('radar')}</span><span>friction<span class="brand-light">radar</span><small>CUSTOMER INTELLIGENCE</small></span></a>
      <div class="workspace"><span class="workspace-avatar">N</span><span><strong>Northstar</strong><small>Demo workspace</small></span><span class="workspace-dots">•••</span></div>
      <div class="nav-label">WORKSPACE</div>
      <nav class="main-nav">
        <button data-action="overview" class="nav-item ${state.view === 'overview' ? 'active' : ''}">${ico('grid')}<span>Journey overview</span></button>
        <button data-action="experiments" class="nav-item ${state.view === 'experiments' ? 'active' : ''}">${ico('flask')}<span>Experiments</span><span class="nav-count">${state.saved.length}</span></button>
        <button data-action="examples" class="nav-item">${ico('spark')}<span>Example investigations</span></button>
      </nav>
      <div class="nav-label journey-nav-label">YOUR JOURNEYS <span>04</span></div>
      <nav class="journey-nav">${JOURNEYS.map(j => `<button class="nav-item ${j.id === state.journey && state.view === 'overview' ? 'journey-active' : ''}" data-journey="${j.id}">${ico(jidIcon[j.id])}<span>${escape(j.name)}</span>${j.id === state.journey && state.view === 'overview' ? '<i class="active-dot"></i>' : ''}</button>`).join('')}</nav>
      <div class="sidebar-bottom"><div class="demo-note"><span class="demo-orbit">${ico('radar')}</span><strong>A little clarity goes a long way.</strong><p>Explore the signals. Find your next opportunity.</p><span class="small-demo">SAMPLE DATA</span></div><button class="nav-item" data-action="methodology">${ico('book')}<span>Data & methodology</span>${ico('chevron')}</button><div class="profile"><span class="profile-avatar">JD</span><span><strong>Journey explorer</strong><small>Product team</small></span><span class="status-dot"></span></div></div>
    </aside>
    <div class="main-area"><header class="topbar"><div class="breadcrumb">Workspace ${ico('chevron')} <span>Customer experience</span></div><div class="topbar-right"><span class="sample-tag"><i></i> Interactive demo</span><span class="topbar-divider"></span><span class="avatar">JD</span></div></header>
      <main id="main" tabindex="-1"><div class="page-heading"><div><div class="eyebrow">LESS FRICTION. MORE FORWARD.</div><h1>${state.view === 'experiments' ? 'Your next experiments' : 'Customer journey overview'}<span class="heading-dot">.</span></h1><p>${state.view === 'experiments' ? 'Turn customer signals into small, measurable improvements.' : 'See where customers struggle. Connect the dots. Make the next move.'}</p></div><div class="heading-actions"><button class="button secondary" data-action="examples">${ico('spark')} Explore examples</button><button class="button primary" data-action="export">${ico('download')} Export snapshot</button></div></div>
      ${state.view === 'overview' ? renderOverview(data, step) : renderExperiments()}
      <footer class="page-footer"><span><i class="status-dot"></i> Fictional customers. Real questions worth asking.</span><button data-action="methodology">How the demo works ${ico('arrow')}</button></footer>
      </main>
    </div>
  </div>`;
  const restore=focusId ? document.getElementById(focusId) : focusDataset ? [...app.querySelectorAll('button,a')].find(el=>el.dataset[focusDataset[0]]===focusDataset[1] && (!focusClass || el.classList.contains(focusClass))) : null;
  restore?.focus({preventScroll:true});
}
function renderOverview(data, step) {
  const worst = data.worstStep;
  return `<section class="filterbar" aria-label="Dashboard filters"><label class="journey-picker"><span class="filter-icon">${ico('route')}</span><span class="filter-field"><small>JOURNEY</small><select id="journey-select" aria-label="Journey">${JOURNEYS.map(j => `<option value="${j.id}" ${j.id === state.journey ? 'selected' : ''}>${escape(j.name)}</option>`).join('')}</select></span></label><div class="filter-divider"></div><div class="segment-control"><span class="filter-caption">Segment</span><div class="segmented" aria-label="Customer segment">${['all',...SEGMENTS].map(s => `<button data-segment="${s}" aria-pressed="${s === state.segment}">${s === 'all' ? 'All customers' : s}</button>`).join('')}</div></div><label class="period-picker">${ico('calendar')}<select id="period-select" aria-label="Sample data period">${PERIODS.map(p => `<option value="${p.value}" ${p.value === state.period ? 'selected' : ''}>${p.label}</option>`).join('')}</select></label></section>
  <div class="cohort-caption"><span>${escape(periodInfo().range)} · ${fmt(data.entered)} eligible customers · ${escape(data.journey.completionWindow)} completion window</span><button data-action="methodology">${ico('info')} Metric definitions</button></div>
  <section class="metrics-grid" aria-label="Journey metrics">
    ${metric('Journey completion',pct(data.completionRate),`${fmt(data.completed)} of ${fmt(data.entered)} customers`,'check','teal','Made it to the finish')}
    ${metric('Journey abandonment',pct(data.abandonmentRate),`${fmt(data.abandoned)} customers left the journey`,'exit','coral','Did not finish within the window')}
    ${metric('Repeated attempts',pct(data.repeatRate),`${fmt(data.repeatUsers)} customers tried a step again`,'repeat','amber','Customers, not total attempts')}
    ${metric('Experienced errors',pct(data.errorRate),`${fmt(data.errorUsers)} customers saw an error`,'error','violet','Across any journey milestone')}
  </section>
  <button class="focus-banner" data-step="${worst.id}"><span class="focus-icon">${ico('radar')}</span><span><span class="focus-kicker">YOUR BIGGEST OPPORTUNITY</span><strong>${escape(worst.name)} accounts for ${pct(worst.dropped / data.abandoned * 100)} of journey exits.</strong><span class="focus-sub">${fmt(worst.dropped)} customers lost here · ${escape(worst.theme)}</span></span><span class="focus-action">Investigate ${ico('arrow')}</span></button>
  <div class="dashboard-grid"><div class="left-column">
    <section class="panel funnel-panel" aria-labelledby="funnel-title"><div class="panel-heading"><div><div class="section-overline">THE BIG PICTURE</div><h2 id="funnel-title">${escape(data.journey.name)} funnel</h2><p>Every milestone, from first step to finish.</p></div><button class="button subtle" data-action="define">${ico('route')} Funnel definition</button></div>
    <div class="funnel-total"><span><span class="live-dot"></span> ${fmt(data.entered)} customers started</span><span>${data.steps.length} milestones ${ico('chevron')}</span></div>
    <div class="funnel-columns"><span>MILESTONE</span><span>COMPLETED</span><span>STEP DROP-OFF</span></div>
    <div class="funnel-steps">${data.steps.map((s,i) => `<button class="funnel-step ${s.id === step.id ? 'selected' : ''}" data-step="${s.id}" aria-pressed="${s.id === step.id}" aria-label="${escape(s.name)}: ${fmt(s.completed)} completed, ${pct(s.dropRate)} step drop-off"><span class="step-marker">${i+1}</span><span class="step-content"><span class="step-name">${escape(s.name)} ${s.id === worst.id ? '<span class="risk-dot" title="Most customers lost"></span>' : ''}</span><span class="bar-track"><span class="bar-fill" style="width:${s.completed/data.entered*100}%"></span></span><span class="step-entered">${fmt(s.entered)} entered · ${fmt(s.dropped)} exited</span></span><span class="step-completed">${fmt(s.completed)}<small>${pct(s.completed / data.entered * 100)} of starters</small></span><span class="step-drop ${s.dropRate >= 20 ? 'high' : ''}">${pct(s.dropRate)}${ico('chevron')}</span></button>`).join('')}</div>
    <div class="funnel-legend"><span><i class="legend-dot teal"></i> Cumulative completion</span><span><i class="legend-dot coral"></i> Largest loss</span><span>Click a milestone to investigate ${ico('arrow')}</span></div></section>
    <section class="panel breakdown-panel" aria-labelledby="breakdown-title"><div class="panel-heading"><div><h2 id="breakdown-title">Same step. Different experiences.</h2><p>${escape(step.name)} · compare customer segments</p></div><span class="tag neutral">${state.segment === 'all' ? '3 segments' : state.segment}</span></div>
    <div class="table-scroll"><table class="segment-table"><thead><tr><th>Segment</th><th>Exits / entrants</th><th>Drop-off</th><th>Retried</th><th>Errors</th></tr></thead><tbody>${step.segmentBreakdown.filter(s => state.segment === 'all' || s.segment === state.segment).map(s => `<tr><td><button class="table-segment" data-segment="${escape(s.segment)}"><span class="segment-avatar ${s.segment.toLowerCase()}">${s.segment.slice(0,1)}</span>${escape(s.segment)}</button></td><td>${fmt(s.dropped)} <span class="muted">/ ${fmt(s.entered)}</span></td><td><div class="table-rate"><span class="mini-track"><i style="width:${s.dropRate}%"></i></span><strong>${pct(s.dropRate)}</strong></div></td><td>${pct(s.repeatRate)}</td><td>${pct(s.errorRate)}</td></tr>`).join('')}</tbody></table></div><div class="panel-footnote">Drop-off, retry and error rates use customers entering this step. Groups can overlap.</div></section>
    ${renderSupport(step)}
  </div><aside class="right-column" aria-label="Selected milestone investigation">${renderAssistant(data,step)}${renderStepDetail(step)}<div class="small-callout">${ico('info')}<p><strong>A signal, not a verdict.</strong> Support comments suggest what to investigate. An experiment helps test the explanation.</p></div></aside></div>`;
}
function metric(label, value, detail, icon, color, note) {
  return `<article class="metric-card"><div class="metric-top"><span>${label}</span><span class="metric-icon ${color}">${ico(icon)}</span></div><div class="metric-value">${value}</div><p>${detail}</p><div class="metric-note">${note}</div></article>`;
}
function renderAssistant(data, step) {
  const segments = [...step.segmentBreakdown].sort((a,b) => b.dropped-a.dropped);
  const leading = state.segment === 'all' ? segments[0] : segments.find(s => s.segment === state.segment);
  const views = { insight:'Connect the dots', compare:'Compare segments', experiment:'Plan an experiment' };
  const comparison = state.segment === 'all'
    ? `At <strong>${escape(step.name)}</strong>, the largest number of exits comes from <strong>${escape(leading.segment)}</strong>: ${fmt(leading.dropped)} of ${fmt(leading.entered)} entrants (${pct(leading.dropRate)}).`
    : `For <strong>${escape(leading.segment)}</strong> customers at <strong>${escape(step.name)}</strong>, ${fmt(leading.dropped)} of ${fmt(leading.entered)} entrants exit here (${pct(leading.dropRate)}).`;
  let body;
  if (state.assistant === 'compare') {
    body = `<h3>Where does the friction concentrate?</h3><p>${comparison}</p>${(state.segment === 'all' ? segments : [leading]).map(s => `<div class="assistant-comparison"><span>${escape(s.segment)}</span><strong>${pct(s.dropRate)} drop-off</strong><small>${fmt(s.dropped)} customers</small></div>`).join('')}<p class="assistant-caveat">Compare rates and cohort sizes together before prioritizing.</p>`;
  } else if (state.assistant === 'experiment') {
    body = `<span class="assistant-label">EXPERIMENT DRAFT</span><h3>${escape(step.experiment.title)}</h3><p>${escape(step.experiment.change)}</p><div class="experiment-measure"><span>SUCCESS METRIC</span><p>${escape(step.experiment.metric)}</p></div><div class="experiment-measure"><span>GUARDRAIL</span><p>${escape(step.experiment.guardrail)}</p></div><p class="assistant-caveat">Suggested design: randomized 50/50 test among eligible step entrants; run through the completion window. Estimate sample size before launch.</p>`;
  } else {
    body = `<span class="assistant-label">A CLOSER LOOK AT STEP ${data.steps.indexOf(step)+1}</span><h3>${escape(step.name)} is losing ${pct(step.dropRate)} of entrants.</h3><p><strong>${fmt(step.dropped)} customers</strong> leave at this milestone. ${pct(step.repeatRate)} try again, and ${pct(step.errorRate)} experience an error.</p><div class="signal-connection"><span class="signal-line"></span><span class="signal-icon">${ico('message')}</span><div><strong>${escape(step.theme)}</strong><small>${fmt(step.supportCount)} related support records in this cohort</small></div></div><span class="assistant-label">HYPOTHESIS TO VALIDATE</span><p>${escape(step.hypothesis)}</p><div class="recommended-experiment"><span>${ico('flask')} PROPOSED EXPERIMENT</span><h4>${escape(step.experiment.title)}</h4><p>${escape(step.experiment.change)}</p><button class="text-button" data-assistant="experiment">See measurement plan ${ico('arrow')}</button></div>`;
  }
  return `<section class="assistant-panel"><div class="assistant-heading"><span class="assistant-brand">${ico('spark')} Radar assistant</span><span class="demo-pill">DEMO</span></div><div class="assistant-context"><i></i>${escape(data.journey.name)} <span>/</span> ${escape(step.name)}</div><div class="assistant-tabs" aria-label="Assistant investigation">${Object.entries(views).map(([key,label])=>`<button data-assistant="${key}" aria-pressed="${state.assistant===key}" title="${label}">${key==='insight'?'Insight':key==='compare'?'Segments':'Experiment'}</button>`).join('')}</div><div class="assistant-body" aria-live="polite">${body}</div><div class="assistant-bottom"><button class="button primary full" data-action="save-experiment">${ico(isSaved(step) ? 'check' : 'plus')} ${isSaved(step) ? 'Added to experiments' : 'Add to experiments'}</button><p>Evidence-linked demo · scripted insights</p></div></section>`;
}
function renderStepDetail(step) {
  const trend = step.trend;
  return `<section class="panel step-detail"><div class="panel-heading"><div><h2>Drop-off pattern</h2><p>${escape(step.name)}</p></div>${ico('route')}</div><div class="trend-summary"><strong>${pct(trend.at(-1))}</strong><span>latest illustrative day</span>${sparkline(trend)}</div><div class="trend-axis"><span>14 illustrative days</span><span>Most recent</span></div><div class="step-stat-row"><span>Repeated attempts</span><strong>${fmt(step.repeatUsers)} <small>(${pct(step.repeatRate)})</small></strong></div><div class="step-stat-row"><span>Experienced errors</span><strong>${fmt(step.errorUsers)} <small>(${pct(step.errorRate)})</small></strong></div><p class="panel-footnote">Trend is illustrative; summary counts are scaled for the selected sample period.</p></section>`;
}
function renderSupport(step) {
  const comments = step.comments;
  return `<section class="panel support-panel" aria-labelledby="support-title"><div class="panel-heading"><div><div class="section-overline">THE VOICE BEHIND THE NUMBERS</div><h2 id="support-title">What customers are saying</h2><p>Support comments related to ${escape(step.name.toLowerCase())}.</p></div><span class="support-counter">${ico('message')} ${fmt(step.supportCount)} records</span></div><div class="theme-line"><span class="theme-chip">${escape(step.theme)}</span><span>Showing ${comments.length} fictional examples</span></div><div class="quotes-list">${comments.length ? comments.map(c => `<article class="quote-card"><div class="quote-heading"><span class="quote-avatar">${escape(c.segment.slice(0,1))}</span><strong>${escape(c.segment)} customer</strong><span>${escape(c.channel)}</span></div><blockquote>“${escape(c.quote)}”</blockquote><div class="quote-meta"><span>${escape(c.id)}</span><span>${escape(c.date)}</span></div></article>`).join('') : '<p class="empty-copy">No sample comments match these filters.</p>'}</div><div class="panel-footnote">Fictional support examples are linked by journey, milestone and segment. Related comments do not prove causation.</div></section>`;
}
function renderExperiments() {
  return `<section class="experiments-intro"><div>${ico('flask')}<div><h2>A small change can move the whole journey.</h2><p>Save proposals from any milestone. Your drafts stay in this browser.</p></div></div><button class="button secondary" data-action="overview">Explore journeys ${ico('arrow')}</button></section>${state.saved.length ? `<div class="experiment-grid">${state.saved.map(item => `<article class="panel experiment-card"><div class="experiment-card-top"><span class="tag teal">PROPOSED</span><button class="icon-button" data-remove="${escape(item.key)}" aria-label="Remove ${escape(item.title)}">${ico('close')}</button></div><div class="experiment-source">${escape(item.journeyName)} / ${escape(item.stepName)} · ${escape(item.segment==='all'?'All customers':item.segment)}</div><h2>${escape(item.title)}</h2><p>${escape(item.change)}</p><div class="experiment-measure"><span>OBSERVED SIGNAL AT SAVE</span><p>${escape(item.evidence)} · ${escape(item.periodLabel)}</p></div><div class="experiment-measure"><span>SUCCESS METRIC</span><p>${escape(item.metric)}</p></div><div class="experiment-measure"><span>GUARDRAIL</span><p>${escape(item.guardrail)}</p></div><button class="text-button" data-revisit="${escape(item.key)}">Revisit the signal ${ico('arrow')}</button></article>`).join('')}</div>` : `<div class="empty-state">${ico('flask')}<h2>Your first experiment starts with a signal.</h2><p>Click a journey milestone, review the evidence, and add the proposed experiment here.</p><button class="button primary" data-action="overview">Find an opportunity ${ico('arrow')}</button></div>`}`;
}
const examples = [
  {journey:'onboarding',index:2,segment:'Startup',title:'Why do new customers stall at setup?',description:'Connect workspace drop-off with confusing setup comments. Test a guided connection flow.',label:'ONBOARDING',icon:'launch'},
  {journey:'checkout',index:3,segment:'Growth',title:'Are payment errors costing conversions?',description:'Connect repeat payment attempts with decline comments. Test clearer recovery guidance.',label:'CHECKOUT',icon:'bag'},
  {journey:'integrations',index:2,segment:'Enterprise',title:'Is the permission request causing hesitation?',description:'Explore authorization exits and consent questions. Test scope explanations and an admin handoff.',label:'INTEGRATIONS',icon:'plug'},
  {journey:'renewal',index:1,segment:'Startup',title:'Does the renewal price feel like a surprise?',description:'Compare plan review exits with pricing comments. Test a transparent renewal comparison.',label:'RENEWAL',icon:'refresh'},
  {journey:'checkout',index:1,segment:'Startup',title:'Why does billing take multiple attempts?',description:'Explore address validation errors and support questions. Test inline examples and validation.',label:'CHECKOUT',icon:'bag'},
  {journey:'integrations',index:4,segment:'Growth',title:'Do customers know their first sync is running?',description:'Connect first-sync exits with waiting-time comments. Test progress estimates and a completion notice.',label:'INTEGRATIONS',icon:'plug'}
];
function openDialog(title, body, wide=false) {
  dialog.className = wide ? 'wide-dialog' : '';
  dialog.innerHTML = `<div class="dialog-header"><div><div class="section-overline">FRICTION RADAR</div><h2 id="dialog-title">${title}</h2></div><button class="icon-button" data-action="close-dialog" aria-label="Close dialog">${ico('close')}</button></div>${body}`;
  dialog.showModal();
}
function showExamples() {
  openDialog('Good questions. Clearer next steps.', `<p class="dialog-description">Choose an investigation to explore its journey, customer segment, support comments and experiment.</p><div class="examples-grid">${examples.map((e,i)=>`<button class="example-card" data-example="${i}"><span class="example-icon">${ico(e.icon)}</span><span class="section-overline">${e.label} · ${e.segment}</span><h3>${e.title}</h3><p>${e.description}</p><span class="example-open">Explore this signal ${ico('arrow')}</span></button>`).join('')}</div>`,true);
}
function showDefinitions() {
  const {journey} = getData();
  openDialog(`${escape(journey.name)} journey definition`, `<p class="dialog-description">${escape(journey.description)} A sequential, closed-cohort funnel with a ${escape(journey.completionWindow)} completion window.</p><div class="definition-list">${journey.steps.map((s,i)=>`<div class="definition-step"><span class="step-marker">${i+1}</span><div><strong>${escape(s.name)}</strong><span>Completion event</span><code>${escape(s.event)}</code></div></div>`).join('')}</div><div class="definition-notice">${ico('info')} These sample funnels are predefined. A future connected version can map your own product events to each milestone.</div>`);
}
function showMethodology() {
  openDialog('A clear view of the sample data', `<div class="methodology"><p><strong>This is an interactive prototype.</strong> All customers, counts, support comments and assistant responses are fictional. No live customer systems or AI service are connected.</p><h3>Cohort & completion</h3><p>The selected period is a synthetic reporting cohort ending October 28, 2026. Every customer has a fully elapsed journey completion window. Later arrivals are excluded. Journey counts are deterministic sample aggregates, scaled for 7, 30 or 90 days.</p><h3>How to read the funnel</h3><p>Steps run in order. Completed customers move into the next step. The last step records the terminal outcome. Bars show step completions as a percentage of journey starters.</p><dl><dt>Journey completion</dt><dd>Terminal completions ÷ journey starters.</dd><dt>Journey abandonment</dt><dd>Customers who did not reach the terminal outcome within the window ÷ journey starters.</dd><dt>Step drop-off</dt><dd>(Step entrants − step completions) ÷ step entrants.</dd><dt>Repeated attempts</dt><dd>Unique customers with more than one attempt ÷ entrants. Journey totals count a customer once.</dd><dt>Experienced errors</dt><dd>Unique customers who encountered an error ÷ entrants. Journey totals count a customer once.</dd><dt>Support records</dt><dd>Related support contacts, not unique customers. Displayed comments are fictional examples for the selected milestone and segment.</dd></dl><p>Retrying, errors and abandonment can overlap. The biggest opportunity is the milestone with the most lost customers. Rates use their displayed cohort denominators. Trends are illustrative, not a live event stream.</p><h3>Assistant & experiments</h3><p>The demo assistant uses scripted, evidence-linked explanations. Comments support a hypothesis; they do not establish a cause. Experiment proposals are drafts with a metric and guardrail. Saved drafts remain in this browser and no experiment is launched.</p></div>`);
}
function saveExperiment() {
  const data=getData(), step=selectedStep(data);
  if (isSaved(step)) {state.view='experiments';render();return;}
  state.saved.push({ key:saveKey(step),journey:state.journey,journeyName:data.journey.name,step:step.id,stepName:step.name,segment:state.segment,period:state.period,periodLabel:periodInfo().label,...step.experiment,evidence:`${fmt(step.dropped)} exits / ${fmt(step.entered)} entrants (${pct(step.dropRate)})` });
  persist();render();toast('Experiment added. Find it in your Experiments workspace.');
}
function persist() {try {localStorage.setItem('friction-radar-experiments',JSON.stringify(state.saved));} catch {toast('Browser storage is unavailable. Drafts will last for this session.');}}
let toastTimer;
function toast(message) {clearTimeout(toastTimer);const el=document.getElementById('toast');el.textContent=message;el.classList.add('show');toastTimer=setTimeout(()=>el.classList.remove('show'),4000);}
function changeJourney(id) {state.journey=id;state.step=null;state.view='overview';state.assistant='insight';render();}
function exportSnapshot() {
  const data=getData(), step=selectedStep(data);
  const snapshot = {product:'Customer Journey Friction Radar',dataset:'Fictional demo data',journey:data.journey.name,segment:state.segment,period:periodInfo(),completionWindow:data.journey.completionWindow,journeyMetrics:{entered:data.entered,completed:data.completed,completionRate:data.completionRate,abandoned:data.abandoned,abandonmentRate:data.abandonmentRate,repeatUsers:data.repeatUsers,errorUsers:data.errorUsers},milestones:data.steps.map(s=>({name:s.name,entered:s.entered,completed:s.completed,dropped:s.dropped,dropRate:s.dropRate,repeatUsers:s.repeatUsers,errorUsers:s.errorUsers,supportCount:s.supportCount})),selectedMilestone:step.name,hypothesis:step.hypothesis,proposedExperiment:step.experiment,fictionalSupportExamples:step.comments,savedExperiments:state.saved};
  const url=URL.createObjectURL(new Blob([JSON.stringify(snapshot,null,2)],{type:'application/json'}));
  const link=document.createElement('a');link.href=url;link.download=`friction-radar-${state.journey}-${state.segment}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Sample data snapshot exported.');
}
document.addEventListener('click', event => {
  const button=event.target.closest('button, a[data-action]');if(!button)return;
  if(button.matches('a'))event.preventDefault();
  if(button.dataset.journey) return changeJourney(button.dataset.journey);
  if(button.dataset.segment) {state.segment=button.dataset.segment;state.assistant='insight';render();return;}
  if(button.dataset.step) {state.step=button.dataset.step;state.assistant='insight';render();return;}
  if(button.dataset.assistant) {state.assistant=button.dataset.assistant;render();return;}
  if(button.dataset.example!==undefined) {
    const example=examples[Number(button.dataset.example)];state.journey=example.journey;state.segment=example.segment;state.period=30;state.view='overview';state.assistant='insight';state.step=JOURNEYS.find(j=>j.id===example.journey).steps[example.index].id;dialog.close();render();return;
  }
  if(button.dataset.remove) {state.saved=state.saved.filter(s=>s.key!==button.dataset.remove);persist();render();toast('Experiment draft removed.');return;}
  if(button.dataset.revisit) {const item=state.saved.find(s=>s.key===button.dataset.revisit);if(item){Object.assign(state,{journey:item.journey,step:item.step,segment:item.segment,period:item.period,view:'overview',assistant:'insight'});render();}return;}
  switch(button.dataset.action) {
    case 'overview':state.view='overview';render();break;
    case 'experiments':state.view='experiments';render();break;
    case 'examples':showExamples();break;
    case 'define':showDefinitions();break;
    case 'methodology':showMethodology();break;
    case 'close-dialog':dialog.close();break;
    case 'save-experiment':saveExperiment();break;
    case 'export':exportSnapshot();break;
  }
});
document.addEventListener('change', event=>{
  if(event.target.id==='journey-select')changeJourney(event.target.value);
  if(event.target.id==='period-select'){state.period=Number(event.target.value);render();}
});
dialog.addEventListener('click', event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();}});
render();
