const fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch({headless:true,executablePath:process.env.BROWSER_PATH||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});try{
 const p=await b.newPage({viewport:{width:1440,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>{window.tones=[];const create=AudioContext.prototype.createOscillator;AudioContext.prototype.createOscillator=function(){const osc=create.call(this),start=osc.start.bind(osc);osc.start=(...args)=>{window.tones.push(osc.frequency.value);return start(...args);};return osc;};});
 await p.goto('http://127.0.0.1:4317/#castle-in-the-sky');await p.evaluate(()=>document.fonts.ready);
 assert.equal(await p.locator('#title').textContent(),'天空之城主旋律');assert.match(await p.locator('#chips').textContent(),/D 小调/);assert.equal(await p.locator('#score .score-line').count(),13);
 await p.click('#answers');await p.check('[data-layer=jianpu]');
 fs.mkdirSync('qa/laputa',{recursive:true});for(const n of [0,7,11,12,24,25])await p.locator('#score .score-line').nth(n).screenshot({path:`qa/laputa/system-${n}.png`});
 await p.selectOption('#from','25');await p.selectOption('#to','26');await p.selectOption('#tempo','120');await p.uncheck('#countIn');await p.click('#play');await p.waitForTimeout(2400);
 assert.deepEqual(await p.evaluate(()=>tones),[220]);assert.equal(await p.evaluate(()=>CelloApp.plan().entries[1].continuation),true);await p.click('#stop');
 for(const tempo of ['20','30','110']){await p.selectOption('#tempo',tempo);await p.click('#whole');await p.click('#play');await p.waitForTimeout(60);assert.equal(await p.evaluate(()=>CelloApp.plan().entries[0].duration),.5*60/Number(tempo));await p.click('#stop');}
 await p.setViewportSize({width:390,height:844});await p.waitForTimeout(180);assert.equal(await p.locator('#score .score-line').count(),52);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await p.locator('#score .score-line').nth(51).screenshot({path:'qa/laputa/mobile-ending.png'});
 await p.setViewportSize({width:1440,height:1000});await p.selectOption('#tempo','60');
 if(process.argv.includes('--pdf')){const file='dist/scores/castle-in-the-sky.pdf';if(fs.existsSync(file)){const backup=path.join('qa/laputa',`print-before-${Date.now()}.pdf`);fs.copyFileSync(file,backup,fs.constants.COPYFILE_EXCL);}await p.pdf({path:file,preferCSSPageSize:true,printBackground:true});}
 assert.deepEqual(errors,[]);console.log('Laputa: minor key, all systems, 20/30/110 tempos, one attack per tie, mobile width and no JS errors passed.');
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1);});
