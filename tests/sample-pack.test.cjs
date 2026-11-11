const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const dir=path.resolve(__dirname,'../assets/cello'),manifest=JSON.parse(fs.readFileSync(path.join(dir,'manifest.json'),'utf8'));
const context=vm.createContext({});vm.runInContext(fs.readFileSync(path.join(dir,'pack.js'),'utf8'),context);
const pack=context.CelloSamplePack;
test('真人采样：许可、来源、26 份音频完整性与循环点',()=>{
 assert.equal(pack.license,'CC0-1.0');assert.equal(manifest.samples.length,26);assert.equal(pack.samples.length,26);
 assert.equal(manifest.performer,'Kamila Borowiak');assert(fs.readFileSync(path.join(dir,'LICENSE.txt'),'utf8').includes('CC0 1.0 Universal'));
 for(const [i,sample] of pack.samples.entries()){
  const b=Buffer.from(sample.data,'base64'),ref=manifest.samples[i];
  assert.equal(crypto.createHash('sha256').update(b).digest('hex'),ref.sha256);assert.equal(b.length,ref.bytes);
  assert.equal(b.toString('ascii',0,4),'RIFF');assert.equal(b.readUInt16LE(22),1);assert.equal(b.readUInt16LE(34),16);
  assert.equal(b.readUInt32LE(24),32000);assert(sample.loopStart>0&&sample.loopEnd>sample.loopStart);
  assert(sample.loopEnd<=b.readUInt32LE(40)/64000+.001);assert(Math.abs(sample.cents)<30);
  const expected=440*2**((sample.root-69)/12);assert(Math.abs(1200*Math.log2(sample.hz/expected))<30);
 }
});
test('真实音高按科学音高映射；现有曲目、四弦与全部把位离原采样不超过两个半音',()=>{
 const roots=[...new Set(pack.samples.map(s=>s.root))];assert.deepEqual(roots,[36,39,42,45,48,51,54,57,60,63,66,69,72]);
 for(const root of roots)assert.deepEqual(Array.from(pack.samples.filter(s=>s.root===root),s=>s.bow),['d','g']);
 const lib=require('../src/library.js'),core=require('../src/core.js'),F=require('../src/fingerboard.js');
 const pitches=lib.lessons.flatMap(l=>l.bars.flat()).filter(n=>n.pitch).map(n=>core.pitchInfo(n.pitch).midi);
 pitches.push(...F.allEnabledNotes().map(n=>n.midi),...F.OPEN_STRINGS.map(n=>n.midi));
 for(const midi of pitches)assert(Math.min(...roots.map(r=>Math.abs(r-midi)))<=2,`MIDI ${midi}`);
 assert(F.POSITIONS.length>=4);
});
