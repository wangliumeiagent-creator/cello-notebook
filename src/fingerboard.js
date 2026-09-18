(function(root){
'use strict';
const C=typeof module!=='undefined'&&module.exports?require('./core.js'):root.CelloCore;
const OPEN_STRINGS=Object.freeze([
 {string:'C',stringNumber:'Ⅳ',pitch:'C2',midi:36},
 {string:'G',stringNumber:'Ⅲ',pitch:'G2',midi:43},
 {string:'D',stringNumber:'Ⅱ',pitch:'D3',midi:50},
 {string:'A',stringNumber:'Ⅰ',pitch:'A3',midi:57}
]);
const SOURCE=Object.freeze({
 title:'The Cello Lab, “Cello positions” (2023)',
 url:'https://cellolabstudio.com/en/2023/12/13/cello-positions-notes/',
 note:'该文明确区分下/上第二、下/上第三，并把第四把位说明为下第四的常见用法；音高以开弦 MIDI 加半音偏移计算。'
});
// A single, non-extended four-finger frame. It is a learning diagram, not a physical distance scale.
const POSITIONS=Object.freeze([
 {id:'first',name:'第一把位',handShape:'常规四指手型（全－半－全）',firstFingerOffset:2,offsets:[2,4,5,7],spellings:['D','E','F','G'],source:SOURCE,reviewStatus:'来源已核对；待老师审核'},
 {id:'second',name:'下第二把位',handShape:'常规四指手型（全－半－全）',firstFingerOffset:3,offsets:[3,5,6,8],spellings:['Eb','F','Gb','Ab'],source:SOURCE,reviewStatus:'来源已核对；待老师审核'},
 {id:'third',name:'下第三把位',handShape:'常规四指手型（全－半－全）',firstFingerOffset:5,offsets:[5,7,8,10],spellings:['F','G','Ab','Bb'],source:SOURCE,reviewStatus:'来源已核对；待老师审核'},
 {id:'fourth',name:'下第四把位',handShape:'常规四指手型（全－半－全）',firstFingerOffset:7,offsets:[7,9,10,12],spellings:['G','A','Bb','C'],source:SOURCE,reviewStatus:'来源已核对；待老师审核'}
]);
const CHROMATIC_SHARPS=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const CHROMATIC_FLATS=['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
function pitchForMidi(midi,spelling){
 if(!Number.isInteger(midi))throw Error('MIDI 必须是整数');
 const octave=Math.floor(midi/12)-1,pc=((midi%12)+12)%12,letter=(spelling==='flat'?CHROMATIC_FLATS:CHROMATIC_SHARPS)[pc];
 return `${letter}${octave}`;
}
function openString(string){const found=OPEN_STRINGS.find(item=>item.string===string);if(!found)throw Error('未知琴弦');return found;}
function position(id){const found=POSITIONS.find(item=>item.id===id);if(!found)throw Error('未知把位');return found;}
function noteAt({string,positionId,finger,spelling}){
 const open=openString(string);if(finger===0)return {...open,finger:0,positionId:null,positionName:null,handShape:null,semitones:0,pitch:open.pitch,info:C.pitchInfo(open.pitch),source:SOURCE,reviewStatus:'开弦音高已核对'};
 const pos=position(positionId);if(!Number.isInteger(finger)||finger<1||finger>4)throw Error('指法必须为 0–4');
 const semitones=pos.offsets[finger-1],midi=open.midi+semitones;
 const wantsFlat=spelling==='flat'||(spelling!=='sharp'&&pos.spellings[finger-1].includes('b'));
 const pitch=pitchForMidi(midi,wantsFlat?'flat':'sharp'),info=C.pitchInfo(pitch);
 return {string:open.string,stringNumber:open.stringNumber,openPitch:open.pitch,positionId:pos.id,positionName:pos.name,handShape:pos.handShape,finger,semitones,midi,pitch,info,source:pos.source,reviewStatus:pos.reviewStatus};
}
function positionNotes(positionId){return OPEN_STRINGS.flatMap(open=>[1,2,3,4].map(finger=>noteAt({string:open.string,positionId,finger})));}
function allEnabledNotes(){return POSITIONS.flatMap(pos=>positionNotes(pos.id));}
function validateData(data=allEnabledNotes()){
 if(!Array.isArray(data)||!data.length)throw Error('指板数据不能为空');
 for(const note of data){
  const open=openString(note.string);if(!Number.isInteger(note.semitones)||note.semitones<0)throw Error('半音偏移无效');
  if(note.midi!==open.midi+note.semitones)throw Error('MIDI 与开弦/半音偏移不一致');
  const info=C.pitchInfo(note.pitch);if(info.midi!==note.midi)throw Error('音名拼写与 MIDI 不一致');
  if(Math.abs(info.hz-440*2**((note.midi-69)/12))>1e-9)throw Error('频率与 MIDI 不一致');
 }
 return true;
}
const api={OPEN_STRINGS,POSITIONS,SOURCE,pitchForMidi,openString,position,noteAt,positionNotes,allEnabledNotes,validateData};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CelloFingerboard=api;
})(globalThis);
