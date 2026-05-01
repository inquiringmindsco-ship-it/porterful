// Porterful Visualizer Studio — Local UI Frontend
// v0.1 Phase 1

const API_BASE = '';

// State
let state = {
  currentScreen: 'screen-start',
  templates: [],
  files: { audio: [], cover: [], lyrics: [] },
  selectedTemplate: null,
  selectedFormat: null,
  jobs: [],
  currentJobId: null,
  pollInterval: null
};

// DOM refs
const screens = {
  start: document.getElementById('screen-start'),
  create: document.getElementById('screen-create'),
  status: document.getElementById('screen-status'),
  output: document.getElementById('screen-output')
};

// Init
async function init() {
  await Promise.all([loadTemplates(), loadFiles()]);
  populateForm();
  showScreen('screen-start');
  setupListeners();
  loadRecentJobs();
}

// API helpers
async function apiGet(path) {
  const res = await fetch(API_BASE + path);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function apiPost(path, body) {
  const res = await fetch(API_BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// Load data
async function loadTemplates() {
  try {
    state.templates = (await apiGet('/templates.json')).templates;
    renderTemplates();
  } catch (e) {
    console.error('Failed to load templates', e);
  }
}

async function loadFiles() {
  try {
    state.files = await apiGet('/api/files');
  } catch (e) {
    console.error('Failed to load files', e);
  }
}

// Populate form selects
function populateForm() {
  const audioSel = document.getElementById('audio-select');
  const coverSel = document.getElementById('cover-select');
  const lyricsSel = document.getElementById('lyrics-file-select');

  audioSel.innerHTML = '<option value="">Choose a song file...</option>' +
    state.files.audio.map(f => `<option value="${f}">${f}</option>`).join('');

  coverSel.innerHTML = '<option value="">Choose a cover image...</option>' +
    state.files.cover.map(f => `<option value="${f}">${f}</option>`).join('');

  lyricsSel.innerHTML = '<option value="">Choose a lyrics file...</option>' +
    state.files.lyrics.map(f => `<option value="${f}">${f}</option>`).join('');
}

// Render templates
function renderTemplates() {
  const grid = document.getElementById('template-grid');
  grid.innerHTML = state.templates.map(t => `
    <div class="template-card" data-id="${t.id}">
      <h4>${t.name}</h4>
      <p>${t.description}</p>
      <span class="vibe">${t.vibe}</span>
    </div>
  `).join('');

  grid.querySelectorAll('.template-card').forEach(card => {
    card.addEventListener('click', () => {
      grid.querySelectorAll('.template-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      state.selectedTemplate = card.dataset.id;
      updatePreview();
      validateForm();
    });
  });
}

// Screen navigation
function showScreen(id) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  state.currentScreen = id;
}

// Setup listeners
function setupListeners() {
  // Start
  document.getElementById('btn-start').addEventListener('click', () => {
    showScreen('screen-create');
  });

  // Back
  document.getElementById('btn-back-start').addEventListener('click', () => {
    showScreen('screen-start');
  });

  // Lyrics tabs
  document.querySelectorAll('.lyrics-tabs .tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.lyrics-tabs .tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const kind = tab.dataset.kind;
      document.getElementById('lyrics-text').classList.toggle('hidden', kind !== 'text');
      document.getElementById('lyrics-file-select').classList.toggle('hidden', kind === 'text');
    });
  });

  // Format selector
  document.querySelectorAll('.format-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.format-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      state.selectedFormat = btn.dataset.format;
      updatePreview();
      validateForm();
    });
  });

  // Form inputs
  ['audio-select', 'cover-select', 'artist-input', 'title-input',
   'lyrics-text', 'lyrics-file-select', 'rights-checkbox'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', validateForm);
    if (el && (el.tagName === 'TEXTAREA' || el.type === 'text')) {
      el.addEventListener('input', validateForm);
    }
  });

  // Generate
  document.getElementById('btn-generate').addEventListener('click', handleGenerate);

  // Output actions
  document.getElementById('btn-make-another').addEventListener('click', () => {
    resetForm();
    showScreen('screen-create');
  });

  document.getElementById('btn-open-folder').addEventListener('click', () => {
    if (state.currentJobId && jobs[state.currentJobId]) {
      const job = jobs[state.currentJobId];
      if (job.outputPath) {
        const dir = job.outputPath.substring(0, job.outputPath.lastIndexOf('/'));
        alert('Open this folder in Finder:\n' + dir);
      }
    }
  });
}

// Validate form
function validateForm() {
  const audio = document.getElementById('audio-select').value;
  const artist = document.getElementById('artist-input').value.trim();
  const title = document.getElementById('title-input').value.trim();
  const rights = document.getElementById('rights-checkbox').checked;
  const lyricsKind = document.querySelector('.lyrics-tabs .tab.active').dataset.kind;
  const lyricsText = document.getElementById('lyrics-text').value.trim();
  const lyricsFile = document.getElementById('lyrics-file-select').value;

  let valid = audio && artist && title && state.selectedTemplate && state.selectedFormat && rights;

  if (lyricsKind === 'text' && !lyricsText) valid = false;
  if ((lyricsKind === 'srt' || lyricsKind === 'lrc') && !lyricsFile) valid = false;

  const btn = document.getElementById('btn-generate');
  btn.disabled = !valid;

  const err = document.getElementById('generate-error');
  if (!valid) {
    err.textContent = 'Fill all required fields and confirm rights to continue.';
  } else {
    err.textContent = '';
  }

  return valid;
}

// Update preview
function updatePreview() {
  const preview = document.getElementById('template-preview');
  const fmtDisplay = document.getElementById('format-display');

  if (state.selectedTemplate) {
    const t = state.templates.find(x => x.id === state.selectedTemplate);
    preview.innerHTML = `
      <h4>${t.name}</h4>
      <p style="color:var(--text-muted);font-size:13px">${t.description}</p>
      <span class="vibe">${t.vibe}</span>
    `;
  }

  if (state.selectedFormat) {
    const labels = { '9:16': 'Reels / TikTok', '1:1': 'Instagram / X', '16:9': 'YouTube' };
    fmtDisplay.innerHTML = `<p><strong>${labels[state.selectedFormat]}</strong> · ${state.selectedFormat}</p>`;
  }
}

// Handle generate
async function handleGenerate() {
  if (!validateForm()) return;

  const lyricsKind = document.querySelector('.lyrics-tabs .tab.active').dataset.kind;
  const body = {
    artist: document.getElementById('artist-input').value.trim(),
    title: document.getElementById('title-input').value.trim(),
    audio: document.getElementById('audio-select').value,
    cover: document.getElementById('cover-select').value,
    lyricsKind: lyricsKind,
    lyricsText: lyricsKind === 'text' ? document.getElementById('lyrics-text').value : '',
    lyricsFile: lyricsKind !== 'text' ? document.getElementById('lyrics-file-select').value : '',
    template: state.selectedTemplate,
    format: state.selectedFormat,
    outputName: '',
    rightsConfirmed: true
  };

  try {
    showScreen('screen-status');
    document.getElementById('status-pill').className = 'status-pill queued';
    document.getElementById('status-pill').textContent = 'Queued';
    document.getElementById('progress-fill').style.width = '0%';
    document.getElementById('status-detail').textContent = 'Waiting to start...';
    document.getElementById('job-meta').classList.add('hidden');

    const result = await apiPost('/api/generate', body);
    state.currentJobId = result.jobId;

    // Show job meta
    document.getElementById('job-artist').textContent = body.artist;
    document.getElementById('job-title').textContent = body.title;
    document.getElementById('job-template').textContent = state.selectedTemplate;
    document.getElementById('job-format').textContent = state.selectedFormat;
    document.getElementById('job-meta').classList.remove('hidden');

    startPolling(result.jobId);
  } catch (e) {
    document.getElementById('status-pill').className = 'status-pill failed';
    document.getElementById('status-pill').textContent = 'Failed';
    document.getElementById('status-detail').textContent = e.message;
  }
}

// Poll job status
let jobs = {};

function startPolling(jobId) {
  if (state.pollInterval) clearInterval(state.pollInterval);

  state.pollInterval = setInterval(async () => {
    try {
      const job = await apiGet('/api/jobs/' + jobId);
      jobs[jobId] = job;
      updateStatusUI(job);

      if (job.status === 'complete' || job.status === 'failed') {
        clearInterval(state.pollInterval);
        state.pollInterval = null;
        if (job.status === 'complete') {
          setTimeout(() => showOutput(job), 800);
        }
      }
    } catch (e) {
      console.error('Poll error', e);
    }
  }, 1500);
}

function updateStatusUI(job) {
  const pill = document.getElementById('status-pill');
  const fill = document.getElementById('progress-fill');
  const detail = document.getElementById('status-detail');

  pill.className = 'status-pill ' + job.status;
  pill.textContent = job.status.charAt(0).toUpperCase() + job.status.slice(1);

  if (job.status === 'queued') {
    fill.style.width = '10%';
    detail.textContent = 'Waiting to start...';
  } else if (job.status === 'rendering') {
    fill.style.width = '60%';
    detail.textContent = 'Rendering your video...';
  } else if (job.status === 'complete') {
    fill.style.width = '100%';
    detail.textContent = 'Done!';
  } else if (job.status === 'failed') {
    fill.style.width = '100%';
    detail.textContent = job.error || 'Generation failed';
  }
}

function showOutput(job) {
  showScreen('screen-output');

  const thumb = document.getElementById('output-thumb');
  const fallback = document.getElementById('output-fallback');

  if (job.thumbnailPath) {
    thumb.src = 'file://' + job.thumbnailPath;
    thumb.classList.remove('hidden');
    fallback.classList.add('hidden');
  } else {
    thumb.classList.add('hidden');
    fallback.classList.remove('hidden');
  }

  const link = document.getElementById('output-link');
  if (job.outputPath) {
    link.href = 'file://' + job.outputPath;
    link.classList.remove('hidden');
  } else {
    link.classList.add('hidden');
  }

  document.getElementById('output-path').textContent = job.outputPath || '-';
  document.getElementById('output-time').textContent = job.completedAt
    ? new Date(job.completedAt).toLocaleString()
    : '-';
}

// Reset form
function resetForm() {
  document.getElementById('audio-select').value = '';
  document.getElementById('cover-select').value = '';
  document.getElementById('artist-input').value = '';
  document.getElementById('title-input').value = '';
  document.getElementById('lyrics-text').value = '';
  document.getElementById('lyrics-file-select').value = '';
  document.getElementById('rights-checkbox').checked = false;
  document.querySelectorAll('.template-card').forEach(c => c.classList.remove('selected'));
  document.querySelectorAll('.format-btn').forEach(b => b.classList.remove('selected'));
  state.selectedTemplate = null;
  state.selectedFormat = null;
  updatePreview();
  validateForm();
}

// Recent jobs
async function loadRecentJobs() {
  try {
    const recent = await apiGet('/api/jobs');
    if (recent && recent.length > 0) {
      document.getElementById('recent-jobs').classList.remove('hidden');
      const list = document.getElementById('recent-list');
      list.innerHTML = recent.slice(-5).reverse().map(j => `
        <div class="job-card" data-job="${j.jobId}">
          <div class="info">
            <h4>${j.artist} — ${j.title}</h4>
            <p>${j.template} · ${j.format}</p>
          </div>
          <span class="pill status-pill ${j.status}">${j.status}</span>
        </div>
      `).join('');

      list.querySelectorAll('.job-card').forEach(card => {
        card.addEventListener('click', () => {
          const job = recent.find(j => j.jobId === card.dataset.job);
          if (job) {
            if (job.status === 'complete') showOutput(job);
            else {
              state.currentJobId = job.jobId;
              showScreen('screen-status');
              startPolling(job.jobId);
            }
          }
        });
      });
    }
  } catch (e) {
    console.error('Failed to load jobs', e);
  }
}

// Boot
init();
