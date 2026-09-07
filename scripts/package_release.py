from pathlib import Path
import json,zipfile
root=Path(__file__).resolve().parents[1]
dist=root/'dist'
def create_or_identical(path,text):
 if path.exists():
  if path.read_text(encoding='utf-8')!=text:raise FileExistsError(path)
 else:path.write_text(text,encoding='utf-8')
create_or_identical(dist/'使用说明.txt',(root/'使用说明.txt').read_text(encoding='utf-8'))
server=(root/'scripts'/'serve.cjs').read_text(encoding='utf-8').replace("path.resolve(__dirname,'../dist')","path.resolve(__dirname)")
create_or_identical(dist/'start-server.cjs',server)
create_or_identical(dist/'package.json',json.dumps({'name':'cello-notebook-portable','private':True,'version':'0.2.0','scripts':{'start':'node start-server.cjs'}},indent=2))
files=sorted(p for p in dist.rglob('*') if p.is_file())
assert not any('test-backup' in p.name or '教材' in p.name for p in files)
output=root/'cello-notebook-v0.2.0.zip'
with zipfile.ZipFile(output,'x',compression=zipfile.ZIP_DEFLATED) as z:
 for p in files:z.write(p,Path('cello-notebook')/p.relative_to(dist))
with zipfile.ZipFile(output) as z:
 assert z.testzip() is None
 assert 'cello-notebook/index.html' in z.namelist()
 assert len([n for n in z.namelist() if n.endswith('.musicxml')])==24
print(str(output));print(f'{len(files)} files; archive integrity verified.')
