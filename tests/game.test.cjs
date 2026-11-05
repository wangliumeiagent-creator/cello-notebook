const {test}=require('node:test'),assert=require('node:assert/strict'),G=require('../src/game-core.js');
test('多指按压：3 指必须补齐 1、2，按最高指位判音',()=>{const d=G.board().filter(p=>p.s==='D');assert.deepEqual(G.resolveHeld([d[3]]).missing,[1,2]);assert.deepEqual(G.resolveHeld([d[1],d[3]]).missing,[2]);assert.equal(G.resolveHeld([d[3],d[1],d[2]]).point.midi,54);assert.equal(G.resolveHeld([d[1],d[2],d[3],d[4]]).point.midi,55);});
test('空弦、跨弦、空弦与落指混按、重复触点分别处理',()=>{const b=G.board(),d=b.filter(p=>p.s==='D');assert.equal(G.resolveHeld([]).kind,'empty');assert.equal(G.resolveHeld([d[0]]).point.midi,50);assert.equal(G.resolveHeld([d[0],d[1]]).kind,'mixed');assert.equal(G.resolveHeld([b[1],d[1]]).kind,'mixed');assert.equal(G.resolveHeld([d[1],d[1],d[2],d[3]]).kind,'ready');});
test('第一把位四弦四指音高与空弦独立核对',()=>{assert.deepEqual(G.board().map(p=>p.midi),[57,59,60,61,62,50,52,53,54,55,43,45,46,47,48,36,38,39,40,41]);});
test('不同弦的同音高可作答，八度不同拒绝',()=>{const points=G.board('fourth').filter(p=>p.midi===43);assert.equal(points.length,2);for(const p of points){const s=G.create([{midi:43,pitch:'G2',at:0}]);assert.equal(G.answer(s,55,0,60,'learn').kind,'wrong');assert.equal(G.answer(s,p.midi,0,60,'learn').kind,'hit');}});
test('节奏窗口边界、过期输入与休止不吞音',()=>{const s=G.create([{midi:50,at:0},{midi:null,at:1},{midi:52,at:2}]);assert.equal(G.answer(s,50,-.33,60,'flow').kind,'early');assert.equal(G.answer(s,50,0,60,'flow').kind,'hit');assert.equal(G.answer(s,52,1,60,'flow').kind,'early');assert.equal(G.answer(s,52,2.39,60,'flow').kind,'none');assert.equal(G.summary(s).misses,1);assert.equal(G.summary(s).total,2);});
test('提示、首次答对和节奏统计分别处理，重练不继承状态',()=>{const input=[{midi:50,pitch:'D3',at:0}],s=G.create(input);G.target(s).assisted=true;G.answer(s,50,0,60,'learn');assert.equal(G.summary(s).assisted,1);assert.equal(G.summary(s).firstTry,0);assert.equal(G.summary(s).timing,null);assert.equal(G.target(G.create(input)).state,null);});

// Exercise the real page input handlers without bypassing the bow action.
function pageHarness(){
 const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
 const elements=new Map(),buttons=[],bows=['A','D','G','C'].map(bow=>({dataset:{bow}})),listeners={},windows={};
 const classes=()=>{const set=new Set();return {contains:x=>set.has(x),add:x=>set.add(x),remove:x=>set.delete(x),toggle(x,on){if(on===undefined)on=!set.has(x);on?set.add(x):set.delete(x)}}};
 bows.forEach(b=>Object.assign(b,{classList:classes(),setPointerCapture(){}}));
 function el(id){if(!elements.has(id))elements.set(id,{value:({song:'0',position:'2',mode:'learn',tempo:'50',keyboardString:'D'})[id]||'',checked:false,style:{},setAttribute(){},classList:classes(),selectedOptions:[{text:'第一把位'}],showModal(){this.open=true},replaceChildren(){},append(){},close(){this.open=false},set innerHTML(value){this.html=value;if(id==='board'){buttons.length=0;for(const m of value.matchAll(/data-point="(\d+)"/g))buttons.push({dataset:{point:m[1]},classList:classes(),setPointerCapture(){}})}},get innerHTML(){return this.html||''}});return elements.get(id)}
 const document={getElementById:el,querySelectorAll:s=>s.includes('data-bow')?bows:buttons,querySelector:s=>s.includes('data-bow')?bows.find(b=>s.includes('"'+b.dataset.bow+'"')):buttons.find(b=>s.includes('"'+b.dataset.point+'"')),addEventListener:(type,fn)=>listeners[type]=fn};
 const context=vm.createContext({document,window:{addEventListener:(type,fn)=>windows[type]=fn},navigator:{},localStorage:{getItem:()=>null,setItem(){}},performance:{now:()=>0},requestAnimationFrame(){},setTimeout(){},console});
 const source=fs.readFileSync(path.join(__dirname,'../src/game-demo.html'),'utf8');
 for(const m of source.matchAll(/<script(?: src="([\w-]+\.js)")?>([\s\S]*?)<\/script>/g))vm.runInContext(m[1]?fs.readFileSync(path.join(__dirname,'../src',m[1]),'utf8'):m[2],context);
 const run=code=>vm.runInContext(code,context),event=code=>({code,target:{closest:()=>null},preventDefault(){}});
 return {run,el,buttons,bows,listeners,windows,key(code){listeners.keydown(event(code))},up(code){listeners.keyup(event(code))},finger(string,f){const id=run(`points.findIndex(p=>p.s==='${string}'&&p.f===${f})`);return buttons.find(b=>Number(b.dataset.point)===id)},target(pitch='F#3',midi=54){run(`session=G.create([{pitch:'${pitch}',midi:${midi},at:0,beats:1},{pitch:'${pitch}',midi:${midi},at:1,beats:1}]);events=session.events;beat=0;running=true;`)}};
}
test('页面方向：4、3、2、1，无空弦按键',()=>{const h=pageHarness();assert.equal(h.buttons.length,16);assert.deepEqual(h.buttons.slice(0,4).map(b=>h.run(`points[${b.dataset.point}].f`)),[4,3,2,1]);});
test('页面触控：左手不提交，缺指不发音，拉弓时按最高完整指位判定',()=>{
 const h=pageHarness();h.target();
 const down=(f,id)=>h.finger('D',f).onpointerdown({pointerId:id,pointerType:'touch',preventDefault(){}});
 down(3,30);h.bows[1].onpointerdown({pointerId:99,pointerType:'touch',preventDefault(){}});assert.equal(h.run('G.summary(session).done'),0);assert.equal(h.run('G.summary(session).wrong'),0);
 h.bows[1].onpointerup({pointerId:99});down(1,10);down(2,20);assert.equal(h.run('G.summary(session).done'),0);
 h.bows[1].onpointerdown({pointerId:99,pointerType:'touch',preventDefault(){}});assert.equal(h.run('G.summary(session).hits'),1);
 h.finger('D',3).onpointerup({pointerId:30,preventDefault(){}});assert.equal(h.run('G.summary(session).done'),1);
 h.finger('D',1).onpointercancel({pointerId:10});h.finger('D',2).onlostpointercapture({pointerId:20});assert.equal(h.run('contacts.size'),0);
});
test('页面键盘：空弦只需拉弓，左手保持可奏连续同音，重复键不重复提交',()=>{
 const h=pageHarness();h.target('D3',50);h.key('Space');assert.equal(h.run('G.summary(session).hits'),1);h.listeners.keydown({code:'Space',repeat:true,target:{closest:()=>null},preventDefault(){}});assert.equal(h.run('G.summary(session).hits'),1);
 h.up('Space');h.run('beat=1');h.key('Space');assert.equal(h.run('G.summary(session).hits'),2);
 h.up('Space');h.target();for(const code of ['Digit1','Digit2','Digit3'])h.key(code);assert.equal(h.run('G.summary(session).done'),0);h.key('KeyS');assert.equal(h.run('G.summary(session).hits'),1);h.up('KeyS');h.run('beat=1');h.key('KeyS');assert.equal(h.run('G.summary(session).hits'),2);assert.equal(h.run('contacts.size'),3);
});
test('页面换弦：以右手弦道为准，另一根弦的左手按压不影响空弦',()=>{const h=pageHarness();h.target('A3',57);h.key('Digit1');h.key('KeyA');assert.equal(h.run('G.summary(session).hits'),1);assert.match(h.el('currentNote').textContent,/A 弦 · 空弦/);});
test('页面安全清理：暂停、后台和失焦都清空左右手，指位松开不提交',()=>{const h=pageHarness();h.target();h.key('Digit1');h.key('KeyS');h.windows.blur();assert.equal(h.run('contacts.size'),0);assert.equal(h.run('bowContacts.size'),0);assert.equal(h.run('running'),false);h.target();h.key('Digit1');h.el('start').onclick();assert.equal(h.run('contacts.size'),0);assert.equal(h.run('running'),false);});
test('拉弓音高：手指未按时为空弦，按着其他弦仍可拉空弦',()=>{const b=G.board();assert.equal(G.bowPitch(b,'D',[]).point.midi,50);assert.equal(G.bowPitch(b,'D',b.filter(p=>p.s==='A'&&p.f===1)).point.midi,50);assert.equal(G.bowPitch(b,'D',b.filter(p=>p.s==='D'&&p.f===3)).kind,'incomplete');});

test('页面节奏判定取右手拉弓时刻，左手提前准备不触发，按住拉弓不连发',()=>{const h=pageHarness();h.target();h.run("$('mode').value='flow';beat=-1");for(const code of ['Digit1','Digit2','Digit3'])h.key(code);assert.equal(h.run('G.summary(session).done'),0);h.run('beat=.1');h.key('KeyS');assert.equal(h.run('G.summary(session).hits'),1);assert.equal(h.run('session.timing[0]'),.12);h.run('beat=1');h.key('KeyS');assert.equal(h.run('G.summary(session).hits'),1);h.up('KeyS');h.key('KeyS');assert.equal(h.run('G.summary(session).hits'),2);});
