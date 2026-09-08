(function(root){
'use strict';
// Suzuki Book 1 companion: one-octave C-major scale in first position.
// C2–F2 are on the C string; G2–C3 are on the G string.
const map={C2:['C',0],D2:['C',1],E2:['C',3],F2:['C',4],G2:['G',0],A2:['G',1],B2:['G',3],C3:['G',4]};
const note=(pitch,beats=1,extra={})=>({pitch,beats,string:map[pitch][0],finger:map[pitch][1],...extra});
const bars=[
 ['C2','D2','E2','F2'],
 ['G2','A2','B2','C3'],
 ['C3','B2','A2','G2'],
 ['F2','E2','D2','C2']
].map(pitches=>pitches.map(p=>note(p)));
const lesson={
 id:'c-major-scale',title:'C 大调音阶',english:'C major · one octave',kind:'音阶',collection:'铃木第一册 · 音阶补充',
 meter:[4,4],key:'C',mode:'major',keyLabel:'C 大调',fifths:0,jianpuTonic:'C2',jianpuKey:'C',jianpuFifths:0,
 tempo:60,repeat:false,systemBars:4,stringsLabel:'C、G 弦',positionLabel:'第一把位 · 不换把、不伸张',
 description:'铃木第一册配套 · C、G 弦第一把位 · 一八度上行与下行',
 source:'按铃木第一册音阶学习方向整理的配套练习；音符与指法供课堂复习使用。',
 focus:'认识 C 大调无升降号音列与 C/G 弦换弦',bars,sections:[{label:'上行低音区',from:1,to:2},{label:'下行低音区',from:3,to:4}],
 theory:[
  {title:'C 大调没有调号',body:'C 大调的音列是 C、D、E、F、G、A、B、C，五线谱开头没有升号或降号。先看音符在谱表上的位置，再读出音名。',task:'遮住辅助，逐个读出四小节的音名。'},
  {title:'C 弦到 G 弦的换弦',body:'C、D、E、F 在 C 弦使用 0–1–3–4 指；G、A、B、C 在 G 弦使用 0–1–3–4 指。两根弦都保持第一把位，G2 是换弦后的空弦。',task:'先只练第 1–2 小节，换弦时保持拍子和弓速均匀。'},
  {title:'上行与下行',body:'前两小节从低音 C 上行到高音 C，后两小节原路返回。每小节四个四分音符，数满 1、2、3、4。',task:'稳定后用 20 或 30 拍练习，每个音保持一拍。'}
 ],
 practiceTips:['先唱或说音名，再把 0–1–3–4 指法放到对应琴弦。','保持第一把位；C 弦与 G 弦换弦处先停弓确认姿势，再连起来练。','网页播放是音高与拍点参考，弓法和手型以老师示范为准。'],
 fingeringNote:'辅助标注为 C、G 弦第一把位参考：两弦均为 0–1–3–4；请让老师确认手型与换弦动作。'
};
const api={lesson};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CelloCMajor=api;
})(globalThis);
