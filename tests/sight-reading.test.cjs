const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../src/sight-reading.html'),'utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const generator=script.slice(script.indexOf('function generatePhrase('),script.indexOf('function newPhrase('));
const strings=['C','G','D','A'];
const notes=strings.flatMap((s,i)=>[0,1,3,4].map((f,j)=>({s,f,id:s+f,midi:36+7*i+[0,2,4,5][j]})));
let seed=1105;
const math=Object.create(Math);math.random=()=>((seed=(1664525*seed+1013904223)>>>0)/2**32);
const context=vm.createContext({strings,Math:math});vm.runInContext(generator,context);
test('混合短句每次覆盖选定琴弦，保留相邻换弦和一把位范围',()=>{
 for(const range of [['C'],['G'],['D'],['A'],['G','D'],['D','A'],strings]){
  const pool=notes.filter(n=>range.includes(n.s));
  for(let attempt=0;attempt<200;attempt++){
   const phrase=context.generatePhrase(pool);
   assert.equal(phrase.length,8);
   assert.deepEqual([...new Set(phrase.map(n=>n.s))].sort(),[...range].sort());
   for(let i=0;i<phrase.length;i++){
    const n=phrase[i];assert(pool.includes(n));assert.notEqual(n.f,2);
    if(!i)continue;
    const prev=phrase[i-1],cross=n.s!==prev.s;
    assert(Math.abs(n.midi-prev.midi)<=(cross?7:4));
    if(cross)assert.equal(Math.abs(strings.indexOf(n.s)-strings.indexOf(prev.s)),1);
   }
  }
 }
});
test('空弦短句覆盖四弦且只使用空弦',()=>{
 const pool=notes.filter(n=>n.f===0);
 for(let i=0;i<100;i++){
  const phrase=context.generatePhrase(pool);
  assert.equal(new Set(phrase.map(n=>n.s)).size,4);
  assert(phrase.every(n=>n.f===0));
 }
});
