const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_PATH||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
 try{
  for(const mode of ['supported','unsupported','rejected','pending']){
   const page=await browser.newPage();
   await page.addInitScript(mode=>{
    window.audioEvents=[];
    Object.defineProperty(navigator,'audioSession',{configurable:true,value:mode==='unsupported'?undefined:{set type(v){window.audioEvents.push(v);if(mode==='rejected')throw Error('Unavailable');}}});
    const RealAudio=window.AudioContext;
    window.AudioContext=mode==='pending'?class{constructor(){this.state='suspended';}resume(){return new Promise(()=>{});}}:class extends RealAudio{constructor(){window.audioEvents.push('create');super();}};
   },mode);
   await page.goto('http://127.0.0.1:4317');await page.uncheck('#countIn');await page.click('#play');
   if(mode==='pending'){
    await page.waitForFunction(()=>document.querySelector('#playerStatus').textContent.includes('音频尚未启动'),{},{timeout:7000});
    assert.equal(await page.evaluate(()=>CelloApp.plan()),null);
   }else{
    await page.waitForFunction(()=>CelloApp.plan()!==null);
    assert.equal(await page.evaluate(()=>CelloApp.audioState()),'running');
    assert.deepEqual(await page.evaluate(()=>audioEvents),mode==='unsupported'?['create']:['playback','create']);
    await page.click('#stop');
   }
   await page.close();
  }
  console.log('Audio checks passed: playback requested before context creation; unsupported/rejected API falls back; stalled resume reports an error.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
