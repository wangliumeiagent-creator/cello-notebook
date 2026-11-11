"""Prepare the pinned CC0 Karoryfer solo cello for the browser; no third-party dependencies.

Original downloads stay in ignored qa/. Existing, different output files are never overwritten.
Run with Python 3.10 (uses its standard audioop resampler).
"""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from urllib.request import urlopen
from urllib.parse import quote
import audioop, base64, hashlib, io, json, math, struct, wave

ROOT = Path(__file__).resolve().parents[1]
REVISION = '6fd75fbfc1dbb3109bf26220ba1adea46188a18b'
BASE = f'https://raw.githubusercontent.com/sfzinstruments/karoryfer-bigcat.cello/{REVISION}/'
CACHE = ROOT / 'qa' / 'karoryfer-originals'
OUTPUT = ROOT / 'assets' / 'cello'
RATE = 32000

def write_safe(path, data):
    if path.exists():
        if path.read_bytes() != data:
            raise FileExistsError(f'Refusing to overwrite different content: {path}')
    else:
        path.parent.mkdir(parents=True, exist_ok=True)
        with path.open('xb') as stream:
            stream.write(data)

def download(name):
    target = CACHE / name
    if not target.exists():
        payload = urlopen(BASE + quote(name), timeout=60).read()
        write_safe(target, payload)
    return target.read_bytes()

def chunks(raw):
    offset = 12
    while offset + 8 <= len(raw):
        size = struct.unpack_from('<I', raw, offset + 4)[0]
        yield raw[offset:offset+4], raw[offset+8:offset+8+size]
        offset += 8 + size + size % 2

def prepare(item):
    name, midi, bow = item
    source = f'Samples/sus/{name}_mf_{bow}.wav'
    raw = download(source)
    parts = dict(chunks(raw))
    fmt = struct.unpack('<HHIIHH', parts[b'fmt '])
    assert fmt[:3] == (1, 1, 44100) and fmt[-1] == 24
    pcm = parts[b'data']
    loop = struct.unpack('<15I', parts[b'smpl'])
    loop_start, loop_end = loop[11], loop[12] + 1  # WAV loop end is inclusive.
    assert 0 < loop_start < loop_end <= len(pcm) // 3
    # File names use a different octave convention from scientific pitch notation.
    # Check the expected period in the recording instead of trusting smpl unity-note tags.
    expected_hz = 440 * 2 ** ((midi - 69) / 12)
    x = [int.from_bytes(pcm[i:i+3], 'little', signed=True) / 8388608
         for i in range(44100*3, min(44100*6, len(pcm)-3), 12)]
    period = (44100 / 4) / expected_hz
    def correlation(lag):
        a, b = x[:-lag], x[lag:]
        return sum(v*w for v,w in zip(a,b)) / math.sqrt(sum(v*v for v in a)*sum(v*v for v in b))
    lags = range(max(2, int(period*.97)), int(period*1.03)+2)
    lag = max(lags, key=correlation)
    left, center, right = correlation(lag-1), correlation(lag), correlation(lag+1)
    fractional = .5*(left-right)/(left-2*center+right)
    measured_hz = (44100 / 4) / (lag + fractional)
    cents = 1200 * math.log2(measured_hz/expected_hz)
    assert center > .85 and abs(cents) < 30, (source, center, cents)
    # Keep the natural attack and the author's complete sustain loop; mono PCM16 is universal.
    pcm16 = audioop.lin2lin(pcm[:loop_end*3], 3, 2)
    pcm16, _ = audioop.ratecv(pcm16, 2, 1, 44100, RATE, None)
    start, end = round(loop_start*RATE/44100), min(len(pcm16)//2, round(loop_end*RATE/44100))
    samples = list(struct.unpack('<'+'h'*(len(pcm16)//2), pcm16))
    # A short crossfade into the pre-loop lead-in makes the repeated boundary continuous.
    fade = min(int(.025*RATE), start, (end-start)//4)
    for i in range(fade):
        amount = i/max(1,fade-1)
        samples[end-fade+i] = round(samples[end-fade+i]*(1-amount)+samples[start-fade+i]*amount)
    peak = max(abs(n) for n in samples) / 32768
    rms = math.sqrt(sum(n*n for n in samples[start:end])/(end-start))/32768
    level = min(.13/max(rms,.0001), .8/max(peak,.0001))
    samples = [round(n*level) for n in samples]
    stream = io.BytesIO()
    with wave.open(stream,'wb') as wav:
        wav.setnchannels(1); wav.setsampwidth(2); wav.setframerate(RATE)
        wav.writeframes(struct.pack('<'+'h'*len(samples),*samples))
    audio = stream.getvalue()
    return {'root':midi,'bow':bow,'source':source,'sourceSha256':hashlib.sha256(raw).hexdigest(),
            'cents':round(cents,3),'hz':round(measured_hz,6),'loopStart':start/RATE,'loopEnd':end/RATE,
            'bytes':len(audio),'sha256':hashlib.sha256(audio).hexdigest(),'data':base64.b64encode(audio).decode()}

if __name__ == '__main__':
    notes = [(f'{note}{octave}', 12*(octave+2)+step, bow)
             for octave in range(1,5) for note,step in [('C',0),('Eb',3),('Gb',6),('A',9)]
             for bow in ['d','g'] if 36 <= 12*(octave+2)+step <= 72]
    with ThreadPoolExecutor(max_workers=4) as pool:
        samples = list(pool.map(prepare, notes))
    manifest = {'name':'Karoryfer x bigcat cello','performer':'Kamila Borowiak', 'license':'CC0-1.0',
                'source':'https://github.com/sfzinstruments/karoryfer-bigcat.cello', 'revision':REVISION,
                'sampleRate':RATE,'articulation':'sustain, mezzo-forte; alternating bows',
                'processing':'Mono PCM16/32kHz; retain natural attacks and smpl loops; 25ms loop crossfade; level matching; measured tuning correction at playback.',
                'samples':[{k:v for k,v in s.items() if k!='data'} for s in samples]}
    pack = {'name':manifest['name'],'license':manifest['license'],'samples':samples}
    write_safe(OUTPUT/'pack.js', ('globalThis.CelloSamplePack='+json.dumps(pack,separators=(',',':'))+';\n').encode())
    write_safe(OUTPUT/'manifest.json', (json.dumps(manifest,ensure_ascii=False,indent=2)+'\n').encode())
    write_safe(OUTPUT/'LICENSE.txt',download('LICENSE'))
    write_safe(OUTPUT/'SOURCE-README.txt',download('readme.txt'))
    print(json.dumps({'samples':len(samples),'pcmBytes':sum(s['bytes'] for s in samples),'packBytes':(OUTPUT/'pack.js').stat().st_size,'tuningCents':[s['cents'] for s in samples]}))
