(function(root){
'use strict';
const fingering={D3:{string:'D',finger:0},E3:{string:'D',finger:1},'F#3':{string:'D',finger:3},G3:{string:'D',finger:4},A3:{string:'A',finger:0},B3:{string:'A',finger:1},'C#4':{string:'A',finger:3},D4:{string:'A',finger:4}};
const note=(pitch,beats,extra={})=>({pitch,beats,...(pitch?fingering[pitch]:{}),...extra});
const eighths=s=>s.split(' ').map(p=>note(p,.5));
const wind={
 id:'song-of-the-wind',title:'风之歌',english:'Song of the Wind',kind:'曲目',meter:[2,4],key:'D',fifths:2,tempo:60,tempoLabel:'Moderato',repeat:true,
 description:'铃木第一册 · 第一把位 · D / A 弦',source:'你提供的铃木大提琴教材修订版，第 7 页（PDF 第 17 页）。',
 focus:'八分音符、跨弦跳进与一拍休止',dynamic:'mf',
 bars:[
 eighths('D3 E3 F#3 G3'),eighths('A3 A3 A3 A3'),eighths('B3 G3 D4 B3'),[note('A3',1),note(null,1)],
 eighths('B3 G3 D4 B3'),[note('A3',1),note(null,1)],eighths('A3 G3 G3 G3'),eighths('G3 F#3 F#3 F#3'),
 eighths('F#3 E3 E3 E3'),[note('D3',.5),note('F#3',.5),note('A3',1,{breath:true})],
 eighths('A3 G3 G3 G3'),eighths('G3 F#3 F#3 F#3'),eighths('F#3 E3 E3 E3'),[note('D3',1),note(null,1)]
 ],
 sections:[{label:'起句',from:1,to:2},{label:'跳进与休止',from:3,to:6},{label:'下行乐句',from:7,to:10},{label:'收尾',from:11,to:14}],
 theory:[
 {title:'2/4 拍：每小节两拍',body:'以四分音符为一拍，每小节数 1、2。八分音符占半拍，可读作“1 和 2 和”。这首原曲保持 2/4 拍，不改成 4/4。',task:'先只拍第 1–2 小节：每小节四个均匀的半拍。'},
 {title:'D 大调：F 与 C 都升高半音',body:'调号的两个升号分别作用于 F 和 C。本曲实际使用 F♯，没有出现 C♯；D 大调音阶练习中会遇到 C♯。音名表示音高，指法数字表示手指。',task:'打开音名提示，找出所有 F♯，再关闭提示读一遍。'},
 {title:'休止、反复与换气',body:'第 4、6、14 小节的四分休止符各占一拍。末尾的反复记号要求从曲首再演奏一次。第 10 小节后有换气记号：它提示乐句呼吸，没有固定的额外拍数。参考播放按谱面时值进行，不额外加拍。',task:'循环第 3–6 小节，数满休止拍；完整播放时打开“按谱反复”。'}
 ],
 practiceTips:[
 '第 3、5 小节：B3（A 弦 1 指）→ G3（D 弦 4 指）→ D4（A 弦 4 指）→ B3（A 弦 1 指）。先慢速读音名，再按老师教过的动作换弦。',
 '教材在第 3、5 小节标注“1 指保持按弦”。这是左手保持动作，不是延长该音的时值。',
 '本页弓法开关显示教材明确标出的下弓和保持按弦提示，不替老师补写其余弓法。数字答案补全了本练习选定的第一把位指法。'
 ]
};
[0,4,6,10].forEach(i=>wind.bars[i][0].bow='down');
wind.bars[2][0].hold='1 指保持按弦';wind.bars[4][0].hold='1 指保持按弦';
const scale=['D3','E3','F#3','G3','A3','B3','C#4','D4'];
const makeScale=(id,title,notes,duration)=>({id,title,english:'D major · one octave',kind:'音阶',meter:[4,4],key:'D',fifths:2,tempo:60,repeat:false,description:'第一把位 · D 弦 0–1–3–4 / A 弦 0–1–3–4',source:'原创配套练习。',focus:'认识 D 大调的一八度音列',bars:Array.from({length:4},(_,i)=>notes.slice(i*4/duration,(i+1)*4/duration).map(p=>note(p,duration))),sections:[],theory:[{title:'相同指法，不同音名',body:'D 弦上的 D、E、F♯、G 和 A 弦上的 A、B、C♯、D 都使用 0–1–3–4 指。0 表示空弦；3 和 4 指之间在音阶中相差半音。',task:'先用音名读一遍，再单独说弦名与指法。'},{title:'简谱中的高音点',body:'本页简谱以 D3 为不带点的 1，上方八度 D4 为上加点的 1。数字后的横线延长一拍；数字下方短线表示半拍。',task:'对照 D3 和 D4，它们都是 D，但相差一个八度。'}],practiceTips:['不换把、不伸张；先用已学的手型与运弓方式练习。','20 拍/分钟时每拍 3 秒，二分音符持续 6 秒；可以先用于离琴读谱与听音。']});
const lessons=[wind,makeScale('d-major-up','D 大调 · 上行',scale,2),makeScale('d-major-down','D 大调 · 下行',[...scale].reverse(),2),makeScale('d-major-return','D 大调 · 上行与返回',[...scale,...scale.slice(0,-1).reverse(),null],1)];
const parse=s=>s.split('|').map(b=>b.trim().split(/\s+/).map(t=>{const [p,d='1']=t.split(':');return note(p==='-'?null:p,Number(d));}));
const song=(id,title,english,page,melody,extra={})=>({id,title,english,kind:'曲目',meter:[4,4],key:'D',fifths:2,tempo:60,tempoLabel:'Moderato',repeat:false,dynamic:'mf',description:'铃木第一册 · 第一把位 · D / A 弦',source:`按你使用的教材印刷第 ${page} 页（PDF 第 ${page+10} 页）核对；网页重新排版。`,focus:'稳定拍感与独立读谱',bars:parse(melody),sections:[],theory:[{title:'先把一拍分均匀',body:'四分音符一拍，二分音符两拍，八分音符半拍。先数拍，再把音高放进节奏。',task:'选两小节，只拍节奏；再开音名辅助核对。'},{title:'第一把位的两个琴弦',body:'D 弦 D–E–F♯–G，A 弦 A–B–C♯–D，指法都为 0–1–3–4。调号中的升号适用于整曲相应音名。',task:'找出换弦位置，在纸谱上做自己的提醒。'}],practiceTips:['先选 2–4 小节，以能稳定读谱的速度练习。','辅助指法补全为第一把位选择；教材弓法只显示已录入的明确标记，实际运弓听从老师指导。'],...extra});
const twinkle=song('twinkle-theme','小星星 · 主题','Twinkle, Twinkle, Little Star',5,'D3 D3 A3 A3 | B3 B3 A3:2 | G3 G3 F#3 F#3 | E3 E3 D3:2 | A3 A3 G3 G3 | F#3 F#3 E3:2 | A3 A3 G3 G3 | F#3 F#3 E3:2 | D3 D3 A3 A3 | B3 B3 A3:2 | G3 G3 F#3 F#3 | E3 E3 D3:2',{dynamic:'f',tempoLabel:'marcato',focus:'四分与二分音符，短音与保持音'});
twinkle.bars.flat().forEach(e=>e.articulation=e.beats===2?'tenuto':'staccato');
[[0,0,'down'],[0,1,'up'],[2,0,'up'],[4,0,'down'],[6,0,'up']].forEach(([b,n,bow])=>twinkle.bars[b][n].bow=bow);
twinkle.theory.push({title:'点与短横线是奏法',body:'音符上方的小点表示短奏，短横线表示保持音。它们不改变音符占用的拍数。参考播放用较短发音示意短奏，不能替代老师示范。',task:'比较四分音符上的点和二分音符上的横线。'});
const pairs=[['D3','A3'],['B3','A3'],['G3','F#3'],['E3','D3'],['A3','G3'],['F#3','E3'],['A3','G3'],['F#3','E3'],['D3','A3'],['B3','A3'],['G3','F#3'],['E3','D3']];
const patterns={A:[.25,.25,.25,.25,.5,.5],B:[.5,.5,-.5,.5],C:[.5,.25,.25,.5,.25,.25],D:Array(8).fill(.25)};
const variations=Object.entries(patterns).map(([letter,pattern])=>{const l=song('twinkle-'+letter.toLowerCase(),'小星星 · 变奏 '+letter,'Twinkle · Variation '+letter,letter==='A'?4:5,'D3:4',{systemBars:2,dynamic:null,tempoLabel:'练习速度',focus:letter==='B'?'八分休止符也占半拍':'十六分音符与均匀细分',source:letter==='A'?'教材印刷第 4 页（PDF 第 14 页），完整变奏 A。':'教材印刷第 5 页（PDF 第 15 页）；依该页变奏 '+letter+' 的节奏型和主题音列展开全曲（原页后续以 etc. 省略）。'});l.bars=pairs.map(pair=>pair.flatMap(p=>pattern.map(d=>note(d<0?null:p,Math.abs(d),{...(d===.5?{articulation:'staccato'}:{})}))));l.theory=[{title:'同一旋律，更细的节奏',body:letter==='B'?'每两拍：半拍音、半拍音、半拍休止、半拍音。休止时继续数拍。':'十六分音符占四分之一拍，每拍均分四份。双层符杠表示十六分音符，单层表示八分音符。',task:'先在一个音上拍出两拍节奏型，再换到下一个音。'},...twinkle.theory.slice(1,2)];l.practiceTips.unshift('变奏由老师安排进度；可以先练主题，再逐个学习节奏型。');if(letter==='B'){for(let b=0;b<2;b++){let n=0;l.bars[b].forEach(e=>{if(e.pitch)e.bow=n++%2?'up':'down';});}}return l;});
const row=song('lightly-row','轻舟荡漾','Lightly Row',6,'A3 F#3 F#3:2 | G3 E3 E3:2 | D3 E3 F#3 G3 | A3 A3 A3:2 | A3 F#3 F#3 F#3 | G3 E3 E3 E3 | D3 F#3 A3 A3 | F#3 F#3 F#3:2 | E3 E3 E3 E3 | E3 F#3 G3:2 | F#3 F#3 F#3 F#3 | F#3 G3 A3:2 | A3 F#3 F#3 F#3 | G3 E3 E3 E3 | D3 F#3 A3 A3 | F#3 F#3 F#3:2');
[[0,'down'],[4,'up'],[8,'down']].forEach(([b,bow])=>row.bars[b][0].bow=bow);
[[6,1],[7,0],[9,1],[10,0],[14,1],[15,0]].forEach(([b,n])=>row.bars[b][n].hold='3 指保持按弦');
const rhody=song('go-tell-aunt-rhody','告诉罗娣阿姨','Go Tell Aunt Rhody',7,'F#3 F#3:.5 E3:.5 D3 D3 | E3 E3 F#3:.5 E3:.5 D3 | A3 A3:.5 G3:.5 F#3 F#3 | E3:.5 D3:.5 E3:.5 F#3:.5 D3:2 | F#3 F#3:.5 G3:.5 A3 A3 | B3 B3 A3:.5 G3:.5 F#3 | F#3 F#3:.5 G3:.5 A3 A3 | B3 B3 A3:2 | F#3 F#3:.5 E3:.5 D3 D3 | E3 E3 F#3:.5 E3:.5 D3 | A3 A3:.5 G3:.5 F#3 F#3 | E3:.5 D3:.5 E3:.5 F#3:.5 D3:2');
rhody.bars[0][0].bow='down';
const children=song('o-come-little-children','快来，小伙伴','O Come, Little Children',8,'A3:.5 | A3 F#3:.5 A3:.5 | A3 F#3:.5 A3:.5 | G3 E3:.5 E3:.5 | F#3 -:.5 A3:.5 | A3 F#3:.5 A3:.5 | A3 F#3:.5 A3:.5 | G3 E3:.5 E3:.5 | F#3 -:.5 F#3:.5 | E3 E3:.5 E3:.5 | G3 G3:.5 G3:.5 | F#3 F#3:.5 F#3:.5 | B3 -:.5 B3:.5 | A3 A3:.5 A3:.5 | D4 A3:.5 F#3:.5 | G3 E3:.5 E3:.5 | D3:1.5',{meter:[2,4],pickup:.5,repeat:true,tempoLabel:'Andante',focus:'半拍弱起、八分休止和附点四分音符',description:'你说的“哦来吧伙伴” · 教材题名《快来，小伙伴》 · 第一把位'});
[[0,0,'up'],[1,0,'down'],[4,2,'up'],[5,0,'down'],[8,2,'up'],[9,0,'down'],[12,0,'up'],[12,2,'up'],[13,0,'down']].forEach(([b,n,bow])=>children.bars[b][n].bow=bow);
[0,1,2,4,5,6].forEach(b=>children.bars[b][0].hold='3 指保持按弦');
children.bars[9][1].expression='cresc.';children.bars[14][0].expression='f';children.bars[15][0].expression='dim.';
children.theory=[{title:'弱起不是漏拍',body:'开头 A 是半拍弱起，位于第 2 拍的后半拍。末小节为附点四分音符，共一拍半；首尾合起来正好两拍。网页把开头标为“弱起”，后续按 1–16 编号。预备拍数 1、2 后，在“2 和”进入。',task:'打开预备拍，听清 A 在第二拍后半拍进入，下一音落在强拍。'},{title:'附点与休止',body:'附点把原音符延长一半：四分音符一拍，加点后是一拍半。八分休止符是半拍。渐强 cresc. 和渐弱 dim. 提示力度变化，参考音只核对音高时值，不模拟力度变化。',task:'数末尾 D 的“一、和、二”，在“二和”接反复的弱起 A。'}];
lessons.splice(1,0,twinkle,...variations,children,rhody,row);
lessons.forEach(l=>{if(!l.sections.length)l.sections=Array.from({length:Math.ceil((l.bars.length-(l.pickup?1:0))/4)},(_,i)=>({label:'乐句 '+(i+1),from:i*4+1+(l.pickup?1:0),to:Math.min(l.bars.length,(i+1)*4+(l.pickup?1:0))}));});
lessons.push((typeof module!=='undefined'&&module.exports?require('./laputa.js'):root.CelloLaputa).lesson);
lessons.push((typeof module!=='undefined'&&module.exports?require('./advanced.js'):root.CelloAdvanced).lesson);
const library={version:3,lessons,planned:[]};
if(typeof module!=='undefined'&&module.exports)module.exports=library;else root.CelloLibrary=library;
})(globalThis);
