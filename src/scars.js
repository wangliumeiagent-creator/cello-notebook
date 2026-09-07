(function(root){
'use strict';
// Transcribed from the user-provided beginner cello score image.
const map={C2:['C',0],D2:['C',1],'F#2':['C',4],A2:['G',2],D3:['D',0],E3:['D',1],'F#3':['D',3],G3:['D',4],A3:['A',0],B3:['A',1],C4:['A',3]};
function note(pitch,beats,extra={}){const [string,finger]=map[pitch]||['D',0];return {pitch,beats,string,finger,...extra};}
function bar(tokens){return tokens.map(t=>Array.isArray(t)?note(t[0],t[1],t[2]||{}):note(t,1));}
const intro=[
 bar([['D2',.25],['F#2',.25],['A2',.25],['D3',.25],'A3',['D3',2]]),
 bar([['D2',.25],['F#2',.25],['A2',.25],['D3',.25],'D3',['A3',2]]),
 bar([['D2',.25],['F#2',.25],['A2',.25],['D3',.25],'A3',['D3',2]]),
 bar([['D2',.25],['F#2',.25],['A2',.25],['D3',.25],'D3',['A3',2]])
];
const aPhrases=[
 ['D3','D3','A3','A3'],['G3','A3','D3','D3'],['D3','A3','A3','G3'],['D3','D3','C4','C4'],
 ['D3','D3','A3','G3'],['D3','A3','A3','G3'],['D3','C4','G3','D3'],['D3','D3','C4','C4'],
 ['D3','D3','A3','G3'],['D3','A3','A3','G3'],['D3','C4','G3','D3'],['D3','D3','C4','C4']
].map(bar);
const bWhole=[bar([['C2',4,{tie:'start'}]]),bar([['C2',4,{tie:'stop'}]]),bar([['D2',4]]),bar([['C2',4]]),
 bar([['C2',1],['C2',.25],['C2',.25],['C2',.25],['C2',.25],['C2',1],['C2',1]]),
 bar([['D2',1],['D2',.25],['D2',.25],['D2',.25],['D2',.25],['D2',1],['D2',1]]),
 bar([['C2',1],['C2',.25],['C2',.25],['C2',.25],['C2',.25],['C2',1],['C2',1]]),
 bar([['C2',3],['C2',.5],['D2',.5]])
];
const cPhrases=[bar([['C4',1.5],['C4',.5],['D3',1],['C4',1]]),bar([['C4',1],['D3',1],['C4',1],['G3',1]]),bar([['C4',1],['D3',1],['C4',1],['D3',1]]),bar([['C4',2],['D3',1],['C4',1]])];
const dPhrases=[bar([['A3',1.5],['G3',.5],['D3',1],['D3',1]]),bar([['A3',2],['D3',2]]),bar([['A3',2],['G3',1],['D3',1]]),bar([['A3',2],['G3',1],['D3',1]])];
const bars=[...intro,...aPhrases,...bWhole,...cPhrases,...dPhrases];
const slurs=[];for(const b of [5,9,13,21,25])slurs.push({from:[b,0],to:[b,1]});slurs.push({from:[29,0],to:[29,1]});
const lesson={id:'scars-of-time',title:'时之伤痕',english:'Scars of Time · Chrono Cross',composer:'Yasunori Mitsuda',kind:'曲目',collection:'拓展曲目',meter:[4,4],key:'D',mode:'major',keyLabel:'D 大调',fifths:2,jianpuTonic:'D3',jianpuKey:'D',jianpuFifths:2,tempo:80,sourceTempo:80,tempoLabel:'Intro / A（原谱 ♩ = 80；B 段 ♩ = 112）',tempoMarks:[{bar:1,tempo:80,label:'Intro / A  ♩ = 80'},{bar:17,tempo:112,label:'B  ♩ = 112'}],repeat:true,repeatLabel:'D 段一二房',repeatPlan:{start:29,firstEnding:31,repeatEnd:31,secondEnding:32},systemBars:4,minNoteSpacing:30,stringsLabel:'C、G、D、A 弦',positionLabel:'初学者版 · 尽量第一把位',fingeringNote:'图中数字为本版第一把位参考指法；B 段使用 C 弦低音，换弦与运弓请跟老师确认。',description:'《时之伤痕》初学者大提琴版 · Intro、A、B、C、D 段',source:'按你提供的《Scars of Time / 时之伤痕》大提琴初学者谱面转录；保留段落、速度、反复与图中参考指法。',focus:'分段识谱、低音 C 弦与第一把位',bars,slurs,sections:[{label:'Intro',from:1,to:4},{label:'A 段',from:5,to:16},{label:'B 段',from:17,to:24},{label:'C 段',from:25,to:28},{label:'D 段',from:29,to:32}],theory:[{title:'先按段落识谱',body:'Intro 由低音分解和弦开始，A 段进入旋律，B 段转到 C 弦低音，C、D 段再回到旋律和反复。先按页面上的段落按钮练习，不必一次从头弹到尾。',task:'先练 Intro 1–4 小节，再练 A 段前四小节。'},{title:'B 段的 C 弦',body:'B 段的 C 与 D 是低音区音符，辅助行会标出 C 弦。低音全音符要数满四拍；随后是均匀的十六分音符型。',task:'先拍四拍，再把 C 弦空弦和低 1 指放进去。'},{title:'D 段的反复',body:'D 段有一二房：第一次演奏第 29–31 小节后回到第 29 小节，第二次跳到第 32 小节结束。勾选“按谱反复”时网页会执行这条路线。',task:'单独练第 29–32 小节，先读房子记号再播放。'},{title:'速度分段练习',body:'谱面标出 Intro / A 为四分音符 80，B 段为 112。网页以 80 作为默认练习速度；B 段先降速，稳定后再逐步提高。',task:'从 30 或 60 拍开始，确认十六分音符均匀后再加速。'}],practiceTips:['先选择 Intro 或 A 段按钮，熟悉旋律后再进入 B、C、D。','图中标有数字指法，本版照录为参考；低音 C 弦的手型请让老师确认。','显示辅助可以打开音名、弦名和指法，简谱仍然可以单独隐藏。','网页播放是合成参考音，用于核对音高和节奏，不模拟完整大提琴音色。']};
const api={lesson};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CelloScars=api;
})(globalThis);
