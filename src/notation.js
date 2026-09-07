(function(root){
'use strict';
const C=typeof module!=='undefined'&&module.exports?require('./core.js'):root.CelloCore;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const glyph=(code,x,y)=>`<text class="music" x="${x}" y="${y}">&#x${code};</text>`;
const text=(str,x,y,cls='annotation',extra='')=>`<text class="${cls}" x="${x}" y="${y}" ${extra}>${esc(str)}</text>`;
const line=(x,y,xx,yy,w=1)=>`<line x1="${x}" y1="${y}" x2="${xx}" y2="${yy}" stroke="currentColor" stroke-width="${w}"/>`;
function degree(p){if(!p)return '0';const degrees={D:'1',E:'2',F:'3',G:'4',A:'5',B:'6',C:'7'};return degrees[p[0]];}
function renderSystem(l,start,count,layers={},selection=null,interactive=true,mobile=false){
 const rows=['names','strings','fingers','jianpu'].filter(r=>layers[r]);const width=mobile?700:1070,left=155,bw=(width-left-15)/(mobile?(l.systemBars?1:2):(l.systemBars||4)),height=rows.length?196+rows.length*25:layers.bows?185:155;
 let s=`<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(l.title)}，第 ${start+1} 至 ${start+count} 小节">`;
 for(let i=0;i<count;i++){const bi=start+i;if(selection&&bi+1>=selection.from&&bi+1<=selection.to)s+=`<rect class="bar-selection" x="${left+i*bw}" y="43" width="${bw}" height="104" rx="5"/>`;}
 for(let y=72;y<=120;y+=12)s+=line(14,y,left+bw*count,y);
 s+=glyph('E062',22,84);if(l.fifths>=1)s+=glyph('E262',65,84);if(l.fifths>=2)s+=glyph('E262',84,102);
 s+=text(l.meter[0],115,93,'', 'font-family="Georgia,serif" font-size="29" font-weight="bold"')+text(l.meter[1],115,117,'','font-family="Georgia,serif" font-size="29" font-weight="bold"');
 const rowNames={names:'音名',strings:'弦名',fingers:'指法',jianpu:'简谱 1=D'};rows.forEach((r,i)=>s+=text(rowNames[r],14,191+i*25,'annotation rowlabel'));
 if(start===0&&layers.bows&&l.dynamic)s+=text(l.dynamic,33,156,'annotation','font-style="italic" font-weight="bold"');
 for(let i=0;i<count;i++){
  const bi=start+i,bar=l.bars[bi],bx=left+i*bw,scale=(bw-40)/l.meter[0];s+=text(C.barLabel(l,bi),bx+7,14,'bar-number');let beat=0;
  const points=bar.map(e=>{const p={x:bx+25+beat*scale,y:e.pitch?C.pitchInfo(e.pitch).y:96,beat,event:e};beat+=e.beats;return p;});
  const beams=new Map(),groups=[];for(let j=0;j<points.length;){const a=j,p=points[j];if(!p.event.pitch||p.event.beats>=1){j++;continue;}while(j+1<points.length&&points[j+1].event.pitch&&points[j+1].event.beats<1&&Math.floor(points[j+1].beat)===Math.floor(p.beat))j++;if(j>a){const y=Math.max(...points.slice(a,j+1).map(p=>p.y))+35;for(let k=a;k<=j;k++)beams.set(k,{y});groups.push({a,z:j,y});}j++;}
  points.forEach(({x,y,event:e},ni)=>{
   const p=e.pitch?C.pitchInfo(e.pitch):null,id=`${l.id}:${bi}:${ni}`,label=p?`${p.name}，${e.beats} 拍，${e.string} 弦 ${e.finger} 指`:`休止 ${e.beats} 拍`;
   s+=`<g class="note-event" data-note="${id}" data-pitch="${esc(e.pitch||'')}" ${interactive?`tabindex="0" role="button" aria-label="${label}"`:''}><title>${label}</title><rect class="note-halo" x="${x-9}" y="44" width="34" height="105" rx="5"/>`;
   if(p){for(let ledger=60;ledger>=y;ledger-=12)s+=line(x-4,ledger,x+18,ledger);s+=glyph(e.beats>=2?'E0A3':'E0A4',x,y);const stem=beams.get(ni)?.y??y+35;if(e.beats<4)s+=line(x+.7,y,x+.7,stem,1.4);if(e.beats<1&&!beams.has(ni))s+=glyph(e.beats===.25?'E243':'E241',x+.7,stem);if(e.beats===3||e.beats===1.5)s+=`<circle cx="${x+20}" cy="${y-6}" r="2" fill="currentColor"/>`;}
   else s+=glyph(e.beats===.25?'E4E7':e.beats===.5?'E4E6':e.beats===2?'E4E4':'E4E5',x,96);
   if(layers.bows&&e.bow)s+=glyph(e.bow==='down'?'E610':'E612',x-1,42);
   if(e.articulation==='staccato')s+=`<circle cx="${x+6}" cy="${Math.min(y-15,57)}" r="2" fill="currentColor"/>`;
   if(e.articulation==='tenuto')s+=line(x,Math.min(y-15,57),x+12,Math.min(y-15,57),1.5);
   if(layers.bows&&e.expression)s+=text(e.expression,x,155,'annotation','font-style="italic"');
   if(layers.bows&&e.breath)s+=glyph('E4CE',Math.min(x+36,bx+bw-12),55);
   rows.forEach((r,ri)=>{const yy=191+ri*25;let value=r==='names'?(p?p.name:'休止'):r==='strings'?(p?e.string:'—'):r==='fingers'?(p?e.finger:'—'):degree(e.pitch)+(e.beats===2?' —':e.beats===3?' — —':e.beats===1.5?' ·':'');s+=text(value,x-3,yy,'annotation',l.systemBars?'style="font-size:12px"':'');if(r==='jianpu'){if(e.beats<1)s+=line(x-3,yy+3,x+8,yy+3);if(e.beats===.25)s+=line(x-3,yy+6,x+8,yy+6);if(e.pitch==='D4')s+=`<circle cx="${x+1}" cy="${yy-17}" r="1.6" fill="currentColor"/>`;}});
   s+='</g>';
  });
  groups.forEach(({a,z,y})=>{s+=line(points[a].x+.7,y,points[z].x+.7,y,4);for(let n=a;n<=z;n++)if(points[n].event.beats===.25){const next=n<z&&points[n+1].event.beats===.25,prev=n>a&&points[n-1].event.beats===.25;if(next)s+=line(points[n].x+.7,y-7,points[n+1].x+.7,y-7,3);else if(!prev)s+=line(points[n].x+.7,y-7,points[n].x+(n===z?-9:10),y-7,3);}});
  if(layers.bows){const held=points.find(p=>p.event.hold);if(held){s+=line(held.x,158,Math.max(held.x+14,points.at(-1).x+15),158);s+=text(held.event.hold,held.x,175,'annotation rowlabel');}}
  const end=bx+bw,isEnd=bi===l.bars.length-1;
  if(isEnd){s+=line(end-6,72,end-6,120);s+=line(end,72,end,120,3);if(l.repeat)s+=`<circle cx="${end-13}" cy="90" r="2.2" fill="currentColor"/><circle cx="${end-13}" cy="102" r="2.2" fill="currentColor"/>`;}
  else s+=line(end,72,end,120);
 }
 return s+'</svg>';
}
function musicxml(l,answers=false,tempo=l.tempo){
 C.validateLesson(l);const bars=l.bars.map((bar,i)=>{
  let inner=i%(l.systemBars||4)===0?`<print${i?' new-system="yes"':''}/>`:'';
  if(i===0){inner+=`<attributes><divisions>4</divisions><key><fifths>${l.fifths}</fifths><mode>major</mode></key><time><beats>${l.meter[0]}</beats><beat-type>${l.meter[1]}</beat-type></time><clef><sign>F</sign><line>4</line></clef></attributes><direction placement="above"><direction-type><words>${esc(l.tempoLabel||'Practice tempo')}</words></direction-type></direction><direction placement="above"><direction-type><metronome><beat-unit>quarter</beat-unit><per-minute>${tempo}</per-minute></metronome></direction-type><sound tempo="${tempo}"/></direction>`;if(l.dynamic)inner+=`<direction placement="below"><direction-type><dynamics><${l.dynamic}/></dynamics></direction-type></direction>`;}
  let beat=0;bar.forEach((e,j)=>{if(e.hold)inner+=`<direction placement="below"><direction-type><words>${esc(e.hold)}</words></direction-type></direction>`;
   if(e.expression)inner+=`<direction placement="below"><direction-type><words>${esc(e.expression)}</words></direction-type></direction>`;
   const p=C.pitchInfo(e.pitch),type=e.beats===.25?'16th':e.beats===.5?'eighth':e.beats<2?'quarter':e.beats<=3?'half':'whole';let n=p?`<pitch><step>${p.step}</step>${p.alter?`<alter>${p.alter}</alter>`:''}<octave>${p.octave}</octave></pitch>`:'<rest/>';
   n+=`<duration>${e.beats*4}</duration><type>${type}</type>${(e.beats===3||e.beats===1.5)?'<dot/>':''}`;if(p&&e.beats<4)n+='<stem>down</stem>';
   if(p&&e.beats<1){const prev=bar[j-1],next=bar[j+1],before=prev?.pitch&&prev.beats<1&&Math.floor(beat-prev.beats)===Math.floor(beat),after=next?.pitch&&next.beats<1&&Math.floor(beat+e.beats)===Math.floor(beat);if(before||after){n+=`<beam number="1">${before?(after?'continue':'end'):'begin'}</beam>`;if(e.beats===.25){const bp=before&&prev.beats===.25,bn=after&&next.beats===.25;n+=`<beam number="2">${bp?(bn?'continue':'end'):bn?'begin':after?'forward hook':'backward hook'}</beam>`;}}}
   let technical=e.bow?`<${e.bow}-bow/>`:'';if(answers&&p)technical+=`<fingering>${e.finger}</fingering><string>${{A:1,D:2,G:3,C:4}[e.string]}</string>`;
   const articulations=(e.breath?'<breath-mark/>':'')+(e.articulation?`<${e.articulation}/>`:'');
   if(technical||articulations)n+=`<notations>${technical?`<technical>${technical}</technical>`:''}${articulations?`<articulations>${articulations}</articulations>`:''}</notations>`;
   if(answers&&p)[p.name,e.string+' string','finger '+e.finger].forEach((v,k)=>n+=`<lyric number="${k+1}"><syllabic>single</syllabic><text>${esc(v)}</text></lyric>`);
   inner+='<note>'+n+'</note>';beat+=e.beats;
  });if(i===l.bars.length-1)inner+=`<barline location="right"><bar-style>light-heavy</bar-style>${l.repeat?'<repeat direction="backward"/>':''}</barline>`;
  return `<measure number="${l.pickup?i:i+1}"${l.pickup&&(i===0||i===l.bars.length-1)?' implicit="yes"':''}>${inner}</measure>`;
 }).join('');
 return `<?xml version="1.0" encoding="UTF-8"?><score-partwise version="4.0"><work><work-title>${esc(l.title)}${answers?' - Answers':''}</work-title></work><identification><creator type="composer">${l.kind==='曲目'?'Folk song':'Original scale exercise'}</creator></identification><defaults><scaling><millimeters>7</millimeters><tenths>40</tenths></scaling></defaults><part-list><score-part id="P1"><part-name>Violoncello</part-name><score-instrument id="I1"><instrument-name>Violoncello</instrument-name></score-instrument><midi-instrument id="I1"><midi-channel>1</midi-channel><midi-program>43</midi-program></midi-instrument></score-part></part-list><part id="P1">${bars}</part></score-partwise>`;
}
const api={renderSystem,musicxml,esc};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CelloNotation=api;
})(globalThis);
