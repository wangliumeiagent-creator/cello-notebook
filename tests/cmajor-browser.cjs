const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const ROOT=path.resolve(__dirname,'..');
(async()=>{const b=await chromium.launch({headless:true,executablePath:process.env.BROWSER_PATH||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});try{
 const p=await b.newPage({viewport:{width:1440,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(process.env.SITE_URL||'http://127.0.0.1:4317/#c-major-scale');await p.evaluate(()=>document.fonts.ready);
 assert.equal(await p.locator('#title').textContent(),'C 大调音阶');assert.equal(await p.locator('#score .score-line').count(),1);assert.equal(await p.locator('#score .note-event').count(),16);assert.equal(await p.locator('#chips').textContent().then(t=>t.includes('C 大调')),true);
 await p.click('#answers');assert.equal(await p.locator('#score .annotation').count()>0,true);await p.check('[data-layer=jianpu]');
 await p.setViewportSize({width:390,height:844});await p.waitForTimeout(300);assert.equal(await p.locator('#score .score-line').count(),4);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await p.setViewportSize({width:1440,height:1000});await p.click('#print');await p.waitForTimeout(500);const printHtml=await p.evaluate(()=>CelloApp.printHtml());assert.match(printHtml,/C 大调音阶/);assert.match(printHtml,/C、G 弦/);
 if(process.argv.includes('--pdf')){const q=await b.newPage();await q.setContent('<html><head><style>'+await p.locator('style').first().textContent()+'</style></head><body><div id="printRoot">'+printHtml+'</div></body></html>');await q.evaluate(()=>document.fonts.ready);await q.pdf({path:path.join(ROOT,'dist/scores/c-major-scale.pdf'),preferCSSPageSize:true,printBackground:true});await q.close();}
 assert.deepEqual(errors,[]);console.log('C major scale: desktop/mobile layout, 16 notes, helper layers and print passed.');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1);});
