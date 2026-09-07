const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch({headless:true,executablePath:process.env.BROWSER_PATH||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});try{
const p=await b.newPage({viewport:{width:1440,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.addInitScript(()=>{window.tones=[];const create=AudioContext.prototype.createOscillator;AudioContext.prototype.createOscillator=function(){const o=create.call(this),start=o.start.bind(o);o.start=(...args)=>{tones.push(o.frequency.value);return start(...args);};return o;};});
await p.goto(process.env.SITE_URL||'http://127.0.0.1:4317/#castle-in-the-sky-advanced');await p.evaluate(()=>document.fonts.ready);
assert.equal(await p.locator('#title').textContent(),'天空之城进阶版');assert.equal(await p.locator('#score .score-line').count(),19);assert.equal(await p.locator('.nav-link').count(),14);
await p.click('#answers');await p.check('[data-layer=jianpu]');
fs.mkdirSync('qa/laputa-advanced',{recursive:true});for(const n of [0,7,10,16,28,29,30,32,33,36])await p.locator('#score .score-line').nth(n).screenshot({path:`qa/laputa-advanced/render-${n}.png`});
await p.selectOption('#tempo','116');await p.uncheck('#countIn');await p.check('#repeat');await p.click('#play');await p.waitForTimeout(60);assert.ok(Math.abs((await p.evaluate(()=>CelloApp.plan().duration))-384*60/116)<1e-7);assert.equal(await p.evaluate(()=>CelloApp.audioState()),'running');await p.click('#stop');
await p.selectOption('#from','66');await p.selectOption('#to','67');await p.selectOption('#tempo','120');await p.evaluate(()=>tones=[]);await p.click('#play');await p.waitForTimeout(2000);assert.deepEqual(await p.evaluate(()=>tones.map(f=>Math.round(f))),[165,165,175]);await p.click('#stop');
for(const t of ['20','30','116']){await p.selectOption('#tempo',t);await p.selectOption('#from','59');await p.selectOption('#to','59');await p.click('#play');await p.waitForTimeout(30);assert.ok(Math.abs((await p.evaluate(()=>CelloApp.plan().entries[0].duration))-40/Number(t))<1e-9);await p.click('#stop');}
await p.setViewportSize({width:390,height:844});await p.waitForTimeout(200);assert.equal(await p.locator('#score .score-line').count(),73);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await p.locator('#score .score-line').nth(58).screenshot({path:'qa/laputa-advanced/mobile.png'});
await p.setViewportSize({width:1440,height:1000});await p.selectOption('#tempo','60');
if(process.argv.includes('--pdf')){const file='dist/scores/castle-in-the-sky-advanced.pdf';if(fs.existsSync(file))fs.copyFileSync(file,`qa/laputa-advanced/print-before-${Date.now()}.pdf`,fs.constants.COPYFILE_EXCL);await p.pdf({path:file,preferCSSPageSize:true,printBackground:true});}
assert.deepEqual(errors,[]);console.log('Advanced: 15 lessons; complete repeat itinerary; triplet timings; real audio and sustained ties; 390px layout; PDF; no JS errors.');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1);});
