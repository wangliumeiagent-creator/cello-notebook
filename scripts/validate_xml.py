from pathlib import Path
from lxml import etree as E
import json
root=Path(__file__).resolve().parents[1]
schema_dir=root/'tests'/'schema'
class Resolver(E.Resolver):
 def resolve(self,url,pubid,context):return self.resolve_filename(str(schema_dir/url.rsplit('/',1)[-1]),context)
parser=E.XMLParser();parser.resolvers.add(Resolver())
schema=E.XMLSchema(E.parse(str(schema_dir/'musicxml.xsd'),parser))
report={}
for file in sorted((root/'dist'/'scores').glob('*.musicxml')):
 doc=E.parse(str(file));schema.assertValid(doc)
 expected=int(doc.findtext('.//time/beats'));division=int(doc.findtext('.//divisions'))
 measures=doc.findall('.//part/measure')
 totals=[sum(int(n.findtext('duration')) for n in m.findall('note')) for m in measures]
 if file.name.startswith('o-come-little-children'):
  assert totals[0]==2 and totals[-1]==6 and totals[0]+totals[-1]==division*expected
  assert all(t==division*expected for t in totals[1:-1])
 else:
  assert all(t==division*expected for t in totals)
 if file.name.startswith('song-of-the-wind'):
  assert len(measures)==14 and expected==2
  assert doc.find('.//repeat') is not None
  assert len(doc.findall('.//breath-mark'))==1
 report[file.name]={'schema_valid':True,'measures':len(measures),'beats':expected}
(root/'qa').mkdir(exist_ok=True)
(root/'qa'/'xml-results.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps(report))
