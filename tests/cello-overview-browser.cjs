const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require(process.env.PLAYWRIGHT_PATH);
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.BROWSER_PATH,headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:1000}});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../dist/index.html')).href+'#fingerboard');
  await page.screenshot({path:path.resolve(__dirname,'../qa/cello-overview-release-1793781203122.png'),fullPage:true});
  for(const id of ['first','second','third','fourth']){
   await page.locator('#celloOverview a[href="#fingerboard/'+id+'"] rect').click();
   await page.waitForFunction(id=>document.querySelector('[data-position="'+id+'"]').getAttribute('aria-pressed')==='true',id);
   await page.locator('#backToCello').click();
   await page.locator('#celloOverview').waitFor({state:'visible'});
  }
  await page.setViewportSize({width:390,height:844});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert.deepEqual(errors,[]);
  console.log('Cello overview: four position links, return navigation and 390px layout passed.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
