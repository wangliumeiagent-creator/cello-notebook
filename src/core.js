(function(root){
'use strict';
const STEPS={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
function pitchInfo(pitch){if(!pitch)return null;const m=/^([A-G])(#|b)?([0-8])$/.exec(pitch);if(!m)throw Error('无效音高');const midi=(Number(m[3])+1)*12+STEPS[m[1]]+(m[2]==='#'?1:m[2]==='b'?-1:0);const diatonic=Number(m[3])*7+'CDEFGAB'.indexOf(m[1]);return {midi,hz:440*2**((midi-69)/12),step:m[1],alter:m[2]==='#'?1:m[2]==='b'?-1:0,octave:Number(m[3]),y:96-(diatonic-22)*6,name:pitch.replace('#','♯').replace('b','♭')};}
function barLabel(l,i){return l.pickup?(i===0?'弱起':String(i)):String(i+1);}
function barBeats(l,i){return l.bars[i].reduce((sum,e)=>sum+e.beats,0);}
function validateLesson(l){
 if(!l||!Array.isArray(l.bars)||l.meter[1]!==4)throw Error('不支持的练习结构');
 if(l.pickup!==undefined&&!(l.pickup>0&&l.pickup<l.meter[0]&&l.bars.length>1))throw Error('无效弱起');
 l.bars.forEach((bar,i)=>{const expected=l.pickup&&i===0?l.pickup:l.pickup&&i===l.bars.length-1?l.meter[0]-l.pickup:l.meter[0];if(!bar.length||Math.abs(barBeats(l,i)-expected)>1e-9)throw Error(`第 ${barLabel(l,i)} 小节拍数不符`);bar.forEach(e=>{if(![.25,.5,1,1.5,2,3,4].includes(e.beats))throw Error('不支持的时值');if(e.pitch){pitchInfo(e.pitch);if(!['A','D','G','C'].includes(e.string)||![0,1,2,3,4].includes(e.finger))throw Error('缺少指法');}});});return true;
}
function timeline(l,{from=1,to=l.bars.length,tempo=60,countIn=false,repeat=false}={}){
 validateLesson(l);if(!Number.isInteger(from)||!Number.isInteger(to)||from<1||to>l.bars.length||to<from)throw Error('请选择有效小节范围');if(!Number.isFinite(tempo)||tempo<20||tempo>160)throw Error('速度超出范围');
 const beatSeconds=60/tempo,lead=countIn?(l.pickup&&from===1?l.meter[0]-l.pickup:l.meter[0]):0;let time=lead*beatSeconds;const entries=[],clicks=[];
 for(let b=0;b<lead;b++)clicks.push({time:b*beatSeconds,strong:b===0,pre:true,beat:b+1});
 const passes=repeat&&l.repeat&&from===1&&to===l.bars.length?2:1;
 for(let pass=0;pass<passes;pass++)for(let bar=from-1;bar<to;bar++){
  const duration=barBeats(l,bar),offset=l.pickup&&bar===0?l.meter[0]-l.pickup:0;
  for(let b=Math.ceil(offset);b<offset+duration;b++)clicks.push({time:time+(b-offset)*beatSeconds,strong:b===0,bar,beat:b+1,pass,pre:false});
  let elapsed=0;l.bars[bar].forEach((event,index)=>{entries.push({time:time+elapsed*beatSeconds,duration:event.beats*beatSeconds,bar,index,pass,...event});elapsed+=event.beats;});time+=duration*beatSeconds;
 }return {entries,clicks,duration:time,passes,beatSeconds};
}
function checkRecord(r){return r&&typeof r.id==='string'&&r.id.length>0&&r.id.length<180&&typeof r.lessonId==='string'&&r.lessonId.length<100&&typeof r.date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(r.date)&&typeof r.note==='string'&&r.note.length<=5000&&Number.isFinite(r.tempo)&&r.tempo>=20&&r.tempo<=160&&['练习中','较稳定','需要复习'].includes(r.status)&&typeof r.createdAt==='string'&&!Number.isNaN(Date.parse(r.createdAt));}
function parseBackup(text){if(text.length>5e6)throw Error('备份文件过大');const data=JSON.parse(text);if(data.format!=='cello-notebook-records'||data.version!==1||!Array.isArray(data.records)||data.records.length>10000||!data.records.every(checkRecord))throw Error('这不是有效的练习记录备份');return data.records.map(r=>({id:r.id,lessonId:r.lessonId,date:r.date,tempo:r.tempo,status:r.status,note:r.note,createdAt:r.createdAt}));}
function mergeRecords(existing,incoming){if(!existing.every(checkRecord)||!incoming.every(checkRecord))throw Error('记录格式不正确');const result=existing.map(r=>({...r}));let added=0,duplicates=0,conflicts=0;const signature=r=>JSON.stringify([r.lessonId,r.date,r.tempo,r.status,r.note,r.createdAt]);for(const r of incoming){const same=result.filter(e=>e.id===r.id||e.id.startsWith(r.id+'~'));if(same.some(e=>signature(e)===signature(r))){duplicates++;continue;}let id=r.id;if(result.some(e=>e.id===id)){conflicts++;let n=1;while(result.some(e=>e.id===`${r.id}~${n}`))n++;id=`${r.id}~${n}`;}result.push({...r,id});added++;}return {records:result,added,duplicates,conflicts};}
const api={barLabel,barBeats,pitchInfo,validateLesson,timeline,checkRecord,parseBackup,mergeRecords};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CelloCore=api;
})(globalThis);
