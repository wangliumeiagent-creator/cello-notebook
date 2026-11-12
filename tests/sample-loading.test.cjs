const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

function harness(){
 const timers=new Map(),scripts=[],label={textContent:''};let id=0;
 const context={
  module:{exports:{}},URL,Uint8Array,Float32Array,WeakMap,Set,Map,Math,Promise,
  atob:value=>Buffer.from(value,'base64').toString('binary'),
  setTimeout(callback,delay){const key=++id;timers.set(key,{callback,delay});return key;},
  clearTimeout(key){timers.delete(key);},
  document:{
   baseURI:'https://example.test/cello/index.html',
   querySelectorAll:()=>[label],
   createElement:()=>({remove(){this.removed=true;}}),
   head:{append:script=>scripts.push(script)}
  }
 };
 vm.createContext(context);
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/audio.js'),'utf8'),context);
 const pack={samples:[{root:60,hz:261.6,data:'AA==',loopStart:.1,loopEnd:.8}]};
 return {
  audio:context.module.exports,context,scripts,label,pack,
  fire(delay){for(const [key,timer] of [...timers])if(timer.delay===delay){timers.delete(key);timer.callback();}},
  timers
 };
}
const flush=async()=>{for(let i=0;i<12;i++)await Promise.resolve();};

test('慢网超过等待上限会返回合成音，录音完成后等下一次播放才切换',async()=>{
 const h=harness(),ctx={decodeAudioData:async()=>({duration:1})};
 const pending=h.audio.prepare(ctx);
 assert.equal(h.scripts.length,1);
 assert.equal(h.scripts[0].src,'https://example.test/cello/samples/cello/pack.js');
 h.fire(8000);
 assert.equal(await pending,false);
 assert.equal(h.audio.status(ctx),'fallback');
 assert.match(h.label.textContent,/合成参考音/);
 h.context.CelloSamplePack=h.pack;h.scripts[0].onload();
 await flush();
 assert.equal(h.audio.status(ctx),'fallback','背景加载不能在乐句中途改变音色');
 assert.equal(await h.audio.prepare(ctx),true);
 assert.equal(h.audio.status(ctx),'sampled');
 assert.equal(h.timers.size,0);
});

test('解码卡住有超时保护，缺失音色包会回退并允许下次重试',async()=>{
 const h=harness();h.context.CelloSamplePack=h.pack;
 const pending=h.audio.prepare({decodeAudioData:()=>new Promise(()=>{})});
 await flush();h.fire(8000);
 assert.equal(await pending,false);

 const missing=harness(),ctx={decodeAudioData:async()=>({duration:1})};
 const first=missing.audio.prepare(ctx);
 missing.scripts[0].onerror();
 assert.equal(await first,false);
 assert.equal(missing.scripts[0].removed,true);
 const retry=missing.audio.prepare(ctx);
 assert.equal(missing.scripts.length,2);
 missing.context.CelloSamplePack=missing.pack;missing.scripts[1].onload();
 assert.equal(await retry,true);
});

test('同一上下文共享加载任务，并顺序解码以限制手机峰值内存',async()=>{
 const h=harness(),resolvers=[];let inFlight=0,maxInFlight=0,decoded=0;
 h.context.CelloSamplePack={samples:Array.from({length:3},()=>h.pack.samples[0])};
 const ctx={decodeAudioData(){inFlight++;maxInFlight=Math.max(maxInFlight,inFlight);return new Promise(resolve=>resolvers.push(()=>{
  inFlight--;decoded++;resolve({duration:1});
 }));}};
 const first=h.audio.prepare(ctx),second=h.audio.prepare(ctx);
 await flush();
 for(let i=0;i<3;i++){assert.equal(resolvers.length,i+1);resolvers[i]();await flush();}
 assert.equal(await first,true);assert.equal(await second,true);
 assert.equal(decoded,3);assert.equal(maxInFlight,1);assert.equal(h.timers.size,0);
});
