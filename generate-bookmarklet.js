const fs = require('fs');
const path = require('path');

const scriptLogic = `(async function() {
  function showToast(msg, isError) {
    var old = document.getElementById('jzarr-toast');
    if (old) old.remove();
    var el = document.createElement('div');
    el.id = 'jzarr-toast';
    el.innerHTML = msg;
    el.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:' + (isError ? '#dc2626' : '#00563B') + ';color:#fff;padding:14px 26px;border-radius:12px;font-weight:bold;z-index:9999999;box-shadow:0 6px 25px rgba(0,0,0,0.35);font-family:Segoe UI,sans-serif;font-size:15px;max-width:90vw;text-align:center;';
    document.body.appendChild(el);
    setTimeout(function() { if (el.parentNode) el.remove(); }, isError ? 7000 : 4500);
  }

  showToast('⏳ Loading fresh tasks from GitHub...');

  var tasks = null;
  var source = '';

  // 1. Try local server first (instant if running)
  try {
    var ctrl = new AbortController();
    var tId = setTimeout(function() { ctrl.abort(); }, 350);
    var localRes = await fetch('http://127.0.0.1:39871/tasks.json', { signal: ctrl.signal, cache: 'no-store' });
    clearTimeout(tId);
    if (localRes.ok) {
      tasks = await localRes.json();
      source = 'Local PC Server';
    }
  } catch(e) {}

  // 2. Fetch directly from GitHub API (Bypasses 5-minute CDN cache!)
  if (!tasks) {
    try {
      var apiRes = await fetch('https://api.github.com/repos/KashanJzarr/Jzarr-Day-End-Reports/contents/tasks.json?t=' + Date.now(), { cache: 'no-store' });
      if (apiRes.ok) {
        var apiData = await apiRes.json();
        if (apiData && apiData.content) {
          var bin = atob(apiData.content.replace(/\\s/g, ''));
          var bytes = Uint8Array.from(bin, function(c) { return c.charCodeAt(0); });
          tasks = JSON.parse(new TextDecoder().decode(bytes));
          source = 'GitHub (Live)';
        }
      }
    } catch(e) {}
  }

  // 3. Fallback: GitHub Raw
  if (!tasks) {
    try {
      var rawRes = await fetch('https://raw.githubusercontent.com/KashanJzarr/Jzarr-Day-End-Reports/main/tasks.json?t=' + Date.now(), { cache: 'no-store' });
      if (rawRes.ok) {
        tasks = await rawRes.json();
        source = 'GitHub Raw';
      }
    } catch(e) {}
  }

  // 4. Fallback: LocalStorage
  if (!tasks) {
    var cached = localStorage.getItem('jzarr_cached_tasks');
    if (cached) {
      try {
        tasks = JSON.parse(cached);
        source = 'Offline Cache';
      } catch(e) {}
    }
  }

  if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
    showToast('✗ Tasks load nahi ho sake. Please Sync-Tasks.bat run karein!', true);
    return;
  }

  try { localStorage.setItem('jzarr_cached_tasks', JSON.stringify(tasks)); } catch(e) {}

  function setVal(el, val) {
    if (!el) return;
    var proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    var setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set || Object.getOwnPropertyDescriptor(el, 'value')?.set;
    if (setter) setter.call(el, val); else el.value = val;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  var wait = function(ms) { return new Promise(function(r) { setTimeout(r, ms); }); };

  var openModalBtn = Array.from(document.querySelectorAll('button')).find(function(b) {
    return b.textContent && b.textContent.toLowerCase().includes('submit day end report');
  });
  if (openModalBtn && !document.querySelector('.modal--lg, form')) {
    openModalBtn.click();
    await wait(300);
  }

  for (var i = 0; i < tasks.length; i++) {
    var t = tasks[i];
    var titles = Array.from(document.querySelectorAll('input[type="text"], input:not([type])')).filter(function(inp) { return !inp.disabled && !inp.readOnly; });
    var descs = Array.from(document.querySelectorAll('textarea')).filter(function(tx) { return !tx.disabled && !tx.readOnly; });

    if (titles[i]) setVal(titles[i], t.title);
    if (descs[i]) setVal(descs[i], (t.desc || '').slice(0, 250));
    await wait(120);

    if (i < tasks.length - 1) {
      var addBtn = Array.from(document.querySelectorAll('button')).find(function(b) {
        return b.textContent && b.textContent.includes('Add another item');
      });
      if (addBtn) {
        addBtn.click();
        await wait(220);
      }
    }
  }

  await wait(200);
  var cb = document.querySelector('input[type="checkbox"]');
  if (cb && !cb.checked) {
    cb.click();
  }

  showToast('✓ ' + tasks.length + ' tasks filled [' + source + ']! Ready to submit.');
})();`;

const minified = scriptLogic.replace(/\s+/g, ' ').trim();
const bookmarkletUrl = 'javascript:' + encodeURIComponent(minified);

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Jzarr Day End Report - Live Dynamic Bookmark</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #f4f7f6;
      color: #111827;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
    }
    .card {
      background: #ffffff;
      max-width: 620px;
      width: 100%;
      border-radius: 16px;
      padding: 36px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.08);
      text-align: center;
    }
    h1 {
      color: #00563B;
      margin-top: 0;
      font-size: 24px;
    }
    p {
      font-size: 15px;
      color: #4b5563;
      line-height: 1.6;
    }
    .btn-container {
      margin: 28px 0;
      padding: 24px;
      background: #f0fdf4;
      border: 2px dashed #00563B;
      border-radius: 12px;
    }
    .bookmarklet-btn {
      display: inline-block;
      background: #00563B;
      color: #ffffff !important;
      text-decoration: none;
      padding: 15px 30px;
      font-size: 17px;
      font-weight: 700;
      border-radius: 10px;
      cursor: grab;
      box-shadow: 0 4px 12px rgba(0,86,59,0.3);
      transition: transform 0.2s, background 0.2s;
    }
    .bookmarklet-btn:hover {
      background: #00442e;
      transform: translateY(-2px);
    }
    .steps {
      text-align: left;
      background: #f9fafb;
      border-radius: 12px;
      padding: 20px 24px;
      margin-top: 24px;
      font-size: 14px;
    }
    .steps ol {
      margin: 0;
      padding-left: 20px;
    }
    .steps li {
      margin-bottom: 12px;
      color: #374151;
      line-height: 1.5;
    }
    .badge {
      display: inline-block;
      background: #dcfce7;
      color: #166534;
      font-weight: 700;
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 12px;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">🔥 LIVE DYNAMIC BOOKMARK (ONE-TIME SETUP)</div>
    <h1>Jzarr Day End Report Auto-Filler</h1>
    <p>Ye naya button <strong>Live GitHub API</strong> se directly update leta hai (Zero Cache Delay)!</p>

    <div class="btn-container">
      <p style="margin-top:0; font-weight:600; color:#00563B;">👇 Is button ko mouse se pakad kar Bookmarks Bar par drop karein:</p>
      <a class="bookmarklet-btn" href="${bookmarkletUrl}" onclick="alert('Is button par click karne ke bajaye mouse se pakad kar apne Chrome Bookmarks bar par drag & drop karein!'); return false;">⚡ Jzarr Auto-Fill (LIVE)</a>
    </div>

    <div class="steps">
      <h3 style="margin-top:0; font-size:15px; color:#111827;">Ab Roz Ka Tariqa:</h3>
      <ol>
        <li><strong>Step 1:</strong> <code>tasks.json</code> mein naye tasks likhein aur save karein (Ctrl + S).</li>
        <li><strong>Step 2:</strong> <strong><code>Sync-Tasks.bat</code></strong> par double click karein (ye instant update ho jayega).</li>
        <li><strong>Step 3:</strong> <strong>https://data.jzarr.com/day-end-reports</strong> par jayein aur bookmarks bar par <strong>"⚡ Jzarr Auto-Fill (LIVE)"</strong> daba dein!</li>
      </ol>
      <p style="margin:0; font-weight:600; color:#00563B;">✨ Screen par green banner aayega: "✓ 7 tasks filled [GitHub (Live)]!"</p>
    </div>
  </div>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, 'Bookmark-Setup.html'), htmlContent, 'utf8');
console.log('✓ Generated live dynamic Bookmark-Setup.html successfully!');
