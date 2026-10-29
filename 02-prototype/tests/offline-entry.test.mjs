import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { JOURNEYS } from '../data.js';

const htmlEscape = value => value.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

function runEntry(html) {
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
  assert.equal(scripts.length, 1, 'entry must include its complete application script');
  assert.doesNotMatch(scripts[0][1], /\bsrc\s*=|\btype\s*=\s*["']module/i, 'local entry cannot depend on external modules');
  assert.doesNotMatch(html, /<link\b[^>]*\brel\s*=\s*["']stylesheet["'][^>]*>/i, 'styles must be inline');
  assert.match(html, /<style>[\s\S]+<\/style>/i);
  const handlers = {};
  const storage = new Map();
  const elements = {
    app: { innerHTML:'', contains:()=>false, querySelectorAll:()=>[] },
    dialog: { innerHTML:'', className:'', showModal(){}, close(){}, addEventListener(){} },
    toast: { textContent:'', classList:{add(){},remove(){}} },
  };
  const document = { activeElement:null, getElementById:id=>elements[id], addEventListener:(name,callback)=>handlers[name]=callback };
  const context = vm.createContext({document,Intl,URL,Blob,setTimeout:()=>1,clearTimeout(){},localStorage:{getItem:key=>storage.get(key),setItem:(key,value)=>storage.set(key,value)}});
  vm.runInContext(scripts[0][2], context);
  return {
    html:()=>elements.app.innerHTML,
    click(dataset){handlers.click({target:{closest:()=>({dataset,matches:()=>false})}});},
    saved:()=>JSON.parse(storage.get('friction-radar-experiments') || '[]'),
  };
}

for (const entry of ['index.html', 'friction-radar.html', 'dist/index.html']) {
  test(`${entry} renders and works without loading external scripts or styles`, () => {
    const html = readFileSync(new URL(`../${entry}`, import.meta.url), 'utf8');
    const ui = runEntry(html);
    assert.match(ui.html(), /Customer journey overview/);
    assert.match(ui.html(), /Onboarding funnel/);
    assert.match(ui.html(), /Radar assistant/);
    const step = JOURNEYS[0].steps.find(item=>item.id==='verify-email');
    ui.click({step:step.id});
    assert.match(ui.html(), /class="funnel-step selected" data-step="verify-email"/);
    assert.ok(ui.html().includes(htmlEscape(step.experiment.title)));
    assert.ok(ui.html().includes(htmlEscape(step.comments[0].quote)));
    ui.click({segment:'Enterprise'});
    assert.ok(ui.html().includes(htmlEscape(step.comments.find(item=>item.segment==='Enterprise').quote)));
    assert.doesNotMatch(ui.html(), /Startup customer/);
    ui.click({action:'save-experiment'});
    assert.equal(ui.saved().length,1);
    assert.equal(ui.saved()[0].step,step.id);
    assert.equal(ui.saved()[0].segment,'Enterprise');
    ui.click({action:'experiments'});
    assert.match(ui.html(), /Your next experiments/);
    assert.ok(ui.html().includes(htmlEscape(step.experiment.title)));
  });
}
