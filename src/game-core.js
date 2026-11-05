(function(root){
'use strict';
const offsets={first:[2,3,4,5],second:[3,4,5,6],third:[5,6,7,8],fourth:[7,8,9,10]};
function board(position='first'){
 if(!offsets[position])throw Error('未知把位');
 return [{string:'A',midi:57},{string:'D',midi:50},{string:'G',midi:43},{string:'C',midi:36}].flatMap(s=>[0,1,2,3,4].map(finger=>({s:s.string,f:finger,midi:s.midi+(finger?offsets[position][finger-1]:0)})));
}
function create(events){return {events:events.map(e=>({...e,state:null,assisted:false,wrong:0})),wrong:0,misses:0,timing:[]};}
function target(state){return state.events.find(e=>e.midi!==null&&!e.state);}
function expire(state,beat,bpm){for(const e of state.events)if(e.midi!==null&&!e.state&&(beat-e.at)*60/bpm>.38){e.state='miss';state.misses++;}}
function answer(state,midi,beat,bpm,mode){
 if(mode==='flow')expire(state,beat,bpm);
 const e=target(state);if(!e)return {kind:'none'};
 const delta=(beat-e.at)*60/bpm;
 if(beat<0||delta<-.32)return {kind:'early'};
 if(midi!==e.midi){state.wrong++;e.wrong++;return {kind:'wrong',event:e};}
 e.state=e.assisted?'assisted':'hit';if(mode==='flow')state.timing.push(delta);
 return {kind:'hit',delta,event:e};
}
function summary(state){const notes=state.events.filter(e=>e.midi!==null),done=notes.filter(e=>e.state),hits=notes.filter(e=>e.state==='hit'||e.state==='assisted');return {total:notes.length,done:done.length,hits:hits.length,wrong:state.wrong,misses:state.misses,assisted:hits.filter(e=>e.assisted).length,firstTry:notes.filter(e=>e.state==='hit'&&!e.wrong).length,timing:state.timing.length?state.timing.reduce((a,b)=>a+Math.abs(b),0)/state.timing.length:null,weak:[...new Set(notes.filter(e=>e.wrong||e.assisted||e.state==='miss').map(e=>e.pitch))]};}
function resolveHeld(points){
 if(!points.length)return {kind:'empty'};
 const strings=new Set(points.map(p=>p.s));if(strings.size!==1)return {kind:'mixed'};
 const highest=points.reduce((a,b)=>a.f>b.f?a:b),fingers=new Set(points.map(p=>p.f));
 if(highest.f&&fingers.has(0))return {kind:'mixed'};
 const missing=[];for(let f=1;f<=highest.f;f++)if(!fingers.has(f))missing.push(f);
 return missing.length?{kind:'incomplete',missing,highest}:{kind:'ready',point:highest};
}
function bowPitch(points,string,held){
 const open=points.find(p=>p.s===string&&p.f===0);if(!open)throw Error('未知琴弦');
 const onString=held.filter(p=>p.s===string&&p.f>0);
 return onString.length?resolveHeld(onString):{kind:'ready',point:open};
}
const api={board,create,target,expire,answer,summary,resolveHeld,bowPitch};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CelloGame=api;
})(globalThis);
