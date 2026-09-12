const fs = require('fs');
const path = require('path');

const tasksPath = path.join(__dirname, 'tasks.json');
const tasks = JSON.parse(fs.readFileSync(tasksPath, 'utf8'));

function createBookmarkletCode(taskList) {
  const json = JSON.stringify(taskList);
  
  const rawCode = `
    (async function() {
      const tasks = ${json};
      function setVal(el, val) {
        if (!el) return;
        const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
        const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set || Object.getOwnPropertyDescriptor(el, 'value')?.set;
        if (setter) setter.call(el, val); else el.value = val;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const wait = ms => new Promise(r => setTimeout(r, ms));
      
      // If modal is not open, try to open it
      const openModalBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.toLowerCase().includes('submit day end report'));
      if (openModalBtn && !document.querySelector('.modal--lg, form')) {
        openModalBtn.click();
        await wait(300);
      }

      console.log('Filling ' + tasks.length + ' tasks...');
      for (let i = 0; i < tasks.length; i++) {
        const t = tasks[i];
        const titles = Array.from(document.querySelectorAll('input[type="text"], input:not([type])')).filter(inp => !inp.disabled && !inp.readOnly);
        const descs = Array.from(document.querySelectorAll('textarea')).filter(tx => !tx.disabled && !tx.readOnly);

        if (titles[i]) setVal(titles[i], t.title);
        if (descs[i]) setVal(descs[i], (t.desc || '').slice(0, 250));
        await wait(120);

        if (i < tasks.length - 1) {
          const addBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Add another item'));
          if (addBtn) {
            addBtn.click();
            await wait(220);
          }
        }
      }

      await wait(200);
      const cb = document.querySelector('input[type="checkbox"]');
      if (cb && !cb.checked) {
        cb.click();
      }

      // Show temporary notification on screen
      const toast = document.createElement('div');
      toast.innerText = '✓ All ' + tasks.length + ' tasks filled successfully! Ready to submit.';
      toast.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#00563B;color:#fff;padding:12px 24px;border-radius:10px;font-weight:bold;z-index:999999;box-shadow:0 4px 15px rgba(0,0,0,0.3);';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 4000);
    })();
  `;

  // Minify to single line
  const minified = rawCode
    .replace(/\/\/.*$/gm, '')
    .replace(/\s+/g, ' ')
    .trim();

  return 'javascript:' + encodeURIComponent(minified);
}

const bookmarkletUrl = createBookmarkletCode(tasks);

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Jzarr Day End Report - Bookmark Setup</title>
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
      max-width: 600px;
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
      margin: 30px 0;
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
      padding: 14px 28px;
      font-size: 16px;
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
      margin-bottom: 10px;
      color: #374151;
    }
    .badge {
      display: inline-block;
      background: #dcfce7;
      color: #166534;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 12px;
      margin-bottom: 12px;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">1-CLICK BROWSER SETUP</div>
    <h1>Jzarr Day End Report Auto-Filler</h1>
    <p>Aapko Console ya F12 kholne ki koi zaroorat nahi hai. Niche diye gaye green button ko pakad kar apne Chrome ke Bookmarks Bar par drag (kheenchna) karein:</p>

    <div class="btn-container">
      <p style="margin-top:0; font-weight:600; color:#00563B;">👇 Is button ko mouse se pakad kar Chrome Bookmarks Bar par chhor dein:</p>
      <a class="bookmarklet-btn" href="${bookmarkletUrl}" onclick="alert('Is button par click karne ke bajaye isko mouse se pakad kar (Drag karke) apne Chrome ke Bookmarks bar par drop karein!'); return false;">⚡ Fill Day End Report</a>
    </div>

    <div class="steps">
      <h3 style="margin-top:0; font-size:15px; color:#111827;">Kaise Use Karein:</h3>
      <ol>
        <li>Agar Chrome mein bookmarks bar nazar nahi aa rahi tou <strong>Ctrl + Shift + B</strong> dabayein.</li>
        <li>Upar wale green button ko mouse se pakad kar Bookmarks bar par drop kardein.</li>
        <li>Ab <strong>https://data.jzarr.com/day-end-reports</strong> par jayein aur "Submit day end report" modal kholein.</li>
        <li>Bookmarks bar par <strong>"⚡ Fill Day End Report"</strong> par 1 click karein!</li>
        <li>Saare 14 tasks automatically fill ho jayenge aur agreement check ho jayegi. Aakhir mein Submit button aap khud click kardein!</li>
      </ol>
    </div>
  </div>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, 'Bookmark-Setup.html'), htmlContent, 'utf8');
console.log('✓ Created Bookmark-Setup.html successfully!');
