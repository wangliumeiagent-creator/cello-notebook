const test=require('node:test'),assert=require('node:assert/strict');
const C=require('../src/core.js'),N=require('../src/notation.js'),{lesson:l}=require('../src/c-major.js');

test('C 大调音阶：四小节四拍，C/G 弦第一把位',()=>{
 assert.equal(C.validateLesson(l),true);assert.deepEqual(l.meter,[4,4]);assert.equal(l.bars.length,4);
 l.bars.forEach(b=>assert.equal(C.barBeats(l,l.bars.indexOf(b)),4));
 assert.deepEqual(l.bars.flat().map(e=>e.pitch),['C2','D2','E2','F2','G2','A2','B2','C3','C3','B2','A2','G2','F2','E2','D2','C2']);
 assert.deepEqual(l.bars.flat().map(e=>[e.string,e.finger]),[['C',0],['C',1],['C',3],['C',4],['G',0],['G',1],['G',3],['G',4],['G',4],['G',3],['G',1],['G',0],['C',4],['C',3],['C',1],['C',0]]);
});

test('C 大调调号与输出',()=>{
 assert.equal(l.fifths,0);assert.equal(C.timeline(l,{tempo:20,countIn:false}).duration,48);
 const xml=N.musicxml(l,true);assert.match(xml,/<fifths>0<\/fifths>/);assert.equal((xml.match(/<measure /g)||[]).length,4);assert.match(xml,/<string>4<\/string>/);
});
