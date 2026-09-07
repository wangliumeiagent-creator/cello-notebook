(function(root){
'use strict';
const C=typeof module!=='undefined'&&module.exports?require('./core.js'):root.CelloCore;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const glyph=(code,x,y)=>`<text class="music" x="${x}" y="${y}">&#x${code};</text>`;
const text=(str,x,y,cls='annotation',extra='')=>`<text class="${cls}" x="${x}" y="${y}" ${extra}>${esc(str)}</text>`;
const line=(x,y,xx,yy,w=1)=>`<line x1="${x}" y1="${y}" x2="${xx}" y2="${yy}" stroke="currentColor" stroke-width="${w}"/>`;
function rhythm(beats){const dotted=[.375,.75,1.5,3].includes(beats),base=dotted?beats/1.5:beats;return {dotted,base,type:({.125:'32nd',.25:'16th',.5:'eighth',1:'quarter',2:'half',4:'whole'})[base],flags:base<1?Math.round(Math.log2(1/base)):0};}
function keyAlter(l,step){const count=l.fifths||0;return count>0?('FCGDAEB'.slice(0,count).includes(step)?1:0):('BEADGCF'.slice(0,-count).includes(step)?-1:0);}
function degree(l,pitch){if(!pitch)return {text:'0',octave:0};const p=C.pitchInfo(pitch),tonic=C.pitchInfo(l.jianpuTonic||'D3'),delta=p.diatonic-tonic.diatonic,alter=p.alter-keyAlter({fifths:l.jianpuFifths??l.fifths},p.step);return {text:(alter>0?'♯':alter<0?'♭':'')+((delta%7+7)%7+1),octave:Math.floor(delta/7)};}
const tieCurve=(x,y,xx,yy)=>`<path class="tie" d="M ${x} ${y} C ${x+(xx-x)*.25} ${y-10}, ${x+(xx-x)*.75} ${yy-10}, ${xx} ${yy}" fill="none" stroke="currentColor" stroke-width="1.4"/>`;
function renderSystem(l,start,count,layers={},selection=null,interactive=true,mobile=false){
 const rows=['names','strings','fingers','jianpu'].filter(r=>layers[r]);const width=mobile?700:1070,left=155,bw=(width-left-15)/(mobile?(l.systemBars?1:2):(l.systemBars||4)),height=(rows.length?196+rows.length*25:layers.bows?185:155)+(l.topPadding||0);
 let s=`<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(l.title)}，第 ${start+1} 至 ${start+count} 小节"><g transform="translate(0,${l.topPadding||0})">`;
 const positions=new Map();
 for(let i=0;i<count;i++){const bi=start+i;if(selection&&bi+1>=selection.from&&bi+1<=selection.to)s+=`<rect class="bar-selection" x="${left+i*bw}" y="43" width="${bw}" height="104" rx="5"/>`;}
 for(let y=72;y<=120;y+=12)s+=line(14,y,left+bw*count,y);
 s+=glyph('E062',22,84);if(l.fifths<=-1)s+=glyph('E260',65,108);if(l.fifths<=-2)s+=glyph('E260',84,90);if(l.fifths>=1)s+=glyph('E262',65,84);if(l.fifths>=2)s+=glyph('E262',84,102);
 s+=text(l.meter[0],115,93,'', 'font-family="Georgia,serif" font-size="29" font-weight="bold"')+text(l.meter[1],115,117,'','font-family="Georgia,serif" font-size="29" font-weight="bold"');
 const rowNames={names:'音名',strings:'弦名',fingers:'指法',jianpu:'简谱 1='+(l.jianpuKey||'D')};rows.forEach((r,i)=>s+=text(rowNames[r],14,191+i*25,'annotation rowlabel'));
 if(start===0&&layers.bows&&l.dynamic)s+=text(l.dynamic,33,156,'annotation','font-style="italic" font-weight="bold"');
 for(let i=0;i<count;i++){
  const bi=start+i,bar=l.bars[bi],bx=left+i*bw,scale=(bw-40)/l.meter[0];s+=text(C.barLabel(l,bi),bx+7,l.topPadding?-30:14,'bar-number');const tempoMark=(l.tempoMarks||[]).find(t=>t.bar===bi+1);if(tempoMark)s+=text(tempoMark.label,bx+28,l.topPadding?-12:30,'annotation','font-size="11"');let beat=0;
  const gap=l.minNoteSpacing||0,flex=(bw-40-gap*bar.length)/l.meter[0],accidentals=new Map();const points=bar.map((e,ni)=>{const p={x:bx+25+ni*gap+beat*(gap?flex:scale),y:e.pitch?C.pitchInfo(e.pitch).y:96,beat,event:e};beat+=e.beats;return p;});
  points.forEach((p,n)=>positions.set(`${bi+1}:${n}`,p));
  const beams=new Map(),groups=[];for(let j=0;j<points.length;){const a=j,p=points[j];if(!p.event.pitch||(p.event.writtenBeats||p.event.beats)>=1){j++;continue;}while(j+1<points.length&&points[j+1].event.pitch&&(points[j+1].event.writtenBeats||points[j+1].event.beats)<1&&Math.floor(points[j+1].beat)===Math.floor(p.beat))j++;if(j>a){const y=Math.max(...points.slice(a,j+1).map(p=>p.y))+35;for(let k=a;k<=j;k++)beams.set(k,{y});groups.push({a,z:j,y});}j++;}
  points.forEach(({x,y,event:e},ni)=>{
   const p=e.pitch?C.pitchInfo(e.pitch):null,id=`${l.id}:${bi}:${ni}`,label=p?`${p.name}，${e.tuplet?"⅔":e.beats} 拍，${e.string} 弦 ${e.finger} 指`:`休止 ${e.tuplet?"⅔":e.beats} 拍`;
   s+=`<g class="note-event" data-note="${id}" data-pitch="${esc(e.pitch||'')}" ${interactive?`tabindex="0" role="button" aria-label="${label}"`:''}><title>${label}</title><rect class="note-halo" x="${x-9}" y="44" width="34" height="105" rx="5"/>`;
   const r=rhythm(e.writtenBeats||e.beats);
   if(p){const accidentalKey=p.step+p.octave,previous=accidentals.has(accidentalKey)?accidentals.get(accidentalKey):keyAlter(l,p.step);if(p.alter!==previous&&!['stop','continue'].includes(e.tie))s+=glyph(p.alter===1?'E262':p.alter===-1?'E260':'E261',x-23,y);if(!['stop','continue'].includes(e.tie))accidentals.set(accidentalKey,p.alter);
    for(let ledger=60;ledger>=y;ledger-=12)s+=line(x-4,ledger,x+18,ledger);for(let ledger=132;ledger<=y;ledger+=12)s+=line(x-4,ledger,x+18,ledger);
    s+=glyph(r.base===4?'E0A2':r.base===2?'E0A3':'E0A4',x,y);const stem=beams.get(ni)?.y??y+35;if(r.base<4)s+=line(x+.7,y,x+.7,stem,1.4);if(r.flags&&!beams.has(ni))s+=glyph(({1:'E241',2:'E243',3:'E245'})[r.flags],x+.7,stem);
   }else s+=glyph(({.125:'E4E8',.25:'E4E7',.5:'E4E6',1:'E4E5',2:'E4E4',4:'E4E3'})[r.base],e.measureRest?bx+bw/2:x,e.measureRest?84:96);
   if(r.dotted)s+=`<circle cx="${x+20}" cy="${p?y-6:90}" r="2" fill="currentColor"/>`;
   if(layers.bows&&e.bow)s+=glyph(e.bow==='down'?'E610':'E612',x-1,l.topPadding?Math.min(42,y-28):42);
   if(e.articulation==='staccato')s+=`<circle cx="${x+6}" cy="${Math.min(y-15,57)}" r="2" fill="currentColor"/>`;
   if(e.articulation==='tenuto')s+=line(x,Math.min(y-15,57),x+12,Math.min(y-15,57),1.5);
   if(layers.bows&&e.expression)s+=text(e.expression,x,155,'annotation','font-style="italic"');
   if(layers.bows&&e.breath)s+=glyph('E4CE',Math.min(x+36,bx+bw-12),55);
   rows.forEach((row,ri)=>{const yy=191+ri*25,num=degree(l,e.pitch);let value=row==='names'?(p?p.name:'休止'):row==='strings'?(p?e.string:'—'):row==='fingers'?(p?((e.extension?(e.extension==='back'?'1低':'4伸'):e.finger)+(e.position?'·'+e.position:'')):'—'):num.text+(e.beats===4?' — — —':e.beats===3?' — —':e.beats===2?' —':r.dotted?' ·':'');s+=text(value,x-3,yy,'annotation',l.systemBars?'style="font-size:12px"':'');if(row==='jianpu'){for(let k=0;k<r.flags;k++)s+=line(x-3,yy+3+k*3,x+10,yy+3+k*3);for(let k=0;k<Math.abs(num.octave);k++)s+=`<circle cx="${x+2}" cy="${num.octave>0?yy-17-k*5:yy+9+r.flags*3+k*5}" r="1.6" fill="currentColor"/>`;}});
   s+='</g>';
  });
  groups.forEach(({a,z,y})=>{s+=line(points[a].x+.7,y,points[z].x+.7,y,4);for(let level=2;level<=3;level++)for(let n=a;n<=z;n++)if(rhythm(points[n].event.beats).flags>=level){const next=n<z&&rhythm(points[n+1].event.beats).flags>=level,prev=n>a&&rhythm(points[n-1].event.beats).flags>=level,by=y-(level-1)*7;if(next)s+=line(points[n].x+.7,by,points[n+1].x+.7,by,3);else if(!prev)s+=line(points[n].x+.7,by,points[n].x+(n===z?-9:10),by,3);}});
  points.forEach((p,ni)=>{if(['start','continue'].includes(p.event.tie)){const next=points[ni+1]||(i+1<count?{x:bx+bw+25,y:C.pitchInfo(l.bars[bi+1][0].pitch).y}:null);s+=tieCurve(p.x+13,p.y-13,next?next.x-2:bx+bw-3,next?next.y-13:p.y-13);}if(i===0&&ni===0&&['stop','continue'].includes(p.event.tie))s+=tieCurve(left-5,p.y-13,p.x-2,p.y-13);});
  if(layers.bows){const held=points.find(p=>p.event.hold);if(held){s+=line(held.x,158,Math.max(held.x+14,points.at(-1).x+15),158);s+=text(held.event.hold,held.x,175,'annotation rowlabel');}}
  if(bar[0]?.tuplet){for(let j=0;j<bar.length;j+=3){const first=points[j],last=points[j+2],yy=Math.min(...points.slice(j,j+3).map(p=>p.y))-27,mid=(first.x+last.x+12)/2;s+=`<g class="tuplet">`+line(first.x,yy+5,first.x,yy)+line(first.x,yy,mid-9,yy)+line(mid+9,yy,last.x+12,yy)+line(last.x+12,yy,last.x+12,yy+5)+text('3',mid-4,yy+4,'annotation')+'</g>';}}
  const end=bx+bw,isEnd=bi===l.bars.length-1,rp=l.repeatPlan;
  if(rp&&bi+1===rp.start)s+=line(bx+1,72,bx+1,120,3)+line(bx+7,72,bx+7,120)+`<circle cx="${bx+14}" cy="90" r="2.2"/><circle cx="${bx+14}" cy="102" r="2.2"/>`;
  if(rp&&bi+1===rp.repeatEnd)s+=line(end-6,72,end-6,120)+line(end,72,end,120,3)+`<circle cx="${end-13}" cy="90" r="2.2"/><circle cx="${end-13}" cy="102" r="2.2"/>`;
  if(rp&&bi+1>=rp.firstEnding){const first=bi+1<=rp.repeatEnd,n=first?1:2,initial=bi+1===(first?rp.firstEnding:rp.secondEnding),last=bi+1===(first?rp.repeatEnd:l.bars.length);s+=`<g class="volta">`+line(bx,-12,end,-12);if(initial)s+=line(bx,-12,bx,0);if(initial||i===0)s+=text(n+'.',bx+7,4,'annotation');if(last)s+=line(end,-12,end,0);s+='</g>';}

  if(isEnd){s+=line(end-6,72,end-6,120);s+=line(end,72,end,120,3);if(l.repeat&&!l.repeatPlan)s+=`<circle cx="${end-13}" cy="90" r="2.2" fill="currentColor"/><circle cx="${end-13}" cy="102" r="2.2" fill="currentColor"/>`;}
  else s+=line(end,72,end,120);
 }
 for(const slur of l.slurs||[]){const [fb,fn]=slur.from,[tb,tn]=slur.to;if(tb<start+1||fb>start+count)continue;const a=positions.get(`${fb}:${fn}`),z=positions.get(`${tb}:${tn}`),x=a?a.x+6:left,xx=z?z.x+6:left+bw*count,below=slur.placement==='below',y=(a||z).y+(below?44:-15),yy=(z||a).y+(below?44:-15),peak=below?Math.max(y,yy)+20:Math.min(y,yy)-24;s+=`<path class="slur" d="M ${x} ${y} C ${x+(xx-x)*.25} ${peak}, ${x+(xx-x)*.75} ${peak}, ${xx} ${yy}" fill="none" stroke="currentColor" stroke-width="1.2"/>`;}
 return s+'</g></svg>';
}
function musicxml(l,answers=false,tempo=l.tempo){
 C.validateLesson(l);const divisions=l.divisions||8;const bars=l.bars.map((bar,i)=>{
  let inner=i%(l.systemBars||4)===0?`<print${i?' new-system="yes"':''}/>`:'';
  if(i===0){inner+=`<attributes><divisions>${divisions}</divisions><key><fifths>${l.fifths}</fifths><mode>${l.mode||'major'}</mode></key><time><beats>${l.meter[0]}</beats><beat-type>${l.meter[1]}</beat-type></time><clef><sign>F</sign><line>4</line></clef></attributes><direction placement="above"><direction-type><words>${esc(l.tempoLabel||'Practice tempo')}</words></direction-type></direction><direction placement="above"><direction-type><metronome><beat-unit>quarter</beat-unit><per-minute>${tempo}</per-minute></metronome></direction-type><sound tempo="${tempo}"/></direction>`;if(l.dynamic)inner+=`<direction placement="below"><direction-type><dynamics><${l.dynamic}/></dynamics></direction-type></direction>`;}
  const tempoMark=(l.tempoMarks||[]).find(t=>t.bar===i+1);if(tempoMark)inner+=`<direction placement="above"><direction-type><words>${esc(tempoMark.label)}</words></direction-type><sound tempo="${tempoMark.tempo}"/></direction>`;
  const rp=l.repeatPlan;
  if(rp&&i+1===rp.start)inner+='<barline location="left"><bar-style>heavy-light</bar-style><repeat direction="forward"/></barline>';
  if(rp&&(i+1===rp.firstEnding||i+1===rp.secondEnding))inner+=`<barline location="left"><ending number="${i+1===rp.firstEnding?1:2}" type="start"/></barline>`;
  let beat=0;bar.forEach((e,j)=>{if(e.hold)inner+=`<direction placement="below"><direction-type><words>${esc(e.hold)}</words></direction-type></direction>`;
   if(e.extension)inner+=`<direction placement="above"><direction-type><words>${esc(e.string)} 弦${e.position?' '+e.position+' 把位 ':''}${e.extension==='back'?'低 1 指（后伸）':'4 指前伸半音'}</words></direction-type></direction>`;
   if(answers&&e.position&&e.position!=='I')inner+=`<direction placement="above"><direction-type><words>${esc(e.position)} 把位 · 参考指法</words></direction-type></direction>`;
   if(e.expression)inner+=`<direction placement="below"><direction-type><words>${esc(e.expression)}</words></direction-type></direction>`;
   const p=C.pitchInfo(e.pitch),r=rhythm(e.writtenBeats||e.beats),tieStart=['start','continue'].includes(e.tie),tieStop=['stop','continue'].includes(e.tie);let n=p?`<pitch><step>${p.step}</step>${p.alter?`<alter>${p.alter}</alter>`:''}<octave>${p.octave}</octave></pitch>`:(e.measureRest?'<rest measure="yes"/>':'<rest/>');
   n+=`<duration>${Math.round(e.beats*divisions)}</duration>${tieStop?'<tie type="stop"/>':''}${tieStart?'<tie type="start"/>':''}<type>${r.type}</type>${r.dotted?'<dot/>':''}`;if(e.tuplet)n+='<time-modification><actual-notes>3</actual-notes><normal-notes>2</normal-notes><normal-type>quarter</normal-type></time-modification>';if(p&&e.beats<4)n+='<stem>down</stem>';
   if(p&&r.flags){const prev=bar[j-1],next=bar[j+1],before=prev?.pitch&&prev.beats<1&&Math.floor(beat-prev.beats)===Math.floor(beat),after=next?.pitch&&next.beats<1&&Math.floor(beat+e.beats)===Math.floor(beat);if(before||after)for(let level=1;level<=r.flags;level++){const bp=before&&rhythm(prev.beats).flags>=level,bn=after&&rhythm(next.beats).flags>=level;n+=`<beam number="${level}">${bp?(bn?'continue':'end'):bn?'begin':after?'forward hook':'backward hook'}</beam>`;}}
   let technical=e.bow?`<${e.bow}-bow/>`:'';if(answers&&p)technical+=`<fingering>${e.finger}</fingering><string>${{A:1,D:2,G:3,C:4}[e.string]}</string>`;
   const articulations=(e.breath?'<breath-mark/>':'')+(e.articulation?`<${e.articulation}/>`:'');
   const slurMarks=(l.slurs||[]).flatMap(a=>[...(a.to[0]===i+1&&a.to[1]===j?['<slur number="1" type="stop"/>']:[]),...(a.from[0]===i+1&&a.from[1]===j?[`<slur number="1" type="start" placement="${a.placement||'above'}"/>`]:[])]).join(''),tuplet=e.tuplet&&(e.tuplet.index===0||e.tuplet.index===2)?`<tuplet number="1" type="${e.tuplet.index===0?'start':'stop'}" bracket="yes"/>`:'';
   if(technical||articulations||tieStart||tieStop||slurMarks||tuplet)n+=`<notations>${tieStop?'<tied type="stop"/>':''}${tieStart?'<tied type="start"/>':''}${slurMarks}${tuplet}${technical?`<technical>${technical}</technical>`:''}${articulations?`<articulations>${articulations}</articulations>`:''}</notations>`;
   if(answers&&p)[p.name,e.string+' string','finger '+e.finger+(e.position?' · '+e.position:'')+(e.extension?' · '+(e.extension==='back'?'low':'extend'):'')].forEach((v,k)=>n+=`<lyric number="${k+1}"><syllabic>single</syllabic><text>${esc(v)}</text></lyric>`);
   inner+='<note>'+n+'</note>';beat+=e.beats;
  });if(rp&&i+1===rp.repeatEnd)inner+='<barline location="right"><bar-style>light-heavy</bar-style><ending number="1" type="stop"/><repeat direction="backward"/></barline>';if(i===l.bars.length-1)inner+=`<barline location="right"><bar-style>light-heavy</bar-style>${rp?'<ending number="2" type="stop"/>':l.repeat?'<repeat direction="backward"/>':''}</barline>`;
  return `<measure number="${l.pickup?i:i+1}"${l.pickup&&(i===0||i===l.bars.length-1)?' implicit="yes"':''}>${inner}</measure>`;
 }).join('');
 return `<?xml version="1.0" encoding="UTF-8"?><score-partwise version="4.0"><work><work-title>${esc(l.title)}${answers?' - Answers':''}</work-title></work><identification><creator type="composer">${esc(l.composer||(l.kind==='曲目'?'Folk song':'Original scale exercise'))}</creator></identification><defaults><scaling><millimeters>7</millimeters><tenths>40</tenths></scaling></defaults><part-list><score-part id="P1"><part-name>Violoncello</part-name><score-instrument id="I1"><instrument-name>Violoncello</instrument-name></score-instrument><midi-instrument id="I1"><midi-channel>1</midi-channel><midi-program>43</midi-program></midi-instrument></score-part></part-list><part id="P1">${bars}</part></score-partwise>`;
}
const api={renderSystem,musicxml,esc,rhythm,degree};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CelloNotation=api;
})(globalThis);
