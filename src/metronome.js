function createMetronome({audioReady, context, tone}) {
  const view = document.getElementById('metronomeView');
  const find = selector => view.querySelector(selector);
  const tempo = find('#metroTempo');
  const sheet = find('#metroSheet');
  const settingsButton = find('#metroSettings');
  const numerator = find('#metroNumerator');
  const denominator = find('#metroDenominator');
  const presets = [...view.querySelectorAll('[data-meter]')];
  const beats = find('#metroBeats');
  const light = find('.metro-dial-light');
  const status = find('#metroStatus');
  const storageKey = 'cello-notebook-metronome-v1';
  const denominators = [2, 4, 8, 16];
  const subdivisions = [1, 2, 3, 4];
  let settings = { bpm: 60, numerator: 4, denominator: 4, subdivision: 1 };
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved && Number.isInteger(saved.bpm) && saved.bpm >= 20 && saved.bpm <= 240
      && Number.isInteger(saved.numerator) && saved.numerator >= 1 && saved.numerator <= 12
      && denominators.includes(saved.denominator) && subdivisions.includes(saved.subdivision)) {
      settings = saved;
    }
  } catch {}

  const compound = (top, bottom) => bottom === 8 && [6, 9, 12].includes(top);
  const beatCount = () => settings.numerator / (compound(settings.numerator, settings.denominator) ? 3 : 1);
  const option = value => new Option(value, value);
  numerator.replaceChildren(...Array.from({length: 12}, (_, i) => option(i + 1)));
  denominator.replaceChildren(...denominators.map(option));

  let pending = false;
  let generation = 0;
  let playback = null;
  let frame;
  let activeBeat;
  const nodes = new Set();

  function markBeat(index) {
    if (activeBeat === index) return;
    beats.children[activeBeat]?.classList.remove('is-current');
    beats.children[index]?.classList.add('is-current');
    activeBeat = index;
  }

  function render() {
    tempo.value = settings.bpm;
    find('#metroMeter').textContent = settings.numerator + '/' + settings.denominator;
    find('#metroDivision').textContent = '每拍 ' + settings.subdivision + ' 下';
    beats.replaceChildren(...Array.from({length: beatCount()}, (_, i) => {
      const dot = document.createElement('span');
      dot.textContent = i + 1;
      return dot;
    }));
    activeBeat = -1;
  }

  function renderPlay() {
    const running = pending || playback;
    find('#metroPlayIcon').textContent = running ? '■' : '▶';
    find('#metroPlayLabel').textContent = running ? '停止' : '开始';
  }

  function clearSchedule() {
    cancelAnimationFrame(frame);
    for (const node of nodes) {
      try { node.stop(); } catch {}
    }
    nodes.clear();
    markBeat(-1);
    light.style.opacity = 0;
  }

  function stop(message = '') {
    generation++;
    pending = false;
    playback = null;
    clearSchedule();
    renderPlay();
    status.textContent = message;
  }

  function pump() {
    const run = playback;
    if (run.audio.state !== 'running') {
      stop('音频已中断，请点「开始」重新打拍。');
      return;
    }
    const now = run.audio.currentTime;
    const elapsed = Math.floor((now - run.start) / run.interval);
    if (elapsed >= 0) {
      const beatTime = (now - run.start) / run.beatDuration;
      const beatNumber = Math.floor(beatTime);
      const beat = beatNumber % run.beats;
      const phase = beatTime - beatNumber;
      markBeat(beat);
      // Count sides across bar lines so odd meters still alternate.
      light.dataset.side = run.beats === 1 ? 'full' : beatNumber % 2 === 0 ? 'left' : 'right';
      light.classList.toggle('is-accent', run.beats > 1 && beat === 0);
      const flashProgress = phase * run.beatDuration / run.flashDuration;
      // Ease both ends so switching halves never starts with a jump in brightness.
      const fade = Math.max(0, Math.min(flashProgress / .18, 1, (1 - flashProgress) / .55));
      const pulse = run.beats === 1 ? Math.sin(Math.PI * phase) ** 2 : fade * fade * (3 - 2 * fade);
      light.style.opacity = pulse;
    }

    // Use the audio clock for exact spacing. Skip ticks missed during a stalled frame.
    run.next = Math.max(run.next, elapsed + 1);
    while (run.start + run.next * run.interval <= now + .12) {
      const tick = run.next++;
      const start = run.start + tick * run.interval;
      const beat = Math.floor(tick / settings.subdivision) % run.beats;
      const offbeat = tick % settings.subdivision !== 0;
      const node = tone(offbeat ? 560 : beat === 0 ? 1500 : 960, start, offbeat ? .033 : .05, true);
      nodes.add(node);
      node.addEventListener('ended', () => nodes.delete(node), {once: true});
    }
    frame = requestAnimationFrame(pump);
  }

  function schedule(audio) {
    const beatDuration = 60 / settings.bpm;
    playback = {
      audio, start: audio.currentTime + .07, next: 0, beats: beatCount(),
      beatDuration, flashDuration: Math.min(.62, beatDuration * .96),
      interval: beatDuration / settings.subdivision
    };
    pump();
  }

  function update(next) {
    if (Object.keys(next).every(key => settings[key] === next[key])) {
      tempo.value = settings.bpm;
      return;
    }
    const audio = playback?.audio;
    if (audio) clearSchedule();
    settings = {...settings, ...next};
    try { localStorage.setItem(storageKey, JSON.stringify(settings)); } catch {}
    render();
    if (audio) schedule(audio);
  }

  function setTempo(value) {
    update({bpm: Number.isInteger(value) ? Math.min(240, Math.max(20, value)) : settings.bpm});
  }

  tempo.addEventListener('change', () => setTempo(/^\d+$/.test(tempo.value) ? Number(tempo.value) : NaN));
  tempo.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.isComposing) tempo.blur();
  });
  find('#metroSlower').onclick = () => setTempo(settings.bpm - 1);
  find('#metroFaster').onclick = () => setTempo(settings.bpm + 1);
  view.querySelectorAll('[data-metro-tempo]').forEach(button => {
    button.onclick = () => setTempo(Number(button.dataset.metroTempo));
  });

  find('#metroPlay').onclick = async () => {
    if (pending || playback) {
      stop();
      return;
    }
    const token = ++generation;
    pending = true;
    renderPlay();
    status.textContent = '';
    try {
      await audioReady();
      if (token !== generation) return;
      pending = false;
      schedule(context());
    } catch {
      if (token === generation) stop('无法启动音频，请点「开始」重试。');
    }
  };

  function selectSubdivision(value) {
    find('input[name="metroSubdivision"][value="' + value + '"]').checked = true;
  }

  function renderDraftMeter() {
    const top = Number(numerator.value);
    const bottom = Number(denominator.value);
    for (const button of presets) {
      button.setAttribute('aria-pressed', String(button.dataset.meter === top + '/' + bottom));
    }
    const isCompound = compound(top, bottom);
    const unit = isCompound ? '附点四分音符' : {2: '二分音符', 4: '四分音符', 8: '八分音符', 16: '十六分音符'}[bottom];
    find('#metroBeatUnit').textContent = '每小节 ' + (isCompound ? top / 3 : top) + ' 拍 · ' + unit + '为一拍';
  }

  let draftCompound;
  function changeDraftMeter() {
    const nextCompound = compound(Number(numerator.value), Number(denominator.value));
    if (nextCompound !== draftCompound) selectSubdivision(nextCompound ? 3 : 1);
    draftCompound = nextCompound;
    renderDraftMeter();
  }

  settingsButton.onclick = () => {
    numerator.value = settings.numerator;
    denominator.value = settings.denominator;
    draftCompound = compound(settings.numerator, settings.denominator);
    selectSubdivision(settings.subdivision);
    renderDraftMeter();
    sheet.showModal();
  };
  find('#metroCancel').onclick = () => sheet.close();
  for (const button of presets) {
    button.onclick = () => {
      const [top, bottom] = button.dataset.meter.split('/');
      numerator.value = top;
      denominator.value = bottom;
      changeDraftMeter();
    };
  }
  numerator.onchange = denominator.onchange = changeDraftMeter;
  find('#metroForm').onsubmit = event => {
    event.preventDefault();
    update({
      numerator: Number(numerator.value),
      denominator: Number(denominator.value),
      subdivision: Number(find('input[name="metroSubdivision"]:checked').value)
    });
    sheet.close();
  };

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && (pending || playback)) stop('离开页面时已停止。');
  });
  window.addEventListener('pagehide', () => stop());
  render();
  return {
    show() {
      document.body.classList.add('metronome-mode');
      view.hidden = false;
    },
    hide() {
      if (view.hidden) return;
      stop();
      sheet.close();
      view.hidden = true;
      document.body.classList.remove('metronome-mode');
    }
  };
}
