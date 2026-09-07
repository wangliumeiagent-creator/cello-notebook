const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch({headless:true,executablePath:process.env.BROWSER_PATH||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});try{
 const p=await b.newPage({viewport:{width:1440,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(process.env.SITE_URL||'http://127.0.0.1:4317/#scars-of-time');await p.evaluate(()=>document.fonts.ready);
 assert.equal(await p.locator('#title').textContent(),'时之伤痕');assert.equal(await p.locator('#score .score-line').count(),8);assert.equal(await p.locator('.nav-link').count(),15);assert.equal(await p.locator('#score .note-event').count(),127);
 await p.click('#answers');await p.check('[data-layer=jianpu]');
 await p.selectOption('#from','29');await p.selectOption('#to','32');await p.check('#repeat');await p.selectOption('#tempo','30');await p.click('#play');await p.waitForTimeout(120);assert.equal(await p.evaluate(()=>CelloApp.plan().passes),1);await p.click('#stop');
 await p.setViewportSize({width:390,height:844});await p.waitForTimeout(150);assert.equal(await p.locator('#score .score-line').count(),32);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await p.setViewportSize({width:1440,height:1000});
 if(process.argv.includes('--pdf'))await p.pdf({path:'dist/scores/scars-of-time.pdf',preferCSSPageSize:true,printBackground:true});
 assert.deepEqual(errors,[]);console.log('Scars of Time: desktop/mobile layout, 32 bars, repeat route and no JS errors passed.');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1);});
