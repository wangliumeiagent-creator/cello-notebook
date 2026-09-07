(function(root){
'use strict';
// Transcribed from the three score images supplied by the user.
// Each token is sounding pitch:quarter-note beats:tie (s=start, c=continue, e=end).
const source=[
'G5:.5 A5:.5',
'Bb5:1.5 A5:.5 Bb5:1 D6:1',
'A5:3 D5:1',
'G5:1.5 F5:.5 G5:1 Bb5:1',
'F5:3 D5:1',
'Eb5:1.5 D5:.5 Eb5:1 Bb5:1',
'D5:3 Bb5:1',
'A5:1.5 E5:.5 E5:1 A5:1',
'A5:3 G5:.5 A5:.5',
'Bb5:1.5 A5:.5 Bb5:1 D6:1',
'A5:3 D5:1',
'G5:1.5 F5:.5 G5:1 Bb5:1',
'F5:3 D5:1',
'Eb5:1 Bb5:.5 A5:.5:s A5:1:e Bb5:1',
'C6:1 D6:.5 Bb5:.5:s Bb5:1.5:c Bb5:.25:e -:.25',
'Bb5:.5 A5:.5 G5:1 A5:1 F#5:1',
'G5:3 Bb5:.5 C6:.5',
'D6:1.5 C6:.5 D6:1 F6:1',
'C6:3 F5:1',
'Bb5:1.5 A5:.5 Bb5:1 D6:1',
'D6:4',
'G5:.5 A5:.5 Bb5:1 A5:.5 Bb5:.5 C6:1',
'Bb5:1.5 F5:.5 F5:2',
'Eb6:1 D6:1 C6:1 Bb5:1',
'D6:4:s',
'D6:2:e -:1 D6:1',
'G6:2 F6:2',
'D6:1 C6:.5 Bb5:.5:s Bb5:1.5:c Bb5:.25:e -:.25',
'C6:1 Bb5:.5 C6:.5:s C6:1:e F6:1',
'D6:3 D6:1',
'G6:2 F6:2',
'D6:1 C6:.5 Bb5:.5:s Bb5:1.5:c Bb5:.5:e',
'C6:1 Bb5:.5 C6:.5:s C6:1:e A5:1',
'G5:3 G5:.5 A5:.5',
'Bb5:1.5 A5:.5 Bb5:1 D6:1',
'A5:3 D5:1',
'G5:1.5 F5:.5 G5:1 Bb5:1',
'F5:3 D5:1',
'Eb5:1.5 D5:.5 Eb5:1 Bb5:1',
'D5:3 Bb5:1',
'A5:1.5 E5:.5 E5:1 A5:1',
'A5:3 G5:.5 A5:.5',
'Bb5:1.5 A5:.5 Bb5:1 D6:1',
'A5:3 D5:1',
'G5:1.5 F5:.5 G5:1 Bb5:1',
'F5:3 D5:1',
'Eb5:1 Bb5:.5 A5:.5:s A5:1:e Bb5:1',
'C6:1 D6:.5 Bb5:.5:s Bb5:1.5:c Bb5:.25:e -:.25',
'Bb5:.5 A5:.5 G5:1 A5:1 F#5:1',
'G5:3 G4:.5 -:.125 A4:.375',
'Bb4:1.5 -:.125 A4:.375 Bb4:1 D5:1',
'A4:3'
];
const sourceBars=source.map(b=>b.split(' ').map(token=>{const [pitch,beats,tie]=token.split(':');return {pitch:pitch==='-'?null:pitch,beats:Number(beats),...(tie?{tie:{s:'start',c:'continue',e:'stop'}[tie]}:{})};}));
const pitches={'D5':'A2','Eb5':'Bb2','E5':'B2','F5':'C3','F#5':'C#3','G5':'D3','A5':'E3','Bb5':'F3','C6':'G3','D6':'A3','Eb6':'Bb3','F6':'C4','G6':'D4'};
const fingers={A2:['G',1],Bb2:['G',2],B2:['G',3],C3:['G',4],'C#3':['G',4],D3:['D',0],E3:['D',1],F3:['D',2],G3:['D',4],A3:['A',0],Bb3:['A',1],C4:['A',2],D4:['A',4]};
const bars=sourceBars.map((bar,bi)=>bar.map((e,ni)=>{if(!e.pitch)return {...e};const lifted=bi>=50||(bi===49&&ni>=1);const sourcePitch=lifted?e.pitch.replace(/(\d)$/,n=>String(Number(n)+1)):e.pitch;const pitch=pitches[sourcePitch];if(!pitch)throw Error('未映射音高 '+sourcePitch);const [string,finger]=fingers[pitch];return {...e,pitch,string,finger,sourcePitch:e.pitch,...(lifted?{octaveAdjusted:true}:{}),...(pitch==='C#3'?{extension:'forward'}:pitch==='Bb3'?{extension:'back'}:{})};}));
const lesson={id:'castle-in-the-sky',title:'天空之城主旋律',english:'Carrying You · Castle in the Sky',composer:'Joe Hisaishi',kind:'曲目',collection:'拓展曲目',meter:[4,4],key:'D',mode:'minor',keyLabel:'D 小调',fifths:-1,jianpuTonic:'F3',jianpuKey:'F',jianpuFifths:-1,tempo:60,sourceTempo:110,tempoLabel:'练习速度（原谱 ♩ = 110）',pickup:1,repeat:false,systemBars:4,minNoteSpacing:32,stringsLabel:'G、D、A 弦',positionLabel:'第一把位 · 含前伸与后伸',description:'拓展练习 · D 小调 · G / D / A 弦 · 第 15、48 小节前伸 / 第 23 小节低 1 指后伸',source:'据你上传的三张谱图转录；G 小调移为 D 小调。第 49 小节第 2 音至曲末提高八度，以适配三根弦；第 15、48 小节保留 C♯3 前伸，第 23 小节 B♭3 使用低 1 指后伸。',focus:'附点节奏、延音线与临时变音',bars,sections:[{label:'主题起句（含弱起）',from:1,to:9},{label:'主题展开',from:10,to:17},{label:'过渡',from:18,to:21},{label:'高音乐段',from:22,to:34},{label:'主题再现',from:35,to:49},{label:'尾声',from:50,to:52}],theory:[{title:'D 小调与临时变音',body:'调号是一个降号 B♭。这首曲子还出现 B♮ 和 C♯，临时变音记号在本小节内对相同音高有效。G 弦上的 B♭2 用 2 指、B2 用 3 指。A 弦上的 B♭3 需要低 1 指手型；请让老师示范。',task:'先找出第 7、40 小节的还原号和第 15、48 小节的升号。'},{title:'三处伸张先跟老师学',body:'第 15、48 小节的 C♯3 用 G 弦 4 指向前伸半音，辅助指法标为“4伸”。第 23 小节 B♭3 用 A 弦低 1 指后伸，标为“1低”。其余音符标注为本版选定指法。它不是全程不伸张的入门练习；未学伸张时先听这三处，不要勉强按弦。',task:'把第 15 小节给老师看，确认 C♯3 的手型和放松方式。'},{title:'延音线：同一个音持续发声',body:'连接相同音高的弧线是延音线，时值相加，中间不重新发音。第 24–25 小节跨小节延音共六拍。网页会连续发声，音符高亮仍按谱面逐个移动。',task:'循环第 24–25 小节，数满六拍再休止。'},{title:'尾声中的短休止',body:'十六分休止是四分之一拍，三十二分休止是八分之一拍；附点十六分音符是八分之三拍。尾声保留了原图这些时值。开头弱起一拍，末小节三拍，首尾合计四拍。',task:'以 20 或 30 拍听第 49–51 小节，先拍节奏，再加入音高。'},{title:'简谱以 1=F 表示 D 小调',body:'本曲简谱使用 1=F，主音 D 是 6；音级下方圆点表示低八度。升 4 对应 B 自然音，升 5 对应 C♯。简谱仅作辅助，练习仍以五线谱为主。',task:'分别打开音名和简谱，核对 D、F、B♭、B 与 C♯。'}],practiceTips:['这首是拓展曲目，比铃木第一册当前进度更难；先跟老师确认 G 弦、低 1 指和两处 4 指伸张。','第 49 小节第 2 音起，原图低八度尾句整体提高八度，节奏不改。此处属于为大提琴选定音区的改编。','先用 20–60 BPM 分段练习。原图速度为 110 BPM；全曲没有末尾反复记号。','原图没有标注弓法；本版不自行添加弓向。显示辅助可分别查看音名、弦名和指法。']};
const api={sourceBars,lesson};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CelloLaputa=api;
})(globalThis);
