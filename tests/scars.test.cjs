const test=require('node:test'),assert=require('node:assert/strict');
const C=require('../src/core.js'),N=require('../src/notation.js'),{lesson:l}=require('../src/scars.js');
test('时之伤痕：四段 32 小节逐小节四拍',()=>{assert.equal(l.bars.length,32);assert.equal(C.validateLesson(l),true);l.bars.forEach((b,i)=>assert.equal(C.barBeats(l,i),4));assert.deepEqual(l.sections.map(s=>s.label),['Intro','A 段','B 段','C 段','D 段']);});
test('B 段低音与 D 段一二房保留',()=>{assert.equal(l.bars[16][0].pitch,'C2');assert.equal(l.bars[16][0].string,'C');assert.equal(l.bars[20][1].beats,.25);const p=C.timeline(l,{tempo:60,repeat:true});assert.equal(p.passes,2);assert.equal(p.duration,136);assert.match(N.musicxml(l,true),/<ending number="1"/);assert.match(N.musicxml(l,true),/<ending number="2"/);});
test('辅助指法和 D 大调信息写入输出',()=>{assert.equal(l.fifths,2);assert.match(N.renderSystem(l,0,4,{names:true,fingering:true,jianpu:true}),/Ⅳ·1/);assert.match(N.musicxml(l,true),/<fingering>0<\/fingering>/);});
