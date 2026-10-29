import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { JOURNEYS, SEGMENTS, PERIODS, getJourneyData } from '../data.js';

// Exercise the actual renderer and event handlers without requiring a server.
// This verifies state transitions; it does not replace browser visual QA.
function dashboard(storage = new Map()) {
  const handlers = {};
  const elements = {
    app: { innerHTML:'', contains:()=>false, querySelectorAll:()=>[] },
    dialog: { innerHTML:'', className:'', open:false, showModal(){this.open=true;}, close(){this.open=false;}, addEventListener(){} },
    toast: { textContent:'', classList:{add(){},remove(){}} }
  };
  const document = { activeElement:null, getElementById:id=>elements[id], addEventListener:(name,callback)=>handlers[name]=callback };
  const context = vm.createContext({document,JOURNEYS,SEGMENTS,PERIODS,getJourneyData,Intl,URL,Blob,setTimeout:()=>1,clearTimeout(){},localStorage:{getItem:key=>storage.get(key),setItem:(key,value)=>storage.set(key,value)}});
  const code=readFileSync(new URL('../app.js',import.meta.url),'utf8').replace(/^import .*?;\n/,'');
  vm.runInContext(code,context);
  return {
    html:()=>elements.app.innerHTML,
    dialog:()=>elements.dialog,
    state:()=>vm.runInContext('state',context),
    click(dataset){handlers.click({target:{closest:()=>({dataset,matches:()=>false})}});},
    change(id,value){handlers.change({target:{id,value}});}
  };
}

test('every milestone updates its evidence, support and experiment together',()=>{
  const ui=dashboard();
  for(const journey of JOURNEYS) {
    ui.click({journey:journey.id});
    for(const step of journey.steps) {
      ui.click({step:step.id});
      assert.equal(ui.state().step,step.id);
      assert.ok(ui.html().includes(step.name));
      assert.ok(ui.html().includes(step.experiment.title));
      assert.ok(ui.html().includes(step.comments[0].quote.replace(/&/g,'&amp;').replace(/'/g,'&#39;')));
      assert.ok(ui.html().includes('aria-pressed="true"'));
    }
  }
});

test('filters retain the selected step and change the cohort and comments',()=>{
  const ui=dashboard();
  ui.click({step:'connect-workspace'});
  ui.click({segment:'Enterprise'});
  ui.change('period-select','7');
  assert.equal(ui.state().step,'connect-workspace');
  assert.equal(ui.state().segment,'Enterprise');
  assert.equal(ui.state().period,7);
  assert.ok(ui.html().includes('Enterprise customer'));
  assert.ok(!ui.html().includes('Startup customer'));
  const expected=getJourneyData('onboarding','Enterprise',7);
  assert.ok(ui.html().includes(new Intl.NumberFormat('en-US').format(expected.entered)+' eligible customers'));
});

test('six investigations open the intended milestone and customer segment',()=>{
  const ui=dashboard();
  const expected=[['onboarding','connect-workspace','Startup'],['checkout','make-payment','Growth'],['integrations','authorize-access','Enterprise'],['renewal','review-plan','Startup'],['checkout','add-details','Startup'],['integrations','first-sync','Growth']];
  expected.forEach(([journey,step,segment],i)=>{
    ui.click({action:'examples'});
    assert.equal(ui.dialog().open,true);
    ui.click({example:String(i)});
    assert.equal(ui.dialog().open,false);
    assert.equal(ui.state().journey,journey);
    assert.equal(ui.state().step,step);
    assert.equal(ui.state().segment,segment);
  });
});

test('experiment drafts persist without duplicates and can be revisited and removed',()=>{
  const storage=new Map();
  const ui=dashboard(storage);
  ui.click({action:'save-experiment'});
  assert.equal(ui.state().saved.length,1);
  ui.click({action:'save-experiment'});
  assert.equal(ui.state().saved.length,1);
  assert.equal(ui.state().view,'experiments');
  const restored=dashboard(storage);
  assert.equal(restored.state().saved.length,1);
  const key=restored.state().saved[0].key;
  restored.click({revisit:key});
  assert.equal(restored.state().view,'overview');
  assert.equal(restored.state().step,'connect-workspace');
  restored.click({remove:key});
  assert.equal(restored.state().saved.length,0);
});

test('assistant views and definitions expose measurement plans and honest demo labels',()=>{
  const ui=dashboard();
  ui.click({assistant:'experiment'});
  assert.ok(ui.html().includes('SUCCESS METRIC'));
  assert.ok(ui.html().includes('GUARDRAIL'));
  ui.click({assistant:'compare'});
  assert.ok(ui.html().includes('Where does the friction concentrate?'));
  ui.click({action:'define'});
  assert.ok(ui.dialog().innerHTML.includes('workspace_connected'));
  ui.dialog().close();
  ui.click({action:'methodology'});
  assert.ok(ui.dialog().innerHTML.includes('fictional'));
  assert.ok(ui.dialog().innerHTML.includes('scripted'));
  assert.ok(ui.dialog().innerHTML.includes('Step drop-off'));
});
