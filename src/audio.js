// Real CC0 solo-cello recordings, with the lightweight synthesis voice as an explicit fallback.
(function(root){
'use strict';
const contexts=new WeakMap();
const instruments=new WeakMap();let packRequest=null;
function notify(state){
 if(typeof document==='undefined')return;
 const labels={loading:'正在准备真实大提琴录音…',sampled:'音色：真实大提琴录音 · Karoryfer × bigcat',fallback:'音色：合成参考音（录音未能加载，下次播放将重试）'};
 document.querySelectorAll('[data-audio-status]').forEach(el=>{el.textContent=labels[state];});
}
function loadPack(){
 if(root.CelloSamplePack)return Promise.resolve(root.CelloSamplePack);
 if(packRequest)return packRequest;
 packRequest=new Promise((resolve,reject)=>{
  const script=document.createElement('script');let timer;
  const finish=error=>{clearTimeout(timer);script.onload=script.onerror=null;if(error){script.remove();packRequest=null;reject(error);}else resolve(root.CelloSamplePack);};
  script.src=new URL('samples/cello/pack.js',document.baseURI).href;script.async=true;
  script.onload=()=>finish(root.CelloSamplePack?null:Error('录音包无效'));
  script.onerror=()=>finish(Error('录音包不可用'));timer=setTimeout(()=>finish(Error('录音加载超时')),12000);
  document.head.append(script);
 });return packRequest;
}
async function prepare(ctx){
 let state=instruments.get(ctx);
 if(state?.ready){notify('sampled');return true;}if(state?.pending)return state.pending;
 state={ready:false,voices:new Set(),roundRobin:new Map()};instruments.set(ctx,state);notify('loading');
 state.pending=(async()=>{try{
  const pack=await loadPack();
  const decoded=await Promise.all(pack.samples.map(async sample=>{
   const bytes=Uint8Array.from(atob(sample.data),c=>c.charCodeAt(0));
   const buffer=await ctx.decodeAudioData(bytes.buffer);
   if(!(sample.loopStart>=0&&sample.loopEnd>sample.loopStart&&sample.loopEnd<=buffer.duration+.001))throw Error('录音循环点无效');
   return {...sample,data:undefined,buffer};
  }));
  state.samples=decoded;state.ready=true;notify('sampled');return true;
 }catch(e){state.ready=false;notify('fallback');return false;}finally{state.pending=null;}})();
 return state.pending;
}
function sampled(ctx,state,hz,start,duration){
 const midi=69+12*Math.log2(hz/440);
 const nearest=state.samples.reduce((a,b)=>Math.abs(a.root-midi)<=Math.abs(b.root-midi)?a:b);
 const choices=state.samples.filter(s=>s.root===nearest.root),count=state.roundRobin.get(nearest.root)||0;
 state.roundRobin.set(nearest.root,count+1);const sample=choices[count%choices.length];
 const source=ctx.createBufferSource(),gain=ctx.createGain();start=Math.max(start,ctx.currentTime);
 const end=start+duration,attack=Math.min(.012,duration*.15),release=Math.min(.09,duration*.28);
 source.buffer=sample.buffer;source.playbackRate.value=hz/sample.hz;
 source.loop=true;source.loopStart=sample.loopStart;source.loopEnd=sample.loopEnd;
 gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(.65,start+attack);
 gain.gain.setValueAtTime(.65,end-release);gain.gain.linearRampToValueAtTime(0,end);
 source.connect(gain);gain.connect(ctx.destination);
 let finished=false;const voice={onended:null,kind:'sampled',root:sample.root,stop(when=ctx.currentTime){
  if(finished)return;const t=Math.max(ctx.currentTime,when);
  gain.gain.cancelScheduledValues(t);gain.gain.setValueAtTime(0,t);try{source.stop(t);}catch{}
 }};
 source.onended=()=>{finished=true;source.disconnect();gain.disconnect();state.voices.delete(voice);voice.onended?.();};
 state.voices.add(voice);source.start(start);source.stop(end);return voice;
}
function stopAll(ctx){const state=instruments.get(ctx);if(state)for(const voice of state.voices)voice.stop();}
function resources(ctx){
 let cached=contexts.get(ctx);if(cached)return cached;
 const noise=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate),data=noise.getChannelData(0);
 let seed=7123;for(let i=0;i<data.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;data[i]=seed/2147483648-1;}
 cached={noise,waves:new Map()};contexts.set(ctx,cached);return cached;
}
function wave(ctx,hz){
 const cache=resources(ctx).waves;if(cache.has(hz))return cache.get(hz);
 const real=new Float32Array(49),imag=new Float32Array(49);
 // Even and odd partials, with broad body resonances; omit ultrasonic partials.
 for(let n=1;n<imag.length&&n*hz<ctx.sampleRate*.45;n++){
  const f=n*hz,body=1+.8*Math.exp(-(((f-220)/100)**2))+.65*Math.exp(-(((f-520)/210)**2))+.4*Math.exp(-(((f-1250)/600)**2));
  imag[n]=body*Math.exp(-f/6500)/Math.pow(n,1.15);
 }
 const result=ctx.createPeriodicWave(real,imag);cache.set(hz,result);return result;
}
function synth(ctx,hz,start,duration){
 if(!Number.isFinite(hz)||hz<=0||!Number.isFinite(start)||!Number.isFinite(duration)||duration<=0)throw Error('无效音符');
 start=Math.max(ctx.currentTime,start);const end=start+duration,attack=Math.min(.065,duration*.22),release=Math.min(.10,duration*.28);
 const osc=ctx.createOscillator(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();
 const bow=ctx.createBufferSource(),bowFilter=ctx.createBiquadFilter(),bowGain=ctx.createGain();
 osc.setPeriodicWave(wave(ctx,hz));osc.frequency.setValueAtTime(hz,start);
 filter.type='lowpass';filter.Q.value=.55;
 filter.frequency.setValueAtTime(Math.min(7500,1800+hz*5),start);
 filter.frequency.exponentialRampToValueAtTime(Math.min(5800,1100+hz*4),start+attack);
 gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(.14,start+attack);
 gain.gain.linearRampToValueAtTime(.112,start+Math.min(attack+.12,duration-release));
 gain.gain.setValueAtTime(.112,end-release);gain.gain.linearRampToValueAtTime(0,end);
 bow.buffer=resources(ctx).noise;bow.loop=true;bowFilter.type='bandpass';bowFilter.frequency.value=1800;bowFilter.Q.value=.65;
 bowGain.gain.setValueAtTime(0,start);bowGain.gain.linearRampToValueAtTime(.0054,start+attack);
 bowGain.gain.linearRampToValueAtTime(.0015,end-release);bowGain.gain.linearRampToValueAtTime(0,end);
 osc.connect(filter);filter.connect(gain);gain.connect(ctx.destination);
 bow.connect(bowFilter);bowFilter.connect(bowGain);bowGain.connect(ctx.destination);
 let ended=0;const nodes=[osc,filter,gain,bow,bowFilter,bowGain];
 const voice={onended:null,kind:'synth',stop(when=ctx.currentTime){for(const source of [osc,bow])try{source.stop(when);}catch{}}};
 instruments.get(ctx)?.voices.add(voice);
 const cleanup=()=>{if(++ended!==2)return;nodes.forEach(n=>n.disconnect());instruments.get(ctx)?.voices.delete(voice);if(voice.onended)voice.onended();};
 osc.onended=bow.onended=cleanup;osc.start(start);bow.start(start);osc.stop(end);bow.stop(end);
 return voice;
}
function play(ctx,hz,start,duration){
 if(!Number.isFinite(hz)||hz<=0||!Number.isFinite(start)||!Number.isFinite(duration)||duration<=0)throw Error('无效音符');
 const state=instruments.get(ctx);
 return state?.ready?sampled(ctx,state,hz,start,duration):synth(ctx,hz,start,duration);
}
const api={play,prepare,stopAll,status:ctx=>instruments.get(ctx)?.ready?'sampled':'fallback'};if(typeof module==='object'&&module.exports)module.exports=api;else root.CelloAudio=api;
})(typeof globalThis==='object'?globalThis:this);
