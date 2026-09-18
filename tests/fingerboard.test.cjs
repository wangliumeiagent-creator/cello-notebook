const test=require('node:test'),assert=require('node:assert/strict');
const F=require('../src/fingerboard.js'),C=require('../src/core.js'),N=require('../src/notation.js');

// Independently transcribed expected values: open-string MIDI + documented lower-position offsets.
const expected={
 C:{open:36,first:[38,40,41,43],second:[39,41,42,44],third:[41,43,44,46],fourth:[43,45,46,48]},
 G:{open:43,first:[45,47,48,50],second:[46,48,49,51],third:[48,50,51,53],fourth:[50,52,53,55]},
 D:{open:50,first:[52,54,55,57],second:[53,55,56,58],third:[55,57,58,60],fourth:[57,59,60,62]},
 A:{open:57,first:[59,61,62,64],second:[60,62,63,65],third:[62,64,65,67],fourth:[64,66,67,69]}
};
test('四根空弦与四把位的独立预期音高一致',()=>{
 for(const [string,table] of Object.entries(expected)){
  assert.equal(F.noteAt({string,positionId:'first',finger:0}).midi,table.open);
  for(const positionId of ['first','second','third','fourth']){
   const actual=F.positionNotes(positionId).filter(note=>note.string===string).map(note=>note.midi);
   assert.deepEqual(actual,table[positionId],`${string} 弦 ${positionId}`);
  }
 }
 assert.equal(F.validateData(),true);
});
test('音名拼写、频率和指板资料字段各自可审核',()=>{
 const sharp=F.noteAt({string:'A',positionId:'first',finger:2});
 assert.equal(sharp.pitch,'C#4');assert.equal(sharp.stringNumber,'Ⅰ');assert.equal(sharp.handShape,'常规四指手型（全－半－全）');
 assert.match(sharp.source.url,/cellolabstudio/);assert.match(sharp.reviewStatus,/待老师审核/);
 const cSharp=C.pitchInfo('C#4'),dFlat=C.pitchInfo('Db4');
 assert.equal(cSharp.midi,dFlat.midi);assert.equal(cSharp.hz,dFlat.hz);assert.notEqual(cSharp.diatonic,dFlat.diatonic);
 assert.ok(N.renderSingleNote('C#4').includes('E262'));assert.ok(N.renderSingleNote('Db4').includes('E260'));
 assert.equal(C.pitchInfo('C2').y,144);assert.equal(C.pitchInfo('C4').y,60);
 assert.match(N.renderSingleNote('C2'),/y1="144"/);assert.match(N.renderSingleNote('C4'),/y1="60"/);
});
test('故意错误的映射样本会被数据校验拒绝',()=>{
 const wrong={...F.noteAt({string:'D',positionId:'third',finger:4}),midi:61};
 assert.throws(()=>F.validateData([wrong]),/MIDI 与开弦/);
});
