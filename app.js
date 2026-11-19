// GTA 6 Trophy Guide & Tracker — Full app logic
// ES module, no network requests at runtime, localStorage persistence

const STORAGE_KEY = 'gta6-trophy-progress';
const SPOILER_KEY = 'gta6-spoiler-settings';

let trophies = [];
let guides = {};
let earned = new Set();
let spoilerSettings = {
  hideStory: true,
  autoReveal: true
};
let currentFilters = {
  grade: 'all',
  kind: 'all',
  spoiler: true
};

// DOM elements
const trophyBody = document.getElementById('trophy-body');
const earnedCountEl = document.getElementById('earned-count');
const gradeFilter = document.getElementById('grade-filter');
const kindFilter = document.getElementById('kind-filter');
const spoilerToggle = document.getElementById('spoiler-toggle');
const exportBtn = document.getElementById('export-btn');
const importFile = document.getElementById('import-file');
const themeToggle = document.getElementById('theme-toggle');
const selectAll = document.getElementById('select-all');
const roadmapEl = document.getElementById('roadmap');
const missablesEl = document.getElementById('missables');
const spoilerSetting = document.getElementById('spoiler-setting');
const spoilerAuto = document.getElementById('spoiler-auto');
const clearDataBtn = document.getElementById('clear-data');
const modal = document.getElementById('guide-modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const modalSources = document.getElementById('modal-sources');
const modalClose = document.querySelector('.modal-close');
const toast = document.getElementById('toast');
const platinumBadge = document.getElementById('platinum-badge');
const ringProgress = document.querySelector('.ring-progress');

// Grade order & colors
const GRADE_ORDER = { platinum: 0, gold: 1, silver: 2, bronze: 3 };
const GRADE_LABELS = { platinum: 'Platinum', gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };
const KIND_LABELS = { story: 'Story', missable: 'Missable', collectibles: 'Collectibles', activities: 'Activities' };
const KIND_COLORS = { story: '#d24e2a', missable: '#e67e22', collectibles: '#27ae60', activities: '#2980b9' };

// Initialize
async function init() {
  await loadData();
  loadProgress();
  loadSpoilerSettings();
  applyTheme();
  renderAll();
  bindEvents();
  updateProgressRing();
}

// Load trophies + guides
async function loadData() {
  const [trophiesResp, guidesResp] = await Promise.all([
    fetch('data/trophies.json'),
    fetch('data/guides.json')
  ]);
  const trophiesData = await trophiesResp.json();
  const guidesData = await guidesResp.json();
  trophies = trophiesData.trophies;
  guides = guidesData.guides;
}

// Load progress from localStorage
function loadProgress() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) earned = new Set(JSON.parse(saved));
  } catch (e) {
    console.warn('Failed to load progress:', e);
  }
}

// Save progress
function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned]));
}

// Load spoiler settings
function loadSpoilerSettings() {
  try {
    const saved = localStorage.getItem(SPOILER_KEY);
    if (saved) spoilerSettings = { ...spoilerSettings, ...JSON.parse(saved) };
    spoilerSetting.checked = spoilerSettings.hideStory;
    spoilerAuto.checked = spoilerSettings.autoReveal;
    spoilerToggle.checked = spoilerSettings.hideStory;
    currentFilters.spoiler = spoilerSettings.hideStory;
  } catch (e) {
    console.warn('Failed to load spoiler settings:', e);
  }
}

// Save spoiler settings
function saveSpoilerSettings() {
  spoilerSettings.hideStory = spoilerSetting.checked;
  spoilerSettings.autoReveal = spoilerAuto.checked;
  localStorage.setItem(SPOILER_KEY, JSON.stringify(spoilerSettings));
  currentFilters.spoiler = spoilerSettings.hideStory;
  renderAll();
}

// Theme handling
function applyTheme() {
  const theme = localStorage.getItem('gta6-theme') || 'light';
  document.documentElement.setAttribute('data-theme', theme);
  themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
  const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('gta6-theme', theme);
  themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
}

// Check if trophy should be hidden due to spoiler
function isSpoilerHidden(trophy) {
  if (!currentFilters.spoiler) return false;
  if (trophy.kind !== 'story') return false;
  return !earned.has(trophy.name);
}

// Get display name/description with spoiler handling
function getDisplayName(trophy) {
  if (isSpoilerHidden(trophy)) return '🔒 Hidden (Story)';
  return trophy.name;
}

function getDisplayDescription(trophy) {
  if (isSpoilerHidden(trophy)) return 'Complete the story to reveal this trophy.';
  return trophy.description;
}

// Render checklist table
function renderChecklist() {
  trophyBody.innerHTML = '';
  let visibleCount = 0;
  let earnedVisible = 0;

  for (const t of trophies) {
    // Grade filter
    if (currentFilters.grade !== 'all' && t.grade !== currentFilters.grade) continue;
    // Kind filter
    if (currentFilters.kind !== 'all' && t.kind !== currentFilters.kind) continue;

    visibleCount++;
    const isEarned = earned.has(t.name);
    if (isEarned) earnedVisible++;

    const tr = document.createElement('tr');
    tr.className = isEarned ? 'earned' : '';
    tr.dataset.trophyId = t.id;

    // Checkbox
    const tdCheck = document.createElement('td');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = isEarned;
    checkbox.addEventListener('change', () => toggleEarned(t, checkbox));
    tdCheck.append(checkbox);
    tr.append(tdCheck);

    // Trophy name & description
    const tdName = document.createElement('td');
    tdName.className = 'trophy-name';
    const nameDiv = document.createElement('div');
    nameDiv.className = 'name';
    nameDiv.textContent = getDisplayName(t);
    const descDiv = document.createElement('div');
    descDiv.className = 'description';
    descDiv.textContent = getDisplayDescription(t);
    tdName.append(nameDiv, descDiv);
    tr.append(tdName);

    // Grade badge
    const tdGrade = document.createElement('td');
    const gradeBadge = document.createElement('span');
    gradeBadge.className = `grade-badge grade-${t.grade}`;
    gradeBadge.textContent = GRADE_LABELS[t.grade];
    tdGrade.append(gradeBadge);
    tr.append(tdGrade);

    // Kind badge
    const tdKind = document.createElement('td');
    const kindBadge = document.createElement('span');
    kindBadge.className = 'kind-badge';
    kindBadge.textContent = KIND_LABELS[t.kind];
    kindBadge.style.backgroundColor = KIND_COLORS[t.kind] + '20';
    kindBadge.style.color = KIND_COLORS[t.kind];
    kindBadge.style.borderColor = KIND_COLORS[t.kind];
    tdKind.append(kindBadge);
    tr.append(tdKind);

    // Guide button
    const tdGuide = document.createElement('td');
    const guideBtn = document.createElement('button');
    guideBtn.className = 'btn btn-sm guide-btn';
    guideBtn.textContent = 'Guide';
    guideBtn.addEventListener('click', () => openGuideModal(t));
    tdGuide.append(guideBtn);
    tr.append(tdGuide);

    // Sources
    const tdSources = document.createElement('td');
    const sourcesDiv = document.createElement('div');
    sourcesDiv.className = 'sources';
    const g = guides[String(t.id)];
    if (g && g.sources) {
      for (const src of g.sources) {
        const a = document.createElement('a');
        a.href = src;
        a.target = '_blank';
        a.rel = 'noopener';
        a.textContent = src.includes('exophase') ? 'Exophase' : src.includes('psnprofiles') ? 'PSNProfiles' : 'Official';
        sourcesDiv.append(a);
      }
    }
    tdSources.append(sourcesDiv);
    tr.append(tdSources);

    // Select checkbox (for bulk actions)
    const tdSelect = document.createElement('td');
    const selectBox = document.createElement('input');
    selectBox.type = 'checkbox';
    selectBox.className = 'row-select';
    selectBox.dataset.trophyName = t.name;
    tdSelect.append(selectBox);
    tr.append(tdSelect);

    trophyBody.append(tr);
  }

  // Update select-all state
  const rowSelects = trophyBody.querySelectorAll('.row-select');
  selectAll.checked = rowSelects.length > 0 && [...rowSelects].every(cb => cb.checked);
  selectAll.indeterminate = rowSelects.length > 0 && [...rowSelects].some(cb => cb.checked) && ![...rowSelects].every(cb => cb.checked);
}

// Toggle earned status
function toggleEarned(trophy, checkbox) {
  if (checkbox.checked) {
    earned.add(trophy.name);
    // Auto-reveal spoiler if enabled
    if (spoilerSettings.autoReveal && trophy.kind === 'story') {
      currentFilters.spoiler = false;
      spoilerToggle.checked = false;
      spoilerSetting.checked = false;
      saveSpoilerSettings();
    }
  } else {
    earned.delete(trophy.name);
  }
  saveProgress();
  renderAll();
  updateProgressRing();
  showToast(checkbox.checked ? `Earned: ${trophy.name}` : `Unmarked: ${trophy.name}`);
}

// Open guide modal
function openGuideModal(trophy) {
  const g = guides[String(trophy.id)];
  if (!g) return;

  modalTitle.textContent = `${g.name} (${GRADE_LABELS[g.grade]})`;
  
  let html = `<p class="modal-desc">${g.description}</p>`;
  html += `<div class="modal-guide">${g.guide}</div>`;
  
  if (g.steps && g.steps.length) {
    html += '<h4>Steps</h4><ol class="modal-steps">';
    for (const step of g.steps) {
      html += `<li>${step}</li>`;
    }
    html += '</ol>';
  }
  
  if (g.missable) {
    html += `<div class="missable-warning">⚠️ Missable: ${g.missableDetail}</div>`;
  }
  
  modalBody.innerHTML = html;
  
  // Sources
  modalSources.innerHTML = '';
  if (g.sources) {
    const srcTitle = document.createElement('strong');
    srcTitle.textContent = 'Sources: ';
    modalSources.append(srcTitle);
    for (const src of g.sources) {
      const a = document.createElement('a');
      a.href = src;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = src.includes('exophase') ? 'Exophase' : src.includes('psnprofiles') ? 'PSNProfiles' : 'Official';
      modalSources.append(a);
    }
  }
  
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
  modal.hidden = true;
  document.body.style.overflow = '';
}

// Render roadmap
function renderRoadmap() {
  const stages = {};
  for (const t of trophies) {
    const stage = t.roadmapStage || 3;
    if (!stages[stage]) stages[stage] = [];
    stages[stage].push(t);
  }

  let html = '';
  for (let stage = 1; stage <= 5; stage++) {
    if (!stages[stage]) continue;
    const stageNames = { 1: 'Getting Started', 2: 'Early Exploration', 3: 'Mid-Game & Strangers', 4: 'Mastery & Completion', 5: 'Platinum Finale' };
    html += `<div class="roadmap-stage"><h3>Stage ${stage}: ${stageNames[stage]}</h3><div class="roadmap-list">`;
    for (const t of stages[stage].sort((a, b) => GRADE_ORDER[a.grade] - GRADE_ORDER[b.grade])) {
      const isEarned = earned.has(t.name);
      const missable = t.missable ? ' <span class="missable-tag">⚠️ Missable</span>' : '';
      html += `<div class="roadmap-item ${isEarned ? 'earned' : ''}">${getDisplayName(t)} <span class="grade-tag grade-${t.grade}">${GRADE_LABELS[t.grade]}</span>${missable}</div>`;
    }
    html += '</div></div>';
  }
  roadmapEl.innerHTML = html;
}

// Render missables
function renderMissables() {
  const missableTrophies = trophies.filter(t => t.missable);
  let html = '<h3>Missable Trophies</h3><p class="missable-intro">These trophies can be permanently missed if not obtained before certain story points. Complete them as early as possible.</p><div class="missables-grid">';
  for (const t of missableTrophies) {
    const isEarned = earned.has(t.name);
    const g = guides[String(t.id)];
    html += `<div class="missable-card ${isEarned ? 'earned' : ''}">
      <div class="missable-header">
        <span class="grade-badge grade-${t.grade}">${GRADE_LABELS[t.grade]}</span>
        <h4>${getDisplayName(t)}</h4>
      </div>
      <p class="missable-detail">${g?.missableDetail || 'Can be missed if not completed in time.'}</p>
      ${isEarned ? '<span class="earned-tag">✅ Earned</span>' : ''}
    </div>`;
  }
  html += '</div>';
  missablesEl.innerHTML = html;
}

// Render all panels
function renderAll() {
  renderChecklist();
  renderRoadmap();
  renderMissables();
}

// Update progress ring
function updateProgressRing() {
  const total = trophies.length || 55;
  const earnedCount = earned.size;
  earnedCountEl.textContent = earnedCount;
  const circumference = 2 * Math.PI * 28; // 175.9
  const offset = circumference - (earnedCount / total) * circumference;
  if (ringProgress) ringProgress.style.strokeDashoffset = offset;
  platinumBadge.hidden = earnedCount < total;
}

// Export progress
function exportProgress() {
  const data = {
    version: '1.0',
    exported: new Date().toISOString(),
    earned: [...earned],
    spoilerSettings
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(url);
  showToast('Progress exported');
}

// Import progress
async function importProgress(file) {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    if (data.earned && Array.isArray(data.earned)) {
      earned = new Set(data.earned);
      saveProgress();
    }
    if (data.spoilerSettings) {
      spoilerSettings = { ...spoilerSettings, ...data.spoilerSettings };
      saveSpoilerSettings();
      spoilerSetting.checked = spoilerSettings.hideStory;
      spoilerAuto.checked = spoilerSettings.autoReveal;
      spoilerToggle.checked = spoilerSettings.hideStory;
      currentFilters.spoiler = spoilerSettings.hideStory;
    }
    renderAll();
    updateProgressRing();
    showToast(`Imported ${earned.size} trophies`);
  } catch (e) {
    showToast('Import failed: invalid file');
    console.error(e);
  }
}

// Clear all data
function clearAllData() {
  if (!confirm('Clear ALL progress and settings? This cannot be undone.')) return;
  earned.clear();
  spoilerSettings = { hideStory: true, autoReveal: true };
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(SPOILER_KEY);
  localStorage.removeItem('gta6-theme');
  saveProgress();
  saveSpoilerSettings();
  applyTheme();
  renderAll();
  updateProgressRing();
  showToast('All data cleared');
}

// Show toast notification
function showToast(message) {
  toast.textContent = message;
  toast.hidden = false;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.hidden = true, 300);
  }, 2500);
}

// Bind events
function bindEvents() {
  // Filters
  gradeFilter.addEventListener('change', () => {
    currentFilters.grade = gradeFilter.value;
    renderChecklist();
  });
  kindFilter.addEventListener('change', () => {
    currentFilters.kind = kindFilter.value;
    renderChecklist();
  });
  spoilerToggle.addEventListener('change', () => {
    currentFilters.spoiler = spoilerToggle.checked;
    spoilerSetting.checked = spoilerToggle.checked;
    saveSpoilerSettings();
    renderChecklist();
  });

  // Select all
  selectAll.addEventListener('change', () => {
    const checkboxes = trophyBody.querySelectorAll('.row-select');
    for (const cb of checkboxes) {
      cb.checked = selectAll.checked;
      const trophy = trophies.find(t => t.name === cb.dataset.trophyName);
      if (trophy) {
        if (selectAll.checked) earned.add(trophy.name);
        else earned.delete(trophy.name);
      }
    }
    saveProgress();
    renderAll();
    updateProgressRing();
  });

  // Export/Import
  exportBtn.addEventListener('click', exportProgress);
  importFile.addEventListener('change', (e) => {
    if (e.target.files[0]) importProgress(e.target.files[0]);
    e.target.value = '';
  });

  // Theme
  themeToggle.addEventListener('click', toggleTheme);

  // Spoiler settings
  spoilerSetting.addEventListener('change', saveSpoilerSettings);
  spoilerAuto.addEventListener('change', saveSpoilerSettings);

  // Clear data
  clearDataBtn.addEventListener('click', clearAllData);

  // Modal
  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });

  // Tabs
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      document.querySelectorAll('.panel').forEach(p => p.hidden = true);
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      document.getElementById(`panel-${tab.dataset.tab}`).hidden = false;
    });
  });
}

// Start
init();