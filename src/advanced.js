(function(root){
'use strict';
// User-provided 73-bar bass-clef score. Bar numbers are the printed numbers.
// t = quarter-note triplet (2/3 beat); s/c/e = tie start/continue/stop.
const source=[
'F#4:t F#4:t E4:t F#4:t F#4:t E4:t',
'-:4','-:4','-:4','-:4','-:4','-:4',
'-:2 -:1 E3:.5 F#3:.5',
'G3:1.5 F#3:.5 G3:1 B3:1',
'F#3:2 -:1 B2:1',
'E3:1.5 D3:.5 E3:1 G3:1',
'D3:2 -:1 B2:.5 B2:.5',
'C3:1.5 B2:.5 C3:.5 G3:1.5',
'B2:2 -:.5 G3:.5 G3:.5 G3:.5',
'F#3:1.5 C#3:.5 C#3:1 F#3:1',
'F#3:2 -:1 E3:.5 F#3:.5',
'G3:1.5 F#3:.5 G3:1 B3:1',
'F#3:2 -:1 B2:.5 B2:.5',
'E3:1.5 D3:.5 E3:1 G3:1',
'D3:2 -:1 -:.5 B2:.5',
'C3:1 G3:.5 F#3:.5:s F#3:1:e G3:1',
'A3:.5 A3:1 B3:.5 G3:2',
'G3:.5 F#3:.5 E3:.5 E3:.5 F#3:1 D#3:1',
'E3:2 -:1 G3:.5 A3:.5',
'B3:1.5 A3:.5 B3:1 D4:1',
'A3:2 -:1 D3:.5 D3:.5',
'G3:1.5 F#3:.5 G3:1 B3:1',
'B3:4',
'E3:.5 F#3:.5 G3:1 F#3:.5 G3:.5 A3:.5 A3:.5',
'G3:1.5 D3:.5:s D3:2:e',
'C4:1 B3:1 A3:1 G3:1',
'B3:4:s',
'B3:2:e -:1 B3:1',
'E4:2 D4:1.5:s D4:.5:e',
'B3:.5 A3:.5 G3:2 -:.5 G3:.5',
'A3:1 G3:.5 A3:.5:s A3:.5:e D4:1.5',
'B3:2 -:1 B3:1',
'E4:2 D4:2',
'B3:.5 A3:.5 G3:2 -:.5 G3:.5',
'A3:1 G3:.5 A3:.5:s A3:1:e E3:1',
'E3:2 -:1 E3:.5 F#3:.5',
'G3:1.5 F#3:.5 G3:1 B3:1',
'F#3:2 -:1 B2:1',
'E3:1.5 D3:.5 E3:1 G3:1',
'D3:2 -:1 B2:.5 B2:.5',
'C3:1.5 B2:.5 C3:.5 G3:1.5',
'B2:2 -:.5 G3:.5 G3:.5 G3:.5',
'F#3:1.5 C#3:.5 C#3:1 F#3:1',
'F#3:2 -:1 E3:.5 F#3:.5',
'G3:1.5 F#3:.5 G3:1 B3:1',
'F#3:2 -:1 B2:.5 B2:.5',
'E3:1.5 D3:.5 E3:1 G3:1',
'D3:2 -:1 -:.5 B2:.5',
'C3:1 G3:.5 F#3:.5:s F#3:1:e G3:1',
'A3:1 B3:.5 G3:.5:s G3:2:e',
'G3:.5 F#3:.5 E3:.5 E3:.5 F#3:1 D#3:1',
'E3:3 E3:.25 F#3:.25 G3:.25 A3:.25',
'B3:4',
'B3:t D4:t C4:t B3:t A3:t G3:t',
'D3:4:s',
'D3:2:e -:1 E3:.25 F#3:.25 G3:.25 A3:.25',
'B3:4',
'B3:t D4:t C4:t B3:t A3:t G3:t',
'A3:4:s',
'A3:2:e -:1 B3:1',
'E3:3 E3:.5 F3:.5:s',
'F3:3:e F3:.5 G3:.5:s',
'G3:3:e G3:.5 A3:.5:s',
'A3:4:c','A3:4:e','A3:4:s','A3:4:e',
'A3:1 -:1 -:2'
];
// Fingering is an editorial reference, not printed in the uploaded score.
const fingers={B2:['G',3],C3:['G',4],'C#3':['G',4,'I','forward'],D3:['D',0],'D#3':['D',1,'I','back'],E3:['D',1],F3:['D',2],'F#3':['D',3],G3:['D',4],A3:['A',0],B3:['A',1],C4:['A',2],D4:['A',4],E4:['A',3,'IV'],'F#4':['A',4,'IV','forward']};
const bars=source.map(b=>b.split(' ').map((token,n)=>{const [pitch,d,tie]=token.split(':'),e={pitch:pitch==='-'?null:pitch,beats:d==='t'?2/3:Number(d)};if(d==='t')Object.assign(e,{writtenBeats:1,tuplet:{actual:3,normal:2,group:Math.floor(n/3),index:n%3}});if(tie)e.tie={s:'start',c:'continue',e:'stop'}[tie];if(e.pitch){const [string,finger,position='I',extension]=fingers[e.pitch];Object.assign(e,{string,finger,position});if(extension)e.extension=extension;}else if(e.beats===4)e.measureRest=true;return e;}));
// Slur endpoints use one-based bar numbers and zero-based note indices.
const slurs=[];const slur=(bar,a,z)=>slurs.push({from:[bar,a],to:[bar,z]});
[9,11,13,15,17,19,25,27,31,42,44,46,48,50,52].forEach(b=>{slur(b,0,1);slur(b,2,3);});
[8,16,24,41,49].forEach(b=>slur(b,2,3));
[21,54].forEach(b=>slur(b,1,3));slur(22,1,2);
[23,56].forEach(b=>{slur(b,0,1);slur(b,4,5);});
slur(29,0,2);slur(29,3,4);slur(30,0,1);
[35,39].forEach(b=>slur(b,0,2));slur(40,0,1);slur(55,0,2);
slur(57,1,4);slur(61,2,5);[59,63].forEach(b=>slur(b,4,5));
[66,67,68].forEach(b=>slur(b,1,2));
slurs.filter(s=>[13,46].includes(s.from[0])&&s.from[1]===0).forEach(s=>s.placement='below');
const bows=[[8,2,'up'],[10,2,'up'],[12,2,'down'],[14,2,'up'],[16,2,'up'],[18,2,'down'],[20,3,'up'],[24,2,'up'],[26,2,'up'],[33,2,'up'],[34,0,'down'],[34,1,'up'],[37,2,'up'],[39,4,'up'],[41,2,'up'],[43,2,'up'],[45,2,'down'],[47,2,'up'],[49,2,'up'],[51,2,'down'],[53,3,'up'],[57,1,'up'],[61,2,'up'],[65,2,'up']];
bows.forEach(([b,n,bow])=>bars[b-1][n].bow=bow);
const lesson={id:'castle-in-the-sky-advanced',title:'天空之城进阶版',english:'君をのせて · Carrying You',composer:'Joe Hisaishi',kind:'曲目',collection:'拓展曲目',meter:[4,4],key:'E',mode:'minor',keyLabel:'E 小调',fifths:1,jianpuTonic:'G3',jianpuKey:'G',jianpuFifths:1,tempo:60,sourceTempo:116,tempoLabel:'练习速度（原谱 ♩ = 116）',repeat:true,repeatLabel:'第 34 小节起反复 · 一二房',repeatPlan:{start:34,firstEnding:57,repeatEnd:65,secondEnding:66},divisions:24,systemBars:2,minNoteSpacing:32,topPadding:48,printSystems:3,stringsLabel:'G、D、A 弦',positionLabel:'含第四把位与伸张 · 参考指法',fingeringNote:'指法为编辑参考，I / IV 表示第一 / 第四把位；换把与弓法请跟老师确认。',description:'原调进阶谱 · 73 小节 · 三连音、连弓、一二房反复与换把',source:'按你上传的《君をのせて》低音谱号单页谱转录，保留原调、原音区与 73 小节结构。原图无数字指法；辅助指法为编辑参考。',focus:'三连音、延音与连弓、反复路线及换把',bars,slurs,sections:[{label:'前奏与休止',from:1,to:7},{label:'主题起句',from:8,to:19},{label:'主题展开',from:20,to:33},{label:'反复段起点',from:34,to:40},{label:'主题再现',from:41,to:56},{label:'第一房',from:57,to:65},{label:'第二房与结尾',from:66,to:73}],theory:[{title:'三连音：三个音占两拍',body:'第 1、59、63 小节的四分音符三连音，每组三个音均分两拍；一小节两组，共四拍。播放按真实时值计算，节拍器仍每四分音符一拍。',task:'先以 30 BPM 听第 59 小节，感受两拍中的三个均匀发音。'},{title:'一二房怎样走',body:'完整播放路线：第 1–65 小节；回到第 34 小节，演奏到第 56 小节；跳过第一房，接第 66–73 小节。勾选“按谱反复”时才走此路线；分段播放始终按所选范围直走。',task:'在第 34、57、65、66 小节找到反复与房子记号。'},{title:'连弓与延音不同',body:'不同音高之间的弧线是连弓，仍有不同音符；相同音高间的延音线则合并时值，中间不重新发音。网页保留连线，延音只发声一次。',task:'对比第 21 小节外层连弓与内层 F♯ 延音线。'},{title:'参考指法与高把位',body:'辅助行中的 I / IV 表示第一 / 第四把位。E4 参考 A 弦第四把位 3 指，F♯4 参考该把位 4 指前伸；C♯3 使用 G 弦 4 指前伸，D♯3 使用 D 弦低 1 指。它不是全程第一把位练习，原图也没有指定数字指法。',task:'先让老师确认第 1、15、23、34、38 小节的换把和伸张，再练习。'},{title:'E 小调与临时记号',body:'调号为 F♯，曲中还出现 C♯、D♯和 F 自然音。简谱辅助采用 1=G，E 为 6；音名、弦名、指法可分开显示。',task:'核对第 66–67 小节的还原 F，并听跨小节延音。'}],practiceTips:['保留原谱第 1 小节高音三连音和第 2–7 小节整小节休止；可直接选“主题起句”从第 8 小节开始。','默认 60 BPM，提供 20、30 与原谱 116 BPM 档位；先分段读谱，再跟老师练习高把位。','弓向与连线按上传谱录入；辅助指法是参考方案，老师可以根据乐句调整。','打印同时包含练习版与辅助版；简谱默认隐藏，不进入打印谱。']};
const api={lesson};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CelloAdvanced=api;
})(globalThis);
