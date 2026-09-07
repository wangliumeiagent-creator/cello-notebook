const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {lessons}=require('../src/library.js');
const root=path.resolve(__dirname,'..'),qa=path.join(root,'qa/release-0.2');fs.mkdirSync(qa,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_PATH||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
 try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const l of lessons){
  await page.goto('http://127.0.0.1:4317/#'+l.id);await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.locator('#title').textContent(),l.title);assert.equal(await page.locator('#answers').textContent(),'显示辅助');assert.equal(await page.locator('#downloadXml').count(),0);
  assert.equal(await page.locator('#score .note-event').count(),l.bars.flat().length);
  await page.click('#answers');await page.check('[data-layer=jianpu]');
  await page.locator('.score-card').screenshot({path:path.join(qa,l.id+'.png')});
  await page.selectOption('#tempo','30');await page.uncheck('#countIn');await page.uncheck('#repeat');await page.click('#play');await page.waitForTimeout(150);
  const plan=await page.evaluate(()=>CelloApp.plan());assert.equal(plan.duration,l.bars.flat().reduce((s,e)=>s+e.beats,0)*2);assert.equal(await page.evaluate(()=>CelloApp.audioState()),'running');await page.click('#stop');
  await page.selectOption('#tempo','60');
  const dest=path.join(root,'dist/scores',l.id+'.pdf');if(fs.existsSync(dest)){const backup=path.join(qa,l.id+'-before.pdf');if(!fs.existsSync(backup))fs.copyFileSync(dest,backup);}
  await page.pdf({path:dest,preferCSSPageSize:true,printBackground:true});
  await page.setViewportSize({width:390,height:844});await page.waitForTimeout(180);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  assert.equal(await page.locator('#score .score-line').count(),Math.ceil(l.bars.length/(l.systemBars?1:2)));
  if(l.systemBars||l.pickup)await page.screenshot({path:path.join(qa,l.id+'-mobile.png'),fullPage:true});
  await page.setViewportSize({width:1440,height:1000});
 }
 assert.deepEqual(errors,[]);console.log('13 lessons: desktop/mobile, note count, audio, 30 BPM, controls and PDF export passed.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
