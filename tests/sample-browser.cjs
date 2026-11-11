// Optional real-browser verification: BROWSER_PATH must name a local Chromium browser.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),{spawn}=require('node:child_process');
const root=path.resolve(__dirname,'..'),dist=path.join(root,'dist'),browserPath=process.env.BROWSER_PATH;
if(!browserPath)throw Error('Set BROWSER_PATH to your Chromium browser executable.');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
let browser,server,timer;const errors=[],requests=[];
async function main(){
 server=http.createServer((req,res)=>{
  let url=new URL(req.url,'http://localhost').pathname;requests.push(url);
  const missing=url.startsWith('/missing/'),slow=url.startsWith('/slow/');url=url.replace(/^\/(missing|slow)\//,'/');
  const file=path.resolve(dist,'.'+decodeURIComponent(url));
  if(!file.startsWith(dist+path.sep)){res.writeHead(403).end();return;}
  const send=()=>fs.readFile(file,(e,data)=>{if(e||missing&&url.endsWith('/pack.js')){res.writeHead(404).end();return;}res.writeHead(200,{'Content-Type':url.endsWith('.js')?'text/javascript':'text/html; charset=utf-8','X-Content-Type-Options':'nosniff'}).end(data);});
  if(slow&&url.endsWith('/pack.js'))setTimeout(send,600);else send();
 });await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const origin='http://127.0.0.1:'+server.address().port;
 browser=spawn(browserPath,['--headless','--no-sandbox','--disable-gpu','--autoplay-policy=no-user-gesture-required','--remote-debugging-pipe','--user-data-dir='+path.join(root,'qa','sample-browser-'+Date.now()),'about:blank'],{windowsHide:true,stdio:['ignore','ignore','pipe','pipe','pipe']});
 let id=0,sessionId,received='';const pending=new Map();
 browser.stdio[4].on('data',chunk=>{received+=chunk;let at;while((at=received.indexOf('\0'))>=0){const msg=JSON.parse(received.slice(0,at));received=received.slice(at+1);if(msg.method==='Runtime.exceptionThrown')errors.push(msg.params.exceptionDetails);if(pending.has(msg.id)){pending.get(msg.id)(msg);pending.delete(msg.id);}}});
 const send=(method,params={})=>new Promise(resolve=>{const key=++id;pending.set(key,resolve);browser.stdio[3].write(JSON.stringify({id:key,method,params,...(sessionId?{sessionId}:{})})+'\0');});
 const created=await send('Target.createTarget',{url:'about:blank'}),attached=await send('Target.attachToTarget',{targetId:created.result.targetId,flatten:true});sessionId=attached.result.sessionId;
 await send('Runtime.enable');
 async function evaluate(expression){const res=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(res.error||res.result.exceptionDetails)throw Error(JSON.stringify(res));return res.result.result.value;}
 async function until(expression){for(let i=0;i<200;i++){try{if(await evaluate(expression))return;}catch{}await wait(40);}throw Error('Timeout: '+expression);}
 async function navigate(url){await send('Page.navigate',{url});await until("document.readyState==='complete'&&typeof CelloAudio==='object'");}
 for(const file of ['index.html#practice','sight-reading.html','game.html','game-demo.html']){
  await navigate(origin+'/'+file);
  await evaluate(`globalThis.sampleCalls=0;const originalVoice=CelloAudio.play;CelloAudio.play=(...args)=>{const voice=originalVoice(...args);if(voice.kind==='sampled')sampleCalls++;return voice;};`);
  if(file.startsWith('index')){await evaluate("document.querySelector('#countIn').checked=false;CelloApp.playbackState();document.querySelector('#play').click()");await until("CelloApp.playbackState()==='playing'&&sampleCalls>0");await evaluate("document.querySelector('#play').click()");assert.equal(await evaluate('CelloApp.playbackState()'),'paused');await evaluate("document.querySelector('#play').click()");await until("CelloApp.playbackState()==='playing'");await evaluate("document.querySelector('#stop').click()");}
  else if(file==='sight-reading.html'){
   await evaluate("document.querySelector('#soundBtn').click()");await until('sampleCalls>0');
   await evaluate("document.querySelector('[data-mode=phrase]').click();document.querySelector('#playBtn').click()");await until('interval!==null');await evaluate("document.querySelector('#playBtn').click()");assert.equal(await evaluate('interval===null'),true);
  }else{await evaluate("document.querySelector('#start').click()");await until('running&&initialized');await evaluate('tone(50,.15)');assert(await evaluate('sampleCalls>0'));await evaluate('pause()');assert.equal(await evaluate('running'),false);}
  assert((await evaluate("document.querySelector('[data-audio-status]').textContent")).includes('真实大提琴录音'));console.log(file+': sampled playback OK');
 }
 await navigate(origin+'/slow/index.html#practice');await evaluate("document.querySelector('#play').click();document.querySelector('#stop').click()");await wait(1000);assert.equal(await evaluate('CelloApp.playbackState()'),'stopped');console.log('Cancel while loading: OK');
 await navigate(origin+'/missing/index.html#practice');await evaluate("document.querySelector('#countIn').checked=false;document.querySelector('#play').click()");await until("CelloApp.playbackState()==='playing'");assert((await evaluate("document.querySelector('[data-audio-status]').textContent")).includes('合成参考音'));await evaluate("document.querySelector('#stop').click()");console.log('Missing recordings: explicit synthesis fallback OK');
 await navigate(origin+'/index.html#practice');
 const rendered=await evaluate(`(async()=>{
  const ctx=new OfflineAudioContext(1,44100*8,44100);if(!await CelloAudio.prepare(ctx))throw Error('Sample decode failed');let ended=0;
  const notes=[146.832384,164.813778,184.997211,195.997718,220];
  for(let i=0;i<notes.length;i++){const v=CelloAudio.play(ctx,notes[i],.1+i*.85,.7);if(v.kind!=='sampled')throw Error('Wrong voice');v.onended=()=>ended++;}
  // Long loop, and a future scheduled voice cancelled before its start.
  const long=CelloAudio.play(ctx,65.406391,4.6,3);long.onended=()=>ended++;
  const cancelled=CelloAudio.play(ctx,440,7.8,.1);cancelled.onended=()=>ended++;cancelled.stop(7.7);
  const result=await ctx.startRendering(),samples=result.getChannelData(0);let peak=0;for(const n of samples){if(!Number.isFinite(n))throw Error('Nonfinite output');peak=Math.max(peak,Math.abs(n));}
  let tail=0;for(let i=Math.floor(7.7*44100);i<samples.length;i++)tail=Math.max(tail,Math.abs(samples[i]));
  const b=new Uint8Array(44+samples.length*2),v=new DataView(b.buffer),str=(at,s)=>[...s].forEach((c,i)=>v.setUint8(at+i,c.charCodeAt(0)));
  str(0,'RIFF');v.setUint32(4,b.length-8,true);str(8,'WAVE');str(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,44100,true);v.setUint32(28,88200,true);v.setUint16(32,2,true);v.setUint16(34,16,true);str(36,'data');v.setUint32(40,samples.length*2,true);for(let i=0;i<samples.length;i++)v.setInt16(44+i*2,Math.round(samples[i]*32767),true);let text='';for(let i=0;i<b.length;i+=8192)text+=String.fromCharCode(...b.subarray(i,i+8192));
  return {peak,ended,tail,wav:btoa(text)};
 })()`);
 assert(rendered.peak>.01&&rendered.peak<.95);assert.equal(rendered.ended,7);assert.equal(rendered.tail,0);
 const output=path.join(root,'qa','cello-real-samples-'+Date.now()+'.wav');fs.writeFileSync(output,Buffer.from(rendered.wav,'base64'),{flag:'wx'});delete rendered.wav;
 // Direct-file use must load the colocated script pack as well.
 const fileURL=require('node:url').pathToFileURL(path.join(dist,'index.html')).href;
 await navigate(fileURL+'#practice');assert(await evaluate('(async()=>{const c=new OfflineAudioContext(1,44100,44100);return await CelloAudio.prepare(c)})()'));console.log('Direct local file: sample pack OK');
 assert.equal(errors.length,0,JSON.stringify(errors));assert(requests.some(u=>u.endsWith('/pack.js')));
 console.log(JSON.stringify({rendered,output,uncaughtErrors:errors.length},null,2));
}
timer=setTimeout(()=>{console.error('Browser check timed out');browser?.kill();server?.closeAllConnections();server?.close();process.exit(1);},60000);
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{clearTimeout(timer);browser?.kill();server?.closeAllConnections();server?.close();});
