const defaultApps = [
  { name: 'Phone', icon: '📞', url: 'https://web.whatsapp.com', local: 'phone', category: 'System', rating: 5, size: '2 MB', desc: 'Make and receive calls.', installed: true },
  { name: 'Messages', icon: '💬', url: 'https://messages.google.com/web', local: 'messages', category: 'Social', rating: 4.8, size: '4 MB', desc: 'Send and receive messages.', installed: true },
  { name: 'Instagram', icon: '📸', url: 'https://instagram.com', local: 'instagram', category: 'Social', rating: 4.4, size: '35 MB', desc: 'Share photos and videos.', installed: true },
  { name: 'WhatsApp', icon: '💬', url: 'https://web.whatsapp.com', local: 'whatsapp', category: 'Social', rating: 4.6, size: '28 MB', desc: 'Messaging and calls.', installed: true },
  { name: 'Chrome', icon: '🌐', url: 'https://google.com', local: 'chrome', category: 'Utilities', rating: 4.7, size: '45 MB', desc: 'Fast web browser.', installed: true },
  { name: 'YouTube', icon: '▶️', url: 'https://youtube.com', category: 'Entertainment', rating: 4.5, size: '52 MB', desc: 'Watch videos.', installed: true },
  { name: 'Camera', icon: '📷', url: 'https://webcamera.io', local: 'camera', category: 'System', rating: 4.3, size: '6 MB', desc: 'Take photos and videos.', installed: true },
  { name: 'Settings', icon: '⚙️', url: null, local: 'settings', category: 'System', rating: 4.9, size: '8 MB', desc: 'Device settings.', installed: true },
  { name: 'Photos', icon: '🖼️', url: 'https://photos.google.com', local: 'photos', category: 'Utilities', rating: 4.6, size: '15 MB', desc: 'View your photos.', installed: true },
  { name: 'Maps', icon: '🗺️', url: 'https://maps.google.com', category: 'Navigation', rating: 4.4, size: '68 MB', desc: 'Find your way.', installed: true },
  { name: 'Clock', icon: '🕐', url: 'https://time.is', local: 'clock', category: 'Utilities', rating: 4.5, size: '5 MB', desc: 'Alarm and timer.', installed: true },
  { name: 'Weather', icon: '☀️', url: 'https://weather.com', local: 'weather', category: 'Utilities', rating: 4.2, size: '9 MB', desc: 'Weather forecast.', installed: true }
];

const storeApps = [
  { name: 'TikTok', icon: '🎵', url: 'https://tiktok.com', category: 'Entertainment', rating: 4.6, size: '48 MB', desc: 'Short-form videos.', featured: true, screenshots: ['🎵','🎵','🎵'] },
  { name: 'Twitter', icon: '🐦', url: 'https://twitter.com', category: 'Social', rating: 4.2, size: '32 MB', desc: 'Real-time conversation.', featured: true, screenshots: ['🐦','🐦','🐦'] },
  { name: 'Facebook', icon: '📘', url: 'https://facebook.com', category: 'Social', rating: 4.0, size: '55 MB', desc: 'Connect with friends.', featured: false, screenshots: ['📘','📘','📘'] },
  { name: 'Spotify', icon: '🎧', url: 'https://spotify.com', category: 'Entertainment', rating: 4.7, size: '42 MB', desc: 'Music and podcasts.', featured: true, screenshots: ['🎧','🎧','🎧'] },
  { name: 'Netflix', icon: '🎬', url: 'https://netflix.com', category: 'Entertainment', rating: 4.5, size: '60 MB', desc: 'Stream movies and series.', featured: false, screenshots: ['🎬','🎬','🎬'] },
  { name: 'Discord', icon: '🎮', url: 'https://discord.com', category: 'Social', rating: 4.6, size: '40 MB', desc: 'Chat for communities.', featured: false, screenshots: ['🎮','🎮','🎮'] },
  { name: 'Telegram', icon: '📥', url: 'https://web.telegram.org', category: 'Social', rating: 4.5, size: '25 MB', desc: 'Secure messaging.', featured: false, screenshots: ['📥','📥','📥'] },
  { name: 'Snapchat', icon: '👻', url: 'https://snapchat.com', category: 'Social', rating: 4.3, size: '58 MB', desc: 'Share moments.', featured: false, screenshots: ['👻','👻','👻'] },
  { name: 'Reddit', icon: '🟠', url: 'https://reddit.com', category: 'Social', rating: 4.4, size: '38 MB', desc: 'Dive into anything.', featured: false, screenshots: ['🟠','🟠','🟠'] },
  { name: 'Pinterest', icon: '📌', url: 'https://pinterest.com', category: 'Entertainment', rating: 4.5, size: '44 MB', desc: 'Discover ideas.', featured: false, screenshots: ['📌','📌','📌'] }
];

const categories = [
  { name: 'All', icon: '📱' },
  { name: 'Social', icon: '💬' },
  { name: 'Entertainment', icon: '🎬' },
  { name: 'Utilities', icon: '🔧' },
  { name: 'Navigation', icon: '🗺️' },
  { name: 'System', icon: '⚙️' }
];

let apps = JSON.parse(localStorage.getItem('eazy-apps')) || defaultApps.map(a => ({ ...a }));
let settings = JSON.parse(localStorage.getItem('eazy-settings')) || { theme: 'dark', launch: 'local-first' };
let currentCategory = 'All';
let currentDetailApp = null;
let recentApps = [];
let hasElectron = false;

const homeGrid = document.getElementById('appGrid');
const drawerGrid = document.getElementById('appDrawerGrid');
const recentGrid = document.getElementById('recentGrid');
const storeGrid = document.getElementById('featuredGrid');
const chartList = document.getElementById('chartList');
const categoryGrid = document.getElementById('categoryGrid');
const views = document.querySelectorAll('.screen-view');
const taskBtns = document.querySelectorAll('.task-btn');
const taskApps = document.querySelectorAll('.task-app');
const toast = document.getElementById('toast');

window.eazyApi = window.api || null;
hasElectron = !!window.eazyApi;

function saveApps() { localStorage.setItem('eazy-apps', JSON.stringify(apps)); }
function saveSettings() { localStorage.setItem('eazy-settings', JSON.stringify(settings)); }

function applyTheme() {
  document.body.setAttribute('data-theme', settings.theme);
  document.body.classList.toggle('electron-mode', hasElectron);
}

function getInstalledApps() { return apps.filter(a => a.installed !== false); }
function isInstalled(name) { return apps.some(a => a.name === name && a.installed !== false); }

function addToRecent(app) {
  recentApps = recentApps.filter(a => a.name !== app.name);
  recentApps.unshift(app);
  if (recentApps.length > 20) recentApps.pop();
}

function renderCard(app, showInstall, manageable) {
  const already = isInstalled(app.name);
  const card = document.createElement('div');
  card.className = 'app-card' + (showInstall ? ' store-card' : '');
  card.innerHTML = `
    <div class="app-icon">${app.icon}</div>
    <div class="app-name">${app.name}</div>
    ${showInstall && !already ? `<button class="btn-install" data-name="${app.name}">Get</button>` : ''}
    ${manageable && already ? `<button class="btn-uninstall" data-name="${app.name}">✕</button>` : ''}
  `;
  if (showInstall && !already) {
    card.querySelector('.btn-install').addEventListener('click', (e) => {
      e.stopPropagation();
      installApp(app);
    });
  }
  if (manageable && already) {
    card.querySelector('.btn-uninstall').addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm('Remove ' + app.name + '?')) uninstallApp(app.name);
    });
  }
  if (!showInstall && !manageable) {
    card.addEventListener('click', () => launchApp(app));
  } else if (showInstall && already) {
    card.addEventListener('click', () => openAppDetail(app));
  } else if (!showInstall && manageable) {
    card.addEventListener('click', () => launchApp(app));
  }
  return card;
}

function renderHome() {
  homeGrid.innerHTML = '';
  const list = getInstalledApps();
  if (!list.length) { homeGrid.innerHTML = '<div class="empty">No apps.</div>'; return; }
  list.forEach(app => homeGrid.appendChild(renderCard(app)));
}

function renderDrawer() {
  drawerGrid.innerHTML = '';
  const list = getInstalledApps();
  if (!list.length) { drawerGrid.innerHTML = '<div class="empty">No apps.</div>'; return; }
  list.forEach(app => drawerGrid.appendChild(renderCard(app, false, true)));
}

function renderRecent() {
  recentGrid.innerHTML = '';
  if (!recentApps.length) {
    recentGrid.innerHTML = '<div class="empty">No recent apps.</div>';
    return;
  }
  recentApps.forEach(app => recentGrid.appendChild(renderCard(app)));
}

function renderStore() {
  const q = document.getElementById('storeSearch').value.toLowerCase();
  storeGrid.innerHTML = '';
  chartList.innerHTML = '';
  categoryGrid.innerHTML = '';

  const featured = storeApps.filter(a => a.featured && a.name.toLowerCase().includes(q));
  featured.forEach(app => {
    storeGrid.appendChild(renderCard(app, true));
  });

  const sorted = [...storeApps].sort((a,b) => b.rating - a.rating).filter(a => a.name.toLowerCase().includes(q));
  sorted.forEach((app, i) => {
    const row = document.createElement('div');
    row.className = 'chart-row';
    row.innerHTML = `
      <span class="chart-rank">#${i+1}</span>
      <div class="chart-icon">${app.icon}</div>
      <span class="chart-name">${app.name}</span>
      <span class="chart-rating">${app.rating} ★</span>
      <button class="btn-install-chart" data-name="${app.name}">${isInstalled(app.name) ? 'Installed' : 'Get'}</button>
    `;
    row.querySelector('button').addEventListener('click', (e) => {
      e.stopPropagation();
      installApp(app);
    });
    chartList.appendChild(row);
  });

  categories.forEach(cat => {
    const btn = document.createElement('div');
    btn.className = 'category-chip' + (currentCategory === cat.name ? ' active' : '');
    btn.innerHTML = `<span>${cat.icon}</span>${cat.name}`;
    btn.addEventListener('click', () => {
      currentCategory = cat.name;
      renderStore();
    });
    categoryGrid.appendChild(btn);
  });
}

function openAppDetail(app) {
  currentDetailApp = app;
  document.getElementById('detailIcon').textContent = app.icon;
  document.getElementById('detailName').textContent = app.name;
  document.getElementById('detailCategory').textContent = app.category;
  document.getElementById('detailRating').textContent = app.rating;
  document.getElementById('detailSize').textContent = app.size;
  document.getElementById('detailDescription').textContent = app.desc;
  document.getElementById('detailSeller').textContent = 'Eazy Stack';
  document.getElementById('detailSize2').textContent = app.size;
  document.getElementById('detailCategory2').textContent = app.category;

  const installed = isInstalled(app.name);
  const btn = document.getElementById('btnInstallDetail');
  btn.textContent = installed ? 'Installed' : 'Get';
  btn.className = 'btn-get' + (installed ? ' installed' : '');

  const screenshots = document.getElementById('detailScreenshots');
  screenshots.innerHTML = '';
  (app.screenshots || []).forEach(s => {
    const el = document.createElement('div');
    el.className = 'screenshot';
    el.textContent = s;
    screenshots.appendChild(el);
  });

  const reviews = document.getElementById('reviewList');
  reviews.innerHTML = '';
  for (let i=0; i<3; i++) {
    const r = document.createElement('div');
    r.className = 'review-item';
    r.innerHTML = `<div class="review-stars">${app.rating} ★</div><div class="review-text">Great app!</div>`;
    reviews.appendChild(r);
  }

  switchView('app-detail');
}

function installApp(app) {
  if (isInstalled(app.name)) { showToast(app.name + ' already installed'); return; }
  installProgress[app.name] = 0;
  const btn = document.querySelector(`button[data-name="${app.name}"]`);
  if (btn) btn.textContent = 'Installing...';
  showToast('Installing ' + app.name + '...');

  let p = 0;
  const id = setInterval(() => {
    p += 10;
    installProgress[app.name] = p;
    if (btn) btn.textContent = p + '%';
    if (p >= 100) {
      clearInterval(id);
      apps.push({ ...app, installed: true, category: app.category, rating: app.rating, size: app.size, desc: app.desc });
      saveApps();
      if (btn) btn.textContent = 'Installed';
      renderHome();
      renderDrawer();
      renderStore();
      showToast(app.name + ' installed');
      delete installProgress[app.name];
    }
  }, 150);
}

function showLocalAppPlaceholder(app) {
  const wrap = document.getElementById('runnerFrameWrap');
  wrap.innerHTML = `
    <div class="local-app-placeholder">
      <div class="local-icon">${app.icon}</div>
      <h2>${app.name}</h2>
      <p>Local desktop app.<br>${hasElectron ? 'Launching via Electron...' : 'Install Electron to open local desktop apps.'}</p>
    </div>
  `;
  document.getElementById('runnerAppName').textContent = app.name;
  document.getElementById('runnerAppIcon').textContent = app.icon;
}



async function launchApp(app) {
  // Eazy Stack internal Settings
  if (app.name === 'Settings') {
    addToRecent(app);
    renderRecent();
    switchView('settings');
    return;
  }

  addToRecent(app);
  renderRecent();

  const runnerFrame = document.getElementById('runnerFrame');
  const runnerName = document.getElementById('runnerAppName');
  const runnerIcon = document.getElementById('runnerAppIcon');


  // Launch genuine Android applications inside Eazy Stack
  const androidAppPackages = {
    'Camera': 'com.android.camera2',
    'Chrome': 'com.android.chrome',
    'Messages': 'com.google.android.apps.messaging',
    'Contacts': 'com.google.android.contacts',
    'Calendar': 'com.google.android.calendar',
    'Clock': 'com.android.deskclock',
    'Photos': 'com.google.android.apps.photos'
  };

  const androidPackage = androidAppPackages[app.name];

  if (androidPackage && hasElectron && window.eazyApi?.launchAndroidApp) {
    try {
      await window.eazyApi.launchAndroidApp(androidPackage);
      return;
    } catch (error) {
      console.error('Android app launch failed:', error);
      showToast('Could not open ' + app.name + ' in Android');
      return;
    }
  }


  // Open web apps inside Eazy Stack first
  if (app.url) {
    runnerName.textContent = app.name;
    runnerIcon.textContent = app.icon;
    runnerFrame.src = app.url;
    switchView('app-runner');
    return;
  }

  // Launch genuine local desktop applications
  if (app.type === 'local' || app.local) {
    if (hasElectron && window.eazyApi.launchLocalApp) {
      try {
        await window.eazyApi.launchLocalApp(app);
        return;
      } catch (e) {
        console.error('App launch failed:', e);
      }
    }

    showLocalAppPlaceholder(app);
    switchView('app-runner');
    return;
  }

  showToast(app.name + ' has no target yet');
}


function uninstallApp(name) {
  apps = apps.map(a => a.name === name ? { ...a, installed: false } : a);
  saveApps();
  renderHome();
  renderDrawer();
  renderStore();
  showToast(name + ' removed');
}

function switchView(id) {
  views.forEach(v => v.classList.remove('active'));
  const target = document.getElementById('view-' + id);
  if (target) target.classList.add('active');
  if (id === 'store') renderStore();
  if (id === 'recent') renderRecent();
  if (id === 'app-drawer') renderDrawer();
}

function updateClock() {
  const now = new Date();
  const timeEl = document.getElementById('statusTime');
  const dateEl = document.getElementById('statusDate');
  if (timeEl) timeEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (dateEl) dateEl.textContent = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

function showToast(msg) {
  toast.textContent = msg;
  toast.className = 'toast show';
  setTimeout(() => { toast.className = 'toast'; }, 2000);
}

function loadApps() {
  try {
    const raw = localStorage.getItem('eazy-apps');
    if (raw) apps = JSON.parse(raw);
  } catch (e) {}
}
function loadSettings() {
  try {
    const raw = localStorage.getItem('eazy-settings');
    if (raw) settings = JSON.parse(raw);
  } catch (e) {}
  if (document.getElementById('settingTheme')) document.getElementById('settingTheme').value = settings.theme;
  if (document.getElementById('settingLaunch')) document.getElementById('settingLaunch').value = settings.launch;
}

const homeSearch = document.getElementById('homeSearch');
const drawerSearch = document.getElementById('drawerSearch');
const storeSearch = document.getElementById('storeSearch');

renderHome();
renderDrawer();
renderRecent();
applyTheme();
setInterval(updateClock, 1000);
updateClock();

homeSearch.addEventListener('input', (e) => {
  const q = e.target.value.toLowerCase();
  renderGrid(homeGrid, getInstalledApps().filter(a => a.name.toLowerCase().includes(q)));
});

drawerSearch.addEventListener('input', (e) => {
  const q = e.target.value.toLowerCase();
  renderGrid(drawerGrid, getInstalledApps().filter(a => a.name.toLowerCase().includes(q)));
});

storeSearch.addEventListener('input', renderStore);

taskBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    taskBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    if (btn.id === 'taskHome') switchView('home');
    if (btn.id === 'taskRecent') switchView('recent');
    if (btn.id === 'taskBack') { history.back(); }
  });
});

taskApps.forEach(app => {
  app.addEventListener('click', () => switchView(app.dataset.view));
});

document.getElementById('settingTheme').addEventListener('change', (e) => {
  settings.theme = e.target.value;
  saveSettings();
  applyTheme();
});
document.getElementById('settingLaunch').addEventListener('change', (e) => {
  settings.launch = e.target.value;
  saveSettings();
});
document.getElementById('btnResetData').addEventListener('click', () => {
  if (!confirm('Reset all data?')) return;
  localStorage.clear();
  location.reload();
});
document.getElementById('btnGoStore').addEventListener('click', () => switchView('store'));
document.getElementById('btnBackFromDetail').addEventListener('click', () => switchView('home'));
document.getElementById('btnBackFromSettings').addEventListener('click', () => switchView('home'));
document.getElementById('btnBackFromRecent').addEventListener('click', () => switchView('home'));
document.getElementById('btnBackFromNotify').addEventListener('click', () => switchView('home'));
document.getElementById('btnBackFromUpdates').addEventListener('click', () => switchView('home'));
document.getElementById('btnCloseRunner').addEventListener('click', () => {
  document.getElementById('runnerFrame').src = 'about:blank';
  document.getElementById('runnerFrameWrap').innerHTML = '<iframe id="runnerFrame" src="about:blank" allowfullscreen></iframe>';
  switchView('home');
});
document.getElementById('btnInstallDetail').addEventListener('click', () => {
  if (currentDetailApp) installApp(currentDetailApp);
});
document.getElementById('btnShareDetail').addEventListener('click', () => {
  if (currentDetailApp) showToast('Sharing ' + currentDetailApp.name);
});
document.getElementById('btnRunnerOpenNew').addEventListener('click', () => {
  const frame = document.getElementById('runnerFrame');
  if (frame.src && frame.src !== 'about:blank') window.open(frame.src, '_blank');
});
document.getElementById('btnRunnerBack').addEventListener('click', () => {
  try { document.getElementById('runnerFrame').contentWindow.history.back(); } catch (e) {}
});
document.getElementById('btnRunnerForward').addEventListener('click', () => {
  try { document.getElementById('runnerFrame').contentWindow.history.forward(); } catch (e) {}
});
document.getElementById('btnRunnerRefresh').addEventListener('click', () => {
  const frame = document.getElementById('runnerFrame');
  frame.src = frame.src;
});

document.getElementById('btnNotify').addEventListener('click', () => switchView('notify'));
document.getElementById('btnClearRecent').addEventListener('click', () => {
  recentApps = [];
  renderRecent();
});

document.getElementById('btnUpdateAll').addEventListener('click', () => {
  showToast('All apps updated');
});

function renderGrid(gridEl, list) {
  gridEl.innerHTML = '';
  if (!list.length) { gridEl.innerHTML = '<div class="empty">No apps.</div>'; return; }
  list.forEach(app => gridEl.appendChild(renderCard(app)));
}

let installProgress = {};

function renderUpdates() {
  const list = document.getElementById('updatesList');
  const installed = getInstalledApps();
  list.innerHTML = '';
  if (!installed.length) {
    list.innerHTML = '<div class="empty">No apps installed.</div>';
    return;
  }
  installed.forEach(app => {
    const row = document.createElement('div');
    row.className = 'update-item';
    row.innerHTML = `
      <div class="update-icon">${app.icon}</div>
      <div class="update-info">
        <div class="update-name">${app.name}</div>
        <div class="update-note">Version ${app.rating}.0</div>
      </div>
      <button class="btn-update" data-name="${app.name}">Update</button>
    `;
    row.querySelector('button').addEventListener('click', (e) => {
      e.stopPropagation();
      const btn = row.querySelector('button');
      btn.textContent = 'Updating...';
      setTimeout(() => {
        btn.textContent = 'Updated';
        showToast(app.name + ' updated');
      }, 1000);
    });
    list.appendChild(row);
  });
}
